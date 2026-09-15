/* ============================================================
   SMART JEWELLERS — AUTH & SHOP ONBOARDING WIZARD (auth.js)
   ============================================================ */

const Auth = {
    currentUser: null,
    activeTenant: null,
    db: null, // Current active tenant's database

    init() {
        this.bindEvents();
        this.checkAuth();
    },

    bindEvents() {
        document.getElementById('tabLoginBtn').addEventListener('click', () => this.switchAuthTab('login'));
        document.getElementById('tabSignupBtn').addEventListener('click', () => this.switchAuthTab('signup'));
        document.getElementById('demoLoginBtn').addEventListener('click', () => this.loginDemoUser());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Tenant Switchers
        document.getElementById('tbTenantBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('tenantDropdown');
            dropdown.classList.toggle('show');
        });

        document.getElementById('sbSwitchBtn').addEventListener('click', () => {
            const dropdown = document.getElementById('tenantDropdown');
            dropdown.classList.toggle('show');
        });

        document.getElementById('tbRegisterNewShopBtn').addEventListener('click', () => {
            document.getElementById('tenantDropdown').classList.remove('show');
            this.openShopRegistrationModal();
        });

        document.addEventListener('click', () => {
            const dropdown = document.getElementById('tenantDropdown');
            if (dropdown) dropdown.classList.remove('show');
        });
    },

    switchAuthTab(tab) {
        document.getElementById('tabLoginBtn').classList.toggle('active', tab === 'login');
        document.getElementById('tabSignupBtn').classList.toggle('active', tab === 'signup');
        document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
        document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
    },

    checkAuth() {
        const session = DataEngine.getSession();
        if (session && session.isLoggedIn && session.userId) {
            const users = DataEngine.getUsers();
            const user = users.find(u => u.id === session.userId);
            if (user) {
                this.currentUser = user;
                let tenantId = session.activeTenantId;
                const tenants = DataEngine.getTenants();
                let tenant = tenants.find(t => t.id === tenantId);
                if (!tenant && user.tenantIds && user.tenantIds.length) {
                    tenant = tenants.find(t => t.id === user.tenantIds[0]);
                }
                if (!tenant && tenants.length) {
                    tenant = tenants[0];
                }

                if (tenant) {
                    this.setActiveTenant(tenant);
                    this.hideAuthPortal();
                    return;
                } else {
                    // Logged in but no shop tenant registered -> Prompt Shop Setup
                    this.hideAuthPortal();
                    this.openShopRegistrationModal();
                    return;
                }
            }
        }
        this.showAuthPortal();
    },

    showAuthPortal() {
        document.getElementById('authPortal').style.display = 'flex';
        document.getElementById('appContainer').style.filter = 'blur(4px)';
    },

    hideAuthPortal() {
        document.getElementById('authPortal').style.display = 'none';
        document.getElementById('appContainer').style.filter = 'none';
    },

    login(email, password) {
        const users = DataEngine.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (!user) {
            toast('Invalid email or password.', 'err');
            return false;
        }

        this.currentUser = user;
        const tenants = DataEngine.getTenants();
        const userTenants = tenants.filter(t => (user.tenantIds || []).includes(t.id));
        const activeTenant = userTenants.length ? userTenants[0] : tenants[0];

        DataEngine.saveSession({
            isLoggedIn: true,
            userId: user.id,
            activeTenantId: activeTenant ? activeTenant.id : null
        });

        if (activeTenant) {
            this.setActiveTenant(activeTenant);
            this.hideAuthPortal();
            toast(`Welcome back, ${user.fullName}! Logged into ${activeTenant.name}.`);
        } else {
            this.hideAuthPortal();
            this.openShopRegistrationModal();
        }
        return true;
    },

    loginDemoUser() {
        this.login('owner@smartjewellers.com', 'password123');
    },

    signup(name, email, password) {
        const users = DataEngine.getUsers();
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            toast('User with this email already exists.', 'err');
            return false;
        }

        const newUser = {
            id: 'user-' + Date.now(),
            email,
            password,
            fullName: name,
            role: 'Owner',
            tenantIds: []
        };
        users.push(newUser);
        DataEngine.saveUsers(users);

        this.currentUser = newUser;
        DataEngine.saveSession({
            isLoggedIn: true,
            userId: newUser.id,
            activeTenantId: null
        });

        this.hideAuthPortal();
        toast(`Account created for ${name}! Now register your Shop basic details.`);
        this.openShopRegistrationModal();
        return true;
    },

    logout() {
        DataEngine.saveSession({ isLoggedIn: false, userId: null, activeTenantId: null });
        this.currentUser = null;
        this.activeTenant = null;
        this.db = null;
        this.showAuthPortal();
        toast('Logged out successfully.');
    },

    setActiveTenant(tenant) {
        this.activeTenant = tenant;
        this.db = DataEngine.getTenantData(tenant.id);

        DataEngine.saveSession({
            isLoggedIn: true,
            userId: this.currentUser ? this.currentUser.id : 'user-1',
            activeTenantId: tenant.id
        });

        this.applyShopBrandingEverywhere();
        this.renderTenantDropdownList();
        
        if (window.AppModule) {
            AppModule.onTenantChanged();
        }
    },

    switchTenant(tenantId) {
        const tenant = DataEngine.getTenantById(tenantId);
        if (tenant) {
            this.setActiveTenant(tenant);
            toast(`Switched to ${tenant.name}`);
        }
    },

    applyShopBrandingEverywhere() {
        if (!this.activeTenant) return;

        const shopName = this.activeTenant.name;
        const shopTagline = this.activeTenant.tagline || 'Jewellery ERP';
        const shopLogo = this.activeTenant.logoUrl || DEFAULT_APP_LOGO;

        // Document Title
        document.title = `${shopName} — Smart Jewellers ERP`;

        // Sidebar elements
        const sbLogo = document.getElementById('sbShopLogo');
        if (sbLogo) { sbLogo.src = shopLogo; sbLogo.onerror = () => sbLogo.src = DEFAULT_APP_LOGO; }
        const sbName = document.getElementById('sbShopName');
        if (sbName) sbName.textContent = shopName;
        const sbTag = document.getElementById('sbShopTagline');
        if (sbTag) sbTag.textContent = shopTagline;

        // Topbar elements
        const tbLogo = document.getElementById('tbShopLogo');
        if (tbLogo) { tbLogo.src = shopLogo; tbLogo.onerror = () => tbLogo.src = DEFAULT_APP_LOGO; }
        const tbName = document.getElementById('tbShopName');
        if (tbName) tbName.textContent = shopName;

        const userBadge = document.getElementById('topUserBadge');
        if (userBadge) {
            userBadge.innerHTML = `<b>${this.currentUser ? this.currentUser.fullName : 'Administrator'}</b><br><span>${shopName}</span>`;
        }

        // Module headings
        const dashTitle = document.getElementById('dashShopTitle');
        if (dashTitle) dashTitle.textContent = `${shopName} Dashboard`;
        const posTitle = document.getElementById('posShopTitle');
        if (posTitle) posTitle.textContent = shopName;
        const invTitle = document.getElementById('invShopTitle');
        if (invTitle) invTitle.textContent = shopName;
        const repTitle = document.getElementById('repShopTitle');
        if (repTitle) repTitle.textContent = shopName;
    },

    renderTenantDropdownList() {
        const dropdownList = document.getElementById('tenantDropdownList');
        if (!dropdownList) return;

        const tenants = DataEngine.getTenants();
        const userTenantIds = (this.currentUser && this.currentUser.tenantIds) ? this.currentUser.tenantIds : tenants.map(t => t.id);
        const myTenants = tenants.filter(t => userTenantIds.includes(t.id));

        dropdownList.innerHTML = myTenants.map(t => `
            <div class="tenant-item ${this.activeTenant && this.activeTenant.id === t.id ? 'active' : ''}" onclick="Auth.switchTenant('${t.id}')">
                <img src="${t.logoUrl || DEFAULT_APP_LOGO}" class="tenant-selector-logo" onerror="this.src='${DEFAULT_APP_LOGO}'">
                <div>
                    <div style="font-weight:700; font-size:13px;">${esc(t.name)}</div>
                    <div style="font-size:11px; color:var(--text-muted);">${esc(t.city || 'Jeweller')}</div>
                </div>
            </div>
        `).join('');
    },

    openShopRegistrationModal() {
        const body = `
            <div class="hint-box">
                <b>Welcome to Smart Jewellers!</b> Register your Jewellery Shop basic details. This logo &amp; shop name will be applied across invoices, reports, POS bills, and vouchers.
            </div>
            <div class="form-row">
                <div class="field">
                    <label>Shop Name <span class="req">*</span></label>
                    <input class="input" id="srName" placeholder="e.g. Royal Gold &amp; Diamonds" required>
                </div>
                <div class="field">
                    <label>Tagline / Branch</label>
                    <input class="input" id="srTagline" placeholder="e.g. Fine Gold &amp; Polki Jewelry">
                </div>
            </div>
            <div class="form-row">
                <div class="field">
                    <label>Phone Number <span class="req">*</span></label>
                    <input class="input" id="srPhone" placeholder="+91 98765 43210" required>
                </div>
                <div class="field">
                    <label>Email Address</label>
                    <input class="input" id="srEmail" placeholder="shop@example.com">
                </div>
            </div>
            <div class="form-row">
                <div class="field">
                    <label>GSTIN Number</label>
                    <input class="input" id="srGstin" placeholder="27XXXXX1234X1ZX">
                </div>
                <div class="field">
                    <label>PAN Number</label>
                    <input class="input" id="srPan" placeholder="ABCDE1234F">
                </div>
            </div>
            <div class="field">
                <label>Full Shop Address <span class="req">*</span></label>
                <textarea class="input" id="srAddress" placeholder="Street Address, Market Area, City" required></textarea>
            </div>
            <div class="form-row-3">
                <div class="field">
                    <label>City</label>
                    <input class="input" id="srCity" placeholder="Mumbai">
                </div>
                <div class="field">
                    <label>State Code</label>
                    <input class="input" id="srStateCode" value="27">
                </div>
                <div class="field">
                    <label>Currency Symbol</label>
                    <input class="input" id="srCurrency" value="₹">
                </div>
            </div>
            <div class="field">
                <label>Shop Logo</label>
                <div class="flex gap12" style="align-items:center;">
                    <img src="${DEFAULT_APP_LOGO}" id="srLogoPreview" style="width:48px; height:48px; border-radius:50%; border:1.5px solid var(--gold); object-fit:cover;">
                    <input class="input" type="file" id="srLogoFile" accept="image/*" style="font-size:12px;">
                </div>
                <span class="small muted">Upload custom shop logo or use default Smart Jewellers gold emblem.</span>
            </div>
        `;

        const foot = `
            <button class="btn btn-gold" id="srSaveBtn">Register &amp; Launch Shop</button>
        `;

        openModal('SHOP Registration & Setup', body, foot, { wide: true });

        let logoDataUrl = DEFAULT_APP_LOGO;
        document.getElementById('srLogoFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    logoDataUrl = reader.result;
                    document.getElementById('srLogoPreview').src = logoDataUrl;
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('srSaveBtn').addEventListener('click', () => {
            const name = document.getElementById('srName').value.trim();
            const phone = document.getElementById('srPhone').value.trim();
            const address = document.getElementById('srAddress').value.trim();

            if (!name || !phone || !address) {
                toast('Shop Name, Phone Number, and Address are required.', 'err');
                return;
            }

            const shopDetails = {
                name,
                tagline: document.getElementById('srTagline').value.trim(),
                phone,
                email: document.getElementById('srEmail').value.trim(),
                gstin: document.getElementById('srGstin').value.trim(),
                pan: document.getElementById('srPan').value.trim(),
                address,
                city: document.getElementById('srCity').value.trim(),
                stateCode: document.getElementById('srStateCode').value.trim(),
                currency: document.getElementById('srCurrency').value.trim() || '₹',
                logoUrl: logoDataUrl
            };

            const ownerId = this.currentUser ? this.currentUser.id : 'user-1';
            const newTenant = DataEngine.createShopTenant(ownerId, shopDetails);

            closeModal();
            this.setActiveTenant(newTenant);
            toast(`Shop "${newTenant.name}" registered successfully!`);
        });
    }
};

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    Auth.login(email, pass);
}

function handleSignup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const pass = document.getElementById('signupPassword').value;
    Auth.signup(name, email, pass);
}
