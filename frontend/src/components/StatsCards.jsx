import React from 'react';
import { Package, DollarSign, Layers, CheckCircle } from 'lucide-react';

export default function StatsCards({ items = [] }) {
  const totalItems = items.length;
  const totalStock = items.reduce((sum, item) => sum + (item.stock_quantity || 0), 0);
  const totalValue = items.reduce((sum, item) => sum + ((item.price || 0) * (item.stock_quantity || 0)), 0);
  const categories = new Set(items.map(i => i.category)).size;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Catalog Items</span>
          <Package className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-2xl font-bold text-slate-900">{totalItems}</div>
        <div className="text-xs text-slate-500 mt-1">Managed products</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Stock</span>
          <Layers className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-bold text-slate-900">{totalStock}</div>
        <div className="text-xs text-slate-500 mt-1">Units in inventory</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Inventory Value</span>
          <DollarSign className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-2xl font-bold text-slate-900">
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-slate-500 mt-1">Valuation at list price</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Categories</span>
          <CheckCircle className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="text-2xl font-bold text-slate-900">{categories}</div>
        <div className="text-xs text-slate-500 mt-1">Product classifications</div>
      </div>
    </div>
  );
}
