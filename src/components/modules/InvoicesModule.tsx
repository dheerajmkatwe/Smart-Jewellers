import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Invoice } from '../../types';
import { inr, fmtDate } from '../../lib/utils';
import { PrintableInvoice } from '../common/PrintableInvoice';
import { FileText, Printer, Search } from 'lucide-react';

export const InvoicesModule: React.FC = () => {
  const { activeShop, data } = useTenant();
  const [query, setQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filtered = data.invoices.filter(i =>
    i.invoice_no.toLowerCase().includes(query.toLowerCase()) ||
    i.customer_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-gold-bright" />
          <div>
            <h1 className="font-display text-xl font-bold text-gold-bright">Invoice History</h1>
            <p className="text-xs text-[#8f9198]">All generated tax bills for <b>{activeShop?.name}</b></p>
          </div>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8f9198]" />
          <input
            type="text"
            placeholder="Search by invoice no or customer..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#eae7df] focus:border-gold outline-none"
          />
        </div>
      </div>

      <div className="bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#8f9198] text-xs">
            No invoices found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e2128] text-[#8f9198] font-bold">
                  <th className="pb-3">Invoice No</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3 text-right">Taxable</th>
                  <th className="pb-3 text-right">CGST + SGST</th>
                  <th className="pb-3 text-right">Grand Total</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2128]">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#1b1e24]">
                    <td className="py-3.5 font-bold text-gold-bright">{inv.invoice_no}</td>
                    <td className="py-3.5 text-[#8f9198]">{fmtDate(inv.date)}</td>
                    <td className="py-3.5 text-[#eae7df] font-medium">{inv.customer_name}</td>
                    <td className="py-3.5 text-right font-mono">{inr(inv.taxable)}</td>
                    <td className="py-3.5 text-right font-mono text-[#8f9198]">{inr(inv.cgst + inv.sgst + inv.igst)}</td>
                    <td className="py-3.5 text-right font-mono font-bold text-[#eae7df]">{inr(inv.grand_total)}</td>
                    <td className="py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        inv.status === 'Paid' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="bg-[#1b1e24] border border-[#262a32] hover:border-gold text-gold-bright text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 mx-auto"
                      >
                        <Printer className="w-3.5 h-3.5" /> View / Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedInvoice && (
        <PrintableInvoice
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};
