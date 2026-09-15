-- 0002 ERP Modules Schema for Smart Jewellers SaaS
-- Defines the complex operational layer with strict integrity, foreign keys, and CHECKS validation.

-- 1. Customers (CRM)
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    pan TEXT,
    loyalty_points INTEGER DEFAULT 0 CHECK (loyalty_points >= 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE(tenant_id, phone) -- A tenant cannot have duplicated phone numbers for customers
);

-- 2. Artisans (Krigar/Workers)
CREATE TABLE IF NOT EXISTS artisans (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    specialty TEXT,
    balance REAL DEFAULT 0.0, -- Positive means we owe them, negative means they owe us
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 3. Sales / Invoices (POS)
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    customer_id TEXT,
    invoice_number TEXT NOT NULL,
    total_amount REAL NOT NULL CHECK (total_amount >= 0),
    discount REAL DEFAULT 0 CHECK (discount >= 0),
    tax_amount REAL DEFAULT 0 CHECK (tax_amount >= 0),
    net_amount REAL NOT NULL CHECK (net_amount >= 0),
    payment_status TEXT DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Partial', 'Paid')),
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL, -- Retain invoice if customer is deleted
    UNIQUE(tenant_id, invoice_number)
);

-- 4. Sales Line Items
CREATE TABLE IF NOT EXISTS sales_items (
    id TEXT PRIMARY KEY,
    sale_id TEXT NOT NULL,
    inventory_item_id TEXT,
    description TEXT NOT NULL,
    weight REAL NOT NULL CHECK (weight > 0),
    rate REAL NOT NULL CHECK (rate >= 0),
    making_charge REAL DEFAULT 0 CHECK (making_charge >= 0),
    total_price REAL NOT NULL CHECK (total_price >= 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE SET NULL
);

-- 5. Old Gold Exchange / Purchase
CREATE TABLE IF NOT EXISTS old_gold (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    customer_id TEXT,
    description TEXT NOT NULL,
    gross_weight REAL NOT NULL CHECK (gross_weight > 0),
    purity TEXT NOT NULL,
    net_weight REAL NOT NULL CHECK (net_weight > 0),
    calculated_value REAL NOT NULL CHECK (calculated_value >= 0),
    status TEXT DEFAULT 'Received' CHECK (status IN ('Received', 'Melted', 'Exchanged', 'Returned')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- 6. Repairs & Maintenance
CREATE TABLE IF NOT EXISTS repairs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    customer_id TEXT,
    artisan_id TEXT,
    item_description TEXT NOT NULL,
    repair_details TEXT NOT NULL,
    estimated_cost REAL DEFAULT 0 CHECK (estimated_cost >= 0),
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Delivered')),
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE SET NULL
);

-- 7. Financial Ledger / Journals
CREATE TABLE IF NOT EXISTS ledger_entries (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    reference_type TEXT NOT NULL CHECK (reference_type IN ('Sale', 'Purchase', 'Repair', 'Expense', 'ArtisanPayment', 'Other')),
    reference_id TEXT, -- Polmorphic ID linking to sales.id, old_gold.id, etc.
    entry_type TEXT NOT NULL CHECK (entry_type IN ('Credit', 'Debit')),
    amount REAL NOT NULL CHECK (amount > 0),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 8. Specialized Performance Indexes
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_tenant ON sales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_items_sale ON sales_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_repairs_tenant ON repairs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_old_gold_tenant ON old_gold(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ledger_tenant ON ledger_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ledger_reference ON ledger_entries(reference_type, reference_id);
