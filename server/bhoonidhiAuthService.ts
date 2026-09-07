/**
 * SATQUERY AI — Official Bhoonidhi Authentication Service
 * ISRO / NRSC Data Dissemination STAC Gateway
 * Smart India Hackathon 2026 — PS 26167
 *
 * Implements official User ID + Password (grant_type=password) authentication,
 * token caching, expiration management, rate-limiting, and error diagnosis.
 * NO secrets or tokens are ever exposed to the client or leaked in logs.
 */

import 'dotenv/config';

interface CachedToken {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresAt: number; // Unix timestamp in ms
  acquiredAt: string;
  userId: string;
}

export interface BhoonidhiAuthStatus {
  configured: boolean;
  authenticated: boolean;
  userId?: string;
  apiUrl: string;
  tokenExpiresAt?: string;
  expiresInSeconds?: number;
  lastChecked: string;
  demoMode: boolean;
  error?: string;
}

class BhoonidhiAuthManager {
  private cachedToken: CachedToken | null = null;
  private inFlightAuthPromise: Promise<string> | null = null;
  private lastAuthError: string | null = null;
  private lastCheckedTime: string = new Date().toISOString();

  private getApiUrl(): string {
    const raw = process.env.BHOONIDHI_API_URL || 'https://bhoonidhi-api.nrsc.gov.in';
    return raw.replace(/\/+$/, '');
  }

  private getCredentials(): { userId: string; password: string } | null {
    const userId = process.env.BHOONIDHI_USER_ID?.trim();
    const password = process.env.BHOONIDHI_PASSWORD?.trim();

    if (!userId || !password) {
      return null;
    }
    return { userId, password };
  }

  public isConfigured(): boolean {
    return this.getCredentials() !== null;
  }

  public isDemoMode(): boolean {
    return process.env.DEMO_MODE === 'true';
  }

  /**
   * Retrieves a valid access token.
   * If cached and unexpired (with 60s buffer), returns immediately.
   * Otherwise, authenticates against Bhoonidhi official endpoint.
   */
  public async getValidToken(): Promise<string> {
    this.lastCheckedTime = new Date().toISOString();

    // Check existing valid token
    const now = Date.now();
    const safetyBufferMs = 60 * 1000; // 60 seconds buffer
    if (this.cachedToken && this.cachedToken.expiresAt > now + safetyBufferMs) {
      return this.cachedToken.accessToken;
    }

    // Mutex: Avoid parallel auth requests
    if (this.inFlightAuthPromise) {
      return this.inFlightAuthPromise;
    }

    this.inFlightAuthPromise = this.performAuthentication();
    try {
      const token = await this.inFlightAuthPromise;
      return token;
    } finally {
      this.inFlightAuthPromise = null;
    }
  }

  private async performAuthentication(): Promise<string> {
    const credentials = this.getCredentials();
    if (!credentials) {
      this.lastAuthError = 'BHOONIDHI_USER_ID or BHOONIDHI_PASSWORD environment variables are not configured.';
      throw new Error(this.lastAuthError);
    }

    const authUrl = `${this.getApiUrl()}/auth/token`;

    try {
      console.log(`[Bhoonidhi Auth] Requesting access token for user '${credentials.userId}' from ${authUrl}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          userId: credentials.userId,
          password: credentials.password,
          grant_type: 'password',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let detailedMsg = `HTTP ${response.status} (${response.statusText})`;
        try {
          const parsed = JSON.parse(errorText);
          detailedMsg = parsed.Description || parsed.error || parsed.message || detailedMsg;
        } catch {
          if (errorText.length < 200) detailedMsg = errorText || detailedMsg;
        }

        this.lastAuthError = `Bhoonidhi authentication failed: ${detailedMsg}`;
        console.error(`[Bhoonidhi Auth Error] Status: ${response.status} - ${this.lastAuthError}`);
        throw new Error(this.lastAuthError);
      }

      const data = await response.json();

      if (!data.access_token) {
        this.lastAuthError = 'Bhoonidhi token response missing access_token field.';
        console.error(`[Bhoonidhi Auth Error] ${this.lastAuthError}`);
        throw new Error(this.lastAuthError);
      }

      const expiresInSec = typeof data.expires_in === 'number' ? data.expires_in : 1200;
      const expiresAt = Date.now() + expiresInSec * 1000;

      this.cachedToken = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenType: data.token_type || 'Bearer',
        expiresAt,
        acquiredAt: new Date().toISOString(),
        userId: credentials.userId,
      };

      this.lastAuthError = null;
      console.log(`[Bhoonidhi Auth] Token acquired successfully for user '${credentials.userId}'. Valid for ${expiresInSec}s.`);

      return this.cachedToken.accessToken;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        this.lastAuthError = 'Connection to Bhoonidhi authentication gateway timed out (15s).';
      } else if (!this.lastAuthError) {
        this.lastAuthError = err.message || 'Unknown network error during authentication.';
      }
      throw err;
    }
  }

  /**
   * Clears the cached token to force fresh authentication
   */
  public invalidateToken(): void {
    this.cachedToken = null;
  }

  /**
   * Diagnostic status report without exposing credentials
   */
  public getStatus(): BhoonidhiAuthStatus {
    const credentials = this.getCredentials();
    const now = Date.now();
    const isValid = !!(this.cachedToken && this.cachedToken.expiresAt > now);

    return {
      configured: credentials !== null,
      authenticated: isValid,
      userId: credentials ? credentials.userId : undefined,
      apiUrl: this.getApiUrl(),
      tokenExpiresAt: this.cachedToken ? new Date(this.cachedToken.expiresAt).toISOString() : undefined,
      expiresInSeconds: this.cachedToken ? Math.max(0, Math.floor((this.cachedToken.expiresAt - now) / 1000)) : undefined,
      lastChecked: this.lastCheckedTime,
      demoMode: this.isDemoMode(),
      error: this.lastAuthError || undefined,
    };
  }
}

export const bhoonidhiAuth = new BhoonidhiAuthManager();
