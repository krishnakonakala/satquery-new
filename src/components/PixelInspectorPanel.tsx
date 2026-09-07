/**
 * SATQUERY AI — Pixel Inspector Component
 * Real-time georeferenced raster coordinate and multi-band spectral inspector.
 * Computes exact latitude, longitude, pixel coordinates, band values,
 * SAR backscatter dB, and difference metrics on image click/hover.
 * Smart India Hackathon 2026 — PS 26167
 */

import React from 'react';
import { Crosshair, MapPin, Layers, Radio, Activity } from 'lucide-react';

export interface PixelInspectionData {
  lat: number;
  lng: number;
  row: number;
  col: number;
  imageAVal: {
    r: number;
    g: number;
    b: number;
    intensity: number;
    sarBackscatterDb?: number;
  };
  imageBVal?: {
    r: number;
    g: number;
    b: number;
    intensity: number;
    sarBackscatterDb?: number;
  };
  difference: number;
  spectralIndex: {
    name: string;
    value: number;
  };
  classification: string;
}

interface PixelInspectorPanelProps {
  data: PixelInspectionData | null;
  isActive: boolean;
  onToggleActive: () => void;
  className?: string;
}

export const PixelInspectorPanel: React.FC<PixelInspectorPanelProps> = ({
  data,
  isActive,
  onToggleActive,
  className = '',
}) => {
  return (
    <div
      className={`bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg p-3 shadow-lg text-xs font-mono transition-all ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px] uppercase tracking-wider">
          <Crosshair className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
          <span>REAL-TIME PIXEL INSPECTOR</span>
        </div>
        <button
          onClick={onToggleActive}
          className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition ${
            isActive
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {isActive ? 'INSPECTING' : 'ENABLE'}
        </button>
      </div>

      {!data ? (
        <div className="py-3 text-center text-slate-400 text-[11px]">
          Click or hover anywhere on the image canvas to inspect raster pixels.
        </div>
      ) : (
        <div className="space-y-2">
          {/* Georeferenced Coordinates & Pixel Position */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-2 rounded border border-slate-200 text-[11px]">
            <div>
              <span className="text-slate-400 text-[9px] block">LATITUDE (WGS84)</span>
              <span className="font-bold text-slate-900">{(data.lat ?? 0).toFixed(5)}° N</span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] block">LONGITUDE (WGS84)</span>
              <span className="font-bold text-slate-900">{(data.lng ?? 0).toFixed(5)}° E</span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] block">PIXEL ROW / COL</span>
              <span className="font-bold text-slate-700">
                R: {data.row ?? 0}, C: {data.col ?? 0}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] block">SPECTRAL INDEX ({data.spectralIndex?.name || 'NDVI'})</span>
              <span className="font-bold text-sky-700">{(data.spectralIndex?.value ?? 0).toFixed(3)}</span>
            </div>
          </div>

          {/* Radiometric & Intensity Values */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2 bg-slate-100/70 rounded border border-slate-200">
              <span className="text-slate-500 font-bold block mb-1">IMAGE A (BEFORE)</span>
              <div className="space-y-0.5 text-slate-800">
                <div>RGB: ({data.imageAVal?.r ?? 0}, {data.imageAVal?.g ?? 0}, {data.imageAVal?.b ?? 0})</div>
                <div>Intensity: {data.imageAVal?.intensity ?? 0}</div>
                {data.imageAVal?.sarBackscatterDb !== undefined && (
                  <div className="text-sky-700 font-bold">
                    σ⁰ Backscatter: {data.imageAVal.sarBackscatterDb.toFixed(2)} dB
                  </div>
                )}
              </div>
            </div>

            {data.imageBVal ? (
              <div className="p-2 bg-slate-100/70 rounded border border-slate-200">
                <span className="text-slate-500 font-bold block mb-1">IMAGE B (AFTER)</span>
                <div className="space-y-0.5 text-slate-800">
                  <div>RGB: ({data.imageBVal.r ?? 0}, {data.imageBVal.g ?? 0}, {data.imageBVal.b ?? 0})</div>
                  <div>Intensity: {data.imageBVal.intensity ?? 0}</div>
                  {data.imageBVal.sarBackscatterDb !== undefined && (
                    <div className="text-sky-700 font-bold">
                      σ⁰ Backscatter: {data.imageBVal.sarBackscatterDb.toFixed(2)} dB
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-slate-400">
                No Second Epoch
              </div>
            )}
          </div>

          {/* Delta & Classification */}
          <div className="flex items-center justify-between p-2 bg-slate-900 text-white rounded text-[11px]">
            <div>
              <span className="text-slate-400 text-[9px] block">CHANGE DELTA:</span>
              <span className={`font-bold ${(data.difference ?? 0) > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
                {(data.difference ?? 0) > 0 ? `+${(data.difference ?? 0).toFixed(2)}` : (data.difference ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[9px] block">CLASSIFICATION:</span>
              <span className="font-bold text-emerald-400">{data.classification || 'Surface Feature'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
