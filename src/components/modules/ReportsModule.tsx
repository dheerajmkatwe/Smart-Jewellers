import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { inr, wt, fmtDate } from '../../lib/utils';
import { BarChart3, Printer } from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const { activeShop, data } = useTenant();
  const [tab, setTab] = useState<'sales' | 'gst' | 'stock' | 'dues'>('sales');

  const totalSales = data.invoices.reduce((acc, i) => acc + i.grand_total, 0);
  const totalTaxable = data.invoices.reduce((acc, i) => acc + i.taxable, 0);
  const totalCGST = data.invoices.reduce((acc, i) => acc + i.cgst, 0);
  const totalSGST = data.invoices.reduce((acc, i) => acc + i.sgst, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-gold-bright" />
          <div>
            <h1 className="font-display text-xl font-bold text-gold-bright">Reports &amp; GST Analytics</h1>
            <p className="text-xs text-[#8f9198]">Shop-branded audit reports for <b>{activeShop?.name}</b></p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-gradient-to-r from-[#f5d77f] via-[#c9a24b] to-[#997327] text-black font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow hover:brightness-110"
        >
          <Printer className="w-4 h-4" /> Print Full Report
        </button>
      </div>

      <div className="flex border-b border-[#262a32] gap-4">
        {[
          { id: 'sales', label: 'Sales Register' },
          { id: 'gst', label: 'GST Tax Summary' },
          { id: 'stock', label: 'Stock Valuation' },
          { id: 'dues', label: 'Outstanding Dues' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-colors ${
              tab === t.id ? 'text-gold-bright border-gold' : 'text-[#8f9198] border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-[#14161b] border border-[#262a32] p-6 rounded-xl space-y-4 printable-area">
        {/* REPORT HEADER */}
        <div className="flex items-center gap-3 border-b border-[#1e2128] pb-4">
          <img
            src={activeShop?.logo_url || 'logo.jpg'}
            alt={activeShop?.name}
            className="w-12 h-12 rounded-lg border border-gold object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'logo.jpg'; }}
          />
          <div>
            <h2 className="font-display text-lg font-bold text-gold-bright">{activeShop?.name}</h2>
            <p className="text-xs text-[#8f9198]">{activeShop?.address} • GSTIN: {activeShop?.gstin}</p>
          </div>
        </div>

        {tab === 'sales' && (
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#eae7df]">Sales Register ({data.invoices.length} Invoices)</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e2128] text-[#8f9198]">
                  <th className="pb-2">Invoice #</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2 text-right">Taxable</th>
                  <th className="pb-2 text-right">Grand Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2128]">
                {data.invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-2.5 font-bold text-gold-bright">{inv.invoice_no}</td>
                    <td className="py-2.5 text-[#8f9198]">{fmtDate(inv.date)}</td>
                    <td className="py-2.5 text-[#eae7df]">{inv.customer_name}</td>
                    <td className="py-2.5 text-right font-mono">{inr(inv.taxable)}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-[#eae7df]">{inr(inv.grand_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'gst' && (
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#eae7df]">GST Tax Breakdown</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#1b1e24] p-4 rounded-lg border border-[#262a32]">
                <div className="text-[11px] text-[#8f9198]">Total Taxable Turnover</div>
                <div className="font-display text-xl font-bold text-[#eae7df] mt-1">{inr(totalTaxable)}</div>
              </div>
              <div className="bg-[#1b1e24] p-4 rounded-lg border border-[#262a32]">
                <div className="text-[11px] text-[#8f9198]">CGST Collected (1.5%)</div>
                <div className="font-display text-xl font-bold text-gold-bright mt-1">{inr(totalCGST)}</div>
              </div>
              <div className="bg-[#1b1e24] p-4 rounded-lg border border-[#262a32]">
                <div className="text-[11px] text-[#8f9198]">SGST Collected (1.5%)</div>
                <div className="font-display text-xl font-bold text-gold-bright mt-1">{inr(totalSGST)}</div>
              </div>
            </div>
          </div>
        )}

        {tab === 'stock' && (
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#eae7df]">Current Inventory Stock Valuation</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e2128] text-[#8f9198]">
                  <th className="pb-2">Code</th>
                  <th className="pb-2">Item Name</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-right">Net Wt</th>
                  <th className="pb-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2128]">
                {data.inventory.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2.5 font-bold text-gold-bright">{i.code}</td>
                    <td className="py-2.5 font-semibold text-[#eae7df]">{i.name}</td>
                    <td className="py-2.5 text-[#8f9198]">{i.category}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-[#eae7df]">{wt(i.net_weight)}</td>
                    <td className="py-2.5 text-center">
                      <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold">
                        {i.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'dues' && (
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#eae7df]">Customer Dues Register</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e2128] text-[#8f9198]">
                  <th className="pb-2">Customer Code</th>
                  <th className="pb-2">Customer Name</th>
                  <th className="pb-2">Phone</th>
                  <th className="pb-2 text-right">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2128]">
                {data.customers.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 font-bold text-gold-bright">{c.cust_code}</td>
                    <td className="py-2.5 text-[#eae7df]">{c.name}</td>
                    <td className="py-2.5 text-[#8f9198]">{c.phone}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-amber-400">{inr(c.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
