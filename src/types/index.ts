export interface Shop {
  id: string;
  name: string;
  tagline?: string;
  logo_url?: string;
  gstin?: string;
  pan?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state_code?: string;
  currency?: string;
  terms?: string;
  subscription_status?: string;
  trial_ends_at?: string;
  owner_id: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  created_at?: string;
}

export interface ShopMember {
  id: string;
  shop_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'manager' | 'accountant' | 'sales' | 'staff';
}

export interface InventoryItem {
  id: string;
  shop_id: string;
  code: string;
  name: string;
  category: string;
  metal: 'Gold' | 'Silver' | 'Platinum';
  purity: string;
  gross_weight: number;
  stone_weight: number;
  net_weight: number;
  stone_charge: number;
  huid?: string;
  status: 'In Stock' | 'Sold' | 'Reserved' | 'Under Repair';
  created_at?: string;
}

export interface Customer {
  id: string;
  shop_id: string;
  cust_code: string;
  name: string;
  phone: string;
  address?: string;
  city?: string;
  state_code?: string;
  pan?: string;
  balance: number;
  created_at?: string;
}

export interface Supplier {
  id: string;
  shop_id: string;
  name: string;
  gstin?: string;
  phone?: string;
  email?: string;
  address?: string;
  state_code?: string;
  balance: number;
  created_at?: string;
}

export interface InvoiceItem {
  code: string;
  name: string;
  category: string;
  metal: string;
  purity: string;
  gross_weight: number;
  net_weight: number;
  stone_charge: number;
  making: number;
  qty: number;
  line_total: number;
}

export interface Invoice {
  id: string;
  shop_id: string;
  invoice_no: string;
  date: string;
  customer_name: string;
  customer_phone?: string;
  customer_address?: string;
  customer_pan?: string;
  subtotal: number;
  making: number;
  stone: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  discount: number;
  grand_total: number;
  paid_now: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  items: InvoiceItem[];
  created_at?: string;
}

export interface Rate {
  id?: string;
  shop_id: string;
  metal: string;
  purity: string;
  fineness: string;
  rate: number;
  as_of: string;
}

export interface Purchase {
  id: string;
  shop_id: string;
  purchase_no: string;
  date: string;
  supplier_name: string;
  supplier_invoice_no?: string;
  total: number;
  paid_now: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  items: any[];
  created_at?: string;
}

export interface Artisan {
  id: string;
  shop_id: string;
  name: string;
  phone?: string;
  address?: string;
  specialty?: string;
  charge_type?: string;
  rate?: number;
  balance: number;
  created_at?: string;
}

export interface JobOrder {
  id: string;
  shop_id: string;
  job_no: string;
  artisan_name: string;
  issue_date: string;
  metal_issued: number;
  metal: string;
  status: 'Issued' | 'In Progress' | 'Completed';
  created_at?: string;
}

export interface OldGoldExchange {
  id: string;
  shop_id: string;
  exchange_no: string;
  date: string;
  customer_name: string;
  metal: string;
  net_weight: number;
  fine_weight: number;
  exchange_value: number;
  status: 'Pending' | 'Adjusted';
  created_at?: string;
}

export interface Repair {
  id: string;
  shop_id: string;
  token: string;
  received_date: string;
  customer_name: string;
  item_desc: string;
  issue: string;
  advance: number;
  balance: number;
  status: 'Received' | 'In Progress' | 'Ready' | 'Delivered';
  created_at?: string;
}
