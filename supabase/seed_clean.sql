-- ====================================================================
-- SMART JEWELLERS — Clean Supabase Setup (Zero Dummy Data)
-- Project Name: Smart Jewellers
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clear Existing Tables if any
DROP TABLE IF EXISTS repairs CASCADE;
DROP TABLE IF EXISTS old_gold_exchanges CASCADE;
DROP TABLE IF EXISTS job_orders CASCADE;
DROP TABLE IF EXISTS artisans CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS rates CASCADE;
DROP TABLE IF EXISTS shop_members CASCADE;
DROP TABLE IF EXISTS shops CASCADE;

-- 3. Create Multi-Tenant Core Tables
CREATE TABLE shops (
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
    terms TEXT,
    owner_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shop_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'cashier')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(shop_id, user_id)
);

CREATE TABLE rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    metal TEXT NOT NULL,
    purity TEXT NOT NULL,
    fineness TEXT,
    rate NUMERIC(12,2) NOT NULL,
    as_of DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    metal TEXT NOT NULL,
    purity TEXT NOT NULL,
    gross_weight NUMERIC(10,3) NOT NULL DEFAULT 0,
    stone_weight NUMERIC(10,3) NOT NULL DEFAULT 0,
    net_weight NUMERIC(10,3) NOT NULL DEFAULT 0,
    stone_charge NUMERIC(12,2) DEFAULT 0,
    huid TEXT,
    status TEXT NOT NULL DEFAULT 'In Stock',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
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

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    gstin TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    state_code TEXT DEFAULT '27',
    balance NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    invoice_no TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT,
    customer_pan TEXT,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    making NUMERIC(12,2) NOT NULL DEFAULT 0,
    stone NUMERIC(12,2) NOT NULL DEFAULT 0,
    taxable NUMERIC(12,2) NOT NULL DEFAULT 0,
    cgst NUMERIC(12,2) DEFAULT 0,
    sgst NUMERIC(12,2) DEFAULT 0,
    igst NUMERIC(12,2) DEFAULT 0,
    discount NUMERIC(12,2) DEFAULT 0,
    grand_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    paid_now NUMERIC(12,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Paid',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    metal TEXT,
    purity TEXT,
    gross_weight NUMERIC(10,3),
    net_weight NUMERIC(10,3),
    stone_charge NUMERIC(12,2),
    making NUMERIC(12,2),
    qty INT DEFAULT 1,
    line_total NUMERIC(12,2) NOT NULL
);

-- 4. Row Level Security Policies (Strict Tenant Isolation)
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_shop_member(check_shop_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM shop_members
    WHERE shop_id = check_shop_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Shops access policy" ON shops FOR ALL USING (
    owner_id = auth.uid() OR is_shop_member(id)
);

CREATE POLICY "Rates isolation policy" ON rates FOR ALL USING (is_shop_member(shop_id));
CREATE POLICY "Inventory isolation policy" ON inventory FOR ALL USING (is_shop_member(shop_id));
CREATE POLICY "Customers isolation policy" ON customers FOR ALL USING (is_shop_member(shop_id));
CREATE POLICY "Suppliers isolation policy" ON suppliers FOR ALL USING (is_shop_member(shop_id));
CREATE POLICY "Invoices isolation policy" ON invoices FOR ALL USING (is_shop_member(shop_id));
CREATE POLICY "Invoice items isolation policy" ON invoice_items FOR ALL USING (is_shop_member(shop_id));
