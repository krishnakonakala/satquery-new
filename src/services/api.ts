/**
 * SATQUERY AI — Frontend API Client
 * Typed fetch client for backend remote sensing services
 * Smart India Hackathon 2026 — PS 26167
 */

import {
  SystemStatus,
  EarthEvent,
  SatelliteMission,
  BenchmarkDataset,
  BenchmarkSample,
  AnalysisResult,
  ImageMetadata,
  StateSummary,
  StateLocationDossier,
  NationalIMDRainfallSummary,
  BhoonidhiCollection,
  BhoonidhiObservation,
  BhoonidhiStatusResponse,
  BhoonidhiSearchResult,
} from '../types';

export async function fetchSystemStatus(): Promise<SystemStatus> {
  const res = await fetch('/api/system/status');
  if (!res.ok) throw new Error(`System status HTTP ${res.status}`);
  return res.json();
}

export async function fetchBhoonidhiStatus(): Promise<BhoonidhiStatusResponse> {
  const res = await fetch('/api/bhoonidhi/status');
  if (!res.ok) throw new Error(`Bhoonidhi status HTTP ${res.status}`);
  return res.json();
}

export async function fetchLiveEvents(): Promise<EarthEvent[]> {
  const res = await fetch('/api/live/events');
  if (!res.ok) throw new Error(`Live events HTTP ${res.status}`);
  return res.json();
}

export async function fetchSatellites(): Promise<SatelliteMission[]> {
  const res = await fetch('/api/live/satellites');
  if (!res.ok) throw new Error(`Satellites HTTP ${res.status}`);
  return res.json();
}

export async function fetchSatelliteById(id: string): Promise<SatelliteMission> {
  const res = await fetch(`/api/live/satellites/${id}`);
  if (!res.ok) throw new Error(`Satellite detail HTTP ${res.status}`);
  return res.json();
}

export async function fetchBhoonidhiCollections(refresh: boolean = false): Promise<BhoonidhiCollection[]> {
  const res = await fetch(`/api/bhoonidhi/collections${refresh ? '?refresh=true' : ''}`);
  if (!res.ok) throw new Error(`Bhoonidhi collections HTTP ${res.status}`);
  return res.json();
}

export async function searchBhoonidhiCatalog(params: any): Promise<BhoonidhiSearchResult> {
  const res = await fetch('/api/bhoonidhi/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Bhoonidhi search HTTP ${res.status}`);
  return res.json();
}

export async function fetchBhoonidhiObservations(limit: number = 12): Promise<{
  source: string;
  status: string;
  count: number;
  items: BhoonidhiObservation[];
}> {
  const res = await fetch(`/api/bhoonidhi/observations?limit=${limit}`);
  if (!res.ok) throw new Error(`Bhoonidhi observations HTTP ${res.status}`);
  return res.json();
}

export async function geocodeLocation(query: string) {
  const res = await fetch('/api/bhuvan/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Bhuvan geocode HTTP ${res.status}`);
  return res.json();
}

export async function fetchBenchmarkDatasets(): Promise<BenchmarkDataset[]> {
  const res = await fetch('/api/datasets');
  if (!res.ok) throw new Error(`Datasets HTTP ${res.status}`);
  return res.json();
}

export async function fetchBenchmarkSample(sampleId: string): Promise<BenchmarkSample> {
  const res = await fetch(`/api/datasets/sample/${sampleId}`);
  if (!res.ok) throw new Error(`Dataset sample HTTP ${res.status}`);
  return res.json();
}

export async function planAnalysisQuery(query: string, availableImageCount: number, inputModalities?: string[]) {
  const res = await fetch('/api/query/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, availableImageCount, inputModalities }),
  });
  if (!res.ok) throw new Error(`Query planning HTTP ${res.status}`);
  return res.json();
}

export async function runAnalysis(payload: {
  query: string;
  images: ImageMetadata[];
  aoiBounds?: any;
}): Promise<AnalysisResult> {
  const res = await fetch('/api/analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Analysis HTTP ${res.status}`);
  }
  return res.json();
}

export async function uploadCustomImage(payload: {
  name: string;
  dataUrl: string;
  modality: 'OPTICAL' | 'SAR' | 'MULTISPECTRAL';
  sensor?: string;
  satellite?: string;
  resolutionMeters?: number;
}): Promise<ImageMetadata> {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Upload HTTP ${res.status}`);
  return res.json();
}

export async function fetchAnalysisHistory(): Promise<AnalysisResult[]> {
  const res = await fetch('/api/history');
  if (!res.ok) throw new Error(`History HTTP ${res.status}`);
  return res.json();
}

export async function fetchStateSummaries(): Promise<StateSummary[]> {
  const res = await fetch('/api/intelligence/states');
  if (!res.ok) throw new Error(`States HTTP ${res.status}`);
  return res.json();
}

export async function fetchStateDossier(stateId: string): Promise<StateLocationDossier> {
  const res = await fetch(`/api/intelligence/state/${stateId}`);
  if (!res.ok) throw new Error(`State dossier HTTP ${res.status}`);
  return res.json();
}

export async function fetchNationalIMDRainfall(): Promise<NationalIMDRainfallSummary> {
  const res = await fetch('/api/imd/rainfall');
  if (!res.ok) throw new Error(`IMD rainfall HTTP ${res.status}`);
  return res.json();
}
