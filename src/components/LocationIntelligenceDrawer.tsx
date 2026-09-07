/**
 * SATQUERY AI — Location Intelligence Dossier
 * Comprehensive Disaster, IMD Rainfall, Bhoonidhi Satellite Observations,
 * Disaster Signals, Evidence Rules, and Verified Timelines for Indian States.
 * Smart India Hackathon 2026 — PS 26167
 */

import React, { useState } from 'react';
import {
  CloudRain,
  ShieldAlert,
  Satellite,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
  AlertTriangle,
  Layers,
  ArrowRight,
  Maximize2,
  Download,
  Crosshair,
  Info,
  CheckCircle2,
  Activity,
  FileText,
  X,
} from 'lucide-react';
import { StateLocationDossier } from '../types';

interface LocationIntelligenceDrawerProps {
  dossier: StateLocationDossier;
  onClose?: () => void;
  onOpenAnalysisWithImage?: (caseId: 'flood' | 'urban' | 'sar', imageA?: any, imageB?: any) => void;
  onFocusOnMap?: () => void;
}

export const LocationIntelligenceDrawer: React.FC<LocationIntelligenceDrawerProps> = ({
  dossier,
  onClose,
  onOpenAnalysisWithImage,
  onFocusOnMap,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rainfall' | 'satellite' | 'timeline'>('overview');
  const [selectedImageModal, setSelectedImageModal] = useState<boolean>(false);

  const { disasterIntelligence: disaster, rainfall, disasterSignal: signal, satelliteIntelligence: satIntel, timeline } = dossier;

  // Signal Badge Color
  const getSignalBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MODERATE':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getRainfallCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'EXTREME':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'VERY HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'NORMAL':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200 shadow-xl overflow-hidden font-sans">
      {/* 1. TOP HEADER */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-slate-900 text-white uppercase tracking-wider">
              STATE DOSSIER
            </span>
            <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded border ${getSignalBadge(signal.level)}`}>
              SIGNAL: {signal.level}
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {dossier.stateName}
          </h2>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <span>Capital: {dossier.capital}</span>
            <span>•</span>
            <span className="font-mono">
              {dossier.center.lat.toFixed(2)}°N, {dossier.center.lng.toFixed(2)}°E
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center border-b border-slate-200 bg-white px-2 text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-slate-900 text-slate-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Disaster</span>
        </button>

        <button
          onClick={() => setActiveTab('rainfall')}
          className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'rainfall'
              ? 'border-slate-900 text-slate-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span>IMD Rainfall</span>
        </button>

        <button
          onClick={() => setActiveTab('satellite')}
          className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'satellite'
              ? 'border-slate-900 text-slate-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Satellite className="w-3.5 h-3.5" />
          <span>Satellite EO</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'timeline'
              ? 'border-slate-900 text-slate-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Timeline</span>
        </button>
      </div>

      {/* 3. TAB CONTENTS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* ========================================================= */}
        {/* TAB 1: DISASTER INTELLIGENCE & SIGNAL EVIDENCE            */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-4 text-xs">
            {/* Disaster Status Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  CURRENT VERIFIED STATUS
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  {disaster.dataStatus}
                </span>
              </div>

              <div className="text-sm font-black text-slate-900">
                {disaster.status}: {disaster.floodStatus}
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase">RIVER BASIN</span>
                  <span className="font-bold text-slate-800">{disaster.riverBasin}</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase">AFFECTED AREA</span>
                  <span className="font-bold text-red-700">{disaster.affectedArea}</span>
                </div>
              </div>

              <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">River Level:</span>
                  <span className="font-bold text-slate-900">{disaster.riverLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reservoir Flow:</span>
                  <span className="text-slate-800 truncate max-w-[200px]">{disaster.reservoirInfo}</span>
                </div>
              </div>

              {/* Affected Districts */}
              {(disaster.affectedDistricts?.length ?? 0) > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                    AFFECTED DISTRICTS
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {disaster.affectedDistricts?.map((dist) => (
                      <span
                        key={dist}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-700"
                      >
                        {dist}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                <span>Source: {disaster.source}</span>
                <span>Obs: {disaster.observationDate?.substring(0, 10) || 'Current Cycle'}</span>
              </div>
            </div>

            {/* Disaster Signal Breakdown (The "Why?") */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-black uppercase text-slate-900">
                    DISASTER SIGNAL & EVIDENCE AUDIT
                  </span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${getSignalBadge(signal.level)}`}>
                  {signal.level}
                </span>
              </div>

              {/* Evidence Matrix */}
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-400 block uppercase">Rainfall</span>
                  <span className="font-bold text-slate-800">{signal.evidence.rainfallSignal}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-400 block uppercase">Satellite Radar</span>
                  <span className="font-bold text-sky-800">{signal.evidence.satelliteSignal}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-400 block uppercase">River Gauge</span>
                  <span className="font-bold text-slate-800">{signal.evidence.riverSignal}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-400 block uppercase">Active Bulletin</span>
                  <span className="font-bold text-red-700">{signal.evidence.recentEventSignal}</span>
                </div>
              </div>

              {/* Explicit "Why?" Evidence Reasons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  WHY IS THIS CLASSIFIED AS {signal.level}?
                </span>
                <div className="space-y-1 bg-slate-50 p-2.5 rounded border border-slate-100">
                  {(signal.why || []).map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Action to Image Analysis */}
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sky-900 font-bold text-xs">
                <Layers className="w-4 h-4 text-sky-700" />
                <span>Perform Bi-Temporal Image Analysis</span>
              </div>
              <p className="text-[11px] text-sky-800">
                Inspect before & after satellite observations over {dossier.stateName} in the multimodal photo analyser.
              </p>
              <button
                onClick={() => onOpenAnalysisWithImage && onOpenAnalysisWithImage('flood')}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Launch Analysis Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: IMD RAINFALL & PRECIPITATION TRENDS                */}
        {/* ========================================================= */}
        {activeTab === 'rainfall' && (
          <div className="space-y-4 text-xs">
            {/* IMD Source Header */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold text-slate-800">SOURCE: {rainfall.source}</span>
              <span className="text-slate-500">{rainfall.timestamp}</span>
            </div>

            {/* Rainfall Primary Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-slate-800">
              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs space-y-1">
                <span className="text-[9px] font-mono text-slate-400 block uppercase">TODAY'S RAINFALL</span>
                <div className="text-2xl font-black text-slate-900">{rainfall.todayMm} <span className="text-sm font-normal text-slate-500">mm</span></div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs space-y-1">
                <span className="text-[9px] font-mono text-slate-400 block uppercase">7-DAY CUMULATIVE</span>
                <div className="text-2xl font-black text-slate-900">{rainfall.sevenDayMm} <span className="text-sm font-normal text-slate-500">mm</span></div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs space-y-1">
                <span className="text-[9px] font-mono text-slate-400 block uppercase">MONTHLY TOTAL</span>
                <div className="text-2xl font-black text-slate-900">{rainfall.monthlyMm} <span className="text-sm font-normal text-slate-500">mm</span></div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs space-y-1">
                <span className="text-[9px] font-mono text-slate-400 block uppercase">RAINFALL DEPARTURE</span>
                <div className={`text-2xl font-black ${rainfall.departurePercent >= 0 ? 'text-red-600' : 'text-slate-600'}`}>
                  {rainfall.departurePercent >= 0 ? `+${rainfall.departurePercent}%` : `${rainfall.departurePercent}%`}
                </div>
              </div>
            </div>

            {/* IMD Intensity Category */}
            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">IMD RAINFALL CATEGORY:</span>
                <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded border ${getRainfallCategoryBadge(rainfall.category)}`}>
                  {rainfall.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Classified based on standardized IMD long-period average departure thresholds (Large Excess: ≥ +60%, Excess: +20% to +59%, Normal: -19% to +19%).
              </p>
            </div>

            {/* Highest Recorded Rainfall Station */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                HIGHEST RECORDED STATION IN REGION
              </span>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-slate-900">{rainfall.highestStation}</div>
                  <div className="text-[11px] text-slate-500 font-mono">District: {rainfall.highestStationDistrict}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-sky-700">{rainfall.highestStationRainfallMm} mm</div>
                  <div className="text-[9px] font-mono text-slate-400">24h Peak</div>
                </div>
              </div>
            </div>

            {/* 7-Day Rainfall Trend Chart (SVG) */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                7-DAY PRECIPITATION TREND (mm)
              </span>
              <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
                {(rainfall.trend7Day || []).map((item, idx) => {
                  const maxMm = Math.max(...(rainfall.trend7Day || []).map((d) => d.rainfallMm), 100);
                  const barHeight = Math.max(8, (item.rainfallMm / maxMm) * 80);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-[9px] font-mono font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition">
                        {item.rainfallMm}
                      </span>
                      <div
                        style={{ height: `${barHeight}px` }}
                        className={`w-full rounded-t transition-all ${
                          idx === (rainfall.trend7Day?.length || 1) - 1
                            ? 'bg-sky-600'
                            : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                      />
                      <span className="text-[9px] font-mono text-slate-400 mt-1">{item.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: BHOONIDHI SATELLITE EO IMAGERY                     */}
        {/* ========================================================= */}
        {activeTab === 'satellite' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                LATEST SATELLITE OBSERVATION (BHOONIDHI)
              </span>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                {satIntel.latestObservation.status}
              </span>
            </div>

            {/* Large Real Satellite Image Viewer */}
            <div className="bg-slate-900 rounded-lg border border-slate-300 overflow-hidden relative group">
              <img
                src={satIntel.latestObservation.largeImageUrl}
                alt="Satellite Observation"
                className="w-full h-56 object-cover cursor-pointer group-hover:scale-105 transition duration-500"
                onClick={() => setSelectedImageModal(true)}
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                {satIntel.latestObservation.satellite} • {satIntel.latestObservation.sensor}
              </div>
              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                <button
                  onClick={() => setSelectedImageModal(true)}
                  className="px-2 py-1 bg-white/90 hover:bg-white text-slate-900 text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Full Preview</span>
                </button>
              </div>
            </div>

            {/* Satellite Metadata Grid */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 font-mono text-[11px] text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Satellite Platform:</span>
                <span className="font-bold text-slate-900">{satIntel.latestObservation.satellite}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sensor & Modality:</span>
                <span className="font-bold text-slate-900">{satIntel.latestObservation.sensor} ({satIntel.latestObservation.modality})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Spatial Resolution (GSD):</span>
                <span className="font-bold text-sky-700">{satIntel.latestObservation.resolutionMeters}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Acquisition Timestamp:</span>
                <span className="font-bold text-slate-900">{satIntel.latestObservation.acquisitionTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Data Catalog Source:</span>
                <span className="font-bold text-slate-900">{satIntel.latestObservation.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Coordinate Reference:</span>
                <span className="text-slate-800">{satIntel.latestObservation.crs}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onOpenAnalysisWithImage && onOpenAnalysisWithImage('flood')}
                className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Analyze in Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(satIntel.latestObservation, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${satIntel.latestObservation.id}_metadata.json`;
                  a.click();
                }}
                className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded text-xs font-semibold border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download Metadata</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: VERIFIED DISASTER TIMELINE                         */}
        {/* ========================================================= */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 text-xs">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              GROUNDED EVENT & OBSERVATION SEQUENCE
            </span>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {(timeline || []).map((item) => (
                <div key={item.id} className="relative space-y-1">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-white" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                      {item.date}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">{item.type}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">{item.label}</div>
                  <p className="text-[11px] text-slate-600">{item.detail}</p>
                  <div className="text-[9px] font-mono text-slate-400">Source: {item.source}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FULL PREVIEW MODAL */}
      {selectedImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-sm text-slate-900">
                {satIntel.latestObservation.satellite} ({satIntel.latestObservation.sensor})
              </span>
              <button
                onClick={() => setSelectedImageModal(false)}
                className="p-1 text-slate-500 hover:text-slate-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={satIntel.latestObservation.largeImageUrl}
              alt="Satellite Large Preview"
              className="w-full max-h-[70vh] object-contain rounded bg-slate-900"
              referrerPolicy="no-referrer"
            />
            <div className="flex justify-between items-center text-xs font-mono text-slate-500">
              <span>{satIntel.latestObservation.product}</span>
              <span>{satIntel.latestObservation.acquisitionTime}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
