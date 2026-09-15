import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SaaSRegistrationWizard } from './SaaSRegistrationWizard';

export const AuthPortal: React.FC = () => {
  const { signIn, loading } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = await signIn(identifier, password);
    if (!success) {
      setErrorMsg('Invalid email/username or password.');
    }
  };

  if (mode === 'register') {
    return (
      <div className="fixed inset-0 z-[1000] bg-radial from-[#1c1a17] to-[#0a0b0d] flex items-center justify-center p-4 overflow-y-auto">
        <SaaSRegistrationWizard 
          onComplete={() => setMode('login')} 
          onCancel={() => setMode('login')} 
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-radial from-[#1c1a17] to-[#0a0b0d] flex items-center justify-center p-4">
      <div className="bg-[#14161b]/95 backdrop-blur-xl border border-[#262a32] rounded-2xl w-full max-w-md p-8 shadow-2xl animate-fade-in">
        <div className="text-center mb-6">
          <img
            src="logo.jpg"
            alt="Smart Jewellers Logo"
            className="w-20 h-20 rounded-full shadow-[0_4px_20px_rgba(201,162,75,0.25)] object-cover mx-auto mb-3"
            onError={(e) => { (e.target as HTMLImageElement).src = 'logo.jpg'; }}
          />
          <h1 className="font-display text-2xl font-bold text-gold-bright tracking-wider">Smart Jewellers</h1>
          <p className="text-xs text-[#8f9198] mt-1">Multi-Tenant SaaS Portal</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg mb-4 text-center pb-2">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#8f9198] mb-1">Email or Username</label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none"
              placeholder="e.g. rajesh@smartjewellers.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-[#8f9198]">Secure Password</label>
              <button 
                type="button" 
                onClick={() => alert("To reset your password, contact the Developer: dheerajmkatwe@gmail.com or cell: 9113565802")}
                className="text-xs text-gold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-2.5 text-sm text-[#eae7df] focus:border-gold outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#f5d77f] via-[#c9a24b] to-[#997327] text-[#171410] font-bold text-sm py-3 rounded-lg shadow-lg hover:brightness-110 transition-all mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> 
                Authenticating...
              </span>
            ) : 'Sign In to Workspace'}
          </button>
        </form>

        <div className="h-[1px] bg-[#1e2128] my-6"></div>

        <button
          onClick={() => setMode('register')}
          className="w-full border border-[#262a32] bg-[#1b1e24] text-gold-bright hover:bg-[#22262f] font-bold text-sm py-3 rounded-lg transition-all shadow-sm"
        >
          🚀 Register New Shop & Workspace
        </button>
      </div>
    </div>
  );
};
