import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { inr, inr0, wt } from '../../lib/utils';
import { DollarSign, Package, Users, FileText, ArrowUpRight, TrendingUp } from 'lucide-react';

interface ModuleProps {
  onNavigate: (page: string) => void;
}

export const DashboardModule: React.FC<ModuleProps> = ({ onNavigate }) => {
  const { activeShop, data } = useTenant();

  const totalSales = data.invoices.reduce((acc, inv) => acc + inv.grand_total, 0);
  const totalStockWt = data.inventory.filter(i => i.status === 'In Stock').reduce((acc, i) => acc + i.net_weight, 0);
  const totalStockValue = data.inventory.filter(i => i.status === 'In Stock').reduce((acc, i) => acc + (i.net_weight * 6830), 0);
  const totalDues = data.customers.reduce((acc, c) => acc + c.balance, 0);

  return (
    <div className="space-y-6">
      {/* SHOP HEADER */}
      <div className="bg-[#14161b] border border-[#262a32] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={activeShop?.logo_url || 'logo.jpg'}
            alt={activeShop?.name}
            className="w-14 h-14 rounded-xl object-cover shadow-[0_4px_20px_rgba(201,162,75,0.2)]"
            onError={(e) => { (e.target as HTMLImageElement).src = 'logo.jpg'; }}
          />
          <div>
            <h1 className="font-display text-2xl font-bold text-gold-bright">{activeShop?.name || 'Smart Jewellers'}</h1>
            <p className="text-xs text-[#8f9198]">{activeShop?.tagline || 'Multi-Tenant Jewellery Workspace'} • GSTIN: {activeShop?.gstin || '27AAAAA0000A1Z5'}</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('billing')}
          className="bg-gradient-to-r from-[#f5d77f] via-[#c9a24b] to-[#997327] text-black font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg hover:brightness-110 flex items-center gap-2"
        >
          <span>+ Create New POS Sale</span>
        </button>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
          <div className="flex justify-between items-center text-[#8f9198] mb-2">
            <span className="text-xs font-bold">Total Sales (Today)</span>
            <DollarSign className="w-4 h-4 text-gold-bright" />
          </div>
          <div className="font-display text-2xl font-bold text-[#eae7df]">{inr0(totalSales)}</div>
          <div className="text-[11px] text-green-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +12.5% from yesterday
          </div>
        </div>

        <div className="bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
          <div className="flex justify-between items-center text-[#8f9198] mb-2">
            <span className="text-xs font-bold">In-Stock Net Weight</span>
            <Package className="w-4 h-4 text-gold-bright" />
          </div>
          <div className="font-display text-2xl font-bold text-[#eae7df]">{wt(totalStockWt)}</div>
          <div className="text-[11px] text-[#8f9198] mt-1">
            Est. Value: <span className="text-gold-bright font-bold">{inr0(totalStockValue)}</span>
          </div>
        </div>

        <div className="bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
          <div className="flex justify-between items-center text-[#8f9198] mb-2">
            <span className="text-xs font-bold">Customer Outstanding</span>
            <Users className="w-4 h-4 text-gold-bright" />
          </div>
          <div className="font-display text-2xl font-bold text-[#eae7df]">{inr0(totalDues)}</div>
          <div className="text-[11px] text-amber-400 mt-1">Pending receivables</div>
        </div>

        <div className="bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
          <div className="flex justify-between items-center text-[#8f9198] mb-2">
            <span className="text-xs font-bold">22K Gold Rate</span>
            <TrendingUp className="w-4 h-4 text-gold-bright" />
          </div>
          <div className="font-display text-2xl font-bold text-gold-bright">
            {inr(data.rates.find(r => r.purity.includes('22K'))?.rate || 6830)} /g
          </div>
          <div className="text-[11px] text-[#8f9198] mt-1">Live IBJA Rate Master</div>
        </div>
      </div>

      {/* RECENT SALES & QUICK POS MODULE */}
      <div className="bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display font-bold text-[#eae7df] text-base">Recent Sales Invoices ({activeShop?.name})</h3>
          <button onClick={() => onNavigate('invoices')} className="text-xs text-gold-bright font-bold hover:underline">
            View All Invoices →
          </button>
        </div>

        {data.invoices.length === 0 ? (
          <div className="text-center py-8 text-[#8f9198] text-xs">
            No invoices generated yet for this shop tenant.
            <button onClick={() => onNavigate('billing')} className="block mx-auto mt-2 text-gold-bright font-bold hover:underline">
              Create First Sale
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e2128] text-[#8f9198] font-bold">
                  <th className="pb-2">Invoice #</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2 text-right">Grand Total</th>
                  <th className="pb-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2128]">
                {data.invoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#1b1e24]">
                    <td className="py-3 font-bold text-gold-bright">{inv.invoice_no}</td>
                    <td className="py-3 text-[#8f9198]">{inv.date}</td>
                    <td className="py-3 text-[#eae7df] font-medium">{inv.customer_name}</td>
                    <td className="py-3 text-right font-bold text-[#eae7df]">{inr(inv.grand_total)}</td>
                    <td className="py-3 text-center">
                      <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                        {inv.status}
                      </span>
                    </td>
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
