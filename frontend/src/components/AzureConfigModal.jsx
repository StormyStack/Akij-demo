import React, { useState } from 'react';
import { X, Cloud, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function AzureConfigModal({ isOpen, onClose, currentUrl, onSaveUrl }) {
  const [url, setUrl] = useState(currentUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const cleanUrl = url.replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/api/health`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setTestResult({
          success: true,
          message: `Connected successfully! Oracle: ${data.tiers?.data?.oracleDb?.mode || 'OK'}, Redis: ${data.tiers?.data?.redis?.mode || 'OK'}`
        });
      } else {
        setTestResult({ success: false, message: `Server returned HTTP ${res.status}` });
      }
    } catch (err) {
      const isMixedContent = window.location.protocol === 'https:' && cleanUrl.startsWith('http://');
      const guidance = isMixedContent
        ? 'Browser blocked Mixed Content (HTTPS website calling HTTP backend). Click the lock/shield icon on your browser address bar -> Site settings -> Allow "Insecure content", then refresh.'
        : `Connection failed: ${err.message}. Make sure your Azure VM Security Group allows inbound port 5000 or 80.`;

      setTestResult({
        success: false,
        message: guidance
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSaveUrl(url.replace(/\/+$/, ''));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Azure Backend Endpoint</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            When deployed to <strong>Azure Static Web Apps</strong>, specify the public IP or DNS address of your <strong>Azure VM</strong> running the backend Docker container.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Backend REST API Base URL
            </label>
            <input
              type="text"
              placeholder="e.g. http://20.120.45.10:5000 or http://localhost:5000"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !url}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-blue-600' : ''}`} />
              {testing ? 'Pinging API...' : 'Test Connection'}
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
              testResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
}
