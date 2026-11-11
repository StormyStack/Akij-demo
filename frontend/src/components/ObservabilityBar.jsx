import React, { useState } from 'react';
import { Activity, CloudUpload, ExternalLink, CheckCircle2, AlertTriangle, RefreshCw, HardDrive } from 'lucide-react';

export default function ObservabilityBar({ health, apiUrl, onTriggerBackup, isBackingUp, lastBackupResult }) {
  // Derive Seq URL from current API host: replace port 5000 with 5341
  const getSeqUrl = () => {
    try {
      const parsed = new URL(apiUrl || 'http://localhost:5000');
      parsed.port = '5341';
      return parsed.origin;
    } catch {
      return 'http://localhost:5341';
    }
  };

  const seqUrl = getSeqUrl();
  const seqInfo = health?.tiers?.observability?.seq;
  const backupInfo = health?.tiers?.observability?.backup;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Activity className="w-3.5 h-3.5 text-purple-600" />
            Observability & Data Protection
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Seq Centralized Logging & Azure Blob Hourly Backup
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerBackup}
            disabled={isBackingUp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50"
            title="Trigger an on-demand Oracle DB backup to Azure Blob Storage"
          >
            <CloudUpload className={`w-3.5 h-3.5 text-blue-600 ${isBackingUp ? 'animate-bounce' : ''}`} />
            {isBackingUp ? 'Uploading to Azure Blob...' : 'Run Backup Now'}
          </button>

          <a
            href={seqUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            title="Open Seq Centralized Log Dashboard"
          >
            <span>Open Seq Logs</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Seq Logging Service */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 text-purple-700 rounded-md">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">Seq Structured Logging</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 className="w-3 h-3" /> Port 5341 Active
            </span>
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Endpoint:</span>
              <span className="font-mono text-slate-700 text-[11px]">{seqUrl}</span>
            </div>
            <div className="flex justify-between">
              <span>Format:</span>
              <span className="text-slate-700 font-medium">CLEF (Compact Log Event Format)</span>
            </div>
          </div>
        </div>

        {/* Azure Blob DB Backup */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-sky-100 text-sky-700 rounded-md">
                <HardDrive className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">Oracle DB Azure Blob Backup</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700">
              <CheckCircle2 className="w-3 h-3" /> Every 1 Hour (0 * * * *)
            </span>
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Target Container:</span>
              <span className="font-mono text-slate-700 text-[11px]">
                {backupInfo?.container || 'oracle-backups'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Storage Status:</span>
              <span className={`font-medium ${backupInfo?.configured ? 'text-emerald-600' : 'text-amber-600'}`}>
                {backupInfo?.configured ? 'Azure Blob Connected ☁️' : 'Local / Pending Azure ConnStr'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Backup Alert */}
      {lastBackupResult && (
        <div className="mt-3 p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              <strong>Backup Created:</strong> {lastBackupResult.filename} ({lastBackupResult.sizeKb} KB)
              {lastBackupResult.azureUpload?.container && (
                <span> &bull; Uploaded to Azure Blob: <code>{lastBackupResult.azureUpload.container}</code></span>
              )}
            </span>
          </div>
          <span className="text-[11px] text-sky-700 font-mono">
            {new Date(lastBackupResult.timestamp).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}
