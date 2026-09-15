import React, { useState } from 'react';

interface SaaSRegistrationWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const SaaSRegistrationWizard: React.FC<SaaSRegistrationWizardProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  // Step 1: Shop Registration
  const [shopName, setShopName] = useState('');
  const [tagline, setTagline] = useState('');
  const [businessType, setBusinessType] = useState('Retail Jeweller');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  const [shopEmail, setShopEmail] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('logo.jpg');

  // Step 2: Owner Details
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [designation, setDesignation] = useState('Managing Director');

  // Step 3: Account Creation
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step: number) => {
    setErrorMsg('');
    if (step === 1) {
      if (!shopName || !address || !city) return 'Shop Name, Address & City are required.';
    }
    if (step === 2) {
      if (!ownerName || !ownerPhone) return 'Owner Name and Phone Number are required.';
    }
    if (step === 3) {
      if (!username || !email || !password) return 'All account fields are required.';
      if (password !== confirmPassword) return 'Passwords do not match.';
      // Enforce strong password dynamically
      if (calculatePasswordStrength(password) < 100) return 'Password must be fully Strong (8+ chars, uppercase, number, symbol).';
    }
    return '';
  };

  const nextStep = () => {
    const error = validateStep(currentStep);
    if (error) {
      setErrorMsg(error);
      return;
    }
    setErrorMsg('');
    if (currentStep === 3) {
      submitRegistration();
    } else {
      setCurrentStep(curr => curr + 1);
    }
  };

  const prevStep = () => {
    setErrorMsg('');
    setCurrentStep(curr => curr - 1);
  };

  const submitRegistration = async () => {
    setLoading(true);

    const formData = new FormData();
    // Step 1
    formData.append('shopName', shopName);
    formData.append('tagline', tagline);
    formData.append('businessType', businessType);
    formData.append('address', address);
    formData.append('city', city);
    formData.append('country', country);
    formData.append('shopEmail', shopEmail);
    if (logoFile) formData.append('logoFile', logoFile);
    
    // Step 2
    formData.append('ownerName', ownerName);
    formData.append('ownerPhone', ownerPhone);
    formData.append('ownerEmail', ownerEmail);
    formData.append('designation', designation);

    // Step 3
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    
    // Add defaults for schema parsing
    formData.append('stateCode', '27');
    formData.append('pincode', '400001');
    formData.append('gstin', '');
    formData.append('pan', '');
    formData.append('bisNumber', '');
    formData.append('metalsHandled', 'Gold, Silver, Platinum');
    formData.append('makingPolicy', 'Standard');
    formData.append('terms', 'Standard shop policies applied.');
    formData.append('currency', '₹');

    try {
      // POST to our new Cloudflare Worker Hono API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      onComplete(); // Login using created credentials locally or redirect to login
    } catch (err: any) {
      setErrorMsg(err.message || 'Fatal Network Error connecting to Backend.');
      setLoading(false);
    }
  };

  const calculatePasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length > 7) strength += 25;
    if (pass.match(/[A-Z]/)) strength += 25;
    if (pass.match(/[0-9]/)) strength += 25;
    if (pass.match(/[^A-Za-z0-9]/)) strength += 25;
    return strength;
  };

  const passStrength = calculatePasswordStrength(password);
  
  // Dynamic color for strength bar
  let strengthColor = 'bg-red-500';
  if (passStrength > 50) strengthColor = 'bg-yellow-500';
  if (passStrength === 100) strengthColor = 'bg-green-500';

  return (
    <div className="bg-[#14161b]/95 backdrop-blur-xl border border-[#262a32] rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gold-bright tracking-wider">
            {currentStep === 1 && 'Step 1: Shop Registration'}
            {currentStep === 2 && 'Step 2: Owner Details'}
            {currentStep === 3 && 'Step 3: Account Creation'}
          </h2>
          <p className="text-xs text-[#8f9198] mt-1">Multi-Tenant Setup Wizard</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(step => (
            <div key={step} className={`w-3 h-3 rounded-full ${currentStep >= step ? 'bg-gold' : 'bg-[#262a32]'}`} />
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg mb-4">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* STEP 1: SHOP REGISTRATION */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#8f9198] mb-1">Shop/Business Name *</label>
              <input type="text" value={shopName} onChange={e => setShopName(e.target.value)} className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none" placeholder="Royal Jewellers" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8f9198] mb-1">Business Type</label>
              <select value={businessType} onChange={e => setBusinessType(e.target.value)} className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none">
                <option value="Retail Jeweller">Retail Jeweller</option>
                <option value="Wholesaler">Wholesaler</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Bullion Dealer">Bullion Dealer</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#8f9198] mb-1">Tagline or Slogan</label>
            <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none" placeholder="Fine Gold & Polki" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#8f9198] mb-1">Official Business Email *</label>
            <input type="email" value={shopEmail} onChange={e => setShopEmail(e.target.value)} className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none" placeholder="info@royaljewellers.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#8f9198] mb-1">Street Address *</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none" placeholder="Zaveri Bazaar" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8f9198] mb-1">City *</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none" placeholder="Mumbai" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#8f9198] mb-1">Country</label>
            <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none" placeholder="India" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#8f9198] mb-2">Shop Logo Upload (R2 Storage Support)</label>
            <div className="flex items-center gap-4 bg-[#1b1e24] border border-[#262a32] p-3 rounded-lg">
              <img src={logoPreview} alt="Preview" className="w-12 h-12 rounded-full border border-gold object-cover flex-shrink-0" />
              <input type="file" accept="image/*" onChange={handleLogoChange} className="text-xs text-[#8f9198] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-gold file:text-black cursor-pointer" />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: OWNER */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="block text-xs font-bold text-[#8f9198] mb-1">Owner / Primary Contact Name *</label>
            <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none" placeholder="Rajesh Mehta" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#8f9198] mb-1">Mobile Contact Number *</label>
            <input type="text" value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none" placeholder="+91 9876543210" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#8f9198] mb-1">Owner Email Address *</label>
            <input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none" placeholder="rajesh.personal@gmail.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#8f9198] mb-1">Role / Designation</label>
            <input type="text" value={designation} onChange={e => setDesignation(e.target.value)} className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none" placeholder="Managing Director" />
          </div>
        </div>
      )}

      {/* STEP 3: ACCOUNT CREATION */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="block text-xs font-bold text-[#8f9198] mb-1">Desired Username *</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none" placeholder="rajesh.m" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#8f9198] mb-1">Primary Email Address * (Login ID)</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none" placeholder="rajesh@smartjewellers.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#8f9198] mb-1">Secure Password *</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none" placeholder="••••••••" />
              {password.length > 0 && (
                <div className="mt-2 text-[10px] text-gray-400">
                  <div className="w-full bg-[#1e2128] rounded-full h-1.5 mb-1 overflow-hidden">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${strengthColor}`} style={{ width: `${passStrength}%` }}></div>
                  </div>
                  {passStrength < 50 ? 'Weak' : passStrength < 100 ? 'Good' : 'Strong Password'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8f9198] mb-1">Confirm Password *</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none" placeholder="••••••••" />
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION CONTROLS */}
      <div className="flex justify-between items-center mt-8 border-t border-[#1e2128] pt-4">
        {currentStep > 1 ? (
          <button onClick={prevStep} disabled={loading} className="text-[#8f9198] hover:text-white font-bold text-xs py-2 px-4 border border-[#262a32] rounded-lg transition-all">Back</button>
        ) : (
          <button onClick={onCancel} className="text-[#8f9198] hover:text-white font-bold text-xs">Return to Login</button>
        )}
        
        <button 
          onClick={nextStep}
          disabled={loading}
          className="bg-gradient-to-r from-[#f5d77f] via-[#c9a24b] to-[#997327] text-[#171410] font-bold text-sm py-2.5 px-6 rounded-lg shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
        >
          {loading ? (
            <> <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Provisioning Tenant... </>
          ) : currentStep === 3 ? (
            'Create Workspace & Start 30-Day Trial'
          ) : 'Proceed Next'}
        </button>
      </div>
    </div>
  );
};
