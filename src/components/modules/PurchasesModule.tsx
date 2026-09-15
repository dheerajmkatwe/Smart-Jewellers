import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { inr } from '../../lib/utils';
import { ShoppingBag } from 'lucide-react';

export const PurchasesModule: React.FC = () => {
  const { activeShop, data } = useTenant();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-6 h-6 text-gold-bright" />
          <div>
            <h1 className="font-display text-xl font-bold text-gold-bright">Purchase Bills Register</h1>
            <p className="text-xs text-[#8f9198]">Bullion &amp; stock arrival invoices for <b>{activeShop?.name}</b></p>
          </div>
        </div>
      </div>

      <div className="bg-[#14161b] border border-[#262a32] p-5 rounded-xl text-center py-10 text-xs text-[#8f9198]">
        No purchase bills recorded for this tenant yet.
      </div>
    </div>
  );
};
