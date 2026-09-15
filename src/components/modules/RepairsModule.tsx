import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { Wrench } from 'lucide-react';

export const RepairsModule: React.FC = () => {
  const { activeShop } = useTenant();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <Wrench className="w-6 h-6 text-gold-bright" />
          <div>
            <h1 className="font-display text-xl font-bold text-gold-bright">Repairs &amp; Customer Service</h1>
            <p className="text-xs text-[#8f9198]">Token receipts &amp; repair tracking for <b>{activeShop?.name}</b></p>
          </div>
        </div>
      </div>

      <div className="bg-[#14161b] border border-[#262a32] p-5 rounded-xl text-center py-10 text-xs text-[#8f9198]">
        No active repair jobs for this shop tenant.
      </div>
    </div>
  );
};
