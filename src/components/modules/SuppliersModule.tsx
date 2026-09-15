import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { inr } from '../../lib/utils';
import { Truck } from 'lucide-react';

export const SuppliersModule: React.FC = () => {
  const { activeShop, data } = useTenant();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <Truck className="w-6 h-6 text-gold-bright" />
          <div>
            <h1 className="font-display text-xl font-bold text-gold-bright">Suppliers &amp; Bullion Vendors</h1>
            <p className="text-xs text-[#8f9198]">Wholesale vendor accounts for <b>{activeShop?.name}</b></p>
          </div>
        </div>
      </div>

      <div className="bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1e2128] text-[#8f9198] font-bold">
              <th className="pb-3">Supplier Name</th>
              <th className="pb-3">GSTIN</th>
              <th className="pb-3">Phone</th>
              <th className="pb-3">Address</th>
              <th className="pb-3 text-right">Balance Payable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2128]">
            {data.suppliers.map((s) => (
              <tr key={s.id} className="hover:bg-[#1b1e24]">
                <td className="py-3.5 font-bold text-gold-bright">{s.name}</td>
                <td className="py-3.5 font-mono text-[#eae7df]">{s.gstin || '-'}</td>
                <td className="py-3.5 text-[#8f9198]">{s.phone || '-'}</td>
                <td className="py-3.5 text-[#8f9198]">{s.address || '-'}</td>
                <td className="py-3.5 text-right font-mono font-bold text-red-400">{inr(s.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
