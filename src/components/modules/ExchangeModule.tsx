import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { RotateCcw } from 'lucide-react';

export const ExchangeModule: React.FC = () => {
  const { activeShop } = useTenant();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <RotateCcw className="w-6 h-6 text-gold-bright" />
          <div>
            <h1 className="font-display text-xl font-bold text-gold-bright">Old Gold / Silver Exchange</h1>
            <p className="text-xs text-[#8f9198]">Record old jewellery melted with purity test deductions for <b>{activeShop?.name}</b></p>
          </div>
        </div>
      </div>

      <div className="bg-[#14161b] border border-[#262a32] p-5 rounded-xl text-center py-10 text-xs text-[#8f9198]">
        No old gold exchanges recorded for this shop tenant.
      </div>
    </div>
  );
};
