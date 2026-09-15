import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { InvoiceItem } from '../../types';
import { inr, wt } from '../../lib/utils';
import { PrintableInvoice } from '../common/PrintableInvoice';
import { Trash2, Plus, ShoppingCart, User, Printer } from 'lucide-react';

export const BillingModule: React.FC = () => {
  const { activeShop, data, addInvoice } = useTenant();

  // Customer Details State
  const [custName, setCustName] = useState('Anand Verma');
  const [custPhone, setCustPhone] = useState('9811122233');
  const [custAddress, setCustAddress] = useState('Flat 402, Sunshine Heights, Mumbai');
  const [custPan, setCustPan] = useState('ABCDE1234F');
  const [supplyType, setSupplyType] = useState<'intra' | 'inter'>('intra');

  // Cart State
  const [cart, setCart] = useState<InvoiceItem[]>([
    {
      code: 'ITM-0001',
      name: '22K Gold Floral Necklace',
      category: 'Necklace',
      metal: 'Gold',
      purity: '22K (916)',
      gross_weight: 24.5,
      net_weight: 24.0,
      stone_charge: 1200,
      making: 450,
      qty: 1,
      line_total: 175920
    }
  ]);

  const [discount, setDiscount] = useState<number>(0);
  const [paidNow, setPaidNow] = useState<number>(0);
  const [selectedItemCode, setSelectedItemCode] = useState('');
  const [activeInvoiceForPrint, setActiveInvoiceForPrint] = useState<any | null>(null);

  const handleAddItemToCart = (code: string) => {
    const found = data.inventory.find(i => i.code === code && i.status === 'In Stock');
    if (!found) return;

    // Default rate lookup for item purity
    const rateObj = data.rates.find(r => r.purity === found.purity) || { rate: 6830 };
    const metalVal = found.net_weight * rateObj.rate;
    const makingVal = found.net_weight * 450;
    const line_total = metalVal + makingVal + found.stone_charge;

    const newItem: InvoiceItem = {
      code: found.code,
      name: found.name,
      category: found.category,
      metal: found.metal,
      purity: found.purity,
      gross_weight: found.gross_weight,
      net_weight: found.net_weight,
      stone_charge: found.stone_charge,
      making: 450,
      qty: 1,
      line_total
    };

    setCart([...cart, newItem]);
    setSelectedItemCode('');
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Recalculations
  const subtotal = cart.reduce((acc, item) => acc + item.line_total, 0);
  const totalMaking = cart.reduce((acc, item) => acc + (item.making * item.net_weight), 0);
  const totalStone = cart.reduce((acc, item) => acc + item.stone_charge, 0);
  const taxable = Math.max(0, subtotal - discount);
  
  const cgst = supplyType === 'intra' ? taxable * 0.015 : 0;
  const sgst = supplyType === 'intra' ? taxable * 0.015 : 0;
  const igst = supplyType === 'inter' ? taxable * 0.03 : 0;
  const totalTax = cgst + sgst + igst;
  const grandTotal = Math.round(taxable + totalTax);

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    if (!custName) {
      alert('Customer Name is required');
      return;
    }

    const invoice_no = 'INV-' + String(data.seq.invoice).padStart(4, '0');
    const newInv = {
      id: 'inv-' + Date.now(),
      shop_id: activeShop?.id || 'tenant-main',
      invoice_no,
      date: new Date().toISOString().slice(0, 10),
      customer_name: custName,
      customer_phone: custPhone,
      customer_address: custAddress,
      customer_pan: custPan,
      subtotal,
      making: totalMaking,
      stone: totalStone,
      taxable,
      cgst,
      sgst,
      igst,
      discount,
      grand_total: grandTotal,
      paid_now: paidNow || grandTotal,
      status: (paidNow || grandTotal) >= grandTotal ? ('Paid' as const) : ('Partial' as const),
      items: cart
    };

    addInvoice(newInv);
    setActiveInvoiceForPrint(newInv);
    setCart([]);
  };

  return (
    <div className="space-y-6">
      {/* POS HEADER */}
      <div className="flex justify-between items-center bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-gold-bright" />
          <div>
            <h1 className="font-display text-xl font-bold text-gold-bright">Billing / Point of Sale (POS)</h1>
            <p className="text-xs text-[#8f9198]">Generating Official GST Tax Invoice for <b>{activeShop?.name}</b></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: CUSTOMER & CART */}
        <div className="lg:col-span-2 space-y-6">
          {/* CUSTOMER SEARCH & DETAILS CARD */}
          <div className="bg-[#14161b] border border-[#262a32] p-5 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-gold-bright font-bold text-xs uppercase tracking-wider">
              <User className="w-4 h-4" /> Customer Information
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#8f9198] font-bold mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-xs text-[#eae7df] focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#8f9198] font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-xs text-[#eae7df] focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#8f9198] font-bold mb-1">PAN Card No.</label>
                <input
                  type="text"
                  value={custPan}
                  onChange={(e) => setCustPan(e.target.value)}
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-xs text-[#eae7df] focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#8f9198] font-bold mb-1">GST Supply Type</label>
                <select
                  value={supplyType}
                  onChange={(e) => setSupplyType(e.target.value as any)}
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-xs text-[#eae7df] focus:border-gold outline-none"
                >
                  <option value="intra">Intrastate CGST (1.5%) + SGST (1.5%)</option>
                  <option value="inter">Interstate IGST (3%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ITEM ADDITION & CART TABLE */}
          <div className="bg-[#14161b] border border-[#262a32] p-5 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-gold-bright font-bold text-xs uppercase tracking-wider">
                Bill Items ({cart.length})
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedItemCode}
                  onChange={(e) => setSelectedItemCode(e.target.value)}
                  className="bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-1.5 text-xs text-[#eae7df] focus:border-gold outline-none"
                >
                  <option value="">-- Select In-Stock Item --</option>
                  {data.inventory.filter(i => i.status === 'In Stock').map(i => (
                    <option key={i.id} value={i.code}>{i.code} — {i.name} ({i.purity}, {wt(i.net_weight)})</option>
                  ))}
                </select>
                <button
                  onClick={() => handleAddItemToCart(selectedItemCode)}
                  className="bg-gold hover:bg-gold-bright text-black font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
            </div>

            <div className="overflow-x-auto w-full touch-pan-x">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1e2128] text-[#8f9198]">
                    <th className="pb-2">Code &amp; Item</th>
                    <th className="pb-2">Purity</th>
                    <th className="pb-2 text-right">Net Wt</th>
                    <th className="pb-2 text-right">Making</th>
                    <th className="pb-2 text-right">Stones</th>
                    <th className="pb-2 text-right">Total</th>
                    <th className="pb-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2128]">
                  {cart.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3">
                        <div className="font-bold text-[#eae7df]">{item.name}</div>
                        <div className="text-[10px] text-[#8f9198]">{item.code}</div>
                      </td>
                      <td className="py-3 text-gold-bright font-bold">{item.purity}</td>
                      <td className="py-3 text-right font-mono">{wt(item.net_weight)}</td>
                      <td className="py-3 text-right font-mono">{inr(item.making)}/g</td>
                      <td className="py-3 text-right font-mono">{inr(item.stone_charge)}</td>
                      <td className="py-3 text-right font-mono font-bold text-gold-bright">{inr(item.line_total)}</td>
                      <td className="py-3 text-center">
                        <button onClick={() => handleRemoveFromCart(idx)} className="text-[#8f9198] hover:text-red-400 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TAX BILLING SUMMARY */}
        <div className="bg-[#14161b] border border-[#262a32] p-5 rounded-xl space-y-4 h-fit sticky top-20">
          <h3 className="font-display font-bold text-[#eae7df] text-sm border-b border-[#1e2128] pb-3">
            Invoice Financial Summary
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[#8f9198]">
              <span>Items Subtotal:</span>
              <span className="font-mono text-[#eae7df]">{inr(subtotal)}</span>
            </div>

            <div className="flex justify-between items-center text-[#8f9198]">
              <span>Discount (₹):</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-24 bg-[#1b1e24] border border-[#262a32] rounded px-2 py-1 text-right text-xs text-[#eae7df] outline-none"
              />
            </div>

            <div className="flex justify-between text-[#8f9198]">
              <span>Taxable Value:</span>
              <span className="font-mono text-[#eae7df]">{inr(taxable)}</span>
            </div>

            {supplyType === 'intra' ? (
              <>
                <div className="flex justify-between text-[#8f9198]">
                  <span>CGST (1.5%):</span>
                  <span className="font-mono">{inr(cgst)}</span>
                </div>
                <div className="flex justify-between text-[#8f9198]">
                  <span>SGST (1.5%):</span>
                  <span className="font-mono">{inr(sgst)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-[#8f9198]">
                <span>IGST (3.0%):</span>
                <span className="font-mono">{inr(igst)}</span>
              </div>
            )}

            <div className="border-t border-[#1e2128] pt-3 flex justify-between items-center text-sm font-bold text-gold-bright">
              <span>Grand Total:</span>
              <span className="font-mono text-base">{inr(grandTotal)}</span>
            </div>

            <div className="pt-2">
              <label className="block text-[11px] text-[#8f9198] font-bold mb-1">Amount Paid Now (₹)</label>
              <input
                type="number"
                value={paidNow || grandTotal}
                onChange={(e) => setPaidNow(Number(e.target.value))}
                className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-xs text-[#eae7df] font-mono focus:border-gold outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleCompleteSale}
            className="w-full bg-gradient-to-r from-[#f5d77f] via-[#c9a24b] to-[#997327] text-black font-bold text-xs py-3 rounded-xl shadow-lg hover:brightness-110 flex items-center justify-center gap-2 mt-4"
          >
            <Printer className="w-4 h-4" />
            <span>Complete Sale &amp; Print Official GST Invoice</span>
          </button>
        </div>
      </div>

      {/* PRINT MODAL IF INVOICE GENERATED */}
      {activeInvoiceForPrint && (
        <PrintableInvoice
          invoice={activeInvoiceForPrint}
          onClose={() => setActiveInvoiceForPrint(null)}
        />
      )}
    </div>
  );
};
