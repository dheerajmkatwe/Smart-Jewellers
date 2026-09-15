import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shop, InventoryItem, Customer, Supplier, Invoice, Rate, Purchase, Artisan, JobOrder, OldGoldExchange, Repair } from '../types';
import { useAuth } from './AuthContext';

const DEFAULT_APP_LOGO = 'logo.jpg';

const DEFAULT_SHOPS: Shop[] = [
  {
    id: 'tenant-main',
    name: 'Smart Jewellers',
    tagline: 'Main Branch - Gold & Diamonds',
    logo_url: DEFAULT_APP_LOGO,
    gstin: '27AAAAA0000A1Z5',
    address: '101 Gold Bazaar, Zaveri Market, MG Road',
    city: 'Mumbai',
    state_code: '27',
    phone: '+91 98765 43210',
    email: 'contact@smartjewellers.com',
    pan: 'AAAAA0000A',
    terms: '1. Goods once sold will be exchanged as per store policy.\n2. GST included as per law. Making charges non-refundable.',
    currency: '₹',
    owner_id: 'demo-user-1'
  },
  {
    id: 'tenant-royal',
    name: 'Smart Jewellers - Royal Heritage',
    tagline: 'Luxury Antique & Polki Collection',
    logo_url: DEFAULT_APP_LOGO,
    gstin: '27BBBBB1111B2Z6',
    address: '45 Heritage Arcade, Cathedral Road',
    city: 'Mumbai',
    state_code: '27',
    phone: '+91 98222 11100',
    email: 'royal@smartjewellers.com',
    pan: 'BBBBB1111B',
    terms: '1. Antique pieces certified by BIS Hallmark.\n2. Custom design orders require 50% advance.',
    currency: '₹',
    owner_id: 'demo-user-1'
  }
];

function createDefaultShopDataset(shopId: string) {
  return {
    rates: [
      { id: '1', shop_id: shopId, metal: 'GOLD', purity: '24K (999)', fineness: '99.9%', rate: 7450, as_of: new Date().toISOString().slice(0,10) },
      { id: '2', shop_id: shopId, metal: 'GOLD', purity: '22K (916)', fineness: '91.6%', rate: 6830, as_of: new Date().toISOString().slice(0,10) },
      { id: '3', shop_id: shopId, metal: 'GOLD', purity: '20K (833)', fineness: '83.3%', rate: 6210, as_of: new Date().toISOString().slice(0,10) },
      { id: '4', shop_id: shopId, metal: 'GOLD', purity: '18K (750)', fineness: '75%', rate: 5580, as_of: new Date().toISOString().slice(0,10) },
      { id: '5', shop_id: shopId, metal: 'PLATINUM', purity: '950 Platinum', fineness: '95%', rate: 3500, as_of: new Date().toISOString().slice(0,10) },
      { id: '6', shop_id: shopId, metal: 'SILVER', purity: '999 Fine Silver', fineness: '99.9%', rate: 92, as_of: new Date().toISOString().slice(0,10) }
    ] as Rate[],
    inventory: [] as InventoryItem[],
    customers: [] as Customer[],
    suppliers: [] as Supplier[],
    invoices: [] as Invoice[],
    purchases: [] as Purchase[],
    artisans: [] as Artisan[],
    jobOrders: [] as JobOrder[],
    exchanges: [] as OldGoldExchange[],
    repairs: [] as Repair[],
    seq: { item: 1, cust: 1, invoice: 1 }
  };
}

interface TenantContextType {
  shops: Shop[];
  activeShop: Shop | null;
  loadingShops: boolean;
  switchShop: (shopId: string) => void;
  createShop: (shopData: Partial<Shop>, logoFile?: File) => Promise<Shop>;
  updateShopProfile: (updated: Partial<Shop>, logoFile?: File) => Promise<void>;
  // Tenant Isolated Data & Mutation Actions
  data: ReturnType<typeof createDefaultShopDataset>;
  saveData: (newDataset: any) => void;
  addInventoryItem: (item: Partial<InventoryItem>) => void;
  addCustomer: (cust: Partial<Customer>) => void;
  addInvoice: (inv: Partial<Invoice>) => void;
  saveRate: (index: number, newRate: number) => void;
  // Cloudflare API Helper
  secureFetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
  
  // Subscription / Entitlement Accessors
  getCurrentTenant: () => Shop | null;
  getSubscription: () => any;
  isTrialActive: () => boolean;
  isSubscriptionActive: () => boolean;
  hasFeatureAccess: (featureName: string) => boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem('sj_shops');
    return saved ? JSON.parse(saved) : DEFAULT_SHOPS;
  });
  const [activeShop, setActiveShop] = useState<Shop | null>(() => {
    const saved = localStorage.getItem('sj_active_shop');
    return saved ? JSON.parse(saved) : (DEFAULT_SHOPS[0] || null);
  });
  const [loadingShops, setLoadingShops] = useState(false);

  // Tenant dataset state
  const [dataset, setDataset] = useState(() => {
    const activeId = activeShop ? activeShop.id : 'tenant-main';
    const saved = localStorage.getItem(`sj_dataset_${activeId}`);
    return saved ? JSON.parse(saved) : createDefaultShopDataset(activeId);
  });

  useEffect(() => {
    if (user) {
      fetchUserShops();
    }
  }, [user]);

  useEffect(() => {
    if (activeShop) {
      localStorage.setItem('sj_active_shop', JSON.stringify(activeShop));
      const saved = localStorage.getItem(`sj_dataset_${activeShop.id}`);
      setDataset(saved ? JSON.parse(saved) : createDefaultShopDataset(activeShop.id));
    }
  }, [activeShop]);

  const fetchUserShops = async () => {
    if (!user) return;
    setLoadingShops(true);
    try {
      // 1. Read shops synced from our Cloudflare Workers API during login/auth check
      const syncedShopsRaw = localStorage.getItem('sj_shops_sync');
      if (syncedShopsRaw) {
        const parsedShops = JSON.parse(syncedShopsRaw);
        if (Array.isArray(parsedShops) && parsedShops.length > 0) {
          setShops(parsedShops);
          
          if (!activeShop || !parsedShops.find(s => s.id === activeShop.id)) {
            setActiveShop(parsedShops[0]);
          }
        } else {
          setShops([]);
          setActiveShop(null);
        }
      } else {
        // Fallback for new registration transitions
        const userShops = shops.filter(s => s.owner_id === user.id);
        if (userShops.length > 0) {
          setShops(userShops);
          setActiveShop(userShops[0]);
        } else {
          setShops([]);
          setActiveShop(null);
        }
      }
    } catch (e) {
      setShops([]);
      setActiveShop(null);
    } finally {
      setLoadingShops(false);
    }
  };

  const switchShop = (shopId: string) => {
    const found = shops.find(s => s.id === shopId);
    if (found) {
      setActiveShop(found);
    }
  };

  const uploadShopLogo = async (file: File, shopId: string): Promise<string> => {
    try {
      const ext = file.name.split('.').pop();
      const path = `${shopId}/logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('shop-logos').upload(path, file, { upsert: true });
      if (!error) {
        const { data: urlData } = supabase.storage.from('shop-logos').getPublicUrl(path);
        return urlData.publicUrl;
      }
    } catch (e) {
      console.warn('Storage upload fallback to Data URI', e);
    }
    // Fallback: Data URI
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const createShop = async (shopData: Partial<Shop>, logoFile?: File): Promise<Shop> => {
    const ownerId = user ? user.id : 'demo-user-1';
    const tempId = 'tenant-' + Date.now();
    let logoUrl = DEFAULT_APP_LOGO;

    if (logoFile) {
      logoUrl = await uploadShopLogo(logoFile, tempId);
    }

    const newShop: Shop = {
      id: tempId,
      name: shopData.name || 'Smart Jewellers Shop',
      tagline: shopData.tagline || 'Fine Gold & Diamonds',
      logo_url: logoUrl,
      gstin: shopData.gstin || '',
      pan: shopData.pan || '',
      phone: shopData.phone || '',
      email: shopData.email || '',
      address: shopData.address || '',
      city: shopData.city || '',
      state_code: shopData.state_code || '27',
      currency: shopData.currency || '₹',
      terms: shopData.terms || '1. Goods once sold will be exchanged as per store policy.\n2. Making charges non-refundable.',
      owner_id: ownerId,
      created_at: new Date().toISOString()
    };

    // Try Supabase insert
    try {
      const { data, error } = await supabase.from('shops').insert([newShop]).select().single();
      if (!error && data) {
        // Insert owner membership
        await supabase.from('shop_members').insert([{ shop_id: data.id, user_id: ownerId, role: 'owner' }]);
      }
    } catch (e) {
      // Offline fallback
    }

    const updatedShops = [...shops, newShop];
    setShops(updatedShops);
    localStorage.setItem('sj_shops', JSON.stringify(updatedShops));
    setActiveShop(newShop);
    
    // Initialize default dataset for new shop
    const newDataset = createDefaultShopDataset(newShop.id);
    setDataset(newDataset);
    localStorage.setItem(`sj_dataset_${newShop.id}`, JSON.stringify(newDataset));

    return newShop;
  };

  const updateShopProfile = async (updated: Partial<Shop>, logoFile?: File) => {
    if (!activeShop) return;
    let logoUrl = activeShop.logo_url;

    if (logoFile) {
      logoUrl = await uploadShopLogo(logoFile, activeShop.id);
    }

    const updatedShop: Shop = {
      ...activeShop,
      ...updated,
      logo_url: logoUrl
    };

    try {
      await supabase.from('shops').update(updatedShop).eq('id', activeShop.id);
    } catch (e) {
      // Fallback
    }

    const newShops = shops.map(s => s.id === activeShop.id ? updatedShop : s);
    setShops(newShops);
    setActiveShop(updatedShop);
    localStorage.setItem('sj_shops', JSON.stringify(newShops));
    localStorage.setItem('sj_active_shop', JSON.stringify(updatedShop));
  };

  const saveData = (newDataset: any) => {
    setDataset(newDataset);
    if (activeShop) {
      localStorage.setItem(`sj_dataset_${activeShop.id}`, JSON.stringify(newDataset));
    }
  };

  const addInventoryItem = (item: Partial<InventoryItem>) => {
    if (!activeShop) return;
    const code = 'ITM-' + String(dataset.seq.item).padStart(4, '0');
    const newItem: InventoryItem = {
      id: 'inv-' + Date.now(),
      shop_id: activeShop.id,
      code,
      name: item.name || 'New Item',
      category: item.category || 'Necklace',
      metal: item.metal || 'Gold',
      purity: item.purity || '22K (916)',
      gross_weight: item.gross_weight || 0,
      stone_weight: item.stone_weight || 0,
      net_weight: item.net_weight || 0,
      stone_charge: item.stone_charge || 0,
      huid: item.huid || '',
      status: 'In Stock'
    };

    const newDataset = {
      ...dataset,
      inventory: [newItem, ...dataset.inventory],
      seq: { ...dataset.seq, item: dataset.seq.item + 1 }
    };
    saveData(newDataset);
  };

  const addCustomer = (cust: Partial<Customer>) => {
    if (!activeShop) return;
    const cust_code = 'CUST-' + String(dataset.seq.cust).padStart(4, '0');
    const newCust: Customer = {
      id: 'c-' + Date.now(),
      shop_id: activeShop.id,
      cust_code,
      name: cust.name || '',
      phone: cust.phone || '',
      address: cust.address || '',
      city: cust.city || '',
      state_code: cust.state_code || '27',
      pan: cust.pan || '',
      balance: cust.balance || 0
    };

    const newDataset = {
      ...dataset,
      customers: [newCust, ...dataset.customers],
      seq: { ...dataset.seq, cust: dataset.seq.cust + 1 }
    };
    saveData(newDataset);
  };

  const addInvoice = (inv: Partial<Invoice>) => {
    if (!activeShop) return;
    const invoice_no = 'INV-' + String(dataset.seq.invoice).padStart(4, '0');
    const newInv: Invoice = {
      id: 'inv-' + Date.now(),
      shop_id: activeShop.id,
      invoice_no,
      date: inv.date || new Date().toISOString().slice(0, 10),
      customer_name: inv.customer_name || '',
      customer_phone: inv.customer_phone || '',
      customer_address: inv.customer_address || '',
      customer_pan: inv.customer_pan || '',
      subtotal: inv.subtotal || 0,
      making: inv.making || 0,
      stone: inv.stone || 0,
      taxable: inv.taxable || 0,
      cgst: inv.cgst || 0,
      sgst: inv.sgst || 0,
      igst: inv.igst || 0,
      discount: inv.discount || 0,
      grand_total: inv.grand_total || 0,
      paid_now: inv.paid_now || 0,
      status: inv.status || 'Paid',
      items: inv.items || []
    };

    // Mark sold inventory items
    const soldCodes = newInv.items.map(i => i.code);
    const updatedInventory: InventoryItem[] = (dataset.inventory as InventoryItem[]).map((it: InventoryItem): InventoryItem => soldCodes.includes(it.code) ? { ...it, status: 'Sold' } : it);

    const newDataset = {
      ...dataset,
      inventory: updatedInventory,
      invoices: [newInv, ...dataset.invoices],
      seq: { ...dataset.seq, invoice: dataset.seq.invoice + 1 }
    };
    saveData(newDataset);
  };

  const saveRate = (index: number, newRate: number) => {
    const updatedRates = [...dataset.rates];
    if (updatedRates[index]) {
      updatedRates[index].rate = newRate;
      updatedRates[index].as_of = new Date().toISOString().slice(0, 10);
    }
    saveData({ ...dataset, rates: updatedRates });
  };

  const secureFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('sj_session_token') || '';
    const tenantId = activeShop?.id || '';
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'X-Tenant-ID': tenantId,
      'Content-Type': 'application/json'
    };
    
    return fetch(endpoint, {
      ...options,
      headers
    });
  };

  // Subscription / Entitlement Accessors Implementation
  const getCurrentTenant = () => activeShop;
  
  const getSubscription = () => {
    if (!activeShop) return null;
    return {
      status: activeShop.subscription_status || 'free_trial',
      trial_ends_at: activeShop.trial_ends_at
    };
  };

  const isTrialActive = () => {
    if (!activeShop?.trial_ends_at) return false;
    return new Date() <= new Date(activeShop.trial_ends_at);
  };

  const isSubscriptionActive = () => {
    if (activeShop?.subscription_status === 'active') return true;
    return isTrialActive();
  };

  const hasFeatureAccess = (featureName: string) => {
    return isSubscriptionActive(); // Extensible for tiered modules later
  };

  return (
    <TenantContext.Provider value={{
      shops,
      activeShop,
      loadingShops,
      switchShop,
      createShop,
      updateShopProfile,
      data: dataset,
      saveData,
      addInventoryItem,
      addCustomer,
      addInvoice,
      saveRate,
      secureFetch,
      getCurrentTenant,
      getSubscription,
      isTrialActive,
      isSubscriptionActive,
      hasFeatureAccess
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
};
