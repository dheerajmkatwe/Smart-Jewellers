import React from 'react';
import { Invoice } from '../../types';
import { useTenant } from '../../context/TenantContext';
import { inr, wt, fmtDate } from '../../lib/utils';

interface PrintableInvoiceProps {
  invoice: Invoice;
  onClose: () => void;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({ invoice, onClose }) => {
  const { activeShop } = useTenant();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#14161b] border border-[#262a32] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-4 bg-[#1b1e24] border-b border-[#262a32] flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={activeShop?.logo_url || 'logo.jpg'}
              alt={activeShop?.name}
              className="w-9 h-9 rounded-full border border-gold object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = 'logo.jpg'; }}
            />
            <div>
              <h3 className="font-display font-bold text-gold-bright text-base">Official GST Tax Invoice Preview</h3>
              <p className="text-xs text-[#8f9198]">Invoice #{invoice.invoice_no} — {activeShop?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-gradient-to-r from-[#f5d77f] via-[#c9a24b] to-[#997327] text-black font-bold text-xs px-4 py-2 rounded-lg shadow hover:brightness-110"
            >
              🖨️ Print / Save PDF
            </button>
            <button onClick={onClose} className="text-[#8f9198] hover:text-white px-3 py-1 font-bold text-lg">✕</button>
          </div>
        </div>

        {/* PRINTABLE INVOICE BODY */}
        <div className="p-6 overflow-y-auto bg-white text-black printable-area font-sans text-xs">
          {/* TAX INVOICE HEADER */}
          <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <img
                src={activeShop?.logo_url || 'logo.jpg'}
                alt="Shop Logo"
                className="w-16 h-16 rounded-lg object-cover border border-gray-300"
                onError={(e) => { (e.target as HTMLImageElement).src = 'logo.jpg'; }}
              />
              <div>
                <h1 className="font-serif text-xl font-bold text-gray-900 tracking-wide">{activeShop?.name || 'Smart Jewellers'}</h1>
                <p className="text-gray-600 font-semibold italic text-[11px]">{activeShop?.tagline || 'Fine Gold & Diamond Jewellery'}</p>
                <p className="text-gray-700 mt-1 max-w-md">{activeShop?.address}, {activeShop?.city}</p>
                <p className="text-gray-700"><b>Ph:</b> {activeShop?.phone} | <b>Email:</b> {activeShop?.email}</p>
                <p className="text-gray-800"><b>GSTIN:</b> {activeShop?.gstin || '27AAAAA0000A1Z5'} | <b>State Code:</b> {activeShop?.state_code || '27'}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block bg-gray-900 text-gold-bright font-bold px-3 py-1 text-sm rounded mb-2 tracking-widest uppercase">
                TAX INVOICE
              </div>
              <p className="text-gray-800"><b>Invoice No:</b> <span className="font-bold text-gray-900">{invoice.invoice_no}</span></p>
              <p className="text-gray-800"><b>Date:</b> {fmtDate(invoice.date)}</p>
              <p className="text-gray-800"><b>Place of Supply:</b> Maharashtra ({activeShop?.state_code || '27'})</p>
            </div>
          </div>

          {/* CUSTOMER & BILLING DETAILS */}
          <div className="grid grid-cols-2 gap-4 border border-gray-300 rounded p-3 mb-4 bg-gray-50">
            <div>
              <p className="font-bold text-gray-900 border-b border-gray-200 pb-1 mb-1 uppercase text-[10.5px]">Billed To (Customer Details)</p>
              <p className="font-bold text-gray-900 text-sm">{invoice.customer_name}</p>
              <p className="text-gray-700"><b>Phone:</b> {invoice.customer_phone || '-'}</p>
              <p className="text-gray-700"><b>Address:</b> {invoice.customer_address || 'Walk-in Customer'}</p>
              {invoice.customer_pan && <p className="text-gray-700"><b>PAN No:</b> {invoice.customer_pan}</p>}
            </div>
            <div>
              <p className="font-bold text-gray-900 border-b border-gray-200 pb-1 mb-1 uppercase text-[10.5px]">Payment Status</p>
              <p className="text-gray-700"><b>Payment Mode:</b> Cash / UPI / Card</p>
              <p className="text-gray-700"><b>Invoice Status:</b> <span className="font-bold uppercase text-green-700">{invoice.status}</span></p>
              <p className="text-gray-700"><b>Amount Paid:</b> {inr(invoice.paid_now)}</p>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <table className="w-full border-collapse border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-100 text-gray-800 uppercase text-[10px]">
                <th className="border border-gray-300 p-2 text-left">#</th>
                <th className="border border-gray-300 p-2 text-left">Item Code &amp; Description</th>
                <th className="border border-gray-300 p-2 text-center">Purity</th>
                <th className="border border-gray-300 p-2 text-right">Net Wt</th>
                <th className="border border-gray-300 p-2 text-right">Making</th>
                <th className="border border-gray-300 p-2 text-right">Stones</th>
                <th className="border border-gray-300 p-2 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="border border-gray-300 p-2 font-bold">{idx + 1}</td>
                  <td className="border border-gray-300 p-2">
                    <div className="font-bold text-gray-900">{it.name}</div>
                    <div className="text-[10px] text-gray-500">Code: {it.code} | Category: {it.category}</div>
                  </td>
                  <td className="border border-gray-300 p-2 text-center">{it.purity}</td>
                  <td className="border border-gray-300 p-2 text-right font-mono">{wt(it.net_weight)}</td>
                  <td className="border border-gray-300 p-2 text-right font-mono">{inr(it.making)}</td>
                  <td className="border border-gray-300 p-2 text-right font-mono">{inr(it.stone_charge)}</td>
                  <td className="border border-gray-300 p-2 text-right font-mono font-bold">{inr(it.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TOTALS SUMMARY */}
          <div className="flex justify-between items-start mb-6">
            <div className="w-1/2 border border-gray-300 p-3 rounded bg-gray-50">
              <p className="font-bold text-gray-900 border-b pb-1 mb-2 text-[10.5px]">HSN TAX SUMMARY (7113 - Gold Jewellery)</p>
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="text-left py-1">HSN</th>
                    <th className="text-right py-1">Taxable</th>
                    <th className="text-right py-1">CGST 1.5%</th>
                    <th className="text-right py-1">SGST 1.5%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1">7113</td>
                    <td className="text-right font-mono">{inr(invoice.taxable)}</td>
                    <td className="text-right font-mono">{inr(invoice.cgst)}</td>
                    <td className="text-right font-mono">{inr(invoice.sgst)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="w-5/12 space-y-1 text-right text-xs">
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-600">Items Subtotal:</span>
                <span className="font-mono font-bold">{inr(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-600">Taxable Value:</span>
                <span className="font-mono font-bold">{inr(invoice.taxable)}</span>
              </div>
              <div className="flex justify-between border-b pb-1 text-gray-700">
                <span>CGST @ 1.5%:</span>
                <span className="font-mono">{inr(invoice.cgst)}</span>
              </div>
              <div className="flex justify-between border-b pb-1 text-gray-700">
                <span>SGST @ 1.5%:</span>
                <span className="font-mono">{inr(invoice.sgst)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between border-b pb-1 text-green-700 font-bold">
                  <span>Discount:</span>
                  <span className="font-mono">-{inr(invoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 text-sm font-bold text-gray-900 border-t-2 border-black">
                <span>Grand Total:</span>
                <span className="font-mono text-base">{inr(invoice.grand_total)}</span>
              </div>
            </div>
          </div>

          {/* TERMS & SIGNATURE */}
          <div className="border-t border-gray-300 pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="font-bold text-gray-900 mb-1 text-[10.5px]">Terms &amp; Conditions:</p>
              <pre className="font-sans text-[10px] text-gray-600 whitespace-pre-wrap leading-tight">{activeShop?.terms}</pre>
            </div>
            <div className="text-right pt-6">
              <p className="font-bold text-gray-900">For {activeShop?.name}</p>
              <div className="h-12"></div>
              <p className="border-t border-gray-400 inline-block px-8 pt-1 text-[10.5px] text-gray-600">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
