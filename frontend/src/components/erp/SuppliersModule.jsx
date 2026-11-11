import React, { useState } from 'react';
import { Truck, Plus, Search, Mail, Phone, MapPin, Building } from 'lucide-react';

export default function SuppliersModule({ suppliers = [], onAddNewSupplier }) {
  const [search, setSearch] = useState('');

  const filtered = suppliers.filter(s => 
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.contact_person || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.city || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.code || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            <span>Procurement & Vendor Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered industrial suppliers, commercial terms, and procurement channels
          </p>
        </div>

        <button
          onClick={onAddNewSupplier}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register Supplier</span>
        </button>
      </div>

      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppliers by name, code, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filtered.length} Vendors Listed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Vendor Code</th>
              <th className="py-3 px-4">Company Name</th>
              <th className="py-3 px-4">Contact Person</th>
              <th className="py-3 px-4">Contact Info</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Payment Terms</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  No suppliers found. Click "Register Supplier" to add one.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                    {s.code}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {s.name}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {s.contact_person}
                  </td>
                  <td className="py-3 px-4 text-slate-600 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{s.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{s.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {s.city}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">
                      {s.payment_terms || 'Net 30'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
