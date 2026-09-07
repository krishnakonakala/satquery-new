/**
 * SATQUERY AI — Live Earth Surveillance & Disaster Monitoring
 * Scientific Aerospace Light Theme
 * Integrates NASA FIRMS Thermal Anomalies, ISRO DMSP Floods & Coastal Tracks
 * Smart India Hackathon 2026 — PS 26167
 */

import React, { useState } from 'react';
import { Flame, ArrowRight, Radio, Filter, MapPin, Calendar, Compass, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { EarthEvent } from '../types';

interface EventsViewProps {
  events: EarthEvent[];
  onSelectEventForAnalysis: (event: EarthEvent) => void;
  onViewOnMap: (event: EarthEvent) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  onSelectEventForAnalysis,
  onViewOnMap,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEvents = events.filter((evt) => {
    if (filterType === 'ALL') return true;
    return evt.eventType === filterType;
  });

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-4 space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Active Earth Events & Disaster Surveillance
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-correlated thermal anomalies, flood plains, and coastal storm systems across the Indian subcontinent.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {['ALL', 'WILDFIRE', 'FLOOD', 'CYCLONE', 'URBAN_EXPANSION'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-md text-xs transition cursor-pointer ${
                filterType === type
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((evt) => {
          const isFire = evt.eventType === 'WILDFIRE';
          const isFlood = evt.eventType === 'FLOOD';
          const isCyclone = evt.eventType === 'CYCLONE';

          return (
            <div
              key={evt.id}
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                      isFire
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : isFlood
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {evt.eventType}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{evt.source}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{evt.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{evt.locationName}</span>
                </p>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                  {evt.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50/70 p-2 rounded border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[9px]">COORDINATES</span>
                    <span className="font-bold text-slate-800">
                      {evt.coordinates.lat.toFixed(2)}°N, {evt.coordinates.lng.toFixed(2)}°E
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">CORRELATION</span>
                    <span className="font-bold text-emerald-700 truncate block">
                      {evt.satelliteCorrelation?.satellite || 'EOS-04 SAR'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onViewOnMap(evt)}
                  className="flex-1 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  <span>Show on Map</span>
                </button>
                <button
                  onClick={() => onSelectEventForAnalysis(evt)}
                  className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Analyze</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
