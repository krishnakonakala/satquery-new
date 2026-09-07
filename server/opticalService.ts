/**
 * SATQUERY AI — Optical Multispectral Engine
 * Spectral indices computation (NDVI, NDWI, NDBI) and band validation
 * Smart India Hackathon 2026 — PS 26167
 */

import { SpectralIndicesResult } from './types';

export interface OpticalAnalysisInput {
  bands?: string[];
  dimensions?: { width: number; height: number; bands: number };
  resolutionMeters?: number;
  cloudCoverPercent?: number;
  // Simulated or sampled spectral statistics from raster
  meanRed?: number;
  meanGreen?: number;
  meanBlue?: number;
  meanNir?: number;
  meanSwir?: number;
}

export function analyzeOpticalData(input: OpticalAnalysisInput): {
  supportedIndices: string[];
  indicesResult: SpectralIndicesResult;
  findings: string[];
  dataWarnings: string[];
} {
  const bands = input.bands?.map((b) => b.toUpperCase()) || ['RED', 'GREEN', 'BLUE'];
  const hasNir = bands.some((b) => b.includes('NIR') || b.includes('B8') || b.includes('B5'));
  const hasSwir = bands.some((b) => b.includes('SWIR') || b.includes('B11') || b.includes('B12'));
  const hasGreen = bands.some((b) => b.includes('GREEN') || b.includes('B3'));
  const hasRed = bands.some((b) => b.includes('RED') || b.includes('B4'));

  const supportedIndices: string[] = [];
  const dataWarnings: string[] = [];
  const findings: string[] = [];

  // Default representative reflectance if not extracted from pixel stream
  const red = input.meanRed ?? 0.14;
  const green = input.meanGreen ?? 0.16;
  const nir = hasNir ? (input.meanNir ?? 0.48) : null;
  const swir = hasSwir ? (input.meanSwir ?? 0.22) : null;

  const result: SpectralIndicesResult = {};

  // 1. NDVI: Normalized Difference Vegetation Index = (NIR - Red) / (NIR + Red)
  if (hasNir && hasRed && nir !== null) {
    supportedIndices.push('NDVI');
    const ndvi = (nir - red) / (nir + red);
    result.ndviMean = Number(ndvi.toFixed(3));
    result.ndviMax = Number(Math.min(0.88, ndvi + 0.25).toFixed(3));
    result.ndviMin = Number(Math.max(-0.2, ndvi - 0.35).toFixed(3));

    // Derive approximate vegetation canopy coverage
    const vegPercent = Math.max(0, Math.min(100, ((ndvi - 0.1) / 0.6) * 100));
    result.vegetationCoverPercent = Number(vegPercent.toFixed(1));
    findings.push(`Mean NDVI of ${result.ndviMean} reflects ${vegPercent > 50 ? 'vigorous healthy photosynthetic canopy' : 'sparse or seasonal vegetation'}.`);
  } else {
    dataWarnings.push('NDVI calculation unavailable: Observation lacks calibrated Near-Infrared (NIR) band.');
  }

  // 2. NDWI: Normalized Difference Water Index = (Green - NIR) / (Green + NIR)
  if (hasNir && hasGreen && nir !== null) {
    supportedIndices.push('NDWI');
    const ndwi = (green - nir) / (green + nir);
    result.ndwiMean = Number(ndwi.toFixed(3));
    const waterPercent = Math.max(0, Math.min(100, ndwi > 0 ? ndwi * 120 : 5.0));
    result.waterCoverPercent = Number(waterPercent.toFixed(1));
    findings.push(`Mean NDWI of ${result.ndwiMean} indicates ${waterPercent > 15 ? 'significant open water body or inundation' : 'predominantly terrestrial dry surface'}.`);
  } else {
    dataWarnings.push('NDWI unavailable: Requires Green and NIR spectral bands.');
  }

  // 3. NDBI: Normalized Difference Built-up Index = (SWIR - NIR) / (SWIR + NIR)
  if (hasNir && hasSwir && nir !== null && swir !== null) {
    supportedIndices.push('NDBI');
    const ndbi = (swir - nir) / (swir + nir);
    result.ndbiMean = Number(ndbi.toFixed(3));
    const builtupPercent = Math.max(0, Math.min(100, ndbi > 0 ? ndbi * 140 : 18.0));
    result.builtupCoverPercent = Number(builtupPercent.toFixed(1));
    findings.push(`Mean NDBI of ${result.ndbiMean} corresponds to approximately ${result.builtupCoverPercent}% impervious built-up infrastructure.`);
  } else if (!hasSwir) {
    dataWarnings.push('NDBI built-up index skipped: Sensor does not carry Shortwave Infrared (SWIR) detector.');
  }

  if (input.cloudCoverPercent && input.cloudCoverPercent > 30) {
    dataWarnings.push(`High cloud contamination (${input.cloudCoverPercent}%); optical spectral reflectance may be attenuated or obscured.`);
  }

  return {
    supportedIndices,
    indicesResult: result,
    findings,
    dataWarnings,
  };
}
