import React, { useState } from 'react';
import { Users, Plus, Search, Mail, Phone, MapPin, DollarSign } from 'lucide-react';

export default function CustomersModule({ customers = [], onAddNewCustomer }) {
  const [search, setSearch] = useState('');

  const filtered = customers.filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.contact_person || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.customer_code || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Client & Customer Directory (CRM)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Commercial wholesale clients, approved credit limits, and contact communication channels
          </p>
        </div>

        <button
          onClick={onAddNewCustomer}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register Customer</span>
        </button>
      </div>

      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers by company, code, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filtered.length} Accounts
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Customer Code</th>
              <th className="py-3 px-4">Company / Client Name</th>
              <th className="py-3 px-4">Contact Representative</th>
              <th className="py-3 px-4">Contact Details</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Approved Credit Limit</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  No customers found. Click "Register Customer" to add one.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                    {c.customer_code}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {c.name}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {c.contact_person}
                  </td>
                  <td className="py-3 px-4 text-slate-600 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{c.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {c.city}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    ${Number(c.credit_limit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {c.status}
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
