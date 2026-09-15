import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Settings, Save, Upload } from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const { activeShop, updateShopProfile } = useTenant();

  const [name, setName] = useState(activeShop?.name || '');
  const [tagline, setTagline] = useState(activeShop?.tagline || '');
  const [phone, setPhone] = useState(activeShop?.phone || '');
  const [email, setEmail] = useState(activeShop?.email || '');
  const [gstin, setGstin] = useState(activeShop?.gstin || '');
  const [pan, setPan] = useState(activeShop?.pan || '');
  const [address, setAddress] = useState(activeShop?.address || '');
  const [terms, setTerms] = useState(activeShop?.terms || '');

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(activeShop?.logo_url || 'logo.jpg');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    try {
      await updateShopProfile({
        name,
        tagline,
        phone,
        email,
        gstin,
        pan,
        address,
        terms
      }, logoFile || undefined);

      setSaving(false);
      setMsg('Shop Profile & Branding updated successfully!');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setSaving(false);
      setMsg('Failed to update shop profile.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center bg-[#14161b] border border-[#262a32] p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-gold-bright" />
          <div>
            <h1 className="font-display text-xl font-bold text-gold-bright">Shop Profile &amp; Settings</h1>
            <p className="text-xs text-[#8f9198]">Configure Shop Branding, Logo, GSTIN, Address &amp; Invoice Terms</p>
          </div>
        </div>
      </div>

      {msg && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs p-3 rounded-lg">
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[#14161b] border border-[#262a32] p-6 rounded-xl space-y-5">
        {/* SHOP LOGO SECTION */}
        <div className="border-b border-[#1e2128] pb-5">
          <label className="block text-xs font-bold text-[#8f9198] mb-2 uppercase tracking-wider">
            Shop Logo Branding
          </label>
          <div className="flex items-center gap-4 bg-[#1b1e24] p-4 rounded-xl border border-[#262a32]">
            <img
              src={logoPreview}
              alt="Shop Logo"
              className="w-16 h-16 rounded-xl object-cover border-2 border-gold shadow-[0_4px_15px_rgba(201,162,75,0.2)]"
              onError={(e) => { (e.target as HTMLImageElement).src = 'logo.jpg'; }}
            />
            <div>
              <p className="text-xs text-[#eae7df] font-bold">Upload Official Shop Emblem / Logo</p>
              <p className="text-[11px] text-[#8f9198] mb-2">This logo dynamically prints on all tax invoices, receipts, and reports.</p>
              <label className="bg-gold text-black font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer inline-flex items-center gap-1.5 hover:bg-gold-bright">
                <Upload className="w-3.5 h-3.5" /> Select Image File
                <input type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* BASIC DETAILS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#8f9198] mb-1">Shop Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-xs text-[#eae7df] focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#8f9198] mb-1">Tagline / Branch</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-xs text-[#eae7df] focus:border-gold outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#8f9198] mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-xs text-[#eae7df] focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#8f9198] mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-xs text-[#eae7df] focus:border-gold outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#8f9198] mb-1">GSTIN Number</label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-xs text-[#eae7df] focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#8f9198] mb-1">PAN Number</label>
            <input
              type="text"
              value={pan}
              onChange={(e) => setPan(e.target.value)}
              className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-xs text-[#eae7df] focus:border-gold outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#8f9198] mb-1">Full Address</label>
          <textarea
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-xs text-[#eae7df] focus:border-gold outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#8f9198] mb-1">Invoice Terms &amp; Conditions</label>
          <textarea
            rows={3}
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2 text-xs text-[#eae7df] focus:border-gold outline-none font-mono"
          />
        </div>

        <div className="pt-3 border-t border-[#1e2128] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-[#f5d77f] via-[#c9a24b] to-[#997327] text-black font-bold text-xs px-6 py-2.5 rounded-lg shadow-lg hover:brightness-110 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings & Update Branding'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
