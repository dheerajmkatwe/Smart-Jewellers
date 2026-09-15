import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';

interface ShopOnboardingWizardProps {
  onClose?: () => void;
  isInitialSetup?: boolean;
}

export const ShopOnboardingWizard: React.FC<ShopOnboardingWizardProps> = ({
  onClose,
  isInitialSetup = false,
}) => {
  const { createShop } = useTenant();
  const { profile, user } = useAuth();

  // Wizard Step State (1 to 4)
  const [currentStep, setCurrentStep] = useState(1);

  // Form 1: Identity & Logo
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('Fine Gold & Diamond Jewellery');
  const [currency, setCurrency] = useState('₹');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('logo.jpg');

  // Form 2: Contact & Location
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(profile?.email || user?.email || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [stateCode, setStateCode] = useState('27');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('400002');
  const [businessType, setBusinessType] = useState('Retail Jeweller');

  // Form 3: Owner Details
  const [ownerName, setOwnerName] = useState(profile?.full_name || '');
  const [ownerPhone, setOwnerPhone] = useState(phone);
  const [ownerEmail, setOwnerEmail] = useState(email);
  const [ownerRole, setOwnerRole] = useState('Proprietor / Director');

  // Form 3: Tax, PAN & Registrations
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [bisNumber, setBisNumber] = useState('HM/916/2026/8891');
  const [docFileName, setDocFileName] = useState<string | null>(null);

  // Form 4: Operations & Policies
  const [metalsHandled, setMetalsHandled] = useState<string[]>(['Gold 22K', 'Gold 24K', 'Silver 999', 'Diamond']);
  const [makingPolicy, setMakingPolicy] = useState('Per Gram (Standard)');
  const [terms, setTerms] = useState(
    '1. Goods once sold will be exchanged as per store policy.\n2. BIS Hallmark guaranteed on all gold items.\n3. Making charges non-refundable.'
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Logo Upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset logo selection helper
  const handlePresetLogo = (logoPath: string) => {
    setLogoFile(null);
    setLogoPreview(logoPath);
  };

  // Handle Document Upload
  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocFileName(file.name);
    }
  };

  // Metal toggle helper
  const toggleMetal = (metal: string) => {
    if (metalsHandled.includes(metal)) {
      setMetalsHandled(metalsHandled.filter((m) => m !== metal));
    } else {
      setMetalsHandled([...metalsHandled, metal]);
    }
  };

  // Validate current step before advancing
  const handleNextStep = () => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!name.trim()) {
        setErrorMsg('Please enter your Shop Name to continue.');
        return;
      }
    } else if (currentStep === 2) {
      if (!phone.trim() || !address.trim() || !city.trim() || !country.trim()) {
        setErrorMsg('Phone Number, Street Address, City, and Country are required.');
        return;
      }
      if (!ownerPhone && phone) setOwnerPhone(phone);
      if (!ownerEmail && email) setOwnerEmail(email);
    } else if (currentStep === 3) {
      if (!ownerName.trim() || !ownerPhone.trim()) {
        setErrorMsg('Owner Name and Mobile Number are required.');
        return;
      }
    } else if (currentStep === 4) {
      if (gstin && gstin.length < 15) {
        setErrorMsg('GSTIN should be a 15-character valid GST number (or leave blank if unregistered).');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      setErrorMsg('Shop Name, Phone Number, and Address are required.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    try {
      await createShop(
        {
          name,
          tagline: `${businessType} | ${tagline}`,
          phone,
          email,
          gstin,
          pan,
          address: `${address}, ${city}, ${stateCode}, ${country} - ${pincode}`,
          city,
          state_code: stateCode,
          currency,
          terms,
        },
        logoFile || undefined
      );

      setSubmitting(false);
      if (onClose) onClose();
    } catch (err) {
      setSubmitting(false);
      setErrorMsg('Failed to register shop. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#14161b] border border-[#262a32] rounded-2xl w-full max-w-3xl p-6 md:p-8 shadow-2xl my-8 relative overflow-hidden">
        {/* Top Header */}
        <div className="flex justify-between items-start pb-4 border-b border-[#1e2128]">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-gold/20 text-gold font-bold text-xs px-2.5 py-0.5 rounded-full border border-gold/30">
                Step {currentStep} of 5
              </span>
              <h2 className="font-display text-xl md:text-2xl font-bold text-gold-bright">
                {isInitialSetup ? 'Shop Registration & Workspace Setup' : 'Register New Jewellery Branch'}
              </h2>
            </div>
            <p className="text-xs text-[#8f9198] mt-1">
              Complete the 4-form registration wizard to configure your shop logo, location, tax, and billing.
            </p>
          </div>
          {!isInitialSetup && onClose && (
            <button
              onClick={onClose}
              className="text-[#8f9198] hover:text-white text-xl p-1 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* STEP PROGRESS NAVIGATION BAR */}
        <div className="grid grid-cols-5 gap-1 md:gap-2 my-6">
          {[
            { step: 1, title: 'Identity', icon: '👑' },
            { step: 2, title: 'Location', icon: '📍' },
            { step: 3, title: 'Owner', icon: '👤' },
            { step: 4, title: 'Tax', icon: '📜' },
            { step: 5, title: 'Operations', icon: '⚙️' },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => {
                if (item.step < currentStep) setCurrentStep(item.step);
              }}
              className={`flex flex-col items-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                currentStep === item.step
                  ? 'bg-gold/15 border-gold text-gold-bright shadow-[0_0_12px_rgba(201,162,75,0.2)]'
                  : currentStep > item.step
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-[#1b1e24] border-[#262a32] text-[#8f9198] opacity-60'
              }`}
            >
              <div className="flex items-center gap-1">
                <span>{item.icon}</span>
                <span>Form {item.step}</span>
              </div>
              <span className="text-[10px] hidden md:inline mt-0.5 font-normal">{item.title}</span>
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-4">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* FORM STEP 1: SHOP IDENTITY & LOGO */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="border-b border-[#1e2128] pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>👑</span> Form 1: Shop Identity &amp; Branding Logo
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8f9198] mb-1">
                  Shop / Business Name <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Gold &amp; Diamonds"
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8f9198] mb-1">
                  Business Type <span className="text-gold">*</span>
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none mb-3"
                >
                  <option>Retail Jeweller</option>
                  <option>Wholesaler</option>
                  <option>Manufacturer</option>
                  <option>Gold Testing / Assaying Core</option>
                </select>

                <label className="block text-xs font-bold text-[#8f9198] mb-1">
                  Shop Tagline / Slogan
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Exclusive Antique &amp; Bridal Collections"
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8f9198] mb-1">Base Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full md:w-1/2 bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none"
              >
                <option value="₹">₹ INR (Indian Rupee)</option>
                <option value="$">$ USD (US Dollar)</option>
                <option value="AED">AED (UAE Dirham)</option>
                <option value="€">€ EUR (Euro)</option>
                <option value="£">£ GBP (British Pound)</option>
              </select>
            </div>

            {/* SHOP LOGO UPLOAD & PREVIEW */}
            <div>
              <label className="block text-xs font-bold text-[#8f9198] mb-2">
                Shop Branding Logo <span className="text-gold">*</span>
              </label>
              <div className="bg-[#1b1e24] border border-[#262a32] p-4 rounded-xl flex flex-col md:flex-row items-center gap-6">
                <div className="relative group">
                  <img
                    src={logoPreview}
                    alt="Shop Logo Preview"
                    className="w-20 h-20 rounded-full border-2 border-gold object-cover shadow-[0_0_15px_rgba(201,162,75,0.3)]"
                  />
                  <span className="absolute bottom-0 right-0 bg-gold text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    Logo
                  </span>
                </div>

                <div className="flex-1 space-y-2 text-center md:text-left">
                  <div className="flex items-center gap-3">
                    <label className="bg-gradient-to-r from-[#f5d77f] via-[#c9a24b] to-[#997327] text-black font-bold text-xs px-4 py-2 rounded-lg cursor-pointer hover:brightness-110 transition-all">
                      Choose Image File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-[#8f9198]">
                      {logoFile ? logoFile.name : 'PNG, JPG or WEBP (Max 5MB)'}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#8f9198]">
                    This logo will dynamically render on customer invoices, rate cards, and reports.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FORM STEP 2: CONTACT & LOCATION */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="border-b border-[#1e2128] pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📍</span> Form 2: Contact &amp; Physical Store Location
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8f9198] mb-1">
                  Primary Phone Number <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8f9198] mb-1">
                  Official Business Email (Verified)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="shop@gmail.com"
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8f9198] mb-1">
                Street Address / Shop Unit / Market <span className="text-gold">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shop No. 104, Gold Jewellery Market, Zaveri Bazaar"
                className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#8f9198] mb-1">
                  Country <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="India"
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8f9198] mb-1">
                  City <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mumbai"
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8f9198] mb-1">State Code</label>
                <input
                  type="text"
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  placeholder="27 (Maharashtra)"
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8f9198] mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="400002"
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* FORM STEP 3: OWNER DETAILS */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="border-b border-[#1e2128] pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>👤</span> Form 3: Key Owner / Director Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8f9198] mb-1">Owner Name <span className="text-gold">*</span></label>
                <input type="text" required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="e.g. Ramesh Kumar" className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8f9198] mb-1">Designation / Role</label>
                <input type="text" value={ownerRole} onChange={(e) => setOwnerRole(e.target.value)} className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8f9198] mb-1">Mobile Number <span className="text-gold">*</span></label>
                <input type="text" required value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} placeholder="Personal Contact" className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8f9198] mb-1">Email Address</label>
                <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none" />
              </div>
            </div>
          </div>
        )}

        {/* FORM STEP 4: TAX & BUSINESS LICENSE */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fade-in">
            <div className="border-b border-[#1e2128] pb-2 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📜</span> Form 3: Tax, PAN &amp; BIS Hallmark License
              </h3>
              <button
                type="button"
                onClick={() => {
                  setGstin('27ABCDE1234F1Z5');
                  setPan('ABCDE1234F');
                }}
                className="text-[11px] bg-gold/10 border border-gold/30 text-gold-bright px-2.5 py-1 rounded-lg hover:bg-gold/20"
              >
                ⚡ Auto-fill Sample GSTIN
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8f9198] mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="27ABCDE1234F1Z5"
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] font-mono focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8f9198] mb-1">PAN Number</label>
                <input
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] font-mono focus:border-gold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8f9198] mb-1">
                BIS Hallmark Registration Number
              </label>
              <input
                type="text"
                value={bisNumber}
                onChange={(e) => setBisNumber(e.target.value)}
                placeholder="HM/916/2026/8891"
                className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] font-mono focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8f9198] mb-2">
                Business Registration / Trade License Document (Optional)
              </label>
              <div className="bg-[#1b1e24] border border-[#262a32] p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <div className="text-xs font-bold text-[#eae7df]">
                      {docFileName || 'Upload Registration Certificate / GST File'}
                    </div>
                    <div className="text-[11px] text-[#8f9198]">
                      Supports PDF, PNG or JPG files for compliance records
                    </div>
                  </div>
                </div>

                <label className="bg-[#262a32] hover:bg-[#323742] text-white text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer border border-[#3b404d] transition-all">
                  Select File
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleDocChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* FORM STEP 5: OPERATIONS & SUMMARY REVIEW */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-fade-in">
            <div className="border-b border-[#1e2128] pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>⚙️</span> Form 4: Store Operations &amp; Complete Registration Review
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8f9198] mb-2">
                Metals &amp; Jewellery Categories Handled
              </label>
              <div className="flex flex-wrap gap-2">
                {['Gold 22K', 'Gold 24K', 'Gold 18K', 'Silver 999', 'Diamond', 'Platinum'].map(
                  (metal) => (
                    <button
                      key={metal}
                      type="button"
                      onClick={() => toggleMetal(metal)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        metalsHandled.includes(metal)
                          ? 'bg-gold/20 border-gold text-gold-bright'
                          : 'bg-[#1b1e24] border-[#262a32] text-[#8f9198]'
                      }`}
                    >
                      {metalsHandled.includes(metal) ? '✓ ' : '+ '} {metal}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8f9198] mb-1">
                  Making Charges Policy
                </label>
                <select
                  value={makingPolicy}
                  onChange={(e) => setMakingPolicy(e.target.value)}
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3.5 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none"
                >
                  <option value="Per Gram (Standard)">Per Gram Rate (e.g. ₹450 / gram)</option>
                  <option value="Percentage">Percentage of Metal Value (%)</option>
                  <option value="Itemized Fixed">Itemized Piece Charge</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8f9198] mb-1">
                  Standard Invoice Terms
                </label>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full bg-[#1b1e24] border border-[#262a32] rounded-xl px-3 py-1.5 text-xs text-[#eae7df] focus:border-gold outline-none resize-none"
                />
              </div>
            </div>

            {/* REGISTRATION SUMMARY CARD */}
            <div className="bg-[#1b1e24] border border-[#262a32] rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-gold-bright uppercase tracking-wider">
                📋 Final Registration Summary
              </h4>

              <div className="flex items-center gap-4">
                <img
                  src={logoPreview}
                  alt="Shop Logo"
                  className="w-14 h-14 rounded-full border border-gold object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-white truncate">{name || 'Shop Name'}</div>
                  <div className="text-xs text-gold">{tagline}</div>
                  <div className="text-[11px] text-[#8f9198]">
                    📞 {phone} | ✉️ {email}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#262a32] text-[#8f9198]">
                <div>
                  📍 <strong className="text-[#eae7df]">Address:</strong> {address}, {city}
                </div>
                <div>
                  📜 <strong className="text-[#eae7df]">GSTIN:</strong> {gstin || 'Unregistered'}
                </div>
                <div>
                  🔍 <strong className="text-[#eae7df]">BIS Hallmark:</strong> {bisNumber}
                </div>
                <div>
                  💎 <strong className="text-[#eae7df]">Categories:</strong> {metalsHandled.join(', ')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION ACTIONS */}
        <div className="pt-5 mt-6 border-t border-[#1e2128] flex justify-between items-center">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-2.5 border border-[#262a32] rounded-xl text-xs font-bold text-[#8f9198] hover:text-white hover:border-gold transition-all"
            >
              ← Back (Form {currentStep - 1})
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="bg-gradient-to-r from-[#f5d77f] via-[#c9a24b] to-[#997327] text-[#171410] font-bold text-xs px-6 py-2.5 rounded-xl shadow-md hover:brightness-110 transition-all"
            >
              Next (Form {currentStep + 1}) →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-[#f5d77f] via-[#c9a24b] to-[#997327] text-[#171410] font-bold text-xs px-8 py-3 rounded-xl shadow-xl hover:brightness-110 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Registering Shop &amp; Creating Workspace...
                </>
              ) : (
                '🚀 Complete Registration & Launch Shop Workspace'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
