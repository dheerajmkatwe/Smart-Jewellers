/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';

type Bindings = {
  DB: any;
  BUCKET: any;
  JWT_SECRET: string;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: any }>().basePath('/api');

// Global Error Handling
app.onError((err, c) => {
  console.error(`[Error] ${c.req.method} ${c.req.url}`, err);
  const isProduction = c.env.ENVIRONMENT === 'production';
  return c.json(
    { 
      error: 'Internal Server Error',
      message: isProduction ? 'An unexpected error occurred.' : err.message
    }, 
    500
  );
});

app.notFound((c) => {
  return c.json({ error: 'Not Found', message: `API endpoint ${c.req.path} does not exist.` }, 404);
});

// SHA-256 Hash Helper for Passwords
async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const pwdBuffer = enc.encode(password);
  // In a real production app, use PBKDF2 or scrypt with a unique salt per user. 
  // For standard secure hashing in native Cloudflare workers without dependencies:
  const hashBuffer = await crypto.subtle.digest('SHA-256', pwdBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

app.post('/auth/register', async (c) => {
  const formData = await c.req.formData();
  const db = c.env.DB;

  // Step 3 (Account) Details
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  // Step 2 (Owner) Details
  const ownerName = formData.get('ownerName') as string;
  const ownerPhone = formData.get('ownerPhone') as string;

  // Step 1 (Shop) Details
  const shopName = formData.get('shopName') as string;
  const tagline = formData.get('tagline') as string;
  const address = formData.get('address') as string;
  const city = formData.get('city') as string;
  const shopEmail = formData.get('shopEmail') as string;
  const stateCode = formData.get('stateCode') as string;
  const pincode = formData.get('pincode') as string;
  const gstin = formData.get('gstin') as string;
  const pan = formData.get('pan') as string;
  const bisNumber = formData.get('bisNumber') as string;
  const metalsHandled = formData.get('metalsHandled') as string;
  const makingPolicy = formData.get('makingPolicy') as string;
  const terms = formData.get('terms') as string;
  const currency = formData.get('currency') as string;

  // Validate Required
  if (!username || !email || !password || !shopName || !ownerName) {
    return c.json({ error: 'Missing required configuration details.' }, 400);
  }

  try {
    // 0. DUPLICATE BUSINESS PROTECTION
    // Ensure we don't accidentally duplicate a shop. Check strong IDs only (GSTIN, email, phone)
    const duplicateCheckStr = [];
    const bindParams = [];
    if (gstin) { duplicateCheckStr.push('gstin = ?'); bindParams.push(gstin); }
    if (shopEmail) { duplicateCheckStr.push('email = ?'); bindParams.push(shopEmail); }
    if (ownerPhone) { duplicateCheckStr.push('phone = ?'); bindParams.push(ownerPhone); }

    if (duplicateCheckStr.length > 0) {
      const dupQuery = `SELECT id FROM tenants WHERE ${duplicateCheckStr.join(' OR ')}`;
      const existingShop = await db.prepare(dupQuery).bind(...bindParams).first();
      if (existingShop) {
        return c.json({ error: 'This business may already have a Smart Jewellers account. Please log in or recover your existing account.' }, 409);
      }
    }

    // 1. Prepare User Insert Payload
    const userId = crypto.randomUUID();
    const pHash = await hashPassword(password);
    const userQ = db.prepare(
      `INSERT INTO users (id, username, email, password_hash, full_name, phone, role, email_verified) VALUES (?, ?, ?, ?, ?, ?, 'owner', true)`
    ).bind(userId, username, email, pHash, ownerName, ownerPhone);

    // 2. Upload Configs (Outside DB Tx)
    let logoUrl = null;
    const logoFile = formData.get('logoFile');
    if (logoFile && logoFile instanceof File) {
      if (logoFile.size > 5 * 1024 * 1024) {
        return c.json({ error: 'File Security Block: Logo exceeds the 5MB size limit.' }, 400);
      }
      
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimes.includes(logoFile.type)) {
        return c.json({ error: 'File Security Block: Disallowed file type. Only JPG, PNG, or WEBP allowed.' }, 400);
      }

      const ext = logoFile.name.split('.').pop()?.substring(0, 5).replace(/[^a-z0-9]/gi, ''); // Sanitize extension
      const objectKey = `logos/${userId}-${crypto.randomUUID()}.${ext || 'jpg'}`; // Unique UUID removes predictability
      
      await c.env.BUCKET.put(objectKey, logoFile.stream(), {
        httpMetadata: { contentType: logoFile.type }
      });
      logoUrl = `/api/storage/${objectKey}`; 
    }

    // 3. Prepare Tenant Insert Payload
    const tenantId = crypto.randomUUID();
    const tenantQ = db.prepare(
      `INSERT INTO tenants (
        id, name, tagline, logo_url, phone, email, address, city, state_code, pincode, 
        gstin, pan, bis_number, metals_handled, making_policy, terms, currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      tenantId, shopName, tagline, logoUrl, ownerPhone, shopEmail || email, address, city, stateCode, pincode,
      gstin, pan, bisNumber, metalsHandled, makingPolicy, terms, currency
    );

    // 4. Prepare Membership Mapping Payload
    const memberQ = db.prepare(
      `INSERT INTO tenant_members (tenant_id, user_id, role) VALUES (?, ?, 'owner')`
    ).bind(tenantId, userId);

    // 5. Prepare Subscription Trial Payload
    const subId = crypto.randomUUID();
    const trialStartedAt = new Date();
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);
    const subQ = db.prepare(
      `INSERT INTO subscriptions (id, tenant_id, plan_id, status, trial_started_at, trial_ends_at)
       VALUES (?, ?, 'free_trial', 'trialing', ?, ?)`
    ).bind(subId, tenantId, trialStartedAt.toISOString(), trialEndsAt.toISOString());

    // Execute ATOMIC TRANSACTION globally guaranteeing zero partial failure corruption
    await db.batch([userQ, tenantQ, memberQ, subQ]);

    return c.json({ success: true, message: 'Registration & 30-Day Free Trial creation successful.', userId, tenantId }, 201);
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Email or username already exists.' }, 409);
    }
    return c.json({ error: error.message }, 500);
  }
});

app.post('/auth/login', async (c) => {
  const { identifier, password } = await c.req.json();
  const db = c.env.DB;
  
  const pHash = await hashPassword(password);
  
  // Authenticate across username OR email
  const user: any = await db.prepare(
    `SELECT * FROM users WHERE (email = ? OR username = ?) AND password_hash = ?`
  ).bind(identifier, identifier, pHash).first();

  if (!user) {
    return c.json({ error: 'Invalid authentication credentials' }, 401);
  }

  // Create session
  const sessionId = crypto.randomUUID();
  // Set 7 days expiration
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.prepare(
    `INSERT INTO user_sessions (id, user_id, expires_at) VALUES (?, ?, ?)`
  ).bind(sessionId, user.id, expiresAt.toISOString()).run();

  // Audit Logging (Login Activity)
  const auditId = crypto.randomUUID();
  const userAgent = c.req.header('user-agent') || 'Unknown Device';
  await db.prepare(
    `INSERT INTO audit_logs (id, user_id, action, metadata) VALUES (?, ?, 'login', ?)`
  ).bind(auditId, user.id, JSON.stringify({ ip: c.req.header('cf-connecting-ip') || 'local', agent: userAgent })).run();

  // Set Secure HTTP-Only Cookie natively
  c.header(
    'Set-Cookie', 
    `sj_session_token=${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
  );

  return c.json({ 
    success: true, 
    user: { id: user.id, username: user.username, full_name: user.full_name, email: user.email }
  });
});

app.get('/auth/me', async (c) => {
  // Read token from secure HTTP-Only cookie, fallback to Authorization for generic API testing
  let sessionId = null;
  const cookieHeader = c.req.header('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(cookieHeader.split('; ').map(v => v.split(/=(.*)/s).map(decodeURIComponent)));
    sessionId = cookies['sj_session_token'];
  }
  
  if (!sessionId) {
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionId = authHeader.split(' ')[1];
    }
  }

  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const db = c.env.DB;
  
  // Validate session against DB
  const sessionUser: any = await db.prepare(
    `SELECT u.id, u.username, u.full_name, u.email, u.role as global_role 
     FROM user_sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP`
  ).bind(sessionId).first();

  if (!sessionUser) {
    return c.json({ error: 'Session invalid or expired' }, 401);
  }

  // Fetch mapping to Active Tenant (Shops) alongside their Subscription State
  const query = await db.prepare(
    `SELECT t.*, m.role, s.plan_id, s.status as subscription_status, s.trial_ends_at
     FROM tenant_members m
     JOIN tenants t ON m.tenant_id = t.id
     LEFT JOIN subscriptions s ON t.id = s.tenant_id
     WHERE m.user_id = ?`
  ).bind(sessionUser.id).all();

  return c.json({ 
    user: sessionUser,
    shops: query.results || [] 
  });
});

app.post('/auth/logout', async (c) => {
  let sessionId = null;
  const cookieHeader = c.req.header('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(cookieHeader.split('; ').map(v => v.split(/=(.*)/s).map(decodeURIComponent)));
    sessionId = cookies['sj_session_token'];
  }
  
  if (sessionId) {
    // Session Revocation from Database
    await c.env.DB.prepare(`DELETE FROM user_sessions WHERE id = ?`).bind(sessionId).run();
  }

  // Clear HTTP-Only Cookie
  c.header('Set-Cookie', 'sj_session_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');
  
  return c.json({ success: true });
});

app.post('/auth/logout-all', async (c) => {
  // Extract session ID 
  let sessionId = null;
  const cookieHeader = c.req.header('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(cookieHeader.split('; ').map(v => v.split(/=(.*)/s).map(decodeURIComponent)));
    sessionId = cookies['sj_session_token'];
  }

  if (sessionId) {
    // Fetch associated user and delete ALL of their active sessions globally
    const sessionUser: any = await c.env.DB.prepare(`SELECT user_id FROM user_sessions WHERE id = ?`).bind(sessionId).first();
    if (sessionUser) {
      await c.env.DB.prepare(`DELETE FROM user_sessions WHERE user_id = ?`).bind(sessionUser.user_id).run();
      await c.env.DB.prepare(`INSERT INTO audit_logs (id, user_id, action, metadata) VALUES (?, ?, 'logout_all_devices', ?)`).bind(crypto.randomUUID(), sessionUser.user_id, JSON.stringify({ ip: c.req.header('cf-connecting-ip') })).run();
    }
  }

  c.header('Set-Cookie', 'sj_session_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');
  return c.json({ success: true });
});

app.post('/auth/forgot-password', async (c) => {
  const { identifier } = await c.req.json();
  const db = c.env.DB;
  
  const user: any = await db.prepare(`SELECT id, email FROM users WHERE email = ? OR username = ?`).bind(identifier, identifier).first();
  if (user) {
    const resetToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Exact 1 hour expiry boundary for Reset Links
    
    await db.prepare(`INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)`).bind(resetToken, user.id, expiresAt.toISOString()).run();
    await db.prepare(`INSERT INTO audit_logs (id, user_id, action, metadata) VALUES (?, ?, 'password_reset_requested', ?)`).bind(crypto.randomUUID(), user.id, JSON.stringify({ ip: c.req.header('cf-connecting-ip') })).run();
    
    // In Production: SMTP API Call to dispatch `https://client.com/reset?token=${resetToken}` to `user.email`
  }
  
  // Security standard: Always return 'generic success' to avoid Account Enumeration attacks
  return c.json({ success: true, message: 'If this account exists, we have emailed a reset link.' });
});

app.post('/auth/reset-password', async (c) => {
  const { token, newPassword } = await c.req.json();
  const db = c.env.DB;

  const validToken: any = await db.prepare(
    `SELECT user_id FROM password_reset_tokens WHERE token = ? AND expires_at > CURRENT_TIMESTAMP`
  ).bind(token).first();

  if (!validToken) {
    return c.json({ error: 'Reset link is invalid or has mathematically expired.' }, 401);
  }

  const pHash = await hashPassword(newPassword);
  
  // Update Password explicitly & revoke all active sessions to force re-login globally for security
  await db.batch([
    db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).bind(pHash, validToken.user_id),
    db.prepare(`DELETE FROM user_sessions WHERE user_id = ?`).bind(validToken.user_id),
    db.prepare(`DELETE FROM password_reset_tokens WHERE user_id = ?`).bind(validToken.user_id), // Erase all reset tokens for user
    db.prepare(`INSERT INTO audit_logs (id, user_id, action, metadata) VALUES (?, ?, 'password_reset_successful', ?)`).bind(crypto.randomUUID(), validToken.user_id, JSON.stringify({ ip: c.req.header('cf-connecting-ip') }))
  ]);

  return c.json({ success: true, message: 'Password securely changed. Forced logout on all devices complete.' });
});

// ---------------------------------------------------------------------------------
// STRICT MULTI-TENANT ISOLATION MIDDLEWARE (/v1/*)
// ---------------------------------------------------------------------------------
app.use('/v1/*', async (c, next) => {
  let sessionId = null;
  const cookieHeader = c.req.header('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(cookieHeader.split('; ').map(v => v.split(/=(.*)/s).map(decodeURIComponent)));
    sessionId = cookies['sj_session_token'];
  }
  
  if (!sessionId) {
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionId = authHeader.split(' ')[1];
    }
  }

  const activeTenantId = c.req.header('X-Tenant-ID'); // Frontend must pass which shop they are querying

  if (!sessionId) {
    return c.json({ error: 'Unauthorized. Missing session token.' }, 401);
  }
  if (!activeTenantId) {
    return c.json({ error: 'Bad Request. Missing X-Tenant-ID header.' }, 400);
  }

  const db = c.env.DB;
  
  // 1. Verify Active Session
  const sessionUser: any = await db.prepare(
    `SELECT u.id, u.username, u.full_name, u.email, u.role as global_role
     FROM user_sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP`
  ).bind(sessionId).first();

  if (!sessionUser) {
    return c.json({ error: 'Session invalid or expired' }, 401);
  }

  // 2. Strict Tenant Authorization check (Is user a member of the requested tenant_id?)
  const membership: any = await db.prepare(
    `SELECT role FROM tenant_members WHERE tenant_id = ? AND user_id = ?`
  ).bind(activeTenantId, sessionUser.id).first();

  if (!membership) {
    // Critical Security: User tried to access a tenant ID they do not belong to!
    return c.json({ error: 'Forbidden. You do not have access to this Tenant Workspace.' }, 403);
  }

  // 3. Inject validated context downstream to all modular endpoints
  c.set('user', sessionUser);
  c.set('tenantId', activeTenantId);
  c.set('role', membership.role);

  await next();
});

// -----------------------------------------------------------------------------
// PROTECTED MODULAR RESOURCES (Enforced Tenant Context)
// -----------------------------------------------------------------------------

// Example: Scalable Inventory API
app.get('/v1/inventory', async (c) => {
  const tenantId = c.get('tenantId'); // Safely extracted by middleware
  const db = c.env.DB;

  // Notice backend completely restricts query to the authenticated tenant_id
  const { results } = await db.prepare(
    `SELECT * FROM inventory_items WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 100`
  ).bind(tenantId).all();

  return c.json({ success: true, data: results });
});

// SaaS Workspace Member Management Endpoints
app.get('/v1/users', async (c) => {
  const tenantId = c.get('tenantId');
  const db = c.env.DB;

  const users = await db.prepare(
    `SELECT u.id, u.username, u.email, u.full_name, m.role 
     FROM tenant_members m 
     JOIN users u ON m.user_id = u.id 
     WHERE m.tenant_id = ? ORDER BY u.created_at DESC`
  ).bind(tenantId).all();

  return c.json({ success: true, data: users.results });
});

app.post('/v1/users', async (c) => {
  const tenantId = c.get('tenantId');
  const sessionRole = c.get('role');
  
  // Security standard: Only owners can provision new tenant seats
  if (sessionRole !== 'owner') {
    return c.json({ error: 'Permission Denied. Only Shop Owners can invite new users.' }, 403);
  }

  const { username, email, full_name, password, role } = await c.req.json();
  const db = c.env.DB;

  // Uniqueness check for username/email globally
  const duplicate = await db.prepare(
    `SELECT id FROM users WHERE email = ? OR username = ?`
  ).bind(email, username).first();

  if (duplicate) {
    return c.json({ error: 'Username or Email is already registered globally.' }, 409);
  }

  const userId = crypto.randomUUID();
  const pHash = await hashPassword(password);

  // Securely construct team member assignment within an atomic ATOMIC Transaction
  await db.batch([
    db.prepare(
      `INSERT INTO users (id, username, email, password_hash, full_name, role) 
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(userId, username, email, pHash, full_name, role || 'staff'),

    db.prepare(
      `INSERT INTO tenant_members (tenant_id, user_id, role) 
       VALUES (?, ?, ?)`
    ).bind(tenantId, userId, role || 'staff')
  ]);

  return c.json({ success: true, message: 'User invited and attached to Workspace securely.' });
});

app.post('/v1/inventory', async (c) => {
  const tenantId = c.get('tenantId');
  const db = c.env.DB;
  const payload = await c.req.json();

  const itemId = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO inventory_items (id, tenant_id, code, name, category, metal, purity, gross_weight, net_weight) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    itemId, tenantId, payload.code, payload.name, payload.category, 
    payload.metal, payload.purity, payload.grossWeight, payload.netWeight
  ).run();

  return c.json({ success: true, message: 'Item secured in tenant inventory.' });
});

// ---------------------------------------------------------------------------------
// GLOBAL SaaS SUPER ADMIN MIDDLEWARE (/superadmin/*)
// ---------------------------------------------------------------------------------
app.use('/superadmin/*', async (c, next) => {
  let sessionId = null;
  const cookieHeader = c.req.header('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(cookieHeader.split('; ').map(v => v.split(/=(.*)/s).map(decodeURIComponent)));
    sessionId = cookies['sj_session_token'];
  }
  
  if (!sessionId) return c.json({ error: 'Unauthorized.' }, 401);

  const db = c.env.DB;
  const sessionUser: any = await db.prepare(
    `SELECT u.id, u.role as global_role 
     FROM user_sessions s JOIN users u ON s.user_id = u.id
     WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP`
  ).bind(sessionId).first();

  if (!sessionUser || sessionUser.global_role !== 'super_admin') {
    // Critical Audit: Unauthorized SuperAdmin access attempt
    await db.prepare(`INSERT INTO audit_logs (id, user_id, action, metadata) VALUES (?, ?, 'unauthorized_superadmin_access', ?)`).bind(
      crypto.randomUUID(), sessionUser?.id || 'unknown', JSON.stringify({ ip: c.req.header('cf-connecting-ip') })
    ).run();
    return c.json({ error: 'Forbidden. Enterprise Super Admin access required.' }, 403);
  }

  c.set('user', sessionUser);
  await next();
});

app.get('/superadmin/stats', async (c) => {
  const db = c.env.DB;
  const [shopsRes, usersRes, subRes] = await db.batch([
    db.prepare(`SELECT COUNT(*) as count FROM tenants`),
    db.prepare(`SELECT COUNT(*) as count FROM users`),
    db.prepare(`SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'`)
  ]);
  return c.json({ 
    success: true, 
    data: {
      totalShops: shopsRes.results[0].count,
      totalUsers: usersRes.results[0].count,
      activeSubscriptions: subRes.results[0].count
    }
  });
});

app.get('/superadmin/tenants', async (c) => {
  const db = c.env.DB;
  const tenants = await db.prepare(
    `SELECT t.id, t.name, t.email, t.phone, t.created_at, s.status, s.trial_ends_at 
     FROM tenants t 
     LEFT JOIN subscriptions s ON t.id = s.tenant_id 
     ORDER BY t.created_at DESC 
     LIMIT 50`
  ).all();
  return c.json({ success: true, data: tenants.results });
});

// ---------------------------------------------------------------------------------
// DEVELOPER BACKDOOR ENDPOINTS (/developer/*)
// ---------------------------------------------------------------------------------
app.post('/auth/developer', async (c) => {
  const { username, password } = await c.req.json();
  if (username === 'developerhubhai01' && password === 'developerhubhai01') {
    c.header('Set-Cookie', `sj_dev_session=active_developer; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`);
    return c.json({ success: true });
  }
  return c.json({ error: 'Invalid Developer Credentials' }, 401);
});

app.use('/developer/*', async (c, next) => {
  const cookieHeader = c.req.header('cookie');
  if (cookieHeader?.includes('sj_dev_session=active_developer')) {
    await next();
  } else {
    return c.json({ error: 'Developer Unauthorized' }, 401);
  }
});

app.get('/developer/clients', async (c) => {
  const db = c.env.DB;
  
  const tenants = await db.prepare(`
    SELECT t.id, t.name, t.phone, t.email, t.created_at, 
           s.status as subscription_status, s.trial_ends_at
    FROM tenants t
    LEFT JOIN subscriptions s ON t.id = s.tenant_id
    ORDER BY t.created_at DESC
  `).all();
  
  return c.json({ success: true, clients: tenants.results });
});

app.post('/developer/reset-client-password', async (c) => {
  const { email, newPassword } = await c.req.json();
  const db = c.env.DB;
  
  const pHash = await hashPassword(newPassword);
  const result = await db.prepare(`UPDATE users SET password_hash = ? WHERE email = ?`).bind(pHash, email).run();
  
  if (result.meta.changes > 0) {
    return c.json({ success: true, message: `Password reset successfully for ${email}` });
  }
  return c.json({ error: 'Client email not found.' }, 404);
});

export const onRequest = handle(app);
