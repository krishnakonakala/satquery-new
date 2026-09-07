/**
 * SATQUERY AI — Scientific Mission Control Header
 * Clean Light Aerospace Workstation Theme
 * Smart India Hackathon 2026 — PS 26167 (ISRO)
 */

import React, { useState, useEffect } from 'react';
import {
  Globe2,
  Layers,
  Flame,
  Satellite,
  Database,
  FileText,
  Zap,
  Activity,
  ChevronDown,
  Sliders,
} from 'lucide-react';
import { PresentationMode } from '../types';

export type NavTab = 'command' | 'analyze' | 'events' | 'satellites' | 'datasets' | 'history';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenPreFlight: () => void;
  onQuickDemoLaunch: () => void;
  presentationMode: PresentationMode;
  onChangePresentationMode: (mode: PresentationMode) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenPreFlight,
  onQuickDemoLaunch,
  presentationMode,
  onChangePresentationMode,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(
        now.toISOString().substring(11, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'command', label: 'EARTH', sub: 'COMMAND CENTER', icon: Globe2 },
    { id: 'analyze', label: 'ANALYZE', sub: 'EO WORKSPACE', icon: Layers },
    { id: 'events', label: 'EVENTS', sub: 'DISASTER FEED', icon: Flame },
    { id: 'satellites', label: 'SATELLITES', sub: 'CONSTELLATION', icon: Satellite },
    { id: 'datasets', label: 'DATA', sub: 'BENCHMARKS', icon: Database },
    { id: 'history', label: 'HISTORY', sub: 'DOSSIERS', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 transition-all shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        {/* LEFT: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center shadow-sm">
            <Globe2 className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                SATQUERY<span className="text-sky-600">.AI</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded">
                ISRO • PS 26167
              </span>
            </div>
            <p className="text-[10px] tracking-wider text-slate-500 font-medium uppercase hidden lg:block">
              Multimodal Earth Observation Intelligence
            </p>
          </div>
        </div>

        {/* CENTER: Navigation tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as NavTab)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-colors ${
                    isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />
                <span className="text-xs uppercase">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* RIGHT: Status, Mode & Actions */}
        <div className="flex items-center gap-2.5">
          {/* UTC Clock */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{utcTime || '00:00:00 UTC'}</span>
          </div>

          {/* Presentation Mode Selector (Standard / Advanced / Expert) */}
          <div className="hidden sm:flex items-center border border-slate-200 rounded-md p-0.5 bg-slate-50 text-[11px] font-medium text-slate-600">
            {(['standard', 'advanced', 'expert'] as PresentationMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onChangePresentationMode(mode)}
                className={`px-2 py-0.5 rounded capitalize transition ${
                  presentationMode === mode
                    ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                    : 'hover:text-slate-900 text-slate-500'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* 60-Second Flagship Demo Launch */}
          <button
            onClick={onQuickDemoLaunch}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wide uppercase bg-sky-600 hover:bg-sky-500 text-white rounded-md shadow-sm transition active:scale-95 cursor-pointer"
            title="Launch 60-Second Assam Flood Bi-Temporal Analysis"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span className="hidden md:inline">60s Demo</span>
          </button>

          {/* System Telemetry Readiness Status */}
          <button
            onClick={onOpenPreFlight}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md transition cursor-pointer shadow-xs"
            title="Inspect System Telemetry & Sensors"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline font-mono text-[11px] font-semibold text-emerald-700">
              TELEMETRY
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
