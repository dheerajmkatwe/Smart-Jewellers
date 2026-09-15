/* ============================================================
   SMART JEWELLERS — MAIN APPLICATION & ROUTER (app.js)
   ============================================================ */

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>' },
    { id: 'billing', label: 'Billing / POS', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/></svg>' },
    { id: 'invoices', label: 'Invoice History', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' },
    { id: 'inventory', label: 'Inventory Stock', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>' },
    { id: 'barcode', label: 'Barcode Printer', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14"/></svg>' },
    { id: 'rates', label: 'Rate Master', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>' },
    { id: 'customers', label: 'Customers', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>' },
    { id: 'suppliers', label: 'Suppliers', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>' },
    { id: 'purchases', label: 'Purchases', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>' },
    { id: 'artisans', label: 'Artisans / Job Work', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>' },
    { id: 'exchange', label: 'Old Gold Exchange', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>' },
    { id: 'repairs', label: 'Repairs & Service', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>' },
    { id: 'reports', label: 'Reports', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' },
    { id: 'settings', label: 'Settings', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>' }
];

let currentPage = 'dashboard';

function buildNav() {
    const nav = document.getElementById('navList');
    nav.innerHTML = NAV_ITEMS.map(item => `
        <div class="nav-link ${item.id === currentPage ? 'active' : ''}" data-page="${item.id}" onclick="goTo('${item.id}')">
            ${item.icon}
            <span>${item.label}</span>
        </div>
    `).join('');
}

function goTo(pageId) {
    currentPage = pageId;
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageId);
    });
    document.querySelectorAll('.page').forEach(page => {
        page.classList.toggle('active', page.id === `page-${pageId}`);
    });

    if (window.AppModule) {
        if (pageId === 'dashboard') AppModule.renderDashboard();
        else if (pageId === 'billing') AppModule.renderPosCart();
        else if (pageId === 'invoices') AppModule.renderInvoices();
        else if (pageId === 'inventory') AppModule.renderInventory();
        else if (pageId === 'barcode') AppModule.renderBarcode();
        else if (pageId === 'rates') AppModule.renderRates();
        else if (pageId === 'customers') AppModule.renderCustomers();
        else if (pageId === 'suppliers') AppModule.renderSuppliers();
        else if (pageId === 'purchases') AppModule.renderPurchases();
        else if (pageId === 'artisans') AppModule.renderArtisans();
        else if (pageId === 'exchange') AppModule.renderExchange();
        else if (pageId === 'repairs') AppModule.renderRepairs();
        else if (pageId === 'reports') AppModule.renderReportBody();
        else if (pageId === 'settings') AppModule.renderSettingsBody();
    }
}

// Theme handler
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sj_theme', theme);
    const btn = document.getElementById('themeToggle');
    if (btn) {
        btn.innerHTML = theme === 'dark' ?
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>' :
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
    }
}

document.getElementById('themeToggle').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(cur);
});

// App Event Bindings
function bindGlobalEvents() {
    // POS / Billing Item Selection
    document.getElementById('posItemSearch').addEventListener('input', e => {
        const val = e.target.value.trim();
        if (!val || !AppModule.db) return;
        const item = (AppModule.db.inventory || []).find(i => (i.name === val || i.code === val) && i.status === 'In Stock');
        if (item) {
            const existing = AppModule.db.posCart.find(c => c.code === item.code);
            if (existing) {
                existing.qty++;
            } else {
                AppModule.db.posCart.push({ ...item, qty: 1, making: 450 });
            }
            e.target.value = '';
            AppModule.renderPosCart();
        }
    });

    // Customer Auto-fill
    document.getElementById('posCustSearch').addEventListener('input', e => {
        const val = e.target.value.trim();
        if (!val || !AppModule.db) return;
        const cust = (AppModule.db.customers || []).find(c => c.name === val || c.phone === val);
        if (cust) {
            document.getElementById('posName').value = cust.name;
            document.getElementById('posPhone').value = cust.phone || '';
            document.getElementById('posAddress').value = cust.address || '';
            document.getElementById('posPan').value = cust.pan || '';
        }
    });

    document.getElementById('posDiscount').addEventListener('input', () => AppModule.recalcBill());
    document.getElementById('posSupplyType').addEventListener('change', () => AppModule.recalcBill());
    document.getElementById('completeSaleBtn').addEventListener('click', () => AppModule.completeSale());

    // Add Stock Item Modal
    document.getElementById('btnAddItem').addEventListener('click', () => {
        const bodyHtml = `
            <div class="form-row">
                <div class="field"><label>Item Name <span class="req">*</span></label><input class="input" id="niName" placeholder="e.g. 22K Gold Antique Choker"></div>
                <div class="field"><label>Category <span class="req">*</span></label><select class="input" id="niCategory"><option>Necklace</option><option>Ring</option><option>Bangle</option><option>Chain</option><option>Earrings</option><option>Pendant</option></select></div>
            </div>
            <div class="form-row">
                <div class="field"><label>Metal <span class="req">*</span></label><select class="input" id="niMetal"><option>Gold</option><option>Silver</option><option>Platinum</option></select></div>
                <div class="field"><label>Purity <span class="req">*</span></label><select class="input" id="niPurity"><option>22K (916)</option><option>18K (750)</option><option>24K (999)</option><option>14K (585)</option><option>925 Sterling Silver</option></select></div>
            </div>
            <div class="form-row">
                <div class="field"><label>Gross Weight (g) <span class="req">*</span></label><input class="input" type="number" step="0.001" id="niGross"></div>
                <div class="field"><label>Net Weight (g) <span class="req">*</span></label><input class="input" type="number" step="0.001" id="niNet"></div>
            </div>
            <div class="form-row">
                <div class="field"><label>HUID Hallmark No.</label><input class="input" id="niHuid" placeholder="e.g. AB1234"></div>
                <div class="field"><label>Stone Charge (₹)</label><input class="input" type="number" id="niStone" value="0"></div>
            </div>
        `;
        const footHtml = `<button class="btn btn-gold" id="saveNewItemBtn">Add Stock Item</button>`;
        openModal('Add New Inventory Stock', bodyHtml, footHtml);

        document.getElementById('saveNewItemBtn').addEventListener('click', () => {
            const name = document.getElementById('niName').value.trim();
            const gross = Number(document.getElementById('niGross').value || 0);
            const net = Number(document.getElementById('niNet').value || 0);
            if (!name || !net) { toast('Item name and net weight required.', 'err'); return; }

            const code = 'ITM-' + pad(AppModule.db.seq.item++, 4);
            AppModule.db.inventory.push({
                code,
                name,
                category: document.getElementById('niCategory').value,
                metal: document.getElementById('niMetal').value,
                purity: document.getElementById('niPurity').value,
                grossWeight: gross || net,
                stoneWeight: gross ? gross - net : 0,
                netWeight: net,
                stoneCharge: Number(document.getElementById('niStone').value || 0),
                huid: document.getElementById('niHuid').value.trim(),
                status: 'In Stock'
            });

            AppModule.saveData();
            closeModal();
            toast(`Item ${code} added to stock!`);
            AppModule.renderInventory();
            AppModule.refreshDatalists();
        });
    });

    // Report Tab Clicks
    document.querySelectorAll('#reportTabs .tab').forEach(t => {
        t.addEventListener('click', () => AppModule.switchReportTab(t.dataset.rtab));
    });

    // Settings Tab Clicks
    document.querySelectorAll('#settingsTabs .tab').forEach(t => {
        t.addEventListener('click', () => {
            AppModule.currentSettingsTab = t.dataset.stab;
            document.querySelectorAll('#settingsTabs .tab').forEach(x => x.classList.toggle('active', x === t));
            AppModule.renderSettingsBody();
        });
    });
}

// Application Entry Point
document.addEventListener('DOMContentLoaded', () => {
    buildNav();
    applyTheme(localStorage.getItem('sj_theme') || 'dark');
    bindGlobalEvents();
    
    // Initialize Auth & Load Active Tenant
    Auth.init();
    if (Auth.activeTenant) {
        AppModule.renderAll();
    }

    goTo('dashboard');
});
