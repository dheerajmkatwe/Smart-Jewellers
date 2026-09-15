import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { wt } from '../../lib/utils';
import { Barcode, Printer } from 'lucide-react';

export const BarcodeModule: React.FC = () => {
  const { activeShop, data } = useTenant();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <Barcode className="w-6 h-6 text-gold-bright" />
          <div>
            <h1 className="font-display text-xl font-bold text-gold-bright">Jewellery Tag &amp; Barcode Printer</h1>
            <p className="text-xs text-[#8f9198]">Print shop-branded barcode tags for <b>{activeShop?.name}</b></p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-gradient-to-r from-[#f5d77f] via-[#c9a24b] to-[#997327] text-black font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow hover:brightness-110"
        >
          <Printer className="w-4 h-4" /> Print Selected Tags
        </button>
      </div>

      <div className="bg-[#14161b] border border-[#262a32] p-5 rounded-xl space-y-4">
        <h3 className="font-display font-bold text-[#eae7df] text-sm border-b border-[#1e2128] pb-3">
          Tag Preview Grid ({data.inventory.length} Stock Items)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.inventory.map((item) => (
            <div key={item.id} className="bg-white text-black p-3 rounded-lg border border-gray-300 font-sans shadow-md space-y-2">
              <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <img
                    src={activeShop?.logo_url || 'logo.jpg'}
                    alt="Shop Logo"
                    className="w-5 h-5 rounded-full object-cover border border-amber-600"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'logo.jpg'; }}
                  />
                  <span className="font-bold text-[10.5px] uppercase tracking-wide truncate max-w-[120px]">
                    {activeShop?.name || 'Smart Jewellers'}
                  </span>
                </div>
                <span className="font-mono text-[9px] font-bold text-gray-500">{item.code}</span>
              </div>

              <div>
                <div className="font-bold text-xs text-gray-900 truncate">{item.name}</div>
                <div className="flex justify-between text-[10px] text-gray-700 mt-1">
                  <span>Purity: <b>{item.purity}</b></span>
                  <span>Net: <b>{wt(item.net_weight)}</b></span>
                </div>
                {item.huid && (
                  <div className="text-[9.5px] text-gray-600">
                    HUID: <span className="font-mono font-bold text-black">{item.huid}</span>
                  </div>
                )}
              </div>

              {/* BARCODE CANVAS VISUAL */}
              <div className="bg-gray-100 p-1.5 rounded text-center">
                <div className="font-mono text-[16px] tracking-widest leading-none select-none text-gray-800">
                  ||| | |||| | ||| ||
                </div>
                <div className="font-mono text-[9px] text-gray-600 mt-0.5">{item.code}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
