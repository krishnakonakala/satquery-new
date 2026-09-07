/**
 * SATQUERY AI — Analysis History & Dossier Reports
 * Scientific Aerospace Light Theme
 * Audit logs, GeoJSON and CSV exports, and executive reports
 * Smart India Hackathon 2026 — PS 26167
 */

import React, { useEffect, useState } from 'react';
import { FileText, Download, Clock, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';
import { AnalysisResult } from '../types';
import { fetchAnalysisHistory } from '../services/api';

interface HistoryAndReportsProps {
  onLoadIntoWorkspace: (result: AnalysisResult) => void;
}

export const HistoryAndReports: React.FC<HistoryAndReportsProps> = ({ onLoadIntoWorkspace }) => {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysisHistory()
      .then((data) => setHistory(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-4 space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Audit History & Scientific Dossiers
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Persistent records of remote sensing investigations with exportable GeoJSON polygons, CSV statistics, and executive reports.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs font-mono">
          Loading audit records...
        </div>
      ) : (!history || history.length === 0) ? (
        <div className="py-16 text-center space-y-3 bg-white border border-slate-200 rounded-lg p-8">
          <Layers className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
          <div className="text-slate-800 text-sm font-bold">
            No Historical Records Yet
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Execute any query in the Analysis Workspace or Command Center to generate an exportable scientific dossier.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {(history || []).map((record) => {
            const recordId = record.analysisId || (record as any).id || 'RECORD';
            const rawTask = record.task || (record as any).taskType || 'ANALYSIS';
            const recordTask = String(rawTask).replace(/_/g, ' ').toUpperCase();
            const rawTime = record.createdAt || (record as any).timestamp || '';
            const recordTime = rawTime ? rawTime.substring(0, 19).replace('T', ' ') : '';

            return (
              <div
                key={recordId}
                className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200 px-1.5 py-0.5 rounded">
                      {recordTask}
                    </span>
                    {recordTime && (
                      <span className="text-xs text-slate-400 font-mono">
                        {recordTime} UTC
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{record.query}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{record.answer}</p>
                </div>

                {/* Exports and action buttons */}
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/analysis/${recordId}/report`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-200 transition"
                  >
                    HTML Dossier
                  </a>
                  <a
                    href={`/api/analysis/${recordId}/geojson`}
                    download={`${recordId}.geojson`}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-200 transition"
                  >
                    GeoJSON
                  </a>
                  <a
                    href={`/api/analysis/${recordId}/csv`}
                    download={`${recordId}.csv`}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-200 transition"
                  >
                    CSV Data
                  </a>
                  <button
                    onClick={() => onLoadIntoWorkspace(record)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded transition cursor-pointer shadow-xs"
                  >
                    Load in Workspace
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
