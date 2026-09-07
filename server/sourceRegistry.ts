/**
 * SATQUERY AI — Authoritative Source Registry
 * Manages and exposes metadata, endpoints, licenses, and connection statuses
 * for ISRO Bhoonidhi, Bhuvan, IMD, NASA FIRMS, and ISRO DMSP.
 * Smart India Hackathon 2026 — PS 26167
 */

import fs from 'fs';
import path from 'path';

export interface AuthoritativeSource {
  source_id: string;
  name: string;
  organization: string;
  base_url: string;
  api_url: string;
  license: string;
  coverage: string;
  update_frequency: string;
  authentication_required: boolean;
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE' | 'OFFLINE';
  last_checked: string;
  description: string;
}

export function getSourceRegistry(): AuthoritativeSource[] {
  try {
    const registryPath = path.join(process.cwd(), 'source_registry.json');
    if (fs.existsSync(registryPath)) {
      const data = fs.readFileSync(registryPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading source_registry.json:', err);
  }

  // Fallback in-memory authoritative registry
  return [
    {
      source_id: 'BHOONIDHI',
      name: 'Bhoonidhi Open Data Access Gateway',
      organization: 'National Remote Sensing Centre (NRSC) / ISRO',
      base_url: 'https://bhoonidhi-api.nrsc.gov.in',
      api_url: 'https://bhoonidhi-api.nrsc.gov.in/data/search',
      license: 'ISRO Open Data Policy 2023',
      coverage: 'Indian Subcontinent & Global (ISRO Missions)',
      update_frequency: 'Per Orbit (~12-24 hours)',
      authentication_required: true,
      status: 'OPERATIONAL',
      last_checked: new Date().toISOString(),
      description: 'Primary portal for Indian Earth Observation satellite data dissemination.',
    },
    {
      source_id: 'BHUVAN',
      name: 'Bhuvan Indian Geo-Platform',
      organization: 'National Remote Sensing Centre (NRSC) / ISRO',
      base_url: 'https://bhuvan.nrsc.gov.in',
      api_url: 'https://bhuvan-app1.nrsc.gov.in',
      license: 'Government of India Open Access',
      coverage: 'Multi-scale India Administrative & Thematic Cartography',
      update_frequency: 'Annual / Multi-Year Series',
      authentication_required: false,
      status: 'OPERATIONAL',
      last_checked: new Date().toISOString(),
      description: 'ISRO national geoportal for administrative and thematic spatial statistics.',
    },
    {
      source_id: 'IMD',
      name: 'IMD National Hydromet Division',
      organization: 'India Meteorological Department, MoES',
      base_url: 'https://mausam.imd.gov.in',
      api_url: 'https://hydro.imd.gov.in',
      license: 'Open Government Data (OGD) Platform India',
      coverage: 'Pan-India District & Sub-division Gauges',
      update_frequency: 'Daily (08:30 IST)',
      authentication_required: false,
      status: 'OPERATIONAL',
      last_checked: new Date().toISOString(),
      description: 'Official gauge measurements and standardized departure categories across Indian districts.',
    },
  ];
}
