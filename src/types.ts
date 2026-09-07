/**
 * SATQUERY AI — Frontend TypeScript Definitions
 * Aligned with Backend Contracts
 * Smart India Hackathon 2026 — PS 26167
 */

export type DataSourceType =
  | 'OFFICIAL_ISRO'
  | 'OFFICIAL_NRSC'
  | 'OFFICIAL_BHUVAN'
  | 'OFFICIAL_NASA'
  | 'OFFICIAL_USGS'
  | 'OFFICIAL_COPERNICUS'
  | 'BENCHMARK'
  | 'USER_UPLOAD'
  | 'LOCAL_DEMO';

export type ModalityType = 'OPTICAL' | 'SAR' | 'MULTISPECTRAL' | 'FUSED' | 'DEM';

export type TaskType =
  | 'single_image_vqa'
  | 'caption'
  | 'grounding'
  | 'bi_temporal_change'
  | 'change_vqa'
  | 'object_change'
  | 'optical_analysis'
  | 'sar_analysis'
  | 'optical_sar_fusion'
  | 'observation_search'
  | 'event_analysis';

export type EvidenceStrength = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';
export type DataQuality = 'GOOD' | 'FAIR' | 'POOR';
export type PresentationMode = 'standard' | 'advanced' | 'expert';

export interface ObservationFootprint {
  id: string;
  satellite: string;
  sensor: string;
  product: string;
  acquisitionTime: string;
  modality: ModalityType;
  resolutionMeters: number;
  source: string;
  status: 'LATEST AVAILABLE' | 'NEAR-REAL-TIME' | 'CACHED' | 'BENCHMARK' | 'LIVE';
  bounds: GeoBounds;
  center: GeoCoordinate;
  previewUrl?: string;
  cloudCoverPercent?: number;
  polygon?: [number, number][]; // [lat, lon] Leaflet coordinates
  assets?: Record<string, any>;
}

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface ImageMetadata {
  id: string;
  name: string;
  sourceType: DataSourceType;
  sourceName: string;
  sourceUrl?: string;
  mission?: string;
  satellite?: string;
  sensor?: string;
  modality: ModalityType;
  acquisitionTime: string;
  processingTime?: string;
  fetchedTime: string;
  resolutionMeters?: number;
  crs?: string;
  bounds?: GeoBounds;
  dimensions?: { width: number; height: number; bands: number };
  bandNames?: string[];
  polarization?: string[];
  dataQuality: DataQuality;
  cloudCoverPercent?: number;
  license: string;
  url: string;
  thumbnailUrl?: string;
}

export interface GroundingBox {
  id: string;
  label: string;
  confidence: number;
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax] (0..1)
  geoCoordinates?: { lat: number; lng: number };
  areaMetersSq?: number;
}

export interface ChangeStatistics {
  changedPixelCount: number;
  totalPixelCount: number;
  changePercent: number;
  changedAreaHectares?: number;
  changedAreaKm2?: number;
  largestClusterAreaHectares?: number;
  regionsDetected: number;
  meanChangeMagnitude: number;
  method: string;
  thresholdApplied: number;
}

export interface SpectralIndicesResult {
  ndviMean?: number;
  ndviMax?: number;
  ndviMin?: number;
  ndwiMean?: number;
  ndbiMean?: number;
  vegetationCoverPercent?: number;
  waterCoverPercent?: number;
  builtupCoverPercent?: number;
}

export interface SARAnalysisResult {
  polarization: string;
  meanBackscatterDb: number;
  minBackscatterDb: number;
  maxBackscatterDb: number;
  crossPolarizationRatioDb?: number;
  roughnessEstimate: string;
  potentialWaterAreasPercent: number;
}

export interface EvidenceItem {
  id: string;
  title: string;
  description: string;
  type: 'VISUAL_CROP' | 'SPECTRAL_INDEX' | 'SAR_BACKSCATTER' | 'CHANGE_MASK' | 'SPATIAL_CLUSTER' | 'PROVENANCE';
  strength: EvidenceStrength;
  confidenceScore: number;
  thumbnailUrl?: string;
  metrics?: Record<string, string | number>;
  region?: { ymin: number; xmin: number; ymax: number; xmax: number };
}

export interface ExecutionEvent {
  step: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'FALLBACK';
  timestamp: string;
  durationMs?: number;
  detail: string;
}

export interface AnalysisResult {
  analysisId: string;
  query: string;
  task: TaskType;
  subtask?: string;
  target?: string;
  answer: string;
  scientificFinding: string;
  limitations: string[];
  evidenceStrength: EvidenceStrength;
  dataQuality: DataQuality;
  inputs: ImageMetadata[];
  modalitiesUsed: ModalityType[];
  modelsInvoked: { name: string; task: string; version: string; device: string; latencyMs: number }[];
  changeStats?: ChangeStatistics;
  spectralIndices?: SpectralIndicesResult;
  sarMetrics?: SARAnalysisResult;
  groundingBoxes?: GroundingBox[];
  changeMaskUrl?: string;
  evidence: EvidenceItem[];
  executionTrace: ExecutionEvent[];
  provenance: {
    source: string;
    product: string;
    satellite: string;
    sensor: string;
    acquisitionTime: string;
    algorithm: string;
    model: string;
    crs?: string;
    resolution?: string;
  };
  createdAt: string;
  totalLatencyMs: number;
}

export interface EarthEvent {
  id: string;
  title: string;
  eventType: 'WILDFIRE' | 'FLOOD' | 'CYCLONE' | 'EARTHQUAKE' | 'URBAN_EXPANSION' | 'DEFORESTATION';
  locationName: string;
  coordinates: GeoCoordinate;
  eventTime: string;
  source: string;
  sourceType: DataSourceType;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  confidence: string;
  satelliteCorrelation?: {
    satellite: string;
    sensor: string;
    acquisitionDiffHours: number;
  };
  metrics?: Record<string, string | number>;
  description: string;
}

export interface SatelliteMission {
  id: string;
  name: string;
  agency: string;
  status: 'OPERATIONAL' | 'UPCOMING' | 'MAINTENANCE';
  orbitType: string;
  altitudeKm: number;
  inclinationDeg: number;
  sensor: string;
  modality: ModalityType;
  bands: string[];
  spatialResolutionMeters: number;
  revisitDays: number;
  latestPassAoi?: string;
  latestPassTime?: string;
  nextPassTime?: string;
  realOrSimulated: 'OFFICIAL_TELEMETRY' | 'SIMULATION';
  dataCatalog: string;
  description: string;
}

export interface BenchmarkDataset {
  id: string;
  name: string;
  targetTask: string;
  sensor: string;
  modality: ModalityType;
  sampleCount: number;
  license: string;
  description: string;
  source: string;
  samples: BenchmarkSample[];
}

export interface BenchmarkSample {
  id: string;
  title: string;
  dataset: 'RSVQA' | 'VRSBench' | 'CDVQA' | 'BigEarthNet';
  query: string;
  groundTruthAnswer?: string;
  groundTruthBoxes?: GroundingBox[];
  groundTruthChangePercent?: number;
  images: {
    label: string;
    url: string;
    modality: ModalityType;
    acquisitionDate: string;
    sensor: string;
    resolution: number;
  }[];
  notes: string;
}

export interface SystemStatus {
  service: string;
  status: 'READY' | 'DEGRADED' | 'INITIALIZING';
  uptimeSeconds: number;
  hardware: {
    platform: string;
    arch: string;
    cpuCores: number;
    totalMemoryGb: number;
    freeMemoryGb: number;
    gpuDetected: boolean;
    gpuDeviceName?: string;
    gpuVramGb?: number;
    cudaAvailable: boolean;
    inferenceMode: 'CPU_FALLBACK' | 'QUANTIZED_LOCAL' | 'GEMINI_SERVER_ACCELERATED';
  };
  models: {
    vqa: { name: string; status: 'LOADED' | 'READY' | 'FALLBACK'; device: string };
    grounding: { name: string; status: 'LOADED' | 'READY' | 'FALLBACK'; device: string };
    changeDetection: { name: string; status: 'LOADED' | 'READY' | 'FALLBACK'; device: string };
    sarEngine: { name: string; status: 'LOADED' | 'READY' | 'FALLBACK'; device: string };
    opticalEngine: { name: string; status: 'LOADED' | 'READY' | 'FALLBACK'; device: string };
  };
  dataSources: {
    bhoonidhi: { status: 'CONNECTED' | 'REQUIRES_TOKEN' | 'UNAVAILABLE'; lastChecked: string; mode: string };
    bhuvan: { status: 'AVAILABLE' | 'UNAVAILABLE'; lastChecked: string; mode: string };
    nasaFirms: { status: 'CONNECTED' | 'OPEN_FEED_ACTIVE'; lastChecked: string; mode: string };
    copernicus: { status: 'CATALOG_READY'; lastChecked: string; mode: string };
  };
}

export interface IMDRainfallData {
  todayMm: number;
  sevenDayMm: number;
  monthlyMm: number;
  departurePercent: number;
  category: 'EXTREME' | 'VERY HIGH' | 'HIGH' | 'NORMAL' | 'DEFICIENT';
  highestStation: string;
  highestStationDistrict: string;
  highestStationRainfallMm: number;
  timestamp: string;
  source: 'India Meteorological Department (IMD) Hydromet Division';
  trend7Day: { date: string; rainfallMm: number }[];
  trend30Day: { date: string; rainfallMm: number }[];
}

export interface DisasterIntelligence {
  status: 'FLOOD' | 'CYCLONE' | 'WILDFIRE' | 'LANDSLIDE' | 'WARNING' | 'NORMAL' | 'NO VERIFIED EVENT DATA';
  dataStatus: 'LATEST AVAILABLE' | 'VERIFIED RECENT' | 'NEAR-REAL-TIME';
  floodStatus: string;
  floodExtent: string;
  affectedArea: string;
  affectedDistricts: string[];
  riverBasin: string;
  riverLevel: string;
  reservoirInfo: string;
  inundationMapUrl: string;
  observationDate: string;
  source: string;
}

export interface DisasterSignal {
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  evidence: {
    rainfallSignal: 'LOW' | 'NORMAL' | 'MODERATE' | 'HIGH' | 'EXTREME';
    satelliteSignal: 'NO ANOMALY' | 'FLOOD SIGNATURE DETECTED' | 'WATER EXPANSION CONFIRMED' | 'THERMAL ANOMALIES';
    riverSignal: 'NORMAL' | 'ELEVATED' | 'SEVERE';
    recentEventSignal: 'NONE' | 'ACTIVE WARNING' | 'CRITICAL ACTIVE EVENT';
  };
  why: string[];
}

export interface LocationObservation {
  id: string;
  satellite: string;
  sensor: string;
  modality: 'OPTICAL' | 'SAR' | 'MULTISPECTRAL';
  acquisitionTime: string;
  resolutionMeters: number;
  product: string;
  coverageBbox: [number, number, number, number];
  source: 'ISRO Bhoonidhi / NRSC';
  status: 'LATEST AVAILABLE';
  largeImageUrl: string;
  thumbnailUrl: string;
  cloudCoverPercent?: number;
  crs: string;
}

export interface LocationSatelliteIntelligence {
  latestObservation: LocationObservation;
  availableObservations: LocationObservation[];
}

export interface DisasterTimelineEvent {
  id: string;
  date: string;
  label: string;
  detail: string;
  source: string;
  type: 'RAINFALL' | 'WARNING' | 'SATELLITE' | 'FLOOD' | 'ACTION';
}

export interface StateLocationDossier {
  stateId: string;
  stateName: string;
  capital: string;
  center: { lat: number; lng: number };
  bounds: [number, number, number, number];
  disasterIntelligence: DisasterIntelligence;
  rainfall: IMDRainfallData;
  disasterSignal: DisasterSignal;
  satelliteIntelligence: LocationSatelliteIntelligence;
  timeline: DisasterTimelineEvent[];
}

export interface StateSummary {
  stateId: string;
  stateName: string;
  capital: string;
  center: { lat: number; lng: number };
  bounds: [number, number, number, number];
  status: DisasterIntelligence['status'];
  signalLevel: DisasterSignal['level'];
  rainfallTodayMm: number;
  rainfallCategory: IMDRainfallData['category'];
  departurePercent: number;
  affectedArea: string;
}

export interface NationalIMDRainfallSummary {
  nationalDeparturePercent: number;
  status: string;
  highestRecordedStationIndia: {
    station: string;
    state: string;
    rainfall24hMm: number;
    timestamp: string;
    source: string;
  };
  highRainfallStates: { state: string; departure: string; category: string }[];
  timestamp: string;
  source: string;
}

export interface BhoonidhiCollection {
  id: string;
  title: string;
  description: string;
  agency: string;
  satellite: string;
  sensor: string;
  modality: 'OPTICAL' | 'SAR' | 'MULTISPECTRAL' | 'ALTIMETRY' | 'DEM';
  spatialResolution: string;
  temporalCoverage: string;
  license: string;
  stacVersion: string;
  spatialBbox?: number[];
  temporalInterval?: string[];
}

export interface BhoonidhiObservation {
  id: string;
  collection: string;
  satellite: string;
  sensor: string;
  mode: string;
  modality: 'OPTICAL' | 'SAR' | 'MULTISPECTRAL' | 'DEM';
  acquisitionDate: string;
  processingLevel: string;
  productCode?: string;
  bbox: [number, number, number, number];
  geometry: any;
  polygon: [number, number][]; // [lat, lon] for Leaflet
  center: { lat: number; lng: number };
  spatialResolution: string;
  polarization?: string;
  cloudCoverPercent?: number | null;
  orbit?: string;
  pathRow?: string;
  quality?: string;
  producer: string;
  source: string;
  sourceStatus: 'LIVE' | 'LATEST AVAILABLE' | 'NEAR-REAL-TIME' | 'OFFLINE';
  assets: {
    thumbnail?: string;
    metadata?: string;
    download?: string;
    [key: string]: any;
  };
  properties: Record<string, any>;
}

export interface BhoonidhiStatusResponse {
  source: string;
  status: 'LIVE' | 'OFFLINE' | 'UNAVAILABLE' | 'REQUIRES_CONFIGURATION';
  gatewayUrl: string;
  authType: string;
  authenticatedUser: string;
  tokenActive: boolean;
  tokenExpiresAt: string;
  expiresInSeconds: number;
  collectionsAvailable: number;
  lastChecked: string;
  demoMode: boolean;
  error?: string | null;
}

export interface BhoonidhiSearchResult {
  connected: boolean;
  status: 'LIVE' | 'OFFLINE' | 'UNAVAILABLE';
  total: number;
  returnedCount: number;
  items: BhoonidhiObservation[];
  message?: string;
  error?: string;
}


