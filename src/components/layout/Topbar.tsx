import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Store, Sun, Moon, LogOut, ChevronDown, PlusCircle, Menu, Download } from 'lucide-react';

interface TopbarProps {
  onOpenRegisterShop: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenRegisterShop, onToggleMobileSidebar }) => {
  const { activeShop, shops, switchShop } = useTenant();
  const { profile, signOut } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        console.log('User installed Smart Jewellers PWA');
      }
      setDeferredPrompt(null);
    } else {
      alert('PWA App is ready! On mobile or Chrome, tap options -> "Add to Home Screen" to install.');
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <header className="h-16 bg-[#14161b] border-b border-[#262a32] px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* LEFT AREA: HAMBURGER MENU & SEARCH */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-[#8f9198] hover:text-white rounded-lg bg-[#1b1e24] border border-[#262a32]"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* SEARCH BAR */}
        <div className="relative w-44 sm:w-64 md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8f9198]" />
          <input
            type="text"
            placeholder="Search items, invoices..."
            className="w-full bg-[#1b1e24] border border-[#262a32] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#eae7df] placeholder-[#8f9198] focus:border-gold outline-none"
          />
        </div>
      </div>

      {/* TRIAL STATUS ALERT (Hidden on ultra-small mobile, visible everywhere else) */}
      {activeShop?.trial_ends_at && (() => {
        const remaining = Math.ceil((new Date(activeShop.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (remaining <= 30 && remaining > 0) {
          let warnColor = 'bg-gold/10 text-gold-bright border-gold/30';
          if (remaining <= 7) warnColor = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
          if (remaining <= 3) warnColor = 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.25)] animate-pulse';
          
          return (
            <div className="hidden sm:flex items-center gap-3 ml-auto mr-4">
              <span className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all ${warnColor}`}>
                {remaining <= 3 ? '⚠️ ' : '⏱️ '} Trial: {remaining} {remaining === 1 ? 'Day' : 'Days'} Left
              </span>
              {(remaining <= 7) && (
                <button 
                  onClick={() => alert("Redirecting to Settings > Subscription Plans...")} 
                  className="text-[10px] font-bold uppercase tracking-wider bg-gold text-black px-2.5 py-1.5 rounded-lg hover:bg-gold-bright shadow transition"
                >
                  Upgrade Now
                </button>
              )}
            </div>
          );
        }
        return null;
      })()}

      {/* TOPBAR RIGHT ACTIONS */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto sm:ml-0">
        {/* PWA INSTALL APP BUTTON */}
        <button
          onClick={handleInstallPWA}
          className="flex items-center gap-1.5 bg-gold/10 border border-gold/30 hover:bg-gold/20 text-gold-bright font-bold text-xs px-2.5 py-1.5 rounded-lg transition-all"
          title="Install Smart Jewellers App on Phone/Desktop"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install PWA</span>
        </button>
        {/* MULTI-TENANT SHOP SWITCHER DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-[#1b1e24] border border-[#262a32] rounded-lg px-3 py-1.5 hover:border-gold transition-colors"
          >
            <Store className="w-4 h-4 text-gold-bright" />
            <img
              src={activeShop?.logo_url || 'logo.jpg'}
              alt="Shop Logo"
              className="w-5 h-5 rounded-full object-cover border border-gold/40"
              onError={(e) => { (e.target as HTMLImageElement).src = 'logo.jpg'; }}
            />
            <span className="text-xs font-bold text-[#eae7df] max-w-[140px] truncate">
              {activeShop ? activeShop.name : 'Select Shop'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8f9198]" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#14161b] border border-[#262a32] rounded-xl shadow-2xl p-2 z-50 animate-fade-in">
              <div className="px-2 py-1 text-[10.5px] font-bold text-[#8f9198] uppercase tracking-wider">
                Switch Active Shop Tenant
              </div>
              <div className="space-y-1 my-1 max-h-48 overflow-y-auto">
                {shops.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      switchShop(s.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-bold transition-all text-left ${
                      activeShop?.id === s.id
                        ? 'bg-[#1b1e24] text-gold-bright border-l-2 border-gold'
                        : 'text-[#8f9198] hover:bg-[#1b1e24] hover:text-[#eae7df]'
                    }`}
                  >
                    <img
                      src={s.logo_url || 'logo.jpg'}
                      alt={s.name}
                      className="w-6 h-6 rounded border border-gold/30 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'logo.jpg'; }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{s.name}</div>
                      <div className="text-[10px] text-[#8f9198] font-normal truncate">{s.city || 'India'}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="border-t border-[#1e2128] pt-1 mt-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenRegisterShop();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-gold-bright hover:bg-[#1b1e24] rounded-lg"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register New Shop</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          className="p-2 bg-[#1b1e24] border border-[#262a32] rounded-lg text-[#8f9198] hover:text-gold-bright transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* USER PROFILE & LOGOUT */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1e2128]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gold-dim to-gold flex items-center justify-center text-xs font-bold text-black">
            {profile ? profile.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-[#eae7df]">{profile?.full_name || 'Owner'}</div>
            <div className="text-[10px] text-gold-bright">Shop Admin</div>
          </div>
          <button
            onClick={signOut}
            className="p-2 text-[#8f9198] hover:text-red-400 transition-colors ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
