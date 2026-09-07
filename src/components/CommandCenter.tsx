/**
 * SATQUERY AI — Earth Observation Intelligence Command Center
 * Spatial, Map-Centric Architecture (India Region Dominant)
 * Features:
 * - Dominant India Map with Interactive State Selection
 * - State Quick-Selection Bar with Disaster Indicators
 * - Seamless Location Intelligence Dossier (IMD Rainfall, Disaster Status, Bhoonidhi Satellite EO, Signals, Timelines)
 * - 2D GIS / 3D Orbital Globe Switcher
 * Smart India Hackathon 2026 — PS 26167
 */

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Map as MapIcon,
  Layers,
  Flame,
  Satellite,
  Database,
  ArrowRight,
  Zap,
  Activity,
  Maximize2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  CloudRain,
  ShieldAlert,
  X,
  ChevronRight,
} from 'lucide-react';
import {
  EarthEvent,
  SatelliteMission,
  PresentationMode,
  StateLocationDossier,
} from '../types';
import { EarthMap, INDIA_OBSERVATION_FOOTPRINTS } from './EarthMap';
import { ThreeEarth } from './ThreeEarth';
import { LocationIntelligenceDrawer } from './LocationIntelligenceDrawer';
import { fetchStateDossier } from '../services/api';

interface CommandCenterProps {
  onNavigate: (tab: any) => void;
  onLaunchQuickAnalysis: (caseName: 'flood' | 'urban' | 'sar') => void;
  events: EarthEvent[];
  satellites: SatelliteMission[];
  presentationMode: PresentationMode;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  onNavigate,
  onLaunchQuickAnalysis,
  events,
  satellites,
  presentationMode,
}) => {
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [selectedStateId, setSelectedStateId] = useState<string>('assam');
  const [stateDossier, setStateDossier] = useState<StateLocationDossier | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(true);
  const [loadingDossier, setLoadingDossier] = useState<boolean>(false);

  // Fetch state dossier on state selection change
  useEffect(() => {
    let isMounted = true;
    setLoadingDossier(true);
    fetchStateDossier(selectedStateId)
      .then((data) => {
        if (isMounted && data) {
          setStateDossier(data);
          setIsDossierOpen(true);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch remote state dossier, fallback will be used:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingDossier(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedStateId]);

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 py-4 space-y-4">
      {/* 1. TOP MISSION HEADER */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              EARTH OBSERVATION INTELLIGENCE • INDIA SUBCONTINENT SURVEILLANCE
            </span>
            <span className="text-[10px] font-mono bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-bold border border-sky-200">
              {(presentationMode || 'standard').toUpperCase()}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Mission Control & Location Intelligence
          </h1>
          <p className="text-xs text-slate-500 max-w-3xl mt-0.5">
            Real-time geospatial intelligence, verified IMD precipitation observations, Bhoonidhi satellite archives, and bi-temporal change detection across India.
          </p>
        </div>

        {/* Flagship Quick Launch Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onLaunchQuickAnalysis('flood')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
            <span>Assam Flood Bi-Temporal (60s)</span>
          </button>
          <button
            onClick={() => onLaunchQuickAnalysis('sar')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>EOS-04 Radar Analysis</span>
          </button>
        </div>
      </div>

      {/* 2. PRIMARY SPLIT VIEW: DOMINANT INDIA MAP + LOCATION INTELLIGENCE DOSSIER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT / CENTER: DOMINANT INDIA MAP WORKBENCH (8 cols if drawer open, 12 cols if closed) */}
        <div
          className={`${
            isDossierOpen ? 'lg:col-span-8' : 'lg:col-span-12'
          } bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col transition-all duration-300`}
        >
          {/* Top Control Bar */}
          <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <MapIcon className="w-4 h-4 text-sky-600" />
                <span>ACTIVE SPATIAL GIS WORKBENCH</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] text-slate-500 font-mono">
                [CLICK ANY STATE TO OPEN EARTH OBSERVATION DOSSIER]
              </span>
            </div>

            {/* Mode Switcher (2D GIS vs 3D Globe) & Dossier Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-slate-200 rounded-md p-0.5 text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setViewMode('2D')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded transition cursor-pointer ${
                    viewMode === '2D'
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'hover:text-slate-900 text-slate-500'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>2D India GIS</span>
                </button>
                <button
                  onClick={() => setViewMode('3D')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded transition cursor-pointer ${
                    viewMode === '3D'
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'hover:text-slate-900 text-slate-500'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>3D Globe</span>
                </button>
              </div>

              {!isDossierOpen && (
                <button
                  onClick={() => setIsDossierOpen(true)}
                  className="px-2.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Map Surface (640px height) */}
          <div className="w-full h-[640px] relative">
            {viewMode === '2D' ? (
              <EarthMap
                events={events}
                satellites={satellites}
                selectedStateId={selectedStateId}
                onSelectState={(stId) => {
                  setSelectedStateId(stId);
                  setIsDossierOpen(true);
                }}
                onSelectAOIForAnalysis={(aoi) => {
                  onNavigate('analyze');
                  if (aoi.presetSample) {
                    onLaunchQuickAnalysis(aoi.presetSample as any);
                  }
                }}
              />
            ) : (
              <ThreeEarth
                events={events}
                satellites={satellites}
                selectedStateId={selectedStateId}
                onSelectState={(stId) => {
                  setSelectedStateId(stId);
                  setIsDossierOpen(true);
                }}
              />
            )}
          </div>
        </div>

        {/* RIGHT: COMPREHENSIVE LOCATION INTELLIGENCE DOSSIER (4 cols) */}
        {isDossierOpen && (
          <div className="lg:col-span-4 h-[692px] flex flex-col transition-all duration-300">
            {stateDossier ? (
              <LocationIntelligenceDrawer
                dossier={stateDossier}
                onClose={() => setIsDossierOpen(false)}
                onOpenAnalysisWithImage={(caseId) => {
                  onNavigate('analyze');
                  onLaunchQuickAnalysis(caseId);
                }}
              />
            ) : (
              <div className="h-full bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-3">
                <RefreshCw className="w-6 h-6 text-sky-600 animate-spin" />
                <span className="text-xs font-mono font-bold text-slate-500">
                  FETCHING GROUNDED LOCATION DOSSIER...
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. BOTTOM SURVEILLANCE BAR: SATELLITES & LIVE EVENTS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Satellites in Orbit */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <Satellite className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 uppercase">ISRO EO CONSTELLATION</div>
              <div className="text-[11px] text-slate-500 font-mono">EOS-04, Cartosat-3, Resourcesat-2A, EOS-06</div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('satellites')}
            className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Fleet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Thermal Anomalies */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-700">
              <Flame className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 uppercase">NASA FIRMS SURVEILLANCE</div>
              <div className="text-[11px] text-slate-500 font-mono">{events?.length || 0} Active Thermal Clusters in India</div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="text-xs font-bold text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SIH Benchmark Ground Truths */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <Database className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 uppercase">SIH BENCHMARK EVALUATION</div>
              <div className="text-[11px] text-slate-500 font-mono">VRSBench, RSVQA, CDVQA, BigEarthNet</div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('datasets')}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Datasets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
