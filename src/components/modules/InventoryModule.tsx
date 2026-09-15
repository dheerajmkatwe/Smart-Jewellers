import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { wt, inr } from '../../lib/utils';
import { Package, Plus, Search } from 'lucide-react';

export const InventoryModule: React.FC = () => {
  const { activeShop, data, addInventoryItem } = useTenant();
  const [query, setQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item modal form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Necklace');
  const [metal, setMetal] = useState<'Gold' | 'Silver' | 'Platinum'>('Gold');
  const [purity, setPurity] = useState('22K (916)');
  const [grossWeight, setGrossWeight] = useState<number>(0);
  const [netWeight, setNetWeight] = useState<number>(0);
  const [stoneCharge, setStoneCharge] = useState<number>(0);
  const [huid, setHuid] = useState('');

  const filtered = data.inventory.filter(i =>
    i.name.toLowerCase().includes(query.toLowerCase()) ||
    i.code.toLowerCase().includes(query.toLowerCase()) ||
    (i.huid && i.huid.toLowerCase().includes(query.toLowerCase()))
  );

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !netWeight) {
      alert('Item Name and Net Weight are required.');
      return;
    }

    addInventoryItem({
      name,
      category,
      metal,
      purity,
      gross_weight: grossWeight || netWeight,
      stone_weight: Math.max(0, (grossWeight || netWeight) - netWeight),
      net_weight: netWeight,
      stone_charge: stoneCharge,
      huid
    });

    setShowAddModal(false);
    setName('');
    setGrossWeight(0);
    setNetWeight(0);
    setStoneCharge(0);
    setHuid('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-gold-bright" />
          <div>
            <h1 className="font-display text-xl font-bold text-gold-bright">Inventory Stock Master</h1>
            <p className="text-xs text-[#8f9198]">Isolated Stock Register for <b>{activeShop?.name}</b></p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8f9198]" />
            <input
              type="text"
              placeholder="Search code, item, HUID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#eae7df] focus:border-gold outline-none"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-[#f5d77f] via-[#c9a24b] to-[#997327] text-black font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow hover:brightness-110"
          >
            <Plus className="w-4 h-4" /> Add Stock Item
          </button>
        </div>
      </div>

      <div className="bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        <div className="overflow-x-auto w-full touch-pan-x">
          <table className="w-full min-w-[800px] text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e2128] text-[#8f9198] font-bold">
                <th className="pb-3">Item Code</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Metal &amp; Purity</th>
                <th className="pb-3 text-right">Gross Wt</th>
                <th className="pb-3 text-right">Net Wt</th>
                <th className="pb-3 text-right">Stone Charge</th>
                <th className="pb-3">HUID Hallmark</th>
                <th className="pb-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2128]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#1b1e24]">
                  <td className="py-3.5 font-bold text-gold-bright">{item.code}</td>
                  <td className="py-3.5 font-semibold text-[#eae7df]">{item.name}</td>
                  <td className="py-3.5 text-[#8f9198]">{item.category}</td>
                  <td className="py-3.5 text-[#eae7df]">{item.purity}</td>
                  <td className="py-3.5 text-right font-mono text-[#8f9198]">{wt(item.gross_weight)}</td>
                  <td className="py-3.5 text-right font-mono font-bold text-[#eae7df]">{wt(item.net_weight)}</td>
                  <td className="py-3.5 text-right font-mono text-[#8f9198]">{inr(item.stone_charge)}</td>
                  <td className="py-3.5">
                    {item.huid ? (
                      <span className="bg-[#1b1e24] border border-[#262a32] text-gold-bright px-2 py-0.5 rounded font-mono text-[10.5px]">
                        {item.huid}
                      </span>
                    ) : (
                      <span className="text-[#5b5e66]">-</span>
                    )}
                  </td>
                  <td className="py-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      item.status === 'In Stock' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ITEM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[1100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161b] border border-[#262a32] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#1e2128] pb-3">
              <h3 className="font-display font-bold text-gold-bright text-base">Add New Stock Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#8f9198] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8f9198] font-bold mb-1">Item Description *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 22K Antique Polki Choker"
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-[#eae7df] focus:border-gold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8f9198] font-bold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-[#eae7df] focus:border-gold outline-none"
                  >
                    <option>Necklace</option>
                    <option>Ring</option>
                    <option>Bangle</option>
                    <option>Chain</option>
                    <option>Earrings</option>
                    <option>Pendant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8f9198] font-bold mb-1">Purity</label>
                  <select
                    value={purity}
                    onChange={(e) => setPurity(e.target.value)}
                    className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-[#eae7df] focus:border-gold outline-none"
                  >
                    <option>22K (916)</option>
                    <option>18K (750)</option>
                    <option>24K (999)</option>
                    <option>14K (585)</option>
                    <option>925 Sterling Silver</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8f9198] font-bold mb-1">Gross Weight (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={grossWeight || ''}
                    onChange={(e) => setGrossWeight(Number(e.target.value))}
                    className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-[#eae7df] focus:border-gold outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#8f9198] font-bold mb-1">Net Weight (g) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={netWeight || ''}
                    onChange={(e) => setNetWeight(Number(e.target.value))}
                    className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-[#eae7df] focus:border-gold outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8f9198] font-bold mb-1">Stone Charge (₹)</label>
                  <input
                    type="number"
                    value={stoneCharge || ''}
                    onChange={(e) => setStoneCharge(Number(e.target.value))}
                    className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-[#eae7df] focus:border-gold outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#8f9198] font-bold mb-1">HUID Hallmark No.</label>
                  <input
                    type="text"
                    value={huid}
                    onChange={(e) => setHuid(e.target.value)}
                    placeholder="e.g. AB1234"
                    className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-[#eae7df] focus:border-gold outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#1e2128]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#262a32] text-[#8f9198] hover:text-white rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#f5d77f] via-[#c9a24b] to-[#997327] text-black font-bold px-5 py-2 rounded-lg hover:brightness-110 shadow"
                >
                  Add Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
