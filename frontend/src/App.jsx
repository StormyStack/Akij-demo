import React, { useState, useEffect, useCallback } from 'react';
import ArchitectureBar from './components/ArchitectureBar';
import StatsCards from './components/StatsCards';
import ItemTable from './components/ItemTable';
import ItemModal from './components/ItemModal';
import AzureConfigModal from './components/AzureConfigModal';
import { Database, Server, Globe, ExternalLink } from 'lucide-react';

export default function App() {
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem('AZURE_API_URL') || import.meta.env.VITE_API_URL || 'http://localhost:5000';
  });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [health, setHealth] = useState(null);
  const [lastQueryInfo, setLastQueryInfo] = useState(null);
  const [isFlushing, setIsFlushing] = useState(false);

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Fetch Health & Architecture Status
  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/health`);
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (e) {
      console.warn('Backend API health ping failed:', e.message);
    }
  }, [apiUrl]);

  // Fetch Items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter) params.append('category', categoryFilter);

      const res = await fetch(`${apiUrl}/api/items?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const result = await res.json();
      if (result.success) {
        setItems(result.data || []);
        setLastQueryInfo({
          source: result.source,
          executionTimeMs: result.executionTimeMs,
          count: result.count,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, searchQuery, categoryFilter]);

  // Initial mount & poller
  useEffect(() => {
    fetchHealth();
    fetchItems();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, [fetchHealth, fetchItems]);

  // Flush Redis Cache
  const handleFlushCache = async () => {
    try {
      setIsFlushing(true);
      const res = await fetch(`${apiUrl}/api/items/cache/flush`, { method: 'POST' });
      if (res.ok) {
        // Automatically fetch items again so user sees Oracle DB query latency!
        await fetchItems();
      }
    } catch (err) {
      alert(`Flush cache failed: ${err.message}`);
    } finally {
      setIsFlushing(false);
    }
  };

  // Save Item (Create or Update)
  const handleSaveItem = async (formData) => {
    const isEdit = !!editingItem;
    const url = isEdit ? `${apiUrl}/api/items/${editingItem.id}` : `${apiUrl}/api/items`;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Error saving item');
    }

    await fetchItems();
    await fetchHealth();
  };

  // Delete Item
  const handleDeleteItem = async (id) => {
    if (!window.confirm(`Are you sure you want to delete item #${id}?`)) return;

    try {
      const res = await fetch(`${apiUrl}/api/items/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchItems();
    } catch (err) {
      alert(`Failed to delete item: ${err.message}`);
    }
  };

  // Save API URL
  const handleSaveApiUrl = (newUrl) => {
    setApiUrl(newUrl);
    localStorage.setItem('AZURE_API_URL', newUrl);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Enterprise Navigation */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              3T
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight">Enterprise 3-Tier Application</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  PoC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Azure Static Web Apps • Node.js Backend • Oracle Database 23ai • Redis Cache
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API: {apiUrl}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Architecture Status & Performance Monitor */}
        <ArchitectureBar
          health={health}
          lastQueryInfo={lastQueryInfo}
          onFlushCache={handleFlushCache}
          isFlushing={isFlushing}
          onOpenConfig={() => setIsConfigModalOpen(true)}
          apiUrl={apiUrl}
        />

        {/* High-level KPI Cards */}
        <StatsCards items={items} />

        {/* Data Table */}
        <ItemTable
          items={items}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          onRefresh={fetchItems}
          onAddNew={() => {
            setEditingItem(null);
            setIsItemModalOpen(true);
          }}
          onEdit={(item) => {
            setEditingItem(item);
            setIsItemModalOpen(true);
          }}
          onDelete={handleDeleteItem}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Demo 3-Tier Application Architecture • Ready for Azure Deployment</span>
          <div className="flex items-center gap-3">
            <span>Frontend: React 18 / SWA</span>
            <span>•</span>
            <span>Backend: Express / Docker</span>
            <span>•</span>
            <span>Database: Oracle DB Free</span>
          </div>
        </div>
      </footer>

      {/* Item Modal (Create/Edit) */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        item={editingItem}
      />

      {/* Azure VM Endpoint Config Modal */}
      <AzureConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        currentUrl={apiUrl}
        onSaveUrl={handleSaveApiUrl}
      />
    </div>
  );
}
