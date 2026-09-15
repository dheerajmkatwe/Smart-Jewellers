import React, { useState, Suspense, lazy } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AuthPortal } from '../auth/AuthPortal';
import { ShopOnboardingWizard } from '../auth/ShopOnboardingWizard';

// High-Performance Lazy Loaded Modules (Auto Code Splitting)
const DashboardModule = lazy(() => import('../modules/DashboardModule').then(m => ({ default: m.DashboardModule })));
const BillingModule = lazy(() => import('../modules/BillingModule').then(m => ({ default: m.BillingModule })));
const InvoicesModule = lazy(() => import('../modules/InvoicesModule').then(m => ({ default: m.InvoicesModule })));
const InventoryModule = lazy(() => import('../modules/InventoryModule').then(m => ({ default: m.InventoryModule })));
const BarcodeModule = lazy(() => import('../modules/BarcodeModule').then(m => ({ default: m.BarcodeModule })));
const RatesModule = lazy(() => import('../modules/RatesModule').then(m => ({ default: m.RatesModule })));
const CustomersModule = lazy(() => import('../modules/CustomersModule').then(m => ({ default: m.CustomersModule })));
const SuppliersModule = lazy(() => import('../modules/SuppliersModule').then(m => ({ default: m.SuppliersModule })));
const PurchasesModule = lazy(() => import('../modules/PurchasesModule').then(m => ({ default: m.PurchasesModule })));
const ArtisansModule = lazy(() => import('../modules/ArtisansModule').then(m => ({ default: m.ArtisansModule })));
const ExchangeModule = lazy(() => import('../modules/ExchangeModule').then(m => ({ default: m.ExchangeModule })));
const RepairsModule = lazy(() => import('../modules/RepairsModule').then(m => ({ default: m.RepairsModule })));
const ReportsModule = lazy(() => import('../modules/ReportsModule').then(m => ({ default: m.ReportsModule })));
const SettingsModule = lazy(() => import('../modules/SettingsModule').then(m => ({ default: m.SettingsModule })));

export const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const { shops, activeShop } = useTenant();

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showRegisterShopModal, setShowRegisterShopModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Unauthenticated -> Auth Portal
  if (!user) {
    return <AuthPortal />;
  }

  // Authenticated but no shop exists -> Force Onboarding Wizard
  const needsShopOnboarding = !activeShop && shops.length === 0;

  return (
    <div className="flex h-screen bg-[#0b0c0f] text-[#eae7df] overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        onOpenRegisterShop={() => setShowRegisterShopModal(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* MAIN CONTAINER */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOPBAR */}
        <Topbar
          onOpenRegisterShop={() => setShowRegisterShopModal(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* MAIN PAGE VIEW (Guarded by Trial Expiry context) */}
        <main className="flex-1 p-6 overflow-y-auto relative">
          
          {/* SUBSCRIPTION EXPIRED INTERCEPTOR */}
          {activeShop && activeShop.trial_ends_at && new Date() > new Date(activeShop.trial_ends_at) ? (
            <div className="absolute inset-0 z-50 bg-[#0b0c0f]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fade-in text-center">
              <div className="bg-[#14161b] border border-red-500/30 p-8 rounded-2xl max-w-md w-full shadow-2xl">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                  <span className="text-red-500 text-2xl font-bold">!</span>
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">Trial Expired</h2>
                <p className="text-[#8f9198] text-sm mb-6">
                  The fully-featured 30-day trial for <strong className="text-gold">{activeShop.name}</strong> has concluded. Your business data has been securely retained. Please upgrade to a paid subscription to restore workspace access.
                </p>
                <div className="space-y-3">
                  <button onClick={() => alert("Redirecting to Payment Gateway / Billing...")} className="w-full bg-gradient-to-r from-[#f5d77f] via-[#c9a24b] to-[#997327] text-[#171410] font-bold text-sm py-3 rounded-lg shadow-lg hover:brightness-110">
                    Upgrade Subscription
                  </button>
                  <button onClick={() => alert("Contacting Enterprise Support...")} className="w-full hover:bg-[#1e2128] border border-[#262a32] text-white font-bold text-sm py-3 rounded-lg shadow-sm">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Suspense fallback={
              <div className="flex h-full items-center justify-center text-[#8f9198]">
                <div className="flex flex-col items-center gap-3">
                  <span className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin"></span>
                  <p className="text-xs font-bold tracking-widest uppercase">Loading Module...</p>
                </div>
              </div>
            }>
              {currentPage === 'dashboard' && <DashboardModule onNavigate={setCurrentPage} />}
              {currentPage === 'billing' && <BillingModule />}
              {currentPage === 'invoices' && <InvoicesModule />}
              {currentPage === 'inventory' && <InventoryModule />}
              {currentPage === 'barcode' && <BarcodeModule />}
              {currentPage === 'rates' && <RatesModule />}
              {currentPage === 'customers' && <CustomersModule />}
              {currentPage === 'suppliers' && <SuppliersModule />}
              {currentPage === 'purchases' && <PurchasesModule />}
              {currentPage === 'artisans' && <ArtisansModule />}
              {currentPage === 'exchange' && <ExchangeModule />}
              {currentPage === 'repairs' && <RepairsModule />}
              {currentPage === 'reports' && <ReportsModule />}
              {currentPage === 'settings' && <SettingsModule />}
            </Suspense>
          )}
        </main>
      </div>

      {/* SHOP ONBOARDING WIZARD MODAL */}
      {(needsShopOnboarding || showRegisterShopModal) && (
        <ShopOnboardingWizard
          isInitialSetup={needsShopOnboarding}
          onClose={() => setShowRegisterShopModal(false)}
        />
      )}
    </div>
  );
};
