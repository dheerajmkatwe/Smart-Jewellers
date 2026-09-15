import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { inr } from '../../lib/utils';
import { Users, Plus, Search } from 'lucide-react';

export const CustomersModule: React.FC = () => {
  const { activeShop, data, addCustomer } = useTenant();
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pan, setPan] = useState('');

  const filtered = data.customers.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.phone.includes(query) ||
    c.cust_code.toLowerCase().includes(query.toLowerCase())
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    addCustomer({ name, phone, address, pan, balance: 0 });
    setShowModal(false);
    setName('');
    setPhone('');
    setAddress('');
    setPan('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-gold-bright" />
          <div>
            <h1 className="font-display text-xl font-bold text-gold-bright">Customer Relationship Master</h1>
            <p className="text-xs text-[#8f9198]">Customer accounts &amp; dues for <b>{activeShop?.name}</b></p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8f9198]" />
            <input
              type="text"
              placeholder="Search customer name or phone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#eae7df] focus:border-gold outline-none"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-[#f5d77f] via-[#c9a24b] to-[#997327] text-black font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow hover:brightness-110"
          >
            <Plus className="w-4 h-4" /> Add Customer
          </button>
        </div>
      </div>

      <div className="bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[650px] text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e2128] text-[#8f9198] font-bold">
                <th className="pb-3">Code</th>
                <th className="pb-3">Customer Name</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">Address</th>
                <th className="pb-3">PAN</th>
                <th className="pb-3 text-right">Balance Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2128]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#1b1e24]">
                  <td className="py-3.5 font-bold text-gold-bright">{c.cust_code}</td>
                  <td className="py-3.5 font-semibold text-[#eae7df]">{c.name}</td>
                  <td className="py-3.5 text-[#8f9198]">{c.phone}</td>
                  <td className="py-3.5 text-[#8f9198]">{c.address || '-'}</td>
                  <td className="py-3.5 font-mono text-[#8f9198]">{c.pan || '-'}</td>
                  <td className="py-3.5 text-right font-mono font-bold text-amber-400">{inr(c.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[1100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14161b] border border-[#262a32] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#1e2128] pb-3">
              <h3 className="font-display font-bold text-gold-bright text-base">Add New Customer</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8f9198] hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8f9198] font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-[#eae7df] focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-[#8f9198] font-bold mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-[#eae7df] focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-[#8f9198] font-bold mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-[#eae7df] focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-[#8f9198] font-bold mb-1">PAN Card</label>
                <input
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-[#eae7df] focus:border-gold outline-none"
                />
              </div>
              <div className="pt-3 border-t border-[#1e2128] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#262a32] text-[#8f9198] rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gold text-black font-bold px-4 py-2 rounded-lg hover:bg-gold-bright"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
