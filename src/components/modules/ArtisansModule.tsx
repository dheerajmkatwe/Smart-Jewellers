import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { inr } from '../../lib/utils';
import { Hammer } from 'lucide-react';

export const ArtisansModule: React.FC = () => {
  const { activeShop, data } = useTenant();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <Hammer className="w-6 h-6 text-gold-bright" />
          <div>
            <h1 className="font-display text-xl font-bold text-gold-bright">Artisans &amp; Goldsmith Job Work</h1>
            <p className="text-xs text-[#8f9198]">Karigar gold issue &amp; wastage tracking for <b>{activeShop?.name}</b></p>
          </div>
        </div>
      </div>

      <div className="bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        <h3 className="font-bold text-xs uppercase text-[#eae7df] mb-3">Artisan Directory</h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1e2128] text-[#8f9198]">
              <th className="pb-2">Name</th>
              <th className="pb-2">Phone</th>
              <th className="pb-2">Specialty</th>
              <th className="pb-2 text-right">Payable Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2128]">
            {data.artisans.map((art) => (
              <tr key={art.id}>
                <td className="py-2.5 font-bold text-gold-bright">{art.name}</td>
                <td className="py-2.5 text-[#8f9198]">{art.phone || '-'}</td>
                <td className="py-2.5 text-[#eae7df]">{art.specialty}</td>
                <td className="py-2.5 text-right font-mono font-bold text-amber-400">{inr(art.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
