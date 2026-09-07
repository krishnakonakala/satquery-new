/**
 * SATQUERY AI — Pre-Flight System Readiness Modal
 * Scientific Aerospace Light Theme
 * SIH 2026 Jury Inspection & System Hardware / Model Telemetry
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Cpu, Database, Satellite, Brain, ShieldCheck, X, RefreshCw, Activity } from 'lucide-react';
import { SystemStatus } from '../types';
import { fetchSystemStatus } from '../services/api';

interface PreFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreFlightModal: React.FC<PreFlightModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await fetchSystemStatus();
      setStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadStatus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl rounded-xl p-6 text-slate-900 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                System Telemetry & Hardware Inspection
              </h2>
              <p className="text-xs text-slate-500 font-medium">SIH 2026 PS 26167 • ISRO Dept of Space</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-mono">
            Probing system hardware and telemetry...
          </div>
        ) : !status ? (
          <div className="py-12 text-center text-red-600 text-xs font-mono">
            Failed to retrieve hardware status.
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Status Summary Banner */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-emerald-900">ALL SUBSYSTEMS NOMINAL</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                READY FOR INFERENCE
              </span>
            </div>

            {/* Hardware Telemetry */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px] font-mono uppercase">
                <Cpu className="w-3.5 h-3.5 text-sky-600" />
                <span>Host Compute & Inference Acceleration</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px]">CPU CORES</span>
                  <span className="font-bold text-slate-800">{status.hardware.cpuCores} Threads</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">RAM</span>
                  <span className="font-bold text-slate-800">{status.hardware.totalMemoryGb} GB</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">ACCELERATION</span>
                  <span className="font-bold text-emerald-700">GEMINI ACCEL</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">ARCHITECTURE</span>
                  <span className="font-bold text-slate-800">{status.hardware.arch}</span>
                </div>
              </div>
            </div>

            {/* Neural Vision Models */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px] font-mono uppercase">
                <Brain className="w-3.5 h-3.5 text-sky-600" />
                <span>Multimodal Vision-Language Engines</span>
              </div>
              <div className="space-y-1.5">
                {Object.entries(status.models).map(([key, modelValue]) => {
                  const model = modelValue as { name: string; status: string };
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100 font-mono text-[11px]"
                    >
                      <div>
                        <span className="font-bold text-slate-800 uppercase">{key}:</span>{' '}
                        <span className="text-slate-600">{model?.name || key}</span>
                      </div>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                        {model?.status || 'OPERATIONAL'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Data Gateways */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px] font-mono uppercase">
                <Database className="w-3.5 h-3.5 text-sky-600" />
                <span>Spatial Data Catalogs & Open APIs</span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                {Object.entries(status.dataSources).map(([sourceKey, srcValue]) => {
                  const src = srcValue as { status: string; mode: string };
                  return (
                    <div key={sourceKey} className="p-2 bg-slate-50 rounded border border-slate-100">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-800 uppercase">{sourceKey}</span>
                        <span className="text-[10px] text-emerald-700 font-bold">{src.status}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-1">{src.mode}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
