import React, { useState } from 'react';
import { Search, Bell, Plus, Cloud, ChevronDown, CheckCircle2, AlertTriangle, Settings } from 'lucide-react';

export default function ErpHeader({ 
  activeTabTitle, 
  onQuickAction, 
  lowStockCount = 0, 
  health,
  onOpenSettings
}) {
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs">
      {/* Module Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Akij ERP</span>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{activeTabTitle}</span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders, SKU items, suppliers, customers..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Cloud Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Azure ERP Connected</span>
        </div>

        {/* Quick Create Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
          </button>

          {showQuickMenu && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs animate-fade-in"
              onMouseLeave={() => setShowQuickMenu(false)}
            >
              <button
                onClick={() => { onQuickAction('order'); setShowQuickMenu(false); }}
                className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-medium transition-colors"
              >
                + New Sales Order
              </button>
              <button
                onClick={() => { onQuickAction('item'); setShowQuickMenu(false); }}
                className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-medium transition-colors"
              >
                + New Product Item
              </button>
              <button
                onClick={() => { onQuickAction('customer'); setShowQuickMenu(false); }}
                className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-medium transition-colors"
              >
                + Register Customer
              </button>
              <button
                onClick={() => { onQuickAction('supplier'); setShowQuickMenu(false); }}
                className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-medium transition-colors"
              >
                + Register Supplier
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {lowStockCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
            {lowStockCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>

          {showNotifications && (
            <div 
              className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50 text-xs animate-fade-in"
              onMouseLeave={() => setShowNotifications(false)}
            >
              <div className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
                <span>ERP System Alerts</span>
                <span className="text-[10px] text-slate-400">Live</span>
              </div>
              {lowStockCount > 0 ? (
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Inventory Alert:</strong> {lowStockCount} products are below the minimum safety reorder point.
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 text-center py-2 text-xs">
                  All systems and inventory normal.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title="Cloud & API Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
