import React from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Package,
  Barcode,
  TrendingUp,
  Users,
  Truck,
  ShoppingBag,
  Hammer,
  RotateCcw,
  Wrench,
  BarChart3,
  Settings
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onSelectPage: (page: string) => void;
  onOpenRegisterShop: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'billing', label: 'Billing / POS', icon: Receipt },
  { id: 'invoices', label: 'Invoice History', icon: FileText },
  { id: 'inventory', label: 'Inventory Stock', icon: Package },
  { id: 'barcode', label: 'Barcode Printer', icon: Barcode },
  { id: 'rates', label: 'Rate Master', icon: TrendingUp },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
  { id: 'artisans', label: 'Artisans / Job Work', icon: Hammer },
  { id: 'exchange', label: 'Old Gold Exchange', icon: RotateCcw },
  { id: 'repairs', label: 'Repairs & Service', icon: Wrench },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  onOpenRegisterShop,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { activeShop } = useTenant();

  const handleNavClick = (pageId: string) => {
    onSelectPage(pageId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        />
      )}

      {/* SIDEBAR ASIDE */}
      <aside
        className={`w-64 bg-[#14161b] border-r border-[#262a32] flex flex-col h-screen sticky top-0 flex-shrink-0 select-none z-50 transition-transform duration-300 ${
          isOpenMobile
            ? 'fixed left-0 top-0 translate-x-0'
            : 'hidden md:flex'
        }`}
      >
        {/* BRAND HEADER */}
        <div className="p-4 md:p-5 border-b border-[#1e2128] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="logo.jpg"
              alt="Smart Jewellers"
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'logo.jpg';
              }}
            />
            <div>
              <div className="font-display text-lg font-bold text-gold-bright leading-tight">
                Smart Jewellers
              </div>
              <div className="text-[11px] text-[#8f9198] tracking-wider">Multi-Tenant SaaS</div>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden text-[#8f9198] hover:text-white p-1 text-lg"
            >
              ✕
            </button>
          )}
        </div>

        {/* ACTIVE TENANT SHOP BADGE */}
        {activeShop && (
          <div className="mx-3.5 my-3 p-2.5 bg-[#1b1e24] border border-[#262a32] rounded-xl flex items-center gap-2.5">
            <img
              src={activeShop.logo_url || 'logo.jpg'}
              alt={activeShop.name}
              className="w-9 h-9 rounded-md border border-gold/40 object-cover bg-[#22262f] flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'logo.jpg';
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-[#eae7df] truncate">{activeShop.name}</div>
              <div className="text-[10.5px] text-gold-bright truncate">
                {activeShop.tagline || 'Jewellery Shop'}
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#1b1e24] text-gold-bright border-l-2 border-gold'
                    : 'text-[#8f9198] hover:bg-[#1b1e24] hover:text-[#eae7df]'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* SIDEBAR FOOTER & SWITCHER */}
        <div className="p-3.5 border-t border-[#1e2128] text-xs text-[#5b5e66] flex items-center justify-between">
          <span className="font-medium text-[11px]">Active Tenant</span>
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenRegisterShop();
            }}
            className="text-gold-bright hover:underline text-[11.5px] font-bold"
          >
            + Register Shop
          </button>
        </div>
      </aside>
    </>
  );
};
