import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { inr } from '../../lib/utils';
import { TrendingUp, RefreshCw } from 'lucide-react';

export const RatesModule: React.FC = () => {
  const { activeShop, data, saveRate } = useTenant();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-gold-bright" />
          <div>
            <h1 className="font-display text-xl font-bold text-gold-bright">Rate Master (Per Gram)</h1>
            <p className="text-xs text-[#8f9198]">Configure daily bullion rates for <b>{activeShop?.name}</b></p>
          </div>
        </div>
      </div>

      <div className="bg-[#14161b] border border-[#262a32] p-5 rounded-xl space-y-4">
        <div className="flex justify-between items-center border-b border-[#1e2128] pb-3">
          <span className="font-display font-bold text-[#eae7df] text-sm">Bullion Purity Rate Matrix</span>
          <span className="text-xs text-[#8f9198]">As of Today: {new Date().toLocaleDateString('en-IN')}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.rates.map((r, idx) => (
            <div key={idx} className="bg-[#1b1e24] border border-[#262a32] p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-[#eae7df]">{r.metal} — {r.purity}</div>
                  <div className="text-[11px] text-[#8f9198]">Fineness: {r.fineness}</div>
                </div>
                <span className="bg-gold/10 text-gold-bright px-2 py-0.5 rounded text-[10px] font-bold">Live</span>
              </div>

              <div>
                <label className="block text-[11px] text-[#8f9198] font-bold mb-1">Rate per gram (₹)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={r.rate}
                    onChange={(e) => saveRate(idx, Number(e.target.value))}
                    className="w-full bg-[#14161b] border border-[#262a32] rounded-lg px-3 py-2 text-sm text-gold-bright font-mono font-bold focus:border-gold outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
