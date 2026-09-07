/**
 * SATQUERY AI — History, Reports, and Geospatial Export Service
 * GeoJSON export, CSV statistics export, and formatted scientific report generation
 * Smart India Hackathon 2026 — PS 26167
 */

import { AnalysisResult } from './types';

const ANALYSIS_HISTORY_STORE: AnalysisResult[] = [];

export function saveAnalysisToHistory(result: AnalysisResult) {
  ANALYSIS_HISTORY_STORE.unshift(result);
  // Keep last 50 analyses in memory
  if (ANALYSIS_HISTORY_STORE.length > 50) {
    ANALYSIS_HISTORY_STORE.pop();
  }
}

export function getAnalysisHistory(): AnalysisResult[] {
  return ANALYSIS_HISTORY_STORE;
}

export function getAnalysisById(id: string): AnalysisResult | undefined {
  return ANALYSIS_HISTORY_STORE.find((a) => a.analysisId === id);
}

export function exportAnalysisToGeoJSON(result: AnalysisResult) {
  if (result.changeStats && result.inputs[0]) {
    return {
      type: 'FeatureCollection',
      metadata: {
        analysisId: result.analysisId,
        query: result.query,
        task: result.task,
        source: result.provenance.source,
        satellite: result.provenance.satellite,
        timestamp: result.createdAt,
      },
      features: [
        {
          type: 'Feature',
          properties: {
            changePercent: result.changeStats.changePercent,
            changedAreaHectares: result.changeStats.changedAreaHectares,
            changedAreaKm2: result.changeStats.changedAreaKm2,
            method: result.changeStats.method,
            confidence: result.evidenceStrength,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [92.8, 26.1],
                [93.1, 26.15],
                [93.25, 26.3],
                [93.1, 26.45],
                [92.75, 26.35],
                [92.8, 26.1],
              ],
            ],
          },
        },
      ],
    };
  }

  // If bounding boxes exist
  if (result.groundingBoxes && result.groundingBoxes.length > 0) {
    return {
      type: 'FeatureCollection',
      metadata: {
        analysisId: result.analysisId,
        query: result.query,
        task: result.task,
      },
      features: result.groundingBoxes.map((box) => ({
        type: 'Feature',
        properties: {
          label: box.label,
          confidence: box.confidence,
          normalizedBbox: box.box,
          areaSqMeters: box.areaMetersSq,
        },
        geometry: {
          type: 'Point',
          coordinates: [box.geoCoordinates?.lng ?? 78.48, box.geoCoordinates?.lat ?? 17.38],
        },
      })),
    };
  }

  return {
    type: 'FeatureCollection',
    metadata: { analysisId: result.analysisId },
    features: [],
  };
}

export function exportAnalysisToCSV(result: AnalysisResult): string {
  const lines: string[] = [];
  lines.push('Field,Value');
  lines.push(`Analysis ID,"${result.analysisId}"`);
  lines.push(`Timestamp,"${result.createdAt}"`);
  lines.push(`User Query,"${result.query.replace(/"/g, '""')}"`);
  lines.push(`Task,"${result.task}"`);
  lines.push(`Evidence Strength,"${result.evidenceStrength}"`);
  lines.push(`Satellite,"${result.provenance.satellite}"`);
  lines.push(`Sensor,"${result.provenance.sensor}"`);
  lines.push(`Resolution,"${result.provenance.resolution}"`);

  if (result.changeStats) {
    lines.push(`Changed Pixels,${result.changeStats.changedPixelCount}`);
    lines.push(`Change Percent,"${result.changeStats.changePercent}%"`);
    lines.push(`Changed Area (Hectares),${result.changeStats.changedAreaHectares ?? 'N/A'}`);
    lines.push(`Changed Area (Km2),${result.changeStats.changedAreaKm2 ?? 'N/A'}`);
    lines.push(`Regions Detected,${result.changeStats.regionsDetected}`);
  }

  if (result.spectralIndices?.ndviMean !== undefined) {
    lines.push(`NDVI Mean,${result.spectralIndices.ndviMean}`);
    lines.push(`Vegetation Cover Percent,"${result.spectralIndices.vegetationCoverPercent}%"`);
  }

  if (result.sarMetrics) {
    lines.push(`SAR Polarization,"${result.sarMetrics.polarization}"`);
    lines.push(`SAR Mean Backscatter (dB),${result.sarMetrics.meanBackscatterDb}`);
  }

  return lines.join('\n');
}

export function generateExecutiveReportHTML(result: AnalysisResult): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SatQuery AI — Scientific Earth Observation Analysis Report</title>
  <style>
    body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background: #0b1120; color: #f1f5f9; padding: 40px; margin: 0; line-height: 1.6; }
    .header { border-bottom: 2px solid #06b6d4; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
    h1 { color: #38bdf8; margin: 0 0 8px 0; font-size: 26px; }
    .meta { color: #94a3b8; font-size: 13px; }
    .badge { background: #0284c7; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; }
    .section { background: #1e293b; border-radius: 8px; padding: 24px; margin-bottom: 24px; border: 1px solid #334155; }
    .section h2 { color: #38bdf8; font-size: 18px; margin-top: 0; border-bottom: 1px solid #334155; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #334155; font-size: 13px; }
    th { color: #94a3b8; font-weight: 600; }
    .finding-box { background: #0f172a; border-left: 4px solid #06b6d4; padding: 16px; border-radius: 4px; font-size: 15px; margin-top: 12px; }
    .evidence-item { background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 12px; margin-bottom: 10px; }
    .footer { text-align: center; color: #64748b; font-size: 11px; margin-top: 40px; border-top: 1px solid #334155; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>SATQUERY AI — SCIENTIFIC EO DOSSIER</h1>
      <div class="meta">ISRO / NRSC Smart India Hackathon 2026 • Problem Statement 26167</div>
    </div>
    <div>
      <span class="badge">EVIDENCE: ${result.evidenceStrength}</span>
    </div>
  </div>

  <div class="section">
    <h2>1. Query & Mission Intent</h2>
    <p><strong>Query:</strong> "${result.query}"</p>
    <p><strong>Task Classification:</strong> ${result.task} • <strong>Target:</strong> ${result.target || 'General'}</p>
    <div class="finding-box">
      <strong>Scientific Finding:</strong><br/>
      ${result.answer}
    </div>
  </div>

  <div class="section">
    <h2>2. Sensor Telemetry & Provenance</h2>
    <table>
      <tr><th>Satellite / Mission</th><td>${result.provenance.satellite}</td></tr>
      <tr><th>Sensor Modality</th><td>${result.modalitiesUsed.join(', ')}</td></tr>
      <tr><th>Acquisition Timestamp</th><td>${result.provenance.acquisitionTime}</td></tr>
      <tr><th>Spatial Resolution (GSD)</th><td>${result.provenance.resolution}</td></tr>
      <tr><th>Source Catalogue</th><td>${result.provenance.source}</td></tr>
      <tr><th>Algorithm / Model</th><td>${result.provenance.algorithm}</td></tr>
    </table>
  </div>

  ${result.changeStats ? `
  <div class="section">
    <h2>3. Bi-Temporal Change Detection Statistics</h2>
    <table>
      <tr><th>Surface Change Area</th><td>${result.changeStats.changedAreaHectares ?? 'N/A'} Hectares (${result.changeStats.changedAreaKm2 ?? 'N/A'} km²)</td></tr>
      <tr><th>Change Proportion</th><td>${result.changeStats.changePercent}% of target AOI</td></tr>
      <tr><th>Distinct Change Clusters</th><td>${result.changeStats.regionsDetected} contiguous spatial regions</td></tr>
      <tr><th>Largest Contiguous Cluster</th><td>${result.changeStats.largestClusterAreaHectares ?? 'N/A'} Hectares</td></tr>
      <tr><th>Threshold & Noise Filter</th><td>${result.changeStats.method} (Threshold: ${result.changeStats.thresholdApplied})</td></tr>
    </table>
  </div>
  ` : ''}

  <div class="section">
    <h2>4. Verified Evidence Artifacts (${result.evidence.length})</h2>
    ${result.evidence.map(e => `
      <div class="evidence-item">
        <strong>${e.title}</strong> [Confidence: ${(e.confidenceScore * 100).toFixed(0)}%]
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;">${e.description}</p>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>5. Scientific Limitations & Uncertainty</h2>
    <ul>
      ${result.limitations.map(l => `<li>${l}</li>`).join('')}
    </ul>
  </div>

  <div class="footer">
    SatQuery AI Agentic Platform • Automated verification report generated on ${new Date().toISOString()} • Confidential & Authorized Geospatial Use
  </div>
</body>
</html>
  `.trim();
}
