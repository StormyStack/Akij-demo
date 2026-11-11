import React from 'react';
import { 
  Server, 
  Database, 
  Zap, 
  Activity, 
  CloudUpload, 
  ExternalLink, 
  CheckCircle2, 
  Settings, 
  Layers, 
  Globe,
  HardDrive
} from 'lucide-react';

export default function SystemAdminModule({
  health,
  apiUrl,
  onFlushCache,
  isFlushing,
  onTriggerBackup,
  isBackingUp,
  lastBackupResult,
  onOpenConfig
}) {
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
  const dbStatus = health?.tiers?.data?.oracleDb;
  const redisStatus = health?.tiers?.data?.redis;
  const backupInfo = health?.tiers?.observability?.backup;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Enterprise Cloud Infrastructure
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            System Administration & Observability Hub
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status for Oracle DB, Redis caching, Seq structured telemetry, and Azure Blob Storage automated backups
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onFlushCache}
            disabled={isFlushing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors disabled:opacity-50"
            title="Flush Redis Cache"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-600 ${isFlushing ? 'animate-spin' : ''}`} />
            {isFlushing ? 'Flushing...' : 'Flush Redis Cache'}
          </button>

          <button
            onClick={onOpenConfig}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>Configure Endpoint</span>
          </button>
        </div>
      </div>

      {/* 4 Core Infrastructure Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tier 1: Frontend */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Globe className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 className="w-3 h-3" /> Online
            </span>
          </div>
          <div className="font-bold text-slate-900 text-xs">Azure Static Web Apps</div>
          <div className="text-[11px] text-slate-500 mt-1">Presentation Tier (React 18 / Vite)</div>
          <div className="text-[10px] text-slate-400 mt-2 font-mono">Edge CDN Deployed</div>
        </div>

        {/* Tier 2: Backend */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Server className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 className="w-3 h-3" /> Port 5000
            </span>
          </div>
          <div className="font-bold text-slate-900 text-xs">Node.js Express REST API</div>
          <div className="text-[11px] text-slate-500 mt-1">Application Tier (Azure VM Docker)</div>
          <div className="text-[10px] text-slate-400 mt-2 font-mono truncate">{apiUrl}</div>
        </div>

        {/* Tier 3: Oracle DB */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <Database className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 className="w-3 h-3" /> Port 1521
            </span>
          </div>
          <div className="font-bold text-slate-900 text-xs">Oracle Database 23ai Free</div>
          <div className="text-[11px] text-slate-500 mt-1">Data Tier (PDB: FREEPDB1)</div>
          <div className="text-[10px] text-slate-400 mt-2 font-mono">User: poc_user</div>
        </div>

        {/* Cache: Redis */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Zap className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 className="w-3 h-3" /> Port 6379
            </span>
          </div>
          <div className="font-bold text-slate-900 text-xs">Redis 7 In-Memory Cache</div>
          <div className="text-[11px] text-slate-500 mt-1">High-Speed Query Cache (60s TTL)</div>
          <div className="text-[10px] text-slate-400 mt-2 font-mono">Active Cache Keys: {redisStatus?.keysCount || 0}</div>
        </div>
      </div>

      {/* Observability & Cloud Backup Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seq Structured Logging Dashboard */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Seq Structured Logging Server</h3>
                  <p className="text-xs text-slate-500">Centralized log analytics, error tracing, and CLEF event ingestion</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Port 5341
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              All commercial ERP activities—including sales transactions, stock updates, database queries, and backup events—are streamed directly to Seq for full audit compliance.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">UI: {seqUrl}</span>
            <a
              href={seqUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <span>Open Seq Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Azure Blob Storage DB Backup Cron */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-50 text-sky-700 rounded-lg">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Oracle DB Backup to Azure Blob</h3>
                  <p className="text-xs text-slate-500">Scheduled hourly cronjob (0 * * * *) with Gzip compression</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                Hourly Cron
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1 mt-2">
              <div>Target Container: <strong className="font-mono">{backupInfo?.container || 'oracle-backups'}</strong></div>
              <div>Retention: <span className="text-slate-800 font-medium">Compressed Gzip Archive (.sql.gz)</span></div>
              <div>Status: <span className={backupInfo?.configured ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-medium'}>
                {backupInfo?.configured ? 'Azure Storage Account Connected ☁️' : 'Local Archive (Pending Azure ConnStr)'}
              </span></div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Total Backups: {backupInfo?.totalBackups || 0}</span>
            <button
              onClick={onTriggerBackup}
              disabled={isBackingUp}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <CloudUpload className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-bounce' : ''}`} />
              {isBackingUp ? 'Uploading to Azure...' : 'Run Backup Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Backup Confirmation Box */}
      {lastBackupResult && (
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-start justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Database Backup Completed Successfully!</div>
              <div className="text-sky-700 mt-0.5">
                File: <code className="font-mono bg-sky-100/60 px-1 py-0.5 rounded">{lastBackupResult.filename}</code> ({lastBackupResult.sizeKb} KB)
                {lastBackupResult.azureUpload?.container && (
                  <span> &bull; Streamed to Azure Storage Container: <strong>{lastBackupResult.azureUpload.container}</strong></span>
                )}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono text-sky-600">
            {new Date(lastBackupResult.timestamp).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}
