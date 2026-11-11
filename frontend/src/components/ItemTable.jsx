import React from 'react';
import { Search, Plus, Edit2, Trash2, RefreshCw, AlertCircle, Tag, AlertTriangle, Package } from 'lucide-react';

export default function ItemTable({
  items,
  loading,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  onRefresh,
  onAddNew,
  onEdit,
  onDelete,
}) {
  const categories = ['All', 'Machinery', 'Packaging', 'Raw Materials', 'Electronics', 'Tools', 'Accessories', 'Furniture'];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>Product Master & Multi-Warehouse Stock Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active item catalog, cost valuation, unit of measure, and safety reorder thresholds
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
            title="Reload from Oracle DB"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Product Item</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU, product name, or category..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="hidden md:block">
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-700"
            >
              {categories.map((c) => (
                <option key={c} value={c === 'All' ? '' : c}>
                  {c === 'All' ? 'All Classifications' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-medium self-end sm:self-auto">
          {items.length} Products Cataloged
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">SKU & Item Name</th>
              <th className="py-3 px-4">Category / UOM</th>
              <th className="py-3 px-4">Cost Price</th>
              <th className="py-3 px-4">Sale Price</th>
              <th className="py-3 px-4">Gross Margin</th>
              <th className="py-3 px-4">Inventory Level</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && items.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-500">
                  <div className="inline-flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Querying Oracle ERP database...</span>
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No product items found</p>
                    <p className="text-xs text-slate-400 mt-1">Try modifying your search or click "New Product Item".</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const cost = Number(item.cost_price || 0);
                const price = Number(item.price || 0);
                const margin = price > 0 ? (((price - cost) / price) * 100).toFixed(1) : 0;
                const isLowStock = Number(item.stock_quantity || 0) <= Number(item.reorder_level || 10);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] font-mono text-blue-600 mt-0.5">{item.sku}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.description}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {item.category}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">UOM: {item.unit_of_measure || 'PCS'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      ${cost.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ${price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-emerald-600 text-[11px]">
                        +{margin}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {isLowStock && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                        <span className={`font-bold ${isLowStock ? 'text-amber-700' : 'text-slate-700'}`}>
                          {item.stock_quantity} {item.unit_of_measure || 'units'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">Safety Min: {item.reorder_level || 10}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'OUT_OF_STOCK'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
