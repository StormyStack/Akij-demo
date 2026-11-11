import React from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Plus, 
  ExternalLink 
} from 'lucide-react';

export default function ErpDashboard({ 
  dashboardData, 
  onNavigate, 
  onQuickAction, 
  onUpdateOrderStatus 
}) {
  const summary = dashboardData?.summary || {
    totalRevenue: 25410.00,
    totalOrders: 4,
    pendingOrders: 2,
    totalInventoryValuation: 42850.00,
    totalProducts: 6,
    lowStockCount: 2,
    totalCustomers: 3,
    totalSuppliers: 3,
  };

  const recentOrders = dashboardData?.recentOrders || [];
  const lowStockAlerts = dashboardData?.lowStockAlerts || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Akij Group Enterprise Portal
          </span>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-1">
            Enterprise Resource Planning & Operations
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Live operations overview across Manufacturing, Procurement, Sales Logistics, and Multi-Tier Warehouse Inventory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onQuickAction('order')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            New Sales Order
          </button>
          <button
            onClick={() => onQuickAction('item')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all"
          >
            <Plus className="w-4 h-4" />
            Add SKU
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Sales Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ${summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.2% from last cycle</span>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sales Orders</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{summary.totalOrders} Total</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{summary.pendingOrders} pending fulfillment</span>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Inventory Valuation</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ${summary.totalInventoryValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {summary.totalProducts} active product SKUs
          </div>
        </div>

        {/* Reorder Warnings */}
        <div className={`border rounded-xl p-5 shadow-xs transition-colors ${
          summary.lowStockCount > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Stock Reorder Alerts</span>
            <div className={`p-2 rounded-lg ${summary.lowStockCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{summary.lowStockCount} Items</div>
          <div className={`text-[11px] font-medium mt-1 ${summary.lowStockCount > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
            {summary.lowStockCount > 0 ? 'Urgent purchase requisitions needed' : 'All stock levels healthy'}
          </div>
        </div>
      </div>

      {/* Main Two-Column ERP Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Sales Orders Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Sales Orders</h2>
              <p className="text-xs text-slate-400">Order processing, fulfillment, and payment tracking</p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No sales orders logged yet. Click "New Sales Order" to create one.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                        {ord.order_number}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {ord.customer_name || `Customer #${ord.customer_id}`}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(ord.order_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        ${Number(ord.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ord.status === 'APPROVED'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : ord.status === 'PROCESSING'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {ord.status === 'PENDING' ? (
                          <button
                            onClick={() => onUpdateOrderStatus(ord.id, 'APPROVED')}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
                          >
                            Approve
                          </button>
                        ) : ord.status === 'APPROVED' ? (
                          <button
                            onClick={() => onUpdateOrderStatus(ord.id, 'SHIPPED')}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                          >
                            Ship
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Logged</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Low Stock Alerts & Vendors (1 Col) */}
        <div className="space-y-6">
          {/* Low Stock Reorder Alerts */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Low Stock Reorder Alerts</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {lowStockAlerts.length} Critical
              </span>
            </div>

            <div className="p-4 divide-y divide-slate-100">
              {lowStockAlerts.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  All warehouse inventory levels are above safety thresholds.
                </div>
              ) : (
                lowStockAlerts.map((item) => (
                  <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 text-xs">{item.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        SKU: {item.sku} &bull; {item.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-red-600">
                        {item.stock_quantity} left
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Reorder at {item.reorder_level}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Open Full Inventory &rarr;
              </button>
            </div>
          </div>

          {/* Quick ERP Vendor & Client Overview */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span>Supply Chain & CRM Partners</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div 
                onClick={() => onNavigate('suppliers')}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 cursor-pointer transition-colors"
              >
                <div className="text-slate-400 text-[11px] font-medium">Registered Vendors</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{summary.totalSuppliers} Vendors</div>
                <div className="text-[10px] text-blue-600 font-medium mt-1">Manage Procurement &rarr;</div>
              </div>

              <div 
                onClick={() => onNavigate('customers')}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 cursor-pointer transition-colors"
              >
                <div className="text-slate-400 text-[11px] font-medium">Active Clients</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{summary.totalCustomers} Accounts</div>
                <div className="text-[10px] text-blue-600 font-medium mt-1">View CRM &rarr;</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
