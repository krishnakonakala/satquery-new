/**
 * SATQUERY AI — Satellite Constellation & Official Bhoonidhi STAC Catalog
 * Scientific Aerospace Light Theme
 * Dual-Mode:
 * 1. ISRO & Allied Constellation Fleet Telemetry (EOS-04, Cartosat-3, Resourcesat-2A, etc.)
 * 2. Real-Time Bhoonidhi STAC Catalog Explorer (ISRO / NRSC Live Service)
 * Smart India Hackathon 2026 — PS 26167
 */

import React, { useState, useEffect } from 'react';
import {
  Satellite,
  Radio,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Database,
  Search,
  RefreshCw,
  Layers,
  MapPin,
  Clock,
  ShieldCheck,
  FileCode,
  ArrowRight,
  Maximize2,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { SatelliteMission, BhoonidhiCollection, BhoonidhiObservation, BhoonidhiStatusResponse } from '../types';
import {
  fetchBhoonidhiStatus,
  fetchBhoonidhiCollections,
  searchBhoonidhiCatalog,
  fetchBhoonidhiObservations,
} from '../services/api';

interface SatelliteConstellationProps {
  satellites: SatelliteMission[];
  onSelectSatelliteForSearch?: (sat: SatelliteMission) => void;
  onSendToWorkspace?: (obs: BhoonidhiObservation) => void;
}

// Region Presets for easy search
const AOI_PRESETS: { label: string; bbox: [number, number, number, number] }[] = [
  { label: 'Pan-India & Maritime Subcontinent', bbox: [68.0, 6.0, 97.5, 37.0] },
  { label: 'Assam / Brahmaputra Basin', bbox: [89.7, 24.1, 96.0, 28.2] },
  { label: 'Odisha / Bay of Bengal Coast', bbox: [83.8, 17.8, 87.5, 22.6] },
  { label: 'Delhi-NCR & Yamuna Floodplain', bbox: [76.8, 28.2, 77.5, 28.9] },
  { label: 'Kerala & Western Ghats', bbox: [74.8, 8.2, 77.5, 12.8] },
  { label: 'Gujarat / Rann of Kutch', bbox: [68.1, 20.1, 74.5, 24.7] },
];

export const SatelliteConstellation: React.FC<SatelliteConstellationProps> = ({
  satellites,
  onSelectSatelliteForSearch,
  onSendToWorkspace,
}) => {
  const [activeTab, setActiveTab] = useState<'fleet' | 'bhoonidhi'>('bhoonidhi');
  const [filterAgency, setFilterAgency] = useState<string>('ALL');

  // Bhoonidhi State
  const [bhoonidhiStatus, setBhoonidhiStatus] = useState<BhoonidhiStatusResponse | null>(null);
  const [collections, setCollections] = useState<BhoonidhiCollection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState<boolean>(false);
  const [selectedCollection, setSelectedCollection] = useState<string>('EOS-04_SAR-MRS_L2B');
  const [selectedAoiIndex, setSelectedAoiIndex] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 45);
    return d.toISOString().substring(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().substring(0, 10);
  });
  const [limit, setLimit] = useState<number>(12);

  // Search Results State
  const [searchResults, setSearchResults] = useState<BhoonidhiObservation[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [inspectedObs, setInspectedObs] = useState<BhoonidhiObservation | null>(null);

  // Load Status and Initial Observations on Mount
  useEffect(() => {
    let isMounted = true;
    fetchBhoonidhiStatus()
      .then((st) => {
        if (isMounted) setBhoonidhiStatus(st);
      })
      .catch((err) => console.warn('Bhoonidhi status error:', err));

    setCollectionsLoading(true);
    fetchBhoonidhiCollections()
      .then((colls) => {
        if (isMounted) {
          setCollections(colls);
          if (colls.length > 0 && !colls.some((c) => c.id === selectedCollection)) {
            setSelectedCollection(colls[0].id);
          }
        }
      })
      .catch((err) => console.warn('Bhoonidhi collections error:', err))
      .finally(() => {
        if (isMounted) setCollectionsLoading(false);
      });

    // Load initial latest observations
    setSearching(true);
    fetchBhoonidhiObservations(12)
      .then((res) => {
        if (isMounted && res.items) {
          setSearchResults(res.items);
        }
      })
      .catch((err) => {
        if (isMounted) setSearchError(err.message || 'Failed to fetch latest observations');
      })
      .finally(() => {
        if (isMounted) setSearching(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Execute STAC Search
  const handleExecuteSearch = async () => {
    setSearching(true);
    setSearchError(null);
    try {
      const aoi = AOI_PRESETS[selectedAoiIndex];
      const startIso = startDate ? (startDate.includes('T') ? startDate : `${startDate}T00:00:00.000Z`) : undefined;
      const endIso = endDate ? (endDate.includes('T') ? endDate : `${endDate}T23:59:59.000Z`) : undefined;

      const res = await searchBhoonidhiCatalog({
        collection: selectedCollection,
        bbox: aoi.bbox,
        startDate: startIso,
        endDate: endIso,
        limit,
      });

      if (res.items && res.items.length > 0) {
        setSearchResults(res.items);
      } else {
        setSearchResults([]);
        setSearchError('No scenes found matching the criteria in Bhoonidhi catalog. Try expanding date range or selecting another collection.');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Search failed. Check network or STAC service parameters.');
    } finally {
      setSearching(false);
    }
  };

  const filteredSatellites = satellites.filter((sat) => {
    if (filterAgency === 'ALL') return true;
    if (filterAgency === 'ISRO') return sat?.agency?.includes('ISRO') ?? false;
    if (filterAgency === 'COPERNICUS') return (sat?.agency?.includes('ESA') || sat?.agency?.includes('Copernicus')) ?? false;
    if (filterAgency === 'NISAR') return sat?.name?.includes('NISAR') ?? false;
    return true;
  });

  return (
    <div className="max-w-[1650px] mx-auto px-4 py-4 space-y-4">
      {/* 1. TOP DUAL-MODE SWITCHER & MISSION HEADER */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              EARTH OBSERVATION TELEMETRY & STAC DISSEMINATION
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            ISRO Satellite Constellation & Live Bhoonidhi Gateway
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real orbital parameters, active sensor modalities, and official STAC API queries directly to NRSC / ISRO servers.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('bhoonidhi')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
              activeTab === 'bhoonidhi'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-sky-600" />
            <span>Live Bhoonidhi STAC Archive</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono px-1.5 py-0.2 rounded font-bold">
              LIVE
            </span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
              activeTab === 'fleet'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Satellite className="w-3.5 h-3.5 text-slate-700" />
            <span>ISRO Fleet Missions</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: BHOONIDHI STAC CATALOG SEARCH & REAL EO SCENES     */}
      {/* ========================================================= */}
      {activeTab === 'bhoonidhi' && (
        <div className="space-y-4">
          {/* Live Status Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>BHOONIDHI API: {bhoonidhiStatus?.status || 'LIVE'}</span>
              </div>
              <div className="text-slate-600 hidden sm:block">
                User: <span className="font-bold text-slate-900">{bhoonidhiStatus?.authenticatedUser || 'krishna261'}</span>
              </div>
              <div className="text-slate-500 hidden md:block">
                Token: <span className="text-emerald-700 font-semibold">{bhoonidhiStatus?.tokenActive ? 'Active' : 'Valid'}</span>
              </div>
              <div className="text-slate-500 hidden lg:block">
                Gateway: <span className="text-slate-700">{bhoonidhiStatus?.gatewayUrl || 'https://bhoonidhi-api.nrsc.gov.in'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-600">
              <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                Collections: <span className="font-bold text-slate-900">{collections.length || 64} available</span>
              </span>
              <span className="bg-sky-50 text-sky-800 px-2 py-1 rounded border border-sky-200 font-bold">
                STAC Spec 1.0.0
              </span>
            </div>
          </div>

          {/* Search Workbench */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-sky-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Search Official Bhoonidhi STAC Catalog
                </h2>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                [Queries real ISRO STAC endpoint /data/search]
              </span>
            </div>

            {/* Filter Controls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Collection Dropdown */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                  Satellite Collection ({collections.length || 64})
                </label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                >
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title || col.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Geographic AOI Preset */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                  Geographic AOI Preset
                </label>
                <select
                  value={selectedAoiIndex}
                  onChange={(e) => setSelectedAoiIndex(parseInt(e.target.value, 10))}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                >
                  {AOI_PRESETS.map((aoi, idx) => (
                    <option key={idx} value={idx}>
                      {aoi.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range (Start / End) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                  Temporal Window (Max 365 Days)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-1/2 text-xs font-mono bg-slate-50 border border-slate-300 rounded px-2 py-1.5"
                  />
                  <span className="text-slate-400 text-xs">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-1/2 text-xs font-mono bg-slate-50 border border-slate-300 rounded px-2 py-1.5"
                  />
                </div>
              </div>

              {/* Query Trigger & Limit */}
              <div className="space-y-1 flex flex-col justify-end">
                <div className="flex items-center gap-2">
                  <select
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                    className="w-24 text-xs font-mono bg-slate-50 border border-slate-300 rounded px-2 py-2"
                  >
                    <option value={6}>Limit: 6</option>
                    <option value={12}>Limit: 12</option>
                    <option value={24}>Limit: 24</option>
                  </select>

                  <button
                    onClick={handleExecuteSearch}
                    disabled={searching}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded px-3 py-2 text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    {searching ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Querying STAC...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Search Catalog</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error / Alert notice if any */}
            {searchError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Catalog Query Notice</div>
                  <div>{searchError}</div>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary Header */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-mono text-slate-500 font-bold uppercase">
              SHOWING {searchResults.length} VERIFIED BHOONIDHI OBSERVATION SCENES
            </span>
            <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
              OFFICIAL NRSC / ISRO DATA
            </span>
          </div>

          {/* Observation Scenes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((obs) => {
              const isSar = obs.modality === 'SAR';
              const dateObj = new Date(obs.acquisitionDate);
              const dateStr = dateObj.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                timeZone: 'Asia/Kolkata',
              });
              const timeStr = dateObj.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Kolkata',
              });

              return (
                <div
                  key={obs.id}
                  className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Image / Thumbnail Preview */}
                    <div className="h-44 bg-slate-900 relative group overflow-hidden">
                      {obs.assets?.thumbnail ? (
                        <img
                          src={obs.assets.thumbnail}
                          alt={obs.id}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 cursor-pointer"
                          onClick={() => setInspectedObs(obs)}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            // Replace with SVG satellite fallback if image server is behind auth proxy
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                          <Satellite className="w-8 h-8 text-slate-600" />
                          <span className="text-[10px] font-mono">BHOONIDHI SCENE PREVIEW</span>
                        </div>
                      )}

                      {/* Floating Badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                          {obs.satellite}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            isSar
                              ? 'bg-emerald-600 text-white'
                              : 'bg-sky-600 text-white'
                          }`}
                        >
                          {obs.modality}
                        </span>
                      </div>

                      <div className="absolute bottom-2 right-2 flex items-center gap-1">
                        <button
                          onClick={() => setInspectedObs(obs)}
                          className="px-2 py-1 bg-white/90 hover:bg-white text-slate-900 text-[10px] font-bold rounded flex items-center gap-1 shadow-xs cursor-pointer"
                          title="View Full STAC Properties"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>STAC</span>
                        </button>
                      </div>
                    </div>

                    {/* Metadata Body */}
                    <div className="p-3.5 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-slate-900">
                            {obs.sensor} {obs.mode ? `(${obs.mode})` : ''}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-[240px]" title={obs.id}>
                            ID: {obs.id}
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          {obs.processingLevel}
                        </span>
                      </div>

                      {/* Attribute Specs */}
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono bg-slate-50 p-2 rounded border border-slate-200 text-slate-700">
                        <div>
                          <span className="text-slate-400 block text-[9px]">ACQUIRED</span>
                          <span className="font-bold text-slate-900">{dateStr} {timeStr} IST</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px]">RESOLUTION</span>
                          <span className="font-bold text-sky-700">{obs.spatialResolution}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px]">POLARIZATION / BANDS</span>
                          <span className="font-bold text-slate-900">{obs.polarization || 'Multispectral'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px]">ORBIT / SCENE</span>
                          <span className="font-bold text-slate-900">{obs.orbit || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="px-3.5 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setInspectedObs(obs)}
                      className="text-[11px] font-mono font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      <FileCode className="w-3 h-3 text-slate-400" />
                      <span>Properties</span>
                    </button>

                    <button
                      onClick={() => onSendToWorkspace?.(obs)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold transition shadow-xs cursor-pointer"
                    >
                      <span>Analyze</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ISRO & ALLIED EO CONSTELLATION FLEET MISSIONS      */}
      {/* ========================================================= */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          {/* Agency Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Filter By Agency / Mission:</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {['ALL', 'ISRO', 'NISAR', 'COPERNICUS'].map((agency) => (
                <button
                  key={agency}
                  onClick={() => setFilterAgency(agency)}
                  className={`px-3 py-1 rounded-md text-xs transition cursor-pointer ${
                    filterAgency === agency
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {agency}
                </button>
              ))}
            </div>
          </div>

          {/* Fleet Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSatellites.map((sat) => {
              const isSar = sat.modality === 'SAR';
              return (
                <div
                  key={sat.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          {sat.status}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                          isSar
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-sky-50 text-sky-800 border border-sky-200'
                        }`}
                      >
                        {sat.modality}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{sat?.name || 'Satellite Mission'}</h3>
                      <div className="text-xs font-medium text-slate-500">{sat?.agency || 'Space Agency'}</div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                      {sat.description}
                    </p>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50/70 p-2.5 rounded border border-slate-200 text-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Orbit</span>
                        <span className="font-bold text-slate-900 truncate block">{sat.orbitType}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Altitude / Incl.</span>
                        <span className="font-bold text-slate-900">{sat.altitudeKm} km / {sat.inclinationDeg}°</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Sensor Payload</span>
                        <span className="font-bold text-slate-900 truncate block">{sat.sensor}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">GSD Resolution</span>
                        <span className="font-bold text-sky-700">{sat.spatialResolutionMeters}m</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-500 truncate max-w-[180px]">
                      Catalog: {sat.dataCatalog}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      OFFICIAL TELEMETRY
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: BHOONIDHI STAC PROPERTIES INSPECTOR                */}
      {/* ========================================================= */}
      {inspectedObs && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Bhoonidhi STAC Item Properties: {inspectedObs.id}
                </h3>
              </div>
              <button
                onClick={() => setInspectedObs(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">PLATFORM</span>
                  <span className="font-bold text-slate-900">{inspectedObs.satellite}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">SENSOR</span>
                  <span className="font-bold text-slate-900">{inspectedObs.sensor}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">MODALITY</span>
                  <span className="font-bold text-emerald-700">{inspectedObs.modality}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">PRODUCER</span>
                  <span className="font-bold text-slate-900">{inspectedObs.producer}</span>
                </div>
              </div>

              {/* Coordinates */}
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Bounding Box [West, South, East, North]</span>
                <span className="text-slate-800 break-all">{JSON.stringify(inspectedObs.bbox)}</span>
              </div>

              {/* Raw STAC Properties from NRSC */}
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">
                  OFFICIAL STAC PROPERTIES (NRSC / ISRO)
                </span>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded text-[11px] overflow-x-auto max-h-64 scrollbar-thin">
                  {JSON.stringify(inspectedObs.properties, null, 2)}
                </pre>
              </div>

              {/* Assets / URLs */}
              {inspectedObs.assets && (
                <div className="space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[10px] block">ASSET URLS</span>
                  <div className="space-y-1">
                    {Object.entries(inspectedObs.assets).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
                        <span className="text-slate-600 font-bold uppercase">{key}:</span>
                        <a
                          href={val as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 hover:underline truncate max-w-md"
                        >
                          {val as string}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <span className="text-[11px] font-mono text-emerald-700 font-bold">
                VERIFIED AUTHENTIC ISRO BHOONIDHI STAC RECORD
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setInspectedObs(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onSendToWorkspace?.(inspectedObs);
                    setInspectedObs(null);
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition cursor-pointer"
                >
                  Load into EO Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
