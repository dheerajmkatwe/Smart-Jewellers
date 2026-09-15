/* ============================================================
   SMART JEWELLERS — CORE MODULES & INVOICE PRINTING (modules.js)
   ============================================================ */

function todayStr() { return new Date().toISOString().slice(0, 10); }
function fmtDate(iso) { if (!iso) return '-'; const [y, m, d] = iso.split('-'); return `${d}-${m}-${y}`; }
function inr(n) { n = Number(n || 0); return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }); }
function inr0(n) { n = Number(n || 0); return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 }); }
function wt(n) { return Number(n || 0).toFixed(3) + ' g'; }
function pad(n, len) { return String(n).padStart(len, '0'); }
function esc(s) { return (s == null ? '' : String(s)).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function toast(msg, type) {
    const host = document.getElementById('toastHost');
    const t = document.createElement('div');
    t.className = `toast ${type === 'err' ? 'err' : ''}`;
    t.textContent = msg;
    host.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3200);
}

function openModal(title, bodyHtml, footHtml, opts) {
    opts = opts || {};
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalFoot').innerHTML = footHtml || '';
    document.getElementById('modalBox').classList.toggle('wide', !!opts.wide);
    document.getElementById('modalBackdrop').classList.add('open');
}

function closeModal() { document.getElementById('modalBackdrop').classList.remove('open'); }

document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
document.getElementById('modalBackdrop').addEventListener('click', e => { if (e.target.id === 'modalBackdrop') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

const AppModule = {
    get db() {
        return Auth.db;
    },
    get shop() {
        return Auth.activeTenant || {};
    },

    saveData() {
        if (Auth.activeTenant && Auth.db) {
            DataEngine.saveTenantData(Auth.activeTenant.id, Auth.db);
        }
    },

    onTenantChanged() {
        this.renderAll();
    },

    renderAll() {
        if (!this.db) return;
        this.renderDashboard();
        this.renderInventory();
        this.renderBarcode();
        this.renderRates();
        this.renderCustomers();
        this.renderSuppliers();
        this.renderPurchases();
        this.renderArtisans();
        this.renderExchange();
        this.renderRepairs();
        this.renderInvoices();
        this.renderReportBody();
        this.renderSettingsBody();
        this.refreshDatalists();
    },

    /* ================= DASHBOARD ================= */
    renderDashboard() {
        const DB = this.db;
        const today = todayStr();
        const monthKey = today.slice(0, 7);
        const todayInv = (DB.invoices || []).filter(i => i.date === today);
        const monthInv = (DB.invoices || []).filter(i => i.date && i.date.slice(0, 7) === monthKey);

        document.getElementById('kpiTodaySales').textContent = inr0(todayInv.reduce((s, i) => s + (i.grandTotal || 0), 0));
        document.getElementById('kpiTodayInv').textContent = todayInv.length + ' invoice(s)';
        document.getElementById('kpiMonthSales').textContent = inr0(monthInv.reduce((s, i) => s + (i.grandTotal || 0), 0));
        document.getElementById('kpiMonthInv').textContent = monthInv.length + ' invoice(s)';

        const stock = (DB.inventory || []).filter(i => i.status === 'In Stock');
        document.getElementById('kpiStockItems').textContent = stock.length;
        document.getElementById('kpiStockWt').textContent = stock.reduce((s, i) => s + Number(i.netWeight || 0), 0).toFixed(2) + ' g total net weight';

        const custDues = (DB.customers || []).reduce((s, c) => s + Math.max(0, c.balance || 0), 0);
        document.getElementById('kpiCustDues').textContent = inr0(custDues);

        const pendingExch = (DB.exchanges || []).filter(e => e.status !== 'Adjusted');
        document.getElementById('kpiPendingExch').textContent = pendingExch.length;
        document.getElementById('kpiPendingExchVal').textContent = inr0(pendingExch.reduce((s, e) => s + (e.value || 0), 0)) + ' awaiting adjustment';

        const openRep = (DB.repairs || []).filter(r => r.status !== 'Delivered');
        document.getElementById('kpiOpenRepairs').textContent = openRep.length;
        document.getElementById('kpiOpenRepairsDue').textContent = inr0(openRep.reduce((s, r) => s + (r.balance || 0), 0)) + ' balance due';

        const rateRows = (DB.rates || []).filter(r => r.rate);
        document.getElementById('tblRateBoard').innerHTML = rateRows.length ? rateRows.map(r =>
            `<tr><td>${r.metal}</td><td>${r.purity}</td><td class="right num">${inr(r.rate)}</td></tr>`).join('') :
            `<tr class="empty-row"><td colspan="3">No rates set yet</td></tr>`;

        const byMetal = {};
        stock.forEach(i => { byMetal[i.metal] = byMetal[i.metal] || { items: 0, wt: 0 }; byMetal[i.metal].items++; byMetal[i.metal].wt += Number(i.netWeight || 0); });
        const metals = Object.keys(byMetal);
        document.getElementById('tblStockBreakdown').innerHTML = metals.length ? metals.map(m =>
            `<tr><td>${m}</td><td class="right">${byMetal[m].items}</td><td class="right num">${byMetal[m].wt.toFixed(2)} g</td></tr>`).join('') :
            `<tr class="empty-row"><td colspan="3">No stock items in hand</td></tr>`;
    },

    /* ================= BILLING / POS & INVOICE PRINT ================= */
    refreshDatalists() {
        const DB = this.db;
        if (!DB) return;
        document.getElementById('dlCustomers').innerHTML = (DB.customers || []).map(c => `<option value="${esc(c.name)}">${c.phone || ''}</option>`).join('');
        document.getElementById('dlInventory').innerHTML = (DB.inventory || []).filter(i => i.status === 'In Stock').map(i => `<option value="${esc(i.name)}">${i.code}</option>`).join('');
        document.getElementById('dlSuppliers').innerHTML = (DB.suppliers || []).map(s => `<option value="${esc(s.name)}"></option>`).join('');
    },

    renderPosCart() {
        const DB = this.db;
        const tbody = document.getElementById('tblPosCart');
        tbody.innerHTML = (DB.posCart || []).length ? DB.posCart.map((it, idx) => `
            <tr>
                <td>${esc(it.name)}<div class="small muted">${it.metal} ${it.purity} · ${wt(it.netWeight)}</div></td>
                <td class="right"><input class="input" style="width:70px; text-align:right;" type="number" value="${it.qty}" min="1" onchange="AppModule.updateCartField(${idx},'qty',this.value)"></td>
                <td class="right"><input class="input" style="width:110px; text-align:right;" type="number" value="${it.making}" onchange="AppModule.updateCartField(${idx},'making',this.value)"></td>
                <td><button class="btn btn-ghost btn-sm" onclick="AppModule.removeCartItem(${idx})">✕</button></td>
            </tr>
        `).join('') : `<tr class="empty-row"><td colspan="4">No items added yet</td></tr>`;
        this.recalcBill();
    },

    updateCartField(idx, field, val) {
        this.db.posCart[idx][field] = Number(val || 0);
        this.recalcBill();
    },

    removeCartItem(idx) {
        this.db.posCart.splice(idx, 1);
        this.renderPosCart();
    },

    rateFor(metal, purity) {
        const r = (this.db.rates || []).find(r => r.metal === metal.toUpperCase() && r.purity === purity);
        return r && r.rate ? r.rate : 0;
    },

    recalcBill() {
        const DB = this.db;
        let subtotal = 0, making = 0, stone = 0;
        (DB.posCart || []).forEach(it => {
            const rate = this.rateFor(it.metal, it.purity);
            subtotal += rate * it.netWeight * it.qty;
            making += it.making * it.qty;
            stone += (it.stoneCharge || 0) * it.qty;
        });

        const taxable = subtotal + making + stone;
        const supplyType = document.getElementById('posSupplyType').value;
        const hsn = DB.hsn.find(h => h.code === '7113') || { cgst: 1.5, sgst: 1.5, igst: 3 };

        let cgst = 0, sgst = 0, igst = 0;
        if (supplyType === 'intra') {
            cgst = taxable * (hsn.cgst / 100);
            sgst = taxable * (hsn.sgst / 100);
        } else {
            igst = taxable * (hsn.igst / 100);
        }

        const discount = Number(document.getElementById('posDiscount').value || 0);
        const preRound = taxable + cgst + sgst + igst - discount;
        const grand = Math.round(preRound);
        const round = grand - preRound;

        document.getElementById('sumSubtotal').textContent = inr(subtotal);
        document.getElementById('sumMaking').textContent = inr(making);
        document.getElementById('sumStone').textContent = inr(stone);
        document.getElementById('sumTaxable').textContent = inr(taxable);
        document.getElementById('sumCgstLabel').textContent = supplyType === 'intra' ? 'CGST' : 'IGST';
        document.getElementById('sumSgstLabel').textContent = supplyType === 'intra' ? 'SGST' : '—';
        document.getElementById('sumCgst').textContent = inr(supplyType === 'intra' ? cgst : igst);
        document.getElementById('sumSgst').textContent = supplyType === 'intra' ? inr(sgst) : inr(0);
        document.getElementById('sumRound').textContent = inr(round);
        document.getElementById('sumGrand').textContent = inr(grand);

        const paid = (DB.paymentSplits || []).reduce((s, p) => s + p.amount, 0) + Number(document.getElementById('payAmount').value || 0);
        document.getElementById('sumPaid').textContent = inr(paid);
        document.getElementById('sumBalance').textContent = inr(Math.max(0, grand - paid));

        window._billDraft = { subtotal, making, stone, taxable, cgst: supplyType === 'intra' ? cgst : 0, sgst: supplyType === 'intra' ? sgst : 0, igst: supplyType === 'intra' ? 0 : igst, discount, grand, paid };
    },

    completeSale() {
        const DB = this.db;
        const name = document.getElementById('posName').value.trim();
        const phone = document.getElementById('posPhone').value.trim();
        const address = document.getElementById('posAddress').value.trim();
        const pan = document.getElementById('posPan').value.trim();

        if (!name || !phone || !address || !pan) {
            toast('Customer name, phone, address, and PAN are mandatory for tax invoice.', 'err');
            return;
        }
        if (!DB.posCart.length) {
            toast('Add at least one item to the cart.', 'err');
            return;
        }

        const d = window._billDraft;
        let cust = (DB.customers || []).find(c => c.phone === phone);
        if (!cust) {
            cust = { id: 'CUST-' + pad(DB.seq.cust++, 4), name, phone, address, pan, balance: 0 };
            DB.customers.push(cust);
        }

        const paid = (DB.paymentSplits || []).reduce((s, p) => s + p.amount, 0) + Number(document.getElementById('payAmount').value || 0);
        const invItems = DB.posCart.map(it => ({
            ...it,
            lineTotal: this.rateFor(it.metal, it.purity) * it.netWeight * it.qty + it.making * it.qty + (it.stoneCharge || 0) * it.qty
        }));

        const invoice = {
            id: 'INV-' + pad(DB.seq.invoice++, 4),
            date: todayStr(),
            customerName: name,
            customerPhone: phone,
            customerAddress: address,
            customerPan: pan,
            taxable: d.taxable,
            subtotal: d.subtotal,
            making: d.making,
            stone: d.stone,
            cgst: d.cgst,
            sgst: d.sgst,
            igst: d.igst,
            discount: d.discount,
            tax: d.cgst + d.sgst + d.igst,
            grandTotal: d.grand,
            paidNow: paid,
            status: paid >= d.grand ? 'Paid' : (paid > 0 ? 'Partial' : 'Unpaid'),
            items: invItems,
            shopName: this.shop.name,
            shopLogo: this.shop.logoUrl || DEFAULT_APP_LOGO
        };

        DB.invoices.push(invoice);
        cust.balance = (cust.balance || 0) + Math.max(0, d.grand - paid);

        invItems.forEach(it => {
            const itemInDb = DB.inventory.find(x => x.code === it.code);
            if (itemInDb) itemInDb.status = 'Sold';
        });

        DB.posCart = [];
        DB.paymentSplits = [];
        document.getElementById('paymentSplits').innerHTML = '';
        document.getElementById('payAmount').value = '';
        document.getElementById('posDiscount').value = 0;
        this.renderPosCart();

        this.saveData();
        toast(`Invoice ${invoice.id} generated!`);
        this.renderInvoices();
        this.renderInventory();
        this.renderDashboard();
        this.renderCustomers();

        // Print preview modal
        this.showInvoicePrintModal(invoice);
    },

    showInvoicePrintModal(inv) {
        const shop = this.shop;
        const logo = shop.logoUrl || DEFAULT_APP_LOGO;

        const html = `
            <div class="invoice-print-container" id="invPrintArea">
                <div class="inv-header">
                    <div class="inv-shop-brand">
                        <img src="${logo}" class="inv-shop-logo" onerror="this.src='${DEFAULT_APP_LOGO}'">
                        <div>
                            <div class="inv-shop-name">${esc(shop.name)}</div>
                            <div class="inv-shop-sub">${esc(shop.tagline || 'Fine Jewellery & Ornaments')}</div>
                            <div style="font-size:11px; color:#555; margin-top:4px;">
                                ${esc(shop.address)}<br>
                                Phone: ${esc(shop.phone)} | Email: ${esc(shop.email || '-')}<br>
                                <b>GSTIN: ${esc(shop.gstin || '27AAAAA0000A1Z5')}</b> | PAN: ${esc(shop.pan || 'AAAAA0000A')}
                            </div>
                        </div>
                    </div>
                    <div class="inv-meta-right">
                        <div class="inv-title-badge">TAX INVOICE</div>
                        <div style="font-size:13px; margin-top:8px;">
                            <b>Invoice #: ${inv.id}</b><br>
                            Date: ${fmtDate(inv.date)}<br>
                            Place of Supply: ${shop.stateCode || '27'}
                        </div>
                    </div>
                </div>

                <div class="inv-details-grid">
                    <div class="inv-box">
                        <b style="color:#c9a24b;">Billed To (Customer Details):</b><br>
                        <b>${esc(inv.customerName)}</b><br>
                        Phone: ${esc(inv.customerPhone || '-')}<br>
                        Address: ${esc(inv.customerAddress || '-')}<br>
                        PAN: ${esc(inv.customerPan || '-')}
                    </div>
                    <div class="inv-box">
                        <b style="color:#c9a24b;">Invoice Meta:</b><br>
                        Payment Status: <b>${inv.status}</b><br>
                        Payment Received: <b>${inr(inv.paidNow)}</b><br>
                        Balance Due: <b>${inr(Math.max(0, inv.grandTotal - inv.paidNow))}</b>
                    </div>
                </div>

                <table class="inv-table">
                    <thead>
                        <tr>
                            <th>Item Description</th>
                            <th>HSN</th>
                            <th class="right">Net Wt</th>
                            <th class="right">Qty</th>
                            <th class="right">Making</th>
                            <th class="right">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(inv.items || []).map(it => `
                            <tr>
                                <td><b>${esc(it.name)}</b> (${it.metal} ${it.purity})</td>
                                <td>7113</td>
                                <td class="right">${wt(it.netWeight)}</td>
                                <td class="right">${it.qty}</td>
                                <td class="right">${inr(it.making)}</td>
                                <td class="right">${inr(it.lineTotal)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="inv-totals-wrap">
                    <div class="inv-totals">
                        <div class="inv-total-row"><span>Taxable Value</span><span>${inr(inv.taxable)}</span></div>
                        <div class="inv-total-row"><span>CGST (1.5%)</span><span>${inr(inv.cgst || inv.tax/2)}</span></div>
                        <div class="inv-total-row"><span>SGST (1.5%)</span><span>${inr(inv.sgst || inv.tax/2)}</span></div>
                        ${inv.discount ? `<div class="inv-total-row"><span>Discount</span><span>-${inr(inv.discount)}</span></div>` : ''}
                        <div class="inv-total-row grand"><span>Grand Total</span><span>${inr(inv.grandTotal)}</span></div>
                    </div>
                </div>

                <div class="inv-terms">
                    <b>Terms &amp; Conditions (${esc(shop.name)}):</b><br>
                    ${(shop.terms || 'Goods once sold are subject to store exchange policy. Making charges non-refundable.').replace(/\n/g, '<br>')}
                </div>
            </div>
        `;

        const foot = `
            <button class="btn btn-outline" id="invClose">Close</button>
            <button class="btn btn-gold" id="invPrintBtn">🖨️ Print Invoice</button>
        `;

        openModal(`Invoice ${inv.id} — ${shop.name}`, html, foot, { wide: true });
        document.getElementById('invClose').addEventListener('click', closeModal);
        document.getElementById('invPrintBtn').addEventListener('click', () => window.print());
    },

    /* ================= INVOICE HISTORY ================= */
    renderInvoices() {
        const DB = this.db;
        if (!DB) return;
        const q = (document.getElementById('invSearch').value || '').toLowerCase();
        const from = document.getElementById('invFrom').value;
        const to = document.getElementById('invTo').value;

        const rows = (DB.invoices || []).filter(i =>
            (!q || i.id.toLowerCase().includes(q) || (i.customerName || '').toLowerCase().includes(q)) &&
            (!from || i.date >= from) &&
            (!to || i.date <= to)
        );

        document.getElementById('tblInvoices').innerHTML = rows.length ? rows.slice().reverse().map(i => `
            <tr>
                <td><b>${i.id}</b></td>
                <td>${fmtDate(i.date)}</td>
                <td>${esc(i.customerName)}</td>
                <td class="right num">${inr0(i.taxable)}</td>
                <td class="right num">${inr0(i.tax)}</td>
                <td class="right num">${inr0(i.grandTotal)}</td>
                <td><span class="badge ${i.status === 'Paid' ? 'badge-success' : i.status === 'Partial' ? 'badge-warn' : 'badge-danger'}">${i.status}</span></td>
                <td><button class="btn btn-gold btn-sm" onclick="AppModule.viewInvoice('${i.id}')">View / Print</button></td>
            </tr>
        `).join('') : `<tr class="empty-row"><td colspan="8">No invoices found</td></tr>`;
    },

    viewInvoice(invId) {
        const inv = (this.db.invoices || []).find(i => i.id === invId);
        if (inv) {
            this.showInvoicePrintModal(inv);
        }
    },

    /* ================= INVENTORY ================= */
    renderInventory() {
        const DB = this.db;
        if (!DB) return;
        const q = (document.getElementById('invItemSearch').value || '').toLowerCase();
        const metalF = document.getElementById('invMetalFilter').value;

        const rows = (DB.inventory || []).filter(i =>
            (!q || i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q) || (i.huid || '').toLowerCase().includes(q)) &&
            (!metalF || i.metal === metalF)
        );

        document.getElementById('tblInventory').innerHTML = rows.length ? rows.map(i => `
            <tr>
                <td>${i.code}</td>
                <td>${esc(i.name)}</td>
                <td>${esc(i.category)}</td>
                <td>${i.metal} / ${i.purity}</td>
                <td class="right num">${wt(i.grossWeight)}</td>
                <td class="right num">${wt(i.netWeight)}</td>
                <td>${i.huid || '-'}</td>
                <td><span class="badge ${i.status === 'In Stock' ? 'badge-success' : 'badge-muted'}">${i.status}</span></td>
            </tr>
        `).join('') : `<tr class="empty-row"><td colspan="8">No items found</td></tr>`;
    },

    /* ================= BARCODE LABELS ================= */
    renderBarcode() {
        const DB = this.db;
        if (!DB) return;
        const q = (document.getElementById('bcSearch').value || '').toLowerCase();
        const rows = (DB.inventory || []).filter(i => !q || i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q));

        document.getElementById('tblBarcode').innerHTML = rows.length ? rows.map(i => `
            <tr>
                <td><input type="checkbox" class="checkbox bc-check" data-code="${i.code}"></td>
                <td>${i.code}</td>
                <td>${esc(i.name)}</td>
                <td>${i.metal} / ${i.purity}</td>
                <td class="right num">${wt(i.netWeight)}</td>
                <td>${i.huid || '-'}</td>
            </tr>
        `).join('') : `<tr class="empty-row"><td colspan="6">No inventory items</td></tr>`;
    },

    /* ================= RATE MASTER ================= */
    renderRates() {
        const DB = this.db;
        if (!DB) return;
        document.getElementById('tblRates').innerHTML = (DB.rates || []).map((r, idx) => `
            <tr>
                <td>${r.metal}</td>
                <td>${r.purity}</td>
                <td>${r.fineness}</td>
                <td class="right num">${r.rate ? inr(r.rate) : '<span class="muted">Not set</span>'}</td>
                <td>${r.asOf ? fmtDate(r.asOf) : '-'}</td>
                <td><input class="input" style="max-width:130px;" type="number" placeholder="New rate" id="rateInput-${idx}"></td>
                <td><button class="btn btn-gold btn-sm" onclick="AppModule.saveRate(${idx})">Save</button></td>
            </tr>
        `).join('');
    },

    saveRate(idx) {
        const val = Number(document.getElementById(`rateInput-${idx}`).value || 0);
        if (!val) { toast('Enter valid rate.', 'err'); return; }
        this.db.rates[idx].rate = val;
        this.db.rates[idx].asOf = todayStr();
        this.saveData();
        toast('Rate updated.');
        this.renderRates();
        this.renderDashboard();
    },

    /* ================= CUSTOMERS ================= */
    renderCustomers() {
        const DB = this.db;
        if (!DB) return;
        const q = (document.getElementById('custSearch').value || '').toLowerCase();
        const rows = (DB.customers || []).filter(c => !q || c.name.toLowerCase().includes(q) || (c.phone || '').includes(q));
        document.getElementById('tblCustomers').innerHTML = rows.length ? rows.map(c => `
            <tr>
                <td>${esc(c.name)}</td>
                <td>${c.phone || '-'}</td>
                <td>${c.city || '-'}</td>
                <td class="right num">${inr0(c.balance)}</td>
            </tr>
        `).join('') : `<tr class="empty-row"><td colspan="4">No customers added</td></tr>`;
    },

    /* ================= SUPPLIERS ================= */
    renderSuppliers() {
        const DB = this.db;
        if (!DB) return;
        const q = (document.getElementById('suppSearch').value || '').toLowerCase();
        const rows = (DB.suppliers || []).filter(s => !q || s.name.toLowerCase().includes(q) || (s.phone || '').includes(q));
        document.getElementById('tblSuppliers').innerHTML = rows.length ? rows.map(s => `
            <tr>
                <td>${esc(s.name)}</td>
                <td>${s.phone || '-'}</td>
                <td>${s.gstin || '-'}</td>
                <td class="right num">${inr0(s.balance)}</td>
                <td><button class="btn btn-ghost btn-sm">View</button></td>
            </tr>
        `).join('') : `<tr class="empty-row"><td colspan="5">No suppliers added</td></tr>`;
    },

    /* ================= PURCHASES ================= */
    renderPurchases() {
        const DB = this.db;
        if (!DB) return;
        document.getElementById('tblPurchases').innerHTML = (DB.purchases || []).length ? DB.purchases.map(p => `
            <tr>
                <td>${fmtDate(p.date)}</td>
                <td>${p.id}</td>
                <td>${esc(p.supplierName)}</td>
                <td>${p.invoiceNo || '-'}</td>
                <td class="right num">${inr0(p.total)}</td>
                <td><span class="badge ${p.status === 'Paid' ? 'badge-success' : 'badge-warn'}">${p.status}</span></td>
            </tr>
        `).join('') : `<tr class="empty-row"><td colspan="6">No purchase bills</td></tr>`;
    },

    /* ================= ARTISANS ================= */
    renderArtisans() {
        const DB = this.db;
        if (!DB) return;
        document.getElementById('tblArtisans').innerHTML = (DB.artisans || []).length ? DB.artisans.map(a => `
            <tr>
                <td>${esc(a.name)}</td>
                <td>${a.phone || '-'}</td>
                <td>${a.specialty || '-'}</td>
                <td class="right num">${inr0(a.balance)}</td>
            </tr>
        `).join('') : `<tr class="empty-row"><td colspan="4">No artisans added</td></tr>`;

        document.getElementById('tblJobs').innerHTML = (DB.jobs || []).length ? DB.jobs.map(j => `
            <tr>
                <td>${j.id}</td>
                <td>${esc(j.artisanName)}</td>
                <td>${fmtDate(j.issueDate)}</td>
                <td>${j.metalIssued}g ${j.metal}</td>
                <td><span class="badge badge-warn">${j.status}</span></td>
            </tr>
        `).join('') : `<tr class="empty-row"><td colspan="5">No job work orders</td></tr>`;
    },

    /* ================= OLD GOLD EXCHANGE ================= */
    renderExchange() {
        const DB = this.db;
        if (!DB) return;
        document.getElementById('tblExchange').innerHTML = (DB.exchanges || []).length ? DB.exchanges.map(x => `
            <tr>
                <td>${x.id}</td>
                <td>${fmtDate(x.date)}</td>
                <td>${esc(x.customerName)}</td>
                <td>${x.metal}</td>
                <td class="right num">${wt(x.netWeight)}</td>
                <td class="right num">${wt(x.fineWeight)}</td>
                <td class="right num">${inr0(x.value)}</td>
                <td><span class="badge badge-warn">${x.status}</span></td>
            </tr>
        `).join('') : `<tr class="empty-row"><td colspan="8">No old gold exchanges recorded</td></tr>`;
    },

    /* ================= REPAIRS ================= */
    renderRepairs() {
        const DB = this.db;
        if (!DB) return;
        document.getElementById('tblRepairs').innerHTML = (DB.repairs || []).length ? DB.repairs.map(r => `
            <tr>
                <td>${r.token}</td>
                <td>${fmtDate(r.receivedDate)}</td>
                <td>${esc(r.customerName)}</td>
                <td>${esc(r.itemDesc)}</td>
                <td>${esc(r.issue)}</td>
                <td class="right num">${inr0(r.advance)}</td>
                <td class="right num">${inr0(r.balance)}</td>
                <td><span class="badge badge-warn">${r.status}</span></td>
            </tr>
        `).join('') : `<tr class="empty-row"><td colspan="8">No repair jobs recorded</td></tr>`;
    },

    /* ================= REPORTS ================= */
    currentReportTab: 'sales',
    switchReportTab(tab) {
        this.currentReportTab = tab;
        document.querySelectorAll('#reportTabs .tab').forEach(t => t.classList.toggle('active', t.dataset.rtab === tab));
        this.renderReportBody();
    },

    renderReportBody() {
        const DB = this.db;
        if (!DB) return;
        const box = document.getElementById('reportBody');
        const shop = this.shop;
        const from = document.getElementById('repFrom').value;
        const to = document.getElementById('repTo').value;

        const dateFilter = item => (!from || item.date >= from) && (!to || item.date <= to);
        const rows = (DB.invoices || []).filter(dateFilter);

        if (this.currentReportTab === 'sales') {
            box.innerHTML = `
                <div class="card mb16">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-soft); padding-bottom:12px; margin-bottom:16px;">
                        <div>
                            <h3 style="color:var(--gold-bright);">${esc(shop.name)} — Sales Register</h3>
                            <div class="small muted">Period: ${fmtDate(from)} to ${fmtDate(to)}</div>
                        </div>
                        <img src="${shop.logoUrl || DEFAULT_APP_LOGO}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;" onerror="this.src='${DEFAULT_APP_LOGO}'">
                    </div>
                    <div class="grid grid-4 mb16">
                        <div class="kpi"><div class="kpi-label">Invoices</div><div class="kpi-value num">${rows.length}</div></div>
                        <div class="kpi"><div class="kpi-label">Taxable Sales</div><div class="kpi-value num">${inr0(rows.reduce((s, r) => s + (r.taxable||0), 0))}</div></div>
                        <div class="kpi"><div class="kpi-label">GST Tax Collected</div><div class="kpi-value num">${inr0(rows.reduce((s, r) => s + (r.tax||0), 0))}</div></div>
                        <div class="kpi"><div class="kpi-label">Grand Total Billed</div><div class="kpi-value num">${inr0(rows.reduce((s, r) => s + (r.grandTotal||0), 0))}</div></div>
                    </div>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr><th>Invoice</th><th>Date</th><th>Customer</th><th class="right">Taxable</th><th class="right">CGST</th><th class="right">SGST</th><th class="right">Total</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                ${rows.length ? rows.map(r => `
                                    <tr>
                                        <td>${r.id}</td><td>${fmtDate(r.date)}</td><td>${esc(r.customerName)}</td>
                                        <td class="right num">${inr0(r.taxable)}</td><td class="right num">${inr0(r.cgst || r.tax/2)}</td><td class="right num">${inr0(r.sgst || r.tax/2)}</td>
                                        <td class="right num">${inr0(r.grandTotal)}</td><td>${r.status}</td>
                                    </tr>
                                `).join('') : `<tr class="empty-row"><td colspan="8">No sales recorded for this period</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (this.currentReportTab === 'gst') {
            box.innerHTML = `
                <div class="card">
                    <h3>${esc(shop.name)} — GST Tax Summary</h3>
                    <div class="panel-sub">HSN-wise breakdown for GST returns</div>
                    <div class="table-wrap mt16">
                        <table>
                            <thead><tr><th>HSN Code</th><th>Description</th><th class="right">Taxable Value</th><th class="right">CGST (1.5%)</th><th class="right">SGST (1.5%)</th><th class="right">Total GST</th></tr></thead>
                            <tbody>
                                <tr><td>7113</td><td>Gold &amp; Fine Jewellery Articles</td><td class="right num">${inr0(rows.reduce((s, r) => s + r.taxable, 0))}</td><td class="right num">${inr0(rows.reduce((s, r) => s + (r.cgst || r.tax/2), 0))}</td><td class="right num">${inr0(rows.reduce((s, r) => s + (r.sgst || r.tax/2), 0))}</td><td class="right num">${inr0(rows.reduce((s, r) => s + r.tax, 0))}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (this.currentReportTab === 'stock') {
            const stock = (DB.inventory || []).filter(i => i.status === 'In Stock');
            box.innerHTML = `
                <div class="card">
                    <h3>${esc(shop.name)} — Stock Valuation Report</h3>
                    <div class="panel-sub">Valuation calculated using current Rate Master</div>
                    <div class="table-wrap mt16">
                        <table>
                            <thead><tr><th>Metal</th><th class="right">Items Count</th><th class="right">Net Weight</th></tr></thead>
                            <tbody>
                                <tr><td>Gold</td><td class="right">${stock.filter(i=>i.metal==='Gold').length}</td><td class="right num">${stock.filter(i=>i.metal==='Gold').reduce((s,i)=>s+i.netWeight,0).toFixed(3)} g</td></tr>
                                <tr><td>Silver</td><td class="right">${stock.filter(i=>i.metal==='Silver').length}</td><td class="right num">${stock.filter(i=>i.metal==='Silver').reduce((s,i)=>s+i.netWeight,0).toFixed(3)} g</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (this.currentReportTab === 'dues') {
            const custDues = (DB.customers || []).filter(c => c.balance > 0);
            box.innerHTML = `
                <div class="card">
                    <h3>${esc(shop.name)} — Outstanding Customer Dues</h3>
                    <div class="table-wrap mt16">
                        <table>
                            <thead><tr><th>Customer Name</th><th>Phone</th><th class="right">Outstanding Balance</th></tr></thead>
                            <tbody>
                                ${custDues.length ? custDues.map(c => `<tr><td>${esc(c.name)}</td><td>${c.phone || '-'}</td><td class="right num">${inr0(c.balance)}</td></tr>`).join('') : `<tr class="empty-row"><td colspan="3">No pending dues</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (this.currentReportTab === 'trend') {
            box.innerHTML = `
                <div class="card">
                    <h3>${esc(shop.name)} — Sales Performance</h3>
                    <div class="panel-sub">Total revenue billed: <b>${inr0(rows.reduce((s,r)=>s+r.grandTotal,0))}</b></div>
                </div>
            `;
        }
    },

    /* ================= SETTINGS ================= */
    currentSettingsTab: 'profile',
    renderSettingsBody() {
        const box = document.getElementById('settingsBody');
        const shop = this.shop;

        if (this.currentSettingsTab === 'profile') {
            box.innerHTML = `
                <div class="card">
                    <div class="panel-title">Active Shop Profile (${esc(shop.name)})</div>
                    <div class="panel-sub">Updates will instantly apply to invoices, header badges, bills, and reports.</div>
                    
                    <div class="field mt16">
                        <label>Shop Logo</label>
                        <div class="flex gap12" style="align-items:center;">
                            <img src="${shop.logoUrl || DEFAULT_APP_LOGO}" id="spLogoPreview" style="width:54px; height:54px; border-radius:50%; border:2px solid var(--gold); object-fit:cover;" onerror="this.src='${DEFAULT_APP_LOGO}'">
                            <input class="input" type="file" id="spLogoFile" accept="image/*" style="max-width:300px;">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="field"><label>Shop Name <span class="req">*</span></label><input class="input" id="spName" value="${esc(shop.name)}"></div>
                        <div class="field"><label>Tagline / Branch</label><input class="input" id="spTagline" value="${esc(shop.tagline || '')}"></div>
                    </div>
                    <div class="form-row">
                        <div class="field"><label>GSTIN</label><input class="input" id="spGstin" value="${esc(shop.gstin || '')}"></div>
                        <div class="field"><label>PAN</label><input class="input" id="spPan" value="${esc(shop.pan || '')}"></div>
                    </div>
                    <div class="field"><label>Address</label><textarea class="input" id="spAddress">${esc(shop.address || '')}</textarea></div>
                    <div class="form-row-3">
                        <div class="field"><label>Phone</label><input class="input" id="spPhone" value="${esc(shop.phone || '')}"></div>
                        <div class="field"><label>Email</label><input class="input" id="spEmail" value="${esc(shop.email || '')}"></div>
                        <div class="field"><label>State Code</label><input class="input" id="spStateCode" value="${esc(shop.stateCode || '27')}"></div>
                    </div>
                    <div class="field"><label>Invoice Terms &amp; Conditions</label><textarea class="input" id="spTerms">${esc(shop.terms || '')}</textarea></div>
                    <button class="btn btn-gold" id="spSaveBtn">Save Shop Profile</button>
                </div>
            `;

            let updatedLogoUrl = shop.logoUrl || DEFAULT_APP_LOGO;
            document.getElementById('spLogoFile').addEventListener('change', e => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        updatedLogoUrl = reader.result;
                        document.getElementById('spLogoPreview').src = updatedLogoUrl;
                    };
                    reader.readAsDataURL(file);
                }
            });

            document.getElementById('spSaveBtn').addEventListener('click', () => {
                shop.name = document.getElementById('spName').value.trim();
                shop.tagline = document.getElementById('spTagline').value.trim();
                shop.gstin = document.getElementById('spGstin').value.trim();
                shop.pan = document.getElementById('spPan').value.trim();
                shop.address = document.getElementById('spAddress').value.trim();
                shop.phone = document.getElementById('spPhone').value.trim();
                shop.email = document.getElementById('spEmail').value.trim();
                shop.stateCode = document.getElementById('spStateCode').value.trim();
                shop.terms = document.getElementById('spTerms').value.trim();
                shop.logoUrl = updatedLogoUrl;

                const tenants = DataEngine.getTenants();
                const idx = tenants.findIndex(t => t.id === shop.id);
                if (idx !== -1) {
                    tenants[idx] = shop;
                    DataEngine.saveTenants(tenants);
                }

                Auth.applyShopBrandingEverywhere();
                toast('Shop profile updated successfully!');
            });

        } else if (this.currentSettingsTab === 'hsn') {
            box.innerHTML = `<div class="card"><h3>HSN &amp; GST Rates</h3><p class="muted">Standard GST 3% (CGST 1.5% + SGST 1.5%) applied across gold &amp; jewellery.</p></div>`;
        } else if (this.currentSettingsTab === 'users') {
            box.innerHTML = `<div class="card"><h3>Staff &amp; Users</h3><p class="muted">Owner: <b>${Auth.currentUser ? Auth.currentUser.fullName : 'Admin'}</b></p></div>`;
        } else if (this.currentSettingsTab === 'backup') {
            box.innerHTML = `
                <div class="card">
                    <h3>Backup &amp; Export</h3>
                    <p class="muted mb16">Export full database for active shop: <b>${esc(shop.name)}</b></p>
                    <button class="btn btn-gold" id="exportBtn">Download Shop Backup JSON</button>
                </div>
            `;
            document.getElementById('exportBtn').addEventListener('click', () => {
                const blob = new Blob([JSON.stringify(this.db, null, 2)], { type: 'application/json' });
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                a.download = `smart-jewellers-${shop.name.toLowerCase().replace(/\s+/g, '-')}-${todayStr()}.json`;
                document.body.appendChild(a); a.click(); a.remove();
                toast('Backup downloaded.');
            });
        }
    }
};
