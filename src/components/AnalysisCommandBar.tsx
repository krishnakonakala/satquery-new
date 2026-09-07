/**
 * SATQUERY AI — Mission Intelligence Command Bar
 * Natural Language Query Router to Real Backend Tools & Workflows
 * Smart India Hackathon 2026 — PS 26167
 */

import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, CloudRain, Satellite, ShieldAlert, Layers, Activity } from 'lucide-react';

interface AnalysisCommandBarProps {
  onExecuteCommand: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const AnalysisCommandBar: React.FC<AnalysisCommandBarProps> = ({
  onExecuteCommand,
  placeholder = 'What do you want to know about this location? (e.g., "Which district has the highest rainfall today?", "Show latest satellite observation over Assam")',
  className = '',
}) => {
  const [query, setQuery] = useState('');

  const quickPrompts = [
    { label: 'Highest Rainfall Today', icon: CloudRain, text: 'Which district has the highest rainfall in India today?' },
    { label: 'Assam Flood Extent', icon: ShieldAlert, text: 'Show flood-affected areas and water expansion in Assam.' },
    { label: 'EOS-04 SAR Catalogue', icon: Satellite, text: 'Show latest EOS-04 SAR satellite observation over Assam.' },
    { label: 'Compare Optical & SAR', icon: Layers, text: 'Compare optical and SAR evidence for standing water detection.' },
    { label: 'NISAR Mission Status', icon: Activity, text: 'Show available NISAR S-band observations and polarimetry.' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onExecuteCommand(query.trim());
  };

  const handlePromptClick = (text: string) => {
    setQuery(text);
    onExecuteCommand(text);
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-3 ${className}`}>
      {/* Top Search Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5 text-sky-600" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white font-medium transition"
          />
        </div>

        <button
          type="submit"
          disabled={!query.trim()}
          className="h-[46px] px-5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg flex items-center gap-2 transition active:scale-98 shadow-xs cursor-pointer flex-shrink-0"
        >
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Execute Intelligence</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Recommended Intent Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
          OPERATIONAL PROMPTS:
        </span>
        <div className="flex items-center gap-1.5 flex-nowrap">
          {quickPrompts.map((p, idx) => {
            const Icon = p.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePromptClick(p.text)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-700 font-medium whitespace-nowrap transition cursor-pointer hover:border-slate-300"
              >
                <Icon className="w-3.5 h-3.5 text-sky-600" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
