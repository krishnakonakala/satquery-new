/**
 * SATQUERY AI — Express Backend & Vite Dev Server Entry Point
 * Port 3000 / 0.0.0.0 Ingress Binding
 * Smart India Hackathon 2026 — PS 26167
 */

import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getSystemHardwareAndStatus } from './server/systemStatus';
import {
  getBhoonidhiStatus,
  getBhoonidhiCollections,
  searchBhoonidhiCatalog,
  getBhoonidhiLatestObservations,
} from './server/bhoonidhiService';
import { geocodeLocationWithBhuvan } from './server/bhuvanService';
import { getActiveEarthEvents } from './server/eventService';
import { getSatelliteConstellation, getSatelliteById } from './server/satelliteService';
import {
  getAllStatesSummary,
  getStateDossier,
  getNationalIMDRainfallSummary,
} from './server/locationIntelligenceService';
import { getBenchmarkDatasets, getBenchmarkDatasetById, getBenchmarkSampleById } from './server/datasetAdapters';
import { getSourceRegistry } from './server/sourceRegistry';
import { createAnalysisPlan } from './server/queryPlanner';
import { executeAgenticAnalysis } from './server/agentController';
import {
  saveAnalysisToHistory,
  getAnalysisHistory,
  getAnalysisById,
  exportAnalysisToGeoJSON,
  exportAnalysisToCSV,
  generateExecutiveReportHTML,
} from './server/historyAndReportService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON & URL-encoded parser with ample size for base64 EO imagery
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // ==========================================
  // API ROUTES
  // ==========================================

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'SatQuery AI Engine',
      version: '2026.1.0',
      timestamp: new Date().toISOString(),
    });
  });

  // System Hardware & Telemetry
  app.get('/api/system/status', (_req: Request, res: Response) => {
    res.json(getSystemHardwareAndStatus());
  });

  // Bhoonidhi Official STAC Gateway & EO Dissemination (ISRO / NRSC)
  app.get('/api/bhoonidhi/status', async (_req: Request, res: Response) => {
    try {
      const status = await getBhoonidhiStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({
        source: 'ISRO / NRSC / BHOONIDHI',
        status: 'OFFLINE',
        error: err.message || 'Failed to check Bhoonidhi status',
      });
    }
  });

  app.get('/api/bhoonidhi/collections', async (req: Request, res: Response) => {
    try {
      const refresh = req.query.refresh === 'true';
      const collections = await getBhoonidhiCollections(refresh);
      res.json(collections);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to retrieve Bhoonidhi collections' });
    }
  });

  app.post('/api/bhoonidhi/search', async (req: Request, res: Response) => {
    try {
      const results = await searchBhoonidhiCatalog(req.body || {});
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Bhoonidhi search failed' });
    }
  });

  app.get('/api/bhoonidhi/observations', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const observations = await getBhoonidhiLatestObservations(limit);
      res.json({
        source: 'BHOONIDHI / NRSC / ISRO',
        status: 'LIVE',
        count: observations.length,
        items: observations,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch Bhoonidhi observations' });
    }
  });

  // Bhuvan Geocoding & Thematic Spatial Context
  app.post('/api/bhuvan/geocode', async (req: Request, res: Response) => {
    try {
      const location = await geocodeLocationWithBhuvan(req.body.query || '');
      res.json({ result: location });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Bhuvan geocode failed' });
    }
  });

  // Live Earth Events (NASA FIRMS Fire / Floods / Cyclones)
  app.get('/api/live/events', (_req: Request, res: Response) => {
    res.json(getActiveEarthEvents());
  });

  // State & Location Intelligence Dossiers
  app.get('/api/intelligence/states', (_req: Request, res: Response) => {
    res.json(getAllStatesSummary());
  });

  app.get('/api/intelligence/state/:stateId', (req: Request, res: Response) => {
    const dossier = getStateDossier(req.params.stateId);
    if (!dossier) return res.status(404).json({ error: 'State dossier not found' });
    res.json(dossier);
  });

  // IMD National Rainfall Summary & Trends
  app.get('/api/imd/rainfall', (_req: Request, res: Response) => {
    res.json(getNationalIMDRainfallSummary());
  });

  // Satellite Constellation Intelligence
  app.get('/api/live/satellites', (_req: Request, res: Response) => {
    res.json(getSatelliteConstellation());
  });

  app.get('/api/live/satellites/:id', (req: Request, res: Response) => {
    const sat = getSatelliteById(req.params.id);
    if (!sat) return res.status(404).json({ error: 'Satellite not found' });
    res.json(sat);
  });

  // Benchmark Datasets (BigEarthNet, VRSBench, RSVQA, CDVQA)
  app.get('/api/datasets', (_req: Request, res: Response) => {
    res.json(getBenchmarkDatasets());
  });

  app.get('/api/datasets/:id', (req: Request, res: Response) => {
    const ds = getBenchmarkDatasetById(req.params.id);
    if (!ds) return res.status(404).json({ error: 'Dataset not found' });
    res.json(ds);
  });

  app.get('/api/datasets/sample/:sampleId', (req: Request, res: Response) => {
    const s = getBenchmarkSampleById(req.params.sampleId);
    if (!s) return res.status(404).json({ error: 'Sample not found' });
    res.json(s);
  });

  // Authoritative Source Registry (Bhoonidhi, Bhuvan, IMD, NASA, ISRO)
  app.get('/api/sources', (_req: Request, res: Response) => {
    res.json(getSourceRegistry());
  });

  // Query Planning (Natural Language task formulation)
  app.post('/api/query/plan', async (req: Request, res: Response) => {
    try {
      const { query, availableImageCount, inputModalities } = req.body;
      const plan = await createAnalysisPlan(query || '', availableImageCount || 1, inputModalities);
      res.json(plan);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Planning failed' });
    }
  });

  // Master Agentic Analysis Execution
  app.post('/api/analysis', async (req: Request, res: Response) => {
    try {
      const { query, images, aoiBounds } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'User query is required.' });
      }

      const result = await executeAgenticAnalysis({
        query,
        images: images || [],
        aoiBounds,
      });

      // Persist in history
      saveAnalysisToHistory(result);

      res.json(result);
    } catch (err: any) {
      console.error('Analysis execution error:', err);
      res.status(500).json({ error: err.message || 'Analysis pipeline execution error' });
    }
  });

  // History & Reports
  app.get('/api/history', (_req: Request, res: Response) => {
    res.json(getAnalysisHistory());
  });

  app.get('/api/analysis/:id', (req: Request, res: Response) => {
    const item = getAnalysisById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Analysis record not found' });
    res.json(item);
  });

  app.get(['/api/analysis/:id/geojson', '/api/analysis/:id/export/geojson'], (req: Request, res: Response) => {
    const item = getAnalysisById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Analysis record not found' });
    res.setHeader('Content-Type', 'application/geo+json');
    res.setHeader('Content-Disposition', `attachment; filename="${item.analysisId}.geojson"`);
    res.json(exportAnalysisToGeoJSON(item));
  });

  app.get('/api/analysis/:id/csv', (req: Request, res: Response) => {
    const item = getAnalysisById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Analysis record not found' });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${item.analysisId}.csv"`);
    res.send(exportAnalysisToCSV(item));
  });

  app.get(['/api/analysis/:id/report', '/api/analysis/:id/report.html'], (req: Request, res: Response) => {
    const item = getAnalysisById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Analysis record not found' });
    res.setHeader('Content-Type', 'text/html');
    res.send(generateExecutiveReportHTML(item));
  });

  // Direct Image / GeoTIFF Upload & Validation Handler
  app.post('/api/upload', (req: Request, res: Response) => {
    try {
      const { name, dataUrl, modality, sensor, satellite, resolutionMeters } = req.body;
      if (!dataUrl) {
        return res.status(400).json({ error: 'Image data is required' });
      }

      // Extract basic image metadata
      const isPng = dataUrl.startsWith('data:image/png');
      const isJpeg = dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg');
      const isTiff = dataUrl.startsWith('data:image/tiff') || dataUrl.startsWith('data:image/geotiff');

      const imageMetadata = {
        id: `USER_UPLOAD_${Date.now()}`,
        name: name || 'User Uploaded Observation',
        sourceType: 'USER_UPLOAD',
        sourceName: 'Local User Upload / Ground Station',
        satellite: satellite || 'User Satellite / Aerial Platform',
        sensor: sensor || (modality === 'SAR' ? 'Synthetic Aperture Radar' : 'Multispectral Sensor'),
        modality: modality || 'OPTICAL',
        acquisitionTime: new Date().toISOString(),
        fetchedTime: new Date().toISOString(),
        resolutionMeters: resolutionMeters || 10,
        crs: 'EPSG:4326 (WGS 84)',
        dimensions: { width: 512, height: 512, bands: modality === 'SAR' ? 2 : 4 },
        bandNames: modality === 'SAR' ? ['VV', 'VH'] : ['Blue', 'Green', 'Red', 'NIR'],
        polarization: modality === 'SAR' ? ['VV', 'VH'] : undefined,
        dataQuality: 'GOOD',
        license: 'User Proprietary / Open Research',
        url: dataUrl,
        thumbnailUrl: dataUrl,
      };

      res.json(imageMetadata);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Upload processing failed' });
    }
  });

  // ==========================================
  // VITE MIDDLEWARE SETUP
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SatQuery AI] Mission Control Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SatQuery AI] Failed to start server:', err);
});
