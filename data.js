/* ============================================================
   SMART JEWELLERS — MULTI-TENANT DATA ENGINE (data.js)
   ============================================================ */

const STORAGE_KEYS = {
    SESSION: 'sj_auth_session',
    USERS: 'sj_users',
    TENANTS: 'sj_tenants',
    TENANT_DATA_PREFIX: 'sj_tenant_data_'
};

// Default app logo file path
const DEFAULT_APP_LOGO = 'logo.jpg';

// Initial pre-configured multi-tenant accounts for demonstration
const DEFAULT_TENANTS = [
    {
        id: 'tenant-main',
        name: 'Smart Jewellers',
        tagline: 'Main Branch - Gold & Diamonds',
        logoUrl: 'logo.jpg',
        gstin: '27AAAAA0000A1Z5',
        address: '101 Gold Bazaar, Zaveri Market, MG Road',
        city: 'Mumbai',
        stateCode: '27',
        phone: '+91 98765 43210',
        email: 'contact@smartjewellers.com',
        pan: 'AAAAA0000A',
        terms: '1. Goods once sold will be exchanged as per store policy.\n2. GST included as per law. Making charges non-refundable.',
        currency: '₹',
        ownerId: 'user-1',
        createdAt: new Date().toISOString()
    },
    {
        id: 'tenant-royal',
        name: 'Smart Jewellers - Royal Heritage',
        tagline: 'Luxury Antique & Polki Collection',
        logoUrl: 'logo.jpg',
        gstin: '27BBBBB1111B2Z6',
        address: '45 Heritage Arcade, Cathedral Road',
        city: 'Mumbai',
        stateCode: '27',
        phone: '+91 98222 11100',
        email: 'royal@smartjewellers.com',
        pan: 'BBBBB1111B',
        terms: '1. Antique pieces certified by BIS Hallmark.\n2. Custom design orders require 50% advance.',
        currency: '₹',
        ownerId: 'user-1',
        createdAt: new Date().toISOString()
    }
];

const DEFAULT_USERS = [
    {
        id: 'user-1',
        email: 'owner@smartjewellers.com',
        password: 'password123',
        fullName: 'Rajesh Sharma',
        role: 'Owner',
        tenantIds: ['tenant-main', 'tenant-royal']
    }
];

// Initial dataset generator for a new shop tenant
function createDefaultTenantData(tenantName) {
    return {
        rates: [
            { metal: 'GOLD', purity: '24K (999)', fineness: '99.9%', rate: 7450, asOf: new Date().toISOString().slice(0,10) },
            { metal: 'GOLD', purity: '22K (916)', fineness: '91.6%', rate: 6830, asOf: new Date().toISOString().slice(0,10) },
            { metal: 'GOLD', purity: '20K (833)', fineness: '83.3%', rate: 6210, asOf: new Date().toISOString().slice(0,10) },
            { metal: 'GOLD', purity: '18K (750)', fineness: '75%', rate: 5580, asOf: new Date().toISOString().slice(0,10) },
            { metal: 'GOLD', purity: '14K (585)', fineness: '58.5%', rate: 4350, asOf: new Date().toISOString().slice(0,10) },
            { metal: 'PLATINUM', purity: '950 Platinum', fineness: '95%', rate: 3500, asOf: new Date().toISOString().slice(0,10) },
            { metal: 'SILVER', purity: '999 Fine Silver', fineness: '99.9%', rate: 92, asOf: new Date().toISOString().slice(0,10) },
            { metal: 'SILVER', purity: '925 Sterling Silver', fineness: '92.5%', rate: 85, asOf: new Date().toISOString().slice(0,10) }
        ],
        hsn: [
            { code: '7106', desc: 'Silver unwrought / semi-manufactured', cgst: 1.5, sgst: 1.5, igst: 3 },
            { code: '7108', desc: 'Gold unwrought / semi-manufactured', cgst: 0.125, sgst: 0.125, igst: 0.25 },
            { code: '7113', desc: 'Articles of jewellery of gold/silver/platinum', cgst: 1.5, sgst: 1.5, igst: 3 },
            { code: '7118', desc: 'Coins of precious metal', cgst: 1.5, sgst: 1.5, igst: 3 },
            { code: '9988', desc: 'Job work making charges', cgst: 2.5, sgst: 2.5, igst: 5 }
        ],
        categories: [
            { name: 'Necklace', hsn: '7113' },
            { name: 'Ring', hsn: '7113' },
            { name: 'Bangle', hsn: '7113' },
            { name: 'Chain', hsn: '7113' },
            { name: 'Earrings', hsn: '7113' },
            { name: 'Pendant', hsn: '7113' },
            { name: 'Anklet (Payal)', hsn: '7113' },
            { name: 'Coin', hsn: '7118' }
        ],
        inventory: [
            { code: 'ITM-0001', name: '22K Gold Floral Necklace', category: 'Necklace', metal: 'Gold', purity: '22K (916)', grossWeight: 24.500, stoneWeight: 0.500, netWeight: 24.000, stoneDetails: 'CZ Diamonds', stoneCharge: 1200, huid: 'HJ8921', status: 'In Stock' },
            { code: 'ITM-0002', name: '18K Diamond Solitaire Ring', category: 'Ring', metal: 'Gold', purity: '18K (750)', grossWeight: 4.800, stoneWeight: 0.300, netWeight: 4.500, stoneDetails: '0.25 ct Diamond VVS', stoneCharge: 8500, huid: 'DR7712', status: 'In Stock' },
            { code: 'ITM-0003', name: '22K Traditional Bangle Pair', category: 'Bangle', metal: 'Gold', purity: '22K (916)', grossWeight: 32.000, stoneWeight: 0.000, netWeight: 32.000, stoneDetails: '', stoneCharge: 0, huid: 'BG5543', status: 'In Stock' },
            { code: 'ITM-0004', name: '925 Sterling Silver Payal', category: 'Anklet (Payal)', metal: 'Silver', purity: '925 Sterling Silver', grossWeight: 45.000, stoneWeight: 0.000, netWeight: 45.000, stoneDetails: '', stoneCharge: 0, huid: '', status: 'In Stock' }
        ],
        customers: [
            { id: 'CUST-0001', name: 'Anand Verma', phone: '9811122233', address: 'Flat 402, Sunshine Heights', city: 'Mumbai', stateCode: '27', pan: 'ABCDE1234F', balance: 0 },
            { id: 'CUST-0002', name: 'Pooja Mehta', phone: '9822233344', address: '12 Marine Lines', city: 'Mumbai', stateCode: '27', pan: 'FGHIJ5678K', balance: 15000 }
        ],
        suppliers: [
            { id: 'SUP-0001', name: 'RK Bullion Supplier', gstin: '27SUPPL1234A1Z9', phone: '9899900011', email: 'rk@bullion.com', stateCode: '27', balance: 45000, address: 'Zaveri Bazaar' }
        ],
        purchases: [],
        artisans: [
            { name: 'Ramesh Karigar', phone: '9877766655', address: 'Artisan Workshop, Craft Street', specialty: 'Kundan & Necklaces', chargeType: 'Per Gram', rate: 250, balance: 4200 }
        ],
        jobs: [],
        exchanges: [],
        repairs: [],
        invoices: [],
        users: [{ username: 'admin', fullName: 'Administrator', role: 'ADMIN', status: 'Active' }],
        posCart: [],
        paymentSplits: [],
        seq: { item: 5, cust: 3, supp: 2, purch: 1, job: 1, exch: 1, repair: 1, invoice: 1 }
    };
}

// Storage Helpers
function loadStorage(key, defaultVal) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : defaultVal;
    } catch (e) {
        return defaultVal;
    }
}

function saveStorage(key, val) {
    try {
        localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
        console.error('Storage error', e);
    }
}

// Data Engine API
const DataEngine = {
    init() {
        if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
            saveStorage(STORAGE_KEYS.TENANTS, DEFAULT_TENANTS);
            DEFAULT_TENANTS.forEach(t => {
                saveStorage(STORAGE_KEYS.TENANT_DATA_PREFIX + t.id, createDefaultTenantData(t.name));
            });
        }
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
            saveStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
        }
    },

    getUsers() {
        return loadStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    },

    saveUsers(users) {
        saveStorage(STORAGE_KEYS.USERS, users);
    },

    getTenants() {
        return loadStorage(STORAGE_KEYS.TENANTS, DEFAULT_TENANTS);
    },

    saveTenants(tenants) {
        saveStorage(STORAGE_KEYS.TENANTS, tenants);
    },

    getTenantById(id) {
        return this.getTenants().find(t => t.id === id);
    },

    getTenantData(tenantId) {
        const data = loadStorage(STORAGE_KEYS.TENANT_DATA_PREFIX + tenantId, null);
        if (!data) {
            const fresh = createDefaultTenantData('New Shop');
            saveStorage(STORAGE_KEYS.TENANT_DATA_PREFIX + tenantId, fresh);
            return fresh;
        }
        return data;
    },

    saveTenantData(tenantId, data) {
        saveStorage(STORAGE_KEYS.TENANT_DATA_PREFIX + tenantId, data);
    },

    getSession() {
        return loadStorage(STORAGE_KEYS.SESSION, { isLoggedIn: false, userId: null, activeTenantId: null });
    },

    saveSession(session) {
        saveStorage(STORAGE_KEYS.SESSION, session);
    },

    createShopTenant(ownerUserId, shopDetails) {
        const tenants = this.getTenants();
        const newId = 'tenant-' + Date.now();
        const newTenant = {
            id: newId,
            name: shopDetails.name || 'Smart Jewellers Shop',
            tagline: shopDetails.tagline || 'Jewellery & Fine Ornaments',
            logoUrl: shopDetails.logoUrl || DEFAULT_APP_LOGO,
            gstin: shopDetails.gstin || '',
            address: shopDetails.address || '',
            city: shopDetails.city || '',
            stateCode: shopDetails.stateCode || '27',
            phone: shopDetails.phone || '',
            email: shopDetails.email || '',
            pan: shopDetails.pan || '',
            terms: shopDetails.terms || '1. Goods once sold will be exchanged as per store policy.\n2. Making charges & wastage non-refundable.',
            currency: shopDetails.currency || '₹',
            ownerId: ownerUserId,
            createdAt: new Date().toISOString()
        };
        tenants.push(newTenant);
        this.saveTenants(tenants);

        // Save tenant initial data
        const initialData = createDefaultTenantData(newTenant.name);
        this.saveTenantData(newId, initialData);

        // Update user tenantIds
        const users = this.getUsers();
        const user = users.find(u => u.id === ownerUserId);
        if (user) {
            if (!user.tenantIds) user.tenantIds = [];
            user.tenantIds.push(newId);
            this.saveUsers(users);
        }

        return newTenant;
    }
};

DataEngine.init();
