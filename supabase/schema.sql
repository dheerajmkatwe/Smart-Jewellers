-- ============================================================
-- SMART JEWELLERS — MULTI-TENANT POSTGRESQL SCHEMA WITH RLS
-- ============================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Shops / Tenants Table
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    tagline TEXT,
    logo_url TEXT,
    gstin TEXT,
    pan TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state_code TEXT DEFAULT '27',
    currency TEXT DEFAULT '₹',
    terms TEXT DEFAULT '1. Goods once sold exchanged as per store policy.\n2. Making charges non-refundable.',
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Profiles Table (Extends Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Shop Members Table (RBAC & Tenant Authorization Mapping)
CREATE TABLE IF NOT EXISTS public.shop_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'cashier')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(shop_id, user_id)
);

-- 5. Helper RLS Function to Check Tenant Membership
CREATE OR REPLACE FUNCTION public.is_shop_member(check_shop_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.shop_members
        WHERE shop_id = check_shop_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Tenant-Isolated Tables

-- Inventory Table
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    metal TEXT NOT NULL,
    purity TEXT NOT NULL,
    gross_weight NUMERIC(10,3) NOT NULL,
    stone_weight NUMERIC(10,3) DEFAULT 0,
    net_weight NUMERIC(10,3) NOT NULL,
    stone_charge NUMERIC(10,2) DEFAULT 0,
    huid TEXT,
    status TEXT DEFAULT 'In Stock' CHECK (status IN ('In Stock', 'Sold', 'Reserved', 'Under Repair')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    cust_code TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state_code TEXT DEFAULT '27',
    pan TEXT,
    balance NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    gstin TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    state_code TEXT DEFAULT '27',
    balance NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    invoice_no TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT,
    customer_pan TEXT,
    subtotal NUMERIC(12,2) NOT NULL,
    making NUMERIC(12,2) DEFAULT 0,
    stone NUMERIC(12,2) DEFAULT 0,
    taxable NUMERIC(12,2) NOT NULL,
    cgst NUMERIC(12,2) DEFAULT 0,
    sgst NUMERIC(12,2) DEFAULT 0,
    igst NUMERIC(12,2) DEFAULT 0,
    discount NUMERIC(12,2) DEFAULT 0,
    grand_total NUMERIC(12,2) NOT NULL,
    paid_now NUMERIC(12,2) DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('Paid', 'Partial', 'Unpaid')),
    items JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate Master Table
CREATE TABLE IF NOT EXISTS public.rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    metal TEXT NOT NULL,
    purity TEXT NOT NULL,
    fineness TEXT,
    rate NUMERIC(10,2) NOT NULL,
    as_of DATE DEFAULT CURRENT_DATE,
    UNIQUE(shop_id, metal, purity)
);

-- Purchases Table
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    purchase_no TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    supplier_name TEXT NOT NULL,
    supplier_invoice_no TEXT,
    total NUMERIC(12,2) NOT NULL,
    paid_now NUMERIC(12,2) DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('Paid', 'Partial', 'Unpaid')),
    items JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artisans Table
CREATE TABLE IF NOT EXISTS public.artisans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    specialty TEXT,
    charge_type TEXT DEFAULT 'Per Gram',
    rate NUMERIC(10,2) DEFAULT 0,
    balance NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Orders Table
CREATE TABLE IF NOT EXISTS public.job_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    job_no TEXT NOT NULL,
    artisan_name TEXT NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    metal_issued NUMERIC(10,3) NOT NULL,
    metal TEXT NOT NULL,
    status TEXT DEFAULT 'Issued' CHECK (status IN ('Issued', 'In Progress', 'Completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Old Gold Exchanges Table
CREATE TABLE IF NOT EXISTS public.old_gold_exchanges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    exchange_no TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_name TEXT NOT NULL,
    metal TEXT NOT NULL,
    net_weight NUMERIC(10,3) NOT NULL,
    fine_weight NUMERIC(10,3) NOT NULL,
    exchange_value NUMERIC(12,2) NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Adjusted')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Repairs Table
CREATE TABLE IF NOT EXISTS public.repairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    received_date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_name TEXT NOT NULL,
    item_desc TEXT NOT NULL,
    issue TEXT NOT NULL,
    advance NUMERIC(12,2) DEFAULT 0,
    balance NUMERIC(12,2) DEFAULT 0,
    status TEXT DEFAULT 'Received' CHECK (status IN ('Received', 'In Progress', 'Ready', 'Delivered')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.old_gold_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairs ENABLE ROW LEVEL SECURITY;

-- Shops RLS: Members can view shop details, owners can update
CREATE POLICY "Users can view shops they belong to"
    ON public.shops FOR SELECT
    USING (is_shop_member(id) OR owner_id = auth.uid());

CREATE POLICY "Owners can update their shop"
    ON public.shops FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create a shop"
    ON public.shops FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- Profiles RLS
CREATE POLICY "Users can view and edit their profile"
    ON public.profiles FOR ALL
    USING (id = auth.uid());

-- Shop Members RLS
CREATE POLICY "Members can view shop members"
    ON public.shop_members FOR SELECT
    USING (is_shop_member(shop_id));

CREATE POLICY "Owners can manage shop members"
    ON public.shop_members FOR ALL
    USING (EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND owner_id = auth.uid()));

-- Macro Policies for Tenant Data Isolation
CREATE POLICY "Tenant inventory isolation" ON public.inventory FOR ALL USING (is_shop_member(shop_id));
CREATE POLICY "Tenant customers isolation" ON public.customers FOR ALL USING (is_shop_member(shop_id));
CREATE POLICY "Tenant suppliers isolation" ON public.suppliers FOR ALL USING (is_shop_member(shop_id));
CREATE POLICY "Tenant invoices isolation" ON public.invoices FOR ALL USING (is_shop_member(shop_id));
CREATE POLICY "Tenant rates isolation" ON public.rates FOR ALL USING (is_shop_member(shop_id));
CREATE POLICY "Tenant purchases isolation" ON public.purchases FOR ALL USING (is_shop_member(shop_id));
CREATE POLICY "Tenant artisans isolation" ON public.artisans FOR ALL USING (is_shop_member(shop_id));
CREATE POLICY "Tenant job_orders isolation" ON public.job_orders FOR ALL USING (is_shop_member(shop_id));
CREATE POLICY "Tenant exchanges isolation" ON public.old_gold_exchanges FOR ALL USING (is_shop_member(shop_id));
CREATE POLICY "Tenant repairs isolation" ON public.repairs FOR ALL USING (is_shop_member(shop_id));

-- ============================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Shop Owner'), NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
