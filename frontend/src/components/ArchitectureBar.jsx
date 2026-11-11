import React from 'react';
import { Server, Database, Zap, Layers, RefreshCw, Globe, Settings, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ArchitectureBar({ 
  health, 
  lastQueryInfo, 
  onFlushCache, 
  isFlushing,
  onOpenConfig,
  apiUrl
}) {
  const isCacheHit = lastQueryInfo?.source === 'redis_cache';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              3-Tier Architecture
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              Azure SWA + Azure VM Docker
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">System Topology & Real-Time Data Flow</h2>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button
            onClick={onFlushCache}
            disabled={isFlushing}
            className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors disabled:opacity-50"
            title="Purge Redis Cache to force the next query directly from Oracle Database"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-600 ${isFlushing ? 'animate-spin' : ''}`} />
            {isFlushing ? 'Flushing...' : 'Flush Redis Cache'}
          </button>

          <button
            onClick={onOpenConfig}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            title="Configure Backend API endpoint"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">API Config</span>
          </button>
        </div>
      </div>

      {/* 3-Tier Visual Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Tier 1: Presentation */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-md">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tier 1 • Presentation</div>
                <div className="text-sm font-semibold text-slate-900">Azure Static Web Apps</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Client Active
            </span>
          </div>
          <div className="text-xs text-slate-500 space-y-0.5">
            <div>Framework: <span className="text-slate-800 font-medium">React 18 + Vite SPA</span></div>
            <div>Deployment: <span className="text-slate-800 font-medium">Azure SWA Edge CDN</span></div>
          </div>
        </div>

        {/* Tier 2: Logic API */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-md">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tier 2 • Application</div>
                <div className="text-sm font-semibold text-slate-900">Node.js Express API</div>
              </div>
            </div>
            {health?.status === 'OK' ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Port 5000
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> Connecting...
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 space-y-0.5">
            <div>Host: <span className="text-slate-800 font-mono text-[11px] truncate">{apiUrl || 'localhost:5000'}</span></div>
            <div>Driver: <span className="text-slate-800 font-medium">node-oracledb Thin Mode</span></div>
          </div>
        </div>

        {/* Tier 3: Data Tier (Oracle DB + Redis) */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-md">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tier 3 • Data & Cache</div>
                <div className="text-sm font-semibold text-slate-900">Oracle DB 23ai + Redis</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ports 1521 / 6379
            </span>
          </div>
          <div className="text-xs text-slate-500 space-y-0.5">
            <div>Database: <span className="text-slate-800 font-medium">Oracle Free (FREEPDB1)</span></div>
            <div>Cache: <span className="text-slate-800 font-medium">Redis 7 Alpine (60s TTL)</span></div>
          </div>
        </div>
      </div>

      {/* Query Performance & Cache Tracer Banner */}
      {lastQueryInfo && (
        <div className={`mt-4 p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs transition-all ${
          isCacheHit 
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 flash-cache-hit' 
            : 'bg-amber-50/80 border-amber-200 text-amber-900 flash-cache-miss'
        }`}>
          <div className="flex items-center gap-2">
            {isCacheHit ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded font-bold bg-emerald-600 text-white">
                <Zap className="w-3 h-3" /> REDIS CACHE HIT
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded font-bold bg-amber-600 text-white">
                <Database className="w-3 h-3" /> ORACLE DB DIRECT QUERY
              </span>
            )}
            <span>
              {isCacheHit 
                ? 'Data served directly from in-memory Redis cache (sub-millisecond).'
                : 'Cache miss: Queried SQL from Oracle Database and populated Redis cache.'}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono font-medium self-end sm:self-auto">
            <span>Latency: <strong>{lastQueryInfo.executionTimeMs} ms</strong></span>
            <span>Items: <strong>{lastQueryInfo.count}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
