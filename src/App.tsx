/**
 * SATQUERY AI — Interactive Vision-Language Remote Sensing Platform
 * Scientific Aerospace Light Theme
 * Smart India Hackathon 2026 — Problem Statement 26167 (ISRO)
 */

import React, { useState, useEffect } from 'react';
import { Navigation, NavTab } from './components/Navigation';
import { CommandCenter } from './components/CommandCenter';
import { AnalysisWorkspace } from './components/AnalysisWorkspace';
import { EventsView } from './components/EventsView';
import { SatelliteConstellation } from './components/SatelliteConstellation';
import { DatasetExplorer } from './components/DatasetExplorer';
import { HistoryAndReports } from './components/HistoryAndReports';
import { PreFlightModal } from './components/PreFlightModal';
import { SatelliteCursor } from './components/SatelliteCursor';
import { EarthEvent, SatelliteMission, BenchmarkDataset, BenchmarkSample, PresentationMode, BhoonidhiObservation } from './types';
import { fetchLiveEvents, fetchSatellites, fetchBenchmarkDatasets } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('command');
  const [preFlightOpen, setPreFlightOpen] = useState<boolean>(false);
  const [presentationMode, setPresentationMode] = useState<PresentationMode>('standard');

  // Core Data
  const [events, setEvents] = useState<EarthEvent[]>([]);
  const [satellites, setSatellites] = useState<SatelliteMission[]>([]);
  const [datasets, setDatasets] = useState<BenchmarkDataset[]>([]);
  const [selectedBhoonidhiObs, setSelectedBhoonidhiObs] = useState<BhoonidhiObservation | null>(null);

  // Workspace active preset / context
  const [workspacePreset, setWorkspacePreset] = useState<string>('flood');

  // Fetch initial telemetry
  useEffect(() => {
    fetchLiveEvents().then(setEvents).catch(console.error);
    fetchSatellites().then(setSatellites).catch(console.error);
    fetchBenchmarkDatasets().then(setDatasets).catch(console.error);
  }, []);

  // Quick 60-Second Jury Demo
  const handleQuickDemoLaunch = () => {
    setWorkspacePreset('flood');
    setActiveTab('analyze');
  };

  // Launch analysis with preset case
  const handleLaunchQuickAnalysis = (caseName: 'flood' | 'urban' | 'sar') => {
    setWorkspacePreset(caseName);
    setActiveTab('analyze');
  };

  // Handle selection from Events View
  const handleSelectEventForAnalysis = (evt: EarthEvent) => {
    if (evt.eventType === 'URBAN_EXPANSION') setWorkspacePreset('urban');
    else if (evt.eventType === 'FLOOD') setWorkspacePreset('flood');
    else setWorkspacePreset('sar');

    setActiveTab('analyze');
  };

  // Handle selection from Benchmark Dataset
  const handleSelectBenchmarkSample = (sample: BenchmarkSample) => {
    if (sample.dataset === 'CDVQA') setWorkspacePreset('urban');
    else if (sample.dataset === 'RSVQA') setWorkspacePreset('flood');
    else setWorkspacePreset('sar');

    setActiveTab('analyze');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans selection:bg-sky-600 selection:text-white">
      {/* Precision Aerospace Satellite Tracking Cursor */}
      <SatelliteCursor />

      {/* Mission Control Top Bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenPreFlight={() => setPreFlightOpen(true)}
        onQuickDemoLaunch={handleQuickDemoLaunch}
        presentationMode={presentationMode}
        onChangePresentationMode={setPresentationMode}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-12">
        {activeTab === 'command' && (
          <CommandCenter
            onNavigate={setActiveTab}
            onLaunchQuickAnalysis={handleLaunchQuickAnalysis}
            events={events}
            satellites={satellites}
            presentationMode={presentationMode}
          />
        )}

        {activeTab === 'analyze' && (
          <AnalysisWorkspace
            initialCase={workspacePreset}
            presentationMode={presentationMode}
            initialObservation={selectedBhoonidhiObs}
          />
        )}

        {activeTab === 'events' && (
          <EventsView
            events={events}
            onSelectEventForAnalysis={handleSelectEventForAnalysis}
            onViewOnMap={(_evt) => {
              setActiveTab('command');
            }}
          />
        )}

        {activeTab === 'satellites' && (
          <SatelliteConstellation
            satellites={satellites}
            onSendToWorkspace={(obs) => {
              setSelectedBhoonidhiObs(obs);
              setActiveTab('analyze');
            }}
          />
        )}

        {activeTab === 'datasets' && (
          <DatasetExplorer
            datasets={datasets}
            onSelectSampleForAnalysis={handleSelectBenchmarkSample}
          />
        )}

        {activeTab === 'history' && (
          <HistoryAndReports
            onLoadIntoWorkspace={(_item) => {
              setActiveTab('analyze');
            }}
          />
        )}
      </main>

      {/* Pre-Flight System Readiness Modal */}
      <PreFlightModal
        isOpen={preFlightOpen}
        onClose={() => setPreFlightOpen(false)}
      />

      {/* Mission Footer */}
      <footer className="border-t border-slate-200 bg-white py-3.5 px-6 text-xs text-slate-500 font-mono flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-900 font-bold">SATQUERY AI • ISRO SIH 2026 PS 26167</span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-slate-500 hidden sm:inline">Multimodal Vision-Language Earth Observation Platform</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>NRSC BHOONIDHI</span>
          <span>ISRO BHUVAN</span>
          <span>NASA FIRMS</span>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            ALL SYSTEMS NOMINAL
          </span>
        </div>
      </footer>
    </div>
  );
}
