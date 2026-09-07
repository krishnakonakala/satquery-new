/**
 * SATQUERY AI — Benchmark Dataset Explorer
 * Scientific Aerospace Light Theme
 * SIH 2026 PS 26167 Ground Truth Benchmarks (VRSBench, RSVQA, CDVQA, BigEarthNet)
 * Smart India Hackathon 2026 — PS 26167
 */

import React, { useState } from 'react';
import { Database, ArrowRight, HelpCircle, FileCheck, CheckCircle2 } from 'lucide-react';
import { BenchmarkDataset, BenchmarkSample } from '../types';

interface DatasetExplorerProps {
  datasets: BenchmarkDataset[];
  onSelectSampleForAnalysis: (sample: BenchmarkSample) => void;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({
  datasets,
  onSelectSampleForAnalysis,
}) => {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(datasets[0]?.id || 'vrsbench');
  const activeDataset = datasets.find((d) => d.id === selectedDatasetId) || datasets[0];

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-4 space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Earth Observation Benchmark Datasets
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            SIH 2026 PS 26167 standardized ground-truth evaluation corpuses for remote sensing VQA & change detection.
          </p>
        </div>

        {/* Dataset Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {datasets.map((ds) => (
            <button
              key={ds.id}
              onClick={() => setSelectedDatasetId(ds.id)}
              className={`px-3 py-1 rounded-md text-xs transition cursor-pointer ${
                selectedDatasetId === ds.id
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {(ds?.name || ds?.id || 'Dataset').split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {activeDataset && (
        <div className="space-y-4">
          {/* Active Dataset Summary Banner */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded">
                  {String(activeDataset.targetTask || (activeDataset as any).taskType || activeDataset.id || 'BENCHMARK').toUpperCase()}
                </span>
                <span className="text-base font-bold text-slate-900">{activeDataset?.name || 'Dataset'}</span>
              </div>
              <p className="text-slate-600 max-w-3xl leading-relaxed">{activeDataset.description}</p>
            </div>

            <div className="flex gap-4 font-mono text-xs bg-slate-50 p-2 rounded border border-slate-200 text-slate-700">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Modalities</span>
                <span className="font-bold text-slate-900">
                  {Array.isArray((activeDataset as any).modalities)
                    ? (activeDataset as any).modalities.join(' + ')
                    : (activeDataset.modality || 'OPTICAL')}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Benchmark Samples</span>
                <span className="font-bold text-slate-900">{activeDataset.sampleCount}</span>
              </div>
            </div>
          </div>

          {/* Sample Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(activeDataset.samples || []).map((sample) => {
              const primaryImage = (sample as any).imageMetadata || sample.images?.[0];
              const sampleImgUrl =
                primaryImage?.thumbnailUrl ||
                primaryImage?.url ||
                'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80';
              const sampleModality = primaryImage?.modality || sample.dataset || 'OPTICAL';

              return (
                <div
                  key={sample.id}
                  className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition"
                >
                  <div className="space-y-2">
                    <div className="w-full h-44 bg-slate-100 rounded border border-slate-200 overflow-hidden relative">
                      <img
                        src={sampleImgUrl}
                        alt={sample.id}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                        {sampleModality}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-mono text-slate-400">BENCHMARK QUERY:</div>
                      <p className="text-xs font-bold text-slate-900 leading-snug">{sample.query}</p>
                    </div>

                    <div className="p-2 bg-slate-50 rounded border border-slate-200 text-xs font-mono text-slate-700">
                      <span className="text-slate-400 block text-[9px] uppercase">GROUND TRUTH ANSWER:</span>
                      <span className="font-semibold text-emerald-800">{sample.groundTruthAnswer || 'Ground truth annotated'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onSelectSampleForAnalysis(sample)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Evaluate with SatQuery AI</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
