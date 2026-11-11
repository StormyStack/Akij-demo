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
  HardDrive,
  ShieldCheck,
  Clock
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
            Real-time status for Nginx Ingress, Oracle DB, Redis caching, Seq structured telemetry, and 12-Hour Azure Blob Storage automated backups
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

      {/* 5 Core Infrastructure Nodes (Matching Architecture Diagram) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Tier 1: Frontend (Amplify -> Azure SWA) */}
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
          <div className="text-[11px] text-slate-500 mt-1">Frontend Client (React / Vite)</div>
          <div className="text-[10px] text-slate-400 mt-2 font-mono">Edge CDN Deployed</div>
        </div>

        {/* Ingress: Nginx Reverse Proxy */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 className="w-3 h-3" /> Port 80
            </span>
          </div>
          <div className="font-bold text-slate-900 text-xs">Nginx Ingress Proxy</div>
          <div className="text-[11px] text-slate-500 mt-1">Reverse Proxy Gateway</div>
          <div className="text-[10px] text-slate-400 mt-2 font-mono">Routes /api & /seq</div>
        </div>

        {/* Tier 2: Backend API */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Server className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 className="w-3 h-3" /> Port 5000
            </span>
          </div>
          <div className="font-bold text-slate-900 text-xs">Node.js Express API</div>
          <div className="text-[11px] text-slate-500 mt-1">Application Tier (Docker VM)</div>
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
          <div className="font-bold text-slate-900 text-xs">Oracle Database 23ai</div>
          <div className="text-[11px] text-slate-500 mt-1">Data Tier (FREEPDB1)</div>
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
          <div className="font-bold text-slate-900 text-xs">Redis 7 Cache</div>
          <div className="text-[11px] text-slate-500 mt-1">In-Memory Query Cache</div>
          <div className="text-[10px] text-slate-400 mt-2 font-mono">Keys: {redisStatus?.keysCount || 0}</div>
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

        {/* Azure Blob Storage DB Backup with Retention Policy */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-50 text-sky-700 rounded-lg">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">DB Backup with Retention Policy</h3>
                  <p className="text-xs text-slate-500">Scheduled 12-hour cronjob (0 */12 * * *) + 7-day auto cleanup</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Every 12 Hours
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1 mt-2">
              <div>Target Container: <strong className="font-mono">{backupInfo?.container || 'oracle-backups'}</strong></div>
              <div>Retention Policy: <span className="text-slate-800 font-medium">Keep Last 7 Days (Auto-Purge Older)</span></div>
              <div>Storage Status: <span className={backupInfo?.configured ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-medium'}>
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
        <div className={`p-4 border rounded-xl text-xs flex items-start justify-between gap-3 animate-fade-in ${
          lastBackupResult.azureUpload?.success
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-start gap-2.5">
            {lastBackupResult.azureUpload?.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold">
                {lastBackupResult.azureUpload?.success
                  ? 'Database Backup Streamed to Azure Blob Storage & Retention Applied!'
                  : 'Database Backup Saved Locally (Azure Blob Upload Incomplete)'}
              </div>
              <div className={`mt-0.5 ${lastBackupResult.azureUpload?.success ? 'text-emerald-700' : 'text-amber-800'}`}>
                File: <code className="font-mono bg-white/70 px-1 py-0.5 rounded border border-slate-200">{lastBackupResult.filename}</code> ({lastBackupResult.sizeKb} KB)
                {lastBackupResult.azureUpload?.success ? (
                  <span> &bull; Uploaded to Azure Blob Container: <strong>{lastBackupResult.azureUpload.container}</strong></span>
                ) : (
                  <div className="mt-1 font-mono text-[11px] bg-amber-100/60 p-1.5 rounded text-amber-900">
                    {lastBackupResult.azureUpload?.error || lastBackupResult.azureUpload?.note}
                  </div>
                )}
                {lastBackupResult.retentionPolicy && (
                  <div className="mt-1 text-[11px] opacity-80">
                    Retention policy: {lastBackupResult.retentionPolicy.retentionDays}-day policy enforced &bull; Purged {lastBackupResult.retentionPolicy.localPurged} local file(s), {lastBackupResult.retentionPolicy.cloudPurged} cloud blob(s).
                  </div>
                )}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono opacity-60">
            {new Date(lastBackupResult.timestamp).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}
