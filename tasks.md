# 🏗️ Multi-Tenant SaaS — PRODUCTION-READY HARDENED PLAN v3

> **System:** Next.js 16 + Supabase + Tailwind v4 + Puppeteer
> **Current:** Single-store live app (RIO BOUQUET)
> **Target:** Multi-tenant SaaS with full tenant isolation

---

## 🔒 SECURITY ARCHITECTURE DECISIONS

### 1. Single Source of Truth for Store Resolution
```
Request → middleware (lightweight, NO DB) → set x-store-id header
  ↓
Page/Action reads header → calls resolveAndVerifyStore()
  ↓
For ADMIN: ALWAYS query user_roles from DB (ignore cookie/header)
For PUBLIC: trust header (set by middleware from hostname)
```

### 2. Cookie Policy
- `x-store-id` cookie = **UI hint ONLY** (for client components to read)
- **NEVER** used for: orders, pricing, admin actions, RLS decisions
- Admin actions: always `assertMerchant(supabase)` → queries `user_roles`
- Public pages: use `x-store-id` header (set by middleware from hostname parsing)

### 3. Middleware Design (Edge-Safe)
- **NO database queries** in middleware
- Middleware ONLY: parse hostname → extract store slug → set headers
- Auth session refresh only (existing Supabase pattern)
- Store resolution = pure string parsing, zero I/O

### 4. RLS Strategy
- **NO** `USING (true)` on sensitive tables (orders, store_settings)
- Orders: public can INSERT (checkout), SELECT own order by `public_token`
- Products: public can SELECT where `is_visible = true`
- Admin: scoped via `user_roles` subquery
- DB-level plan enforcement via CHECK constraints + triggers

---

## GLOBAL RULES

1. **NEVER** trust cookies for authorization
2. **NEVER** make DB calls in middleware
3. **ALWAYS** use `assertMerchant(supabase)` in admin actions (queries DB every time)
4. **EVERY** database column added must be NULLABLE first → backfill → NOT NULL
5. **EVERY** step must compile: `npm run build`
6. **ALL** admin queries must include `.eq('store_id', storeId)`
7. Default store ID: `00000000-0000-0000-0000-000000000001`

---

## PHASE 0 — Audit & Preparation

### 🎯 Goal
Branch, catalog all hardcoded values, document all unscoped queries.

### Tasks

#### Task 0.1 — Create branch
**Type:** DevOps
Run `git checkout -b feat/multi-tenant`

#### Task 0.2 — Audit hardcoded strings
**Type:** Audit
Search `src/` for: `RIO BOUQUET`, `RIHAM MOHAMED`, `riobouquet@instapay`, `01124417693`, `/logo.jpg`
Document every file:line occurrence.

**Known locations:**
- `src/app/page.tsx` → lines 43,44,47,107,267,274,275,307,313,349
- `src/app/products/[id]/page.tsx` → 57,58,62,171
- `src/app/invoice/[id]/page.tsx` → 45,46,49,164,173,195
- `src/templates/InvoiceHTML.ts` → 10,25,314,315,358,412,416,447
- `src/app/admin/layout.tsx` → 20,21,24
- `src/app/admin/login/page.tsx` → 47,48
- `src/app/layout.tsx` → 13
- `src/app/not-found.tsx` → 14
- `src/components/InvoiceActions.tsx` → 26,33
- `src/lib/whatsapp.ts` → 4
- `src/lib/invoice-utils.ts` → 4

#### Task 0.3 — Audit unscoped queries
**Type:** Audit
List every `.from('products|orders|coupons|store_settings')` without `.eq('store_id',...)`.

#### Task 0.4 — Audit middleware
**Type:** Audit
⚠️ CRITICAL: Verify `src/proxy.ts` is NOT auto-invoked by Next.js. Next.js requires `src/middleware.ts`. If no `middleware.ts` exists, the auth guard is NOT running. Must rename in Phase 2.

#### Task 0.5 — Add env vars
**Type:** Config
**File:** `.env.example`
Add: `BASE_DOMAIN=`, `SUPABASE_SERVICE_ROLE_KEY=`, `DEFAULT_STORE_ID=00000000-0000-0000-0000-000000000001`

#### Task 0.6 — Create migration file
**Type:** DB
Create `sql/migration-v2-multitenant.sql` with header comment.

### ✅ Done: Complete audit. Zero code changes. Branch ready.

---

## PHASE 1 — Database Foundation

### 🎯 Goal
Add tenant tables + columns. Backfill. All backward-compatible.

### Tasks

#### Task 1.1 — Create `stores` table ⚠️ CRITICAL
**Type:** DB | **File:** `sql/migration-v2-multitenant.sql`

```sql
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  custom_domain TEXT UNIQUE,
  whatsapp_phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','basic','pro')),
  max_products INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
-- Public can read active stores (storefront needs store name/slug)
CREATE POLICY "public_read_active" ON stores FOR SELECT USING (is_active = true);
-- Merchants manage own store
CREATE POLICY "merchant_own" ON stores FOR ALL USING (
  id IN (SELECT store_id FROM user_roles WHERE user_id = auth.uid())
);
```

#### Task 1.2 — Create `store_branding` table
**Type:** DB

```sql
CREATE TABLE IF NOT EXISTS store_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  logo_url TEXT,
  logo_base64 TEXT, -- 🔒 pre-processed for PDF (no runtime fetch)
  primary_color TEXT DEFAULT '#e11d48',
  secondary_color TEXT DEFAULT '#fff1f2',
  font_family TEXT DEFAULT 'Cairo',
  tagline TEXT,
  footer_text TEXT,
  invoice_instapay TEXT,
  invoice_wallet TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE store_branding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON store_branding FOR SELECT USING (true);
CREATE POLICY "merchant_manage" ON store_branding FOR ALL USING (
  store_id IN (SELECT store_id FROM user_roles WHERE user_id = auth.uid())
);
```

#### Task 1.3 — Create `user_roles` table
**Type:** DB

```sql
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'merchant' CHECK (role IN ('platform_admin','merchant')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, store_id)
);
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_own" ON user_roles FOR SELECT USING (user_id = auth.uid());
```

#### Task 1.4–1.7 — Add NULLABLE `store_id` to products, orders, coupons, store_settings
**Type:** DB

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS public_token UUID DEFAULT gen_random_uuid(); -- 🔒 for secure public access
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE;
```

#### Task 1.8 — Seed default store ⚠️ CRITICAL
**Type:** DB

```sql
INSERT INTO stores (id, slug, name, whatsapp_phone, max_products)
VALUES ('00000000-0000-0000-0000-000000000001', 'rio-bouquet', 'RIO BOUQUET', '201124417693', 999)
ON CONFLICT (id) DO NOTHING;

INSERT INTO store_branding (store_id, logo_url, tagline, invoice_instapay, invoice_wallet)
VALUES ('00000000-0000-0000-0000-000000000001', '/logo.jpg',
  'لتنسيق أروع الزهور والهدايا', 'riobouquet@instapay', '01124417693')
ON CONFLICT (store_id) DO NOTHING;
```

#### Task 1.9 — Backfill store_id ⚠️ CRITICAL
**Type:** DB

```sql
UPDATE products SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;
UPDATE orders SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;
UPDATE coupons SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;
UPDATE store_settings SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;
```

#### Task 1.10 — Enforce NOT NULL
**Type:** DB

```sql
ALTER TABLE products ALTER COLUMN store_id SET NOT NULL;
ALTER TABLE orders ALTER COLUMN store_id SET NOT NULL;
ALTER TABLE coupons ALTER COLUMN store_id SET NOT NULL;
ALTER TABLE store_settings ALTER COLUMN store_id SET NOT NULL;
```

#### Task 1.11 — Add indexes
**Type:** DB

```sql
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_token ON orders(public_token);
CREATE INDEX IF NOT EXISTS idx_coupons_store ON coupons(store_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_domain ON stores(custom_domain);
CREATE INDEX IF NOT EXISTS idx_roles_user ON user_roles(user_id);
```

#### Task 1.12 — Create atomic order function 🔥 HIGH RISK
**Type:** DB

```sql
CREATE OR REPLACE FUNCTION create_order_atomic(
  p_product_name TEXT, p_product_price NUMERIC,
  p_coupon_code TEXT, p_discount_percentage NUMERIC,
  p_final_price NUMERIC, p_customer_name TEXT,
  p_customer_address TEXT, p_customer_phone TEXT,
  p_payment_method TEXT, p_store_id UUID,
  p_product_id UUID DEFAULT NULL
) RETURNS TABLE(order_id UUID, order_token UUID) AS $$
DECLARE
  v_order_id UUID;
  v_token UUID := gen_random_uuid();
  v_rows_affected INT;
BEGIN
  -- 🔒 Atomic stock decrement: UPDATE WHERE stock > 0 prevents overselling
  IF p_product_id IS NOT NULL THEN
    UPDATE products SET stock = stock - 1
    WHERE id = p_product_id AND stock > 0;
    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    IF v_rows_affected = 0 THEN
      RAISE EXCEPTION 'OUT_OF_STOCK';
    END IF;
  END IF;

  INSERT INTO orders (
    product_name, product_price, coupon_code, discount_percentage,
    final_price, customer_name, customer_address, customer_phone,
    payment_method, store_id, public_token
  ) VALUES (
    p_product_name, p_product_price, p_coupon_code, p_discount_percentage,
    p_final_price, p_customer_name, p_customer_address, p_customer_phone,
    p_payment_method, p_store_id, v_token
  ) RETURNING id INTO v_order_id;

  RETURN QUERY SELECT v_order_id, v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Task 1.13 — Create plan enforcement trigger
**Type:** DB

```sql
-- 🔒 DB-level enforcement: cannot exceed max_products
CREATE OR REPLACE FUNCTION check_product_limit() RETURNS TRIGGER AS $$
DECLARE v_count INT; v_max INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM products WHERE store_id = NEW.store_id;
  SELECT max_products INTO v_max FROM stores WHERE id = NEW.store_id;
  IF v_count >= COALESCE(v_max, 10) THEN
    RAISE EXCEPTION 'PRODUCT_LIMIT_REACHED';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_product_limit BEFORE INSERT ON products
FOR EACH ROW EXECUTE FUNCTION check_product_limit();
```

#### Task 1.14 — Link admin user + run migration
**Type:** DB

```sql
INSERT INTO user_roles (user_id, store_id, role)
SELECT id, '00000000-0000-0000-0000-000000000001', 'merchant'
FROM auth.users LIMIT 1
ON CONFLICT (user_id, store_id) DO NOTHING;
```

Run full migration in Supabase SQL Editor. Verify all tables exist.

#### Task 1.15 — Create TypeScript types
**Type:** Backend | **File:** `src/types/store.ts` (NEW)

```ts
export interface Store {
  id: string; slug: string; name: string; owner_id: string | null;
  custom_domain: string | null; whatsapp_phone: string | null;
  is_active: boolean; plan: string; max_products: number; created_at: string;
}
export interface StoreBranding {
  id: string; store_id: string; logo_url: string | null;
  logo_base64: string | null; primary_color: string;
  secondary_color: string; font_family: string;
  tagline: string | null; footer_text: string | null;
  invoice_instapay: string | null; invoice_wallet: string | null;
}
export interface UserRole {
  id: string; user_id: string; store_id: string;
  role: 'platform_admin' | 'merchant';
}
```

#### Task 1.16 — Add `store_id` to Product type
**Type:** Backend | **File:** `src/types/product.ts`
Add `store_id: string` field.

### ✅ Done: DB has multi-tenant structure. App unchanged. Zero regression.

---

## PHASE 2 — Auth, Middleware & Store Resolution

### 🎯 Goal
Rename proxy → middleware (edge-safe, no DB). Create unified store resolution pipeline. Establish auth helpers.

### ⚠️ KEY DESIGN: Middleware = lightweight. NO DB queries.

### Tasks

#### Task 2.1 — Create unified store resolver (SINGLE SOURCE OF TRUTH) ⚠️ CRITICAL
**Type:** Backend | **File:** `src/lib/tenant/resolve.ts` (NEW)

This is the ONE function that resolves stores. No other file should duplicate this logic.

```ts
// PURE FUNCTION — no DB calls, no side effects
export function resolveStoreSlug(hostname: string, searchParams?: URLSearchParams): string | null {
  // 1. Normalize
  hostname = hostname.replace(/^www\./, '').split(':')[0]
  // 2. Query param (dev mode)
  const paramSlug = searchParams?.get('store')
  if (paramSlug) return paramSlug
  // 3. Subdomain
  const baseDomain = process.env.BASE_DOMAIN?.split(':')[0]
  if (baseDomain && hostname.endsWith(baseDomain) && hostname !== baseDomain) {
    const sub = hostname.replace(`.${baseDomain}`, '')
    if (sub && sub !== 'www') return sub
  }
  // 4. Custom domain → stored in header by middleware after DB lookup (deferred)
  // 5. Preview domains (vercel, etc) → use param or null
  if (hostname.includes('vercel.app')) return paramSlug || null
  return null // caller uses DEFAULT_STORE_ID
}
```

#### Task 2.2 — Create store fetcher with caching
**Type:** Backend | **File:** `src/lib/tenant/get-store.ts` (NEW)

```ts
import { unstable_cache } from 'next/cache'

// Cached store+branding fetch (5 min TTL) — used by pages
export const getStoreById = unstable_cache(
  async (supabase, storeId) => {
    const { data: store } = await supabase.from('stores').select('*').eq('id', storeId).single()
    const { data: branding } = await supabase.from('store_branding').select('*').eq('store_id', storeId).single()
    return { store, branding }
  },
  ['store-data'],
  { revalidate: 300 } // 5 minutes
)

export const getStoreBySlug = unstable_cache(
  async (supabase, slug) => {
    const { data: store } = await supabase.from('stores').select('*').eq('slug', slug).eq('is_active', true).single()
    if (!store) return null
    const { data: branding } = await supabase.from('store_branding').select('*').eq('store_id', store.id).single()
    return { store, branding }
  },
  ['store-by-slug'],
  { revalidate: 300 }
)
```

#### Task 2.3 — Create auth helpers ⚠️ CRITICAL
**Type:** Backend | **File:** `src/lib/auth.ts` (NEW)

```ts
export const DEFAULT_STORE_ID = '00000000-0000-0000-0000-000000000001'

// 🔒 ALWAYS queries DB. NEVER trusts cookies.
export async function assertMerchant(supabase) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('NOT_AUTHENTICATED')
  const { data: role } = await supabase.from('user_roles')
    .select('store_id, role').eq('user_id', user.id).single()
  if (!role) throw new Error('NO_STORE_ACCESS')
  return { userId: user.id, storeId: role.store_id, role: role.role }
}
// NO .catch() fallbacks. NO DEFAULT_STORE_ID in admin context. EVER.
```

#### Task 2.4 — Rename proxy.ts → middleware.ts (Edge-Safe) ⚠️ CRITICAL
**Type:** Auth | **Files:** `src/proxy.ts` → `src/middleware.ts`

**Steps:**
1. Rename file
2. Change export: `export async function middleware(request: NextRequest)`
3. Keep existing Supabase auth session refresh
4. Add **lightweight** tenant resolution (NO DB):
```ts
const slug = resolveStoreSlug(request.nextUrl.hostname, request.nextUrl.searchParams)
if (slug) {
  // Set header — pages will use this to fetch store from DB
  supabaseResponse.headers.set('x-store-slug', slug)
}
```
5. For `/admin/*` routes: keep existing auth check (redirect if no user)
6. **REMOVE** any `user_roles` DB query from middleware
7. Update `config.matcher` to include all routes

**🚫 DO NOT** query `user_roles` or `stores` table in middleware. Edge Runtime cannot reliably do this.

#### Task 2.5 — Update login page
**Type:** Frontend | **File:** `src/app/admin/login/page.tsx`

1. After `signInWithPassword`, fetch role from `user_roles`
2. If no role → show error, do NOT redirect
3. If role found → set `x-store-id` cookie (hint only) → redirect
4. **NO fallback** to DEFAULT_STORE_ID. No role = no access.
5. Add rate limiting: track attempts in state, disable after 5 failures for 60s

#### Task 2.6 — Update admin layout (cached)
**Type:** Frontend | **File:** `src/app/admin/layout.tsx`

1. Get user via `supabase.auth.getUser()`
2. Query `user_roles` for storeId (this is a server component, OK to query DB)
3. Use `getStoreById(supabase, storeId)` (cached, 5-min TTL)
4. Replace `RIO BOUQUET` with `store.name`
5. **FALLBACK:** If role not found, redirect to `/admin/login`

### 🧪 Checkpoint
- [ ] Middleware runs (renamed from proxy.ts)
- [ ] Middleware does NO DB queries
- [ ] Login sets cookie hint + validates role
- [ ] Admin layout shows dynamic store name (cached)
- [ ] `npm run build` passes

### ✅ Done: Auth is secure. Middleware is edge-safe. Store resolution is unified.

---

## PHASE 3 — RLS & Data Scoping ⚠️ CRITICAL SECURITY PHASE

### 🎯 Goal
Lock down ALL database access with tenant-scoped RLS. Scope all admin queries.

### 🔒 RLS DESIGN (NO USING(true) ON ORDERS)

#### Task 3.1 — Deploy tenant-scoped RLS 🔥 HIGH RISK
**Type:** DB | **File:** `sql/migration-v2-multitenant.sql`

```sql
-- ========== PRODUCTS ==========
DROP POLICY IF EXISTS "Allow public read access" ON products;
DROP POLICY IF EXISTS "Allow admin all access" ON products;
CREATE POLICY "public_read_visible" ON products FOR SELECT USING (is_visible = true);
CREATE POLICY "merchant_manage" ON products FOR ALL USING (
  store_id IN (SELECT store_id FROM user_roles WHERE user_id = auth.uid())
);

-- ========== ORDERS (🔒 HARDENED — NO USING(true)) ==========
DROP POLICY IF EXISTS "Allow admin all access" ON orders;
DROP POLICY IF EXISTS "Allow public insert" ON orders;
-- Public: can INSERT (checkout)
CREATE POLICY "public_insert" ON orders FOR INSERT WITH CHECK (true);
-- Public: can SELECT own order ONLY via public_token (invoice page)
CREATE POLICY "public_read_by_token" ON orders FOR SELECT USING (
  public_token IS NOT NULL AND public_token = current_setting('app.order_token', true)::uuid
);
-- Merchant: full access to own store orders
CREATE POLICY "merchant_manage" ON orders FOR ALL USING (
  store_id IN (SELECT store_id FROM user_roles WHERE user_id = auth.uid())
);

-- ========== COUPONS ==========
DROP POLICY IF EXISTS "Allow public read" ON coupons;
DROP POLICY IF EXISTS "Allow admin all access" ON coupons;
CREATE POLICY "public_read_active" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "merchant_manage" ON coupons FOR ALL USING (
  store_id IN (SELECT store_id FROM user_roles WHERE user_id = auth.uid())
);

-- ========== STORE SETTINGS ==========
CREATE POLICY "public_read" ON store_settings FOR SELECT USING (true);
CREATE POLICY "merchant_manage" ON store_settings FOR ALL USING (
  store_id IN (SELECT store_id FROM user_roles WHERE user_id = auth.uid())
);
```

**Note on orders SELECT:** The `public_read_by_token` policy uses `current_setting('app.order_token')`. The invoice page must call `await supabase.rpc('set_claim', { key: 'app.order_token', value: tokenFromUrl })` before querying. Alternative simpler approach: use service role client for invoice page only.

**Simpler alternative for orders (if `current_setting` is too complex):**
```sql
-- Allow SELECT if user is authenticated (merchant) or if order is accessed by direct ID
-- Since order IDs are UUIDs (unguessable), this is acceptably safe
CREATE POLICY "public_read_by_id" ON orders FOR SELECT USING (true);
```
Choose ONE approach and document the decision.

#### Task 3.2 — Scope createProduct
**Type:** Backend | **File:** `src/app/admin/actions.ts`

```ts
// 🔒 NO fallback. Fails if unauthorized.
const { storeId } = await assertMerchant(supabase)
// ... add store_id: storeId to .insert()
// Plan limit enforced by DB trigger (Task 1.13), but also check in app:
// catch 'PRODUCT_LIMIT_REACHED' error from DB
```

#### Task 3.3 — Scope updateProduct
Same pattern. Add `.eq('store_id', storeId)` to `.update().eq('id', id)`.

#### Task 3.4 — Scope deleteProduct
Same pattern. Add `.eq('store_id', storeId)` to `.select()` and `.delete()`.

#### Task 3.5 — Scope toggleProductVisibility
Same pattern.

#### Task 3.6 — Scope dashboard query
**Type:** Frontend | **File:** `src/app/admin/dashboard/page.tsx`
Get storeId via `assertMerchant(supabase)`. No fallback. Add `.eq('store_id', storeId)`.

#### Task 3.7 — Scope orders query
**File:** `src/app/admin/orders/page.tsx` — same pattern.

#### Task 3.8 — Scope coupons query + insert
**File:** `src/app/admin/coupons/page.tsx` — add store_id to query and insert.

#### Task 3.9 — Scope settings query
**File:** `src/app/admin/settings/page.tsx` — `.eq('store_id', storeId).single()`.

#### Task 3.10 — Scope settings update
**File:** `src/app/actions/settings.ts` — use `assertMerchant`, upsert with `store_id`.

#### Task 3.11 — Scope updateOrderStatus
**File:** `src/app/actions/order.ts` — add `.eq('store_id', storeId)`.

#### Task 3.12 — Scope deleteOrder
Same pattern.

#### Task 3.13 — Update image upload paths
**File:** `src/components/MultiImageUploader.tsx`
Add `storeId` prop. Upload to `{storeId}/{fileName}`. Fallback: `default/`.

#### Task 3.14 — Pass storeId to image uploader
**Files:** product forms — read storeId from cookie (hint OK here since server action re-validates).

### ✅ Done: All queries scoped. RLS enforced at DB level. No cross-tenant leaks.

---

## PHASE 4 — Storefront Separation

### 🎯 Goal
Public pages become tenant-aware. Each store shows only its own data.

### Tasks

#### Task 4.1 — Update home page
**File:** `src/app/page.tsx`

1. Read `x-store-slug` header (set by middleware)
2. Call `getStoreBySlug(supabase, slug)` — cached
3. If no slug, use DEFAULT_STORE_ID with `getStoreById`
4. Add `.eq('store_id', store.id)` to all queries
5. Replace all hardcoded text with `store.name`, `branding.logo_url`, `store.whatsapp_phone`

#### Task 4.2 — Update product detail page
**File:** `src/app/products/[id]/page.tsx`
Same pattern. Scope query + replace branding.

#### Task 4.3 — Update layout metadata
**File:** `src/app/layout.tsx`
Use cached store data. Inject CSS variables from branding onto `<body>`. Generic fallback title.

#### Task 4.4 — Update WhatsApp utility
**File:** `src/lib/whatsapp.ts`
Add `whatsappPhone?: string` param. Fallback to env var. Backward compatible.

#### Task 4.5 — Update WhatsApp button
**File:** `src/components/WhatsAppButton.tsx`
Accept `whatsappPhone` prop.

#### Task 4.6 — Update CheckoutBox
**File:** `src/components/CheckoutBox.tsx`
Add `storeId` prop. Scope settings + coupons queries.

#### Task 4.7 — Update createOrder (atomic) ⚠️ CRITICAL
**File:** `src/app/actions/order.ts`

Replace `.insert()` with:
```ts
const { data, error } = await supabase.rpc('create_order_atomic', {
  p_product_name: ..., p_store_id: storeId, p_product_id: productId, ...
})
if (error?.message?.includes('OUT_OF_STOCK')) {
  return { success: false, error: 'عذراً، نفذت الكمية' }
}
// data returns { order_id, order_token }
// Redirect to /invoice/{order_id}?token={order_token}
```

#### Task 4.8 — Update invoice-utils
**File:** `src/lib/invoice-utils.ts`
Accept `whatsappPhone` param.

### ✅ Done: Storefront is tenant-aware. Orders are atomic. No overselling.

---

## PHASE 5 — Branding & Theming

### 🎯 Goal
Merchants customize their store (colors, logo, font) via admin. 

### Tasks

#### Task 5.1 — CSS Variable Generator
**Type:** Backend | **File:** `src/lib/tenant/branding.ts` (NEW)
Export `generateCSSVariables(branding: StoreBranding)` to map fields to CSS custom properties.

#### Task 5.2 — Update globals.css
**Type:** Frontend | **File:** `src/app/globals.css`
Update `@theme` to use `var(--color-primary, #e11d48)` instead of hardcoded `#e11d48`. Same for secondary color.

#### Task 5.3 — Inject CSS in Root Layout
**Type:** Frontend | **File:** `src/app/layout.tsx`
Call `getStoreBySlug()` or `getStoreById()`. Inject generated CSS variables into `<body>` style.

#### Task 5.4 — Admin Branding Page
**Type:** Frontend | **File:** `src/app/admin/settings/branding/page.tsx` (NEW)
Create form with color pickers, font dropdown, and logo upload. Load existing data via `getStoreById(supabase, storeId)`.

#### Task 5.5 — Branding Server Action (with Base64 Processing) ⚠️ CRITICAL
**Type:** Backend | **File:** `src/app/actions/branding.ts` (NEW)
1. `assertMerchant(supabase)` to get `storeId`.
2. Handle logo upload to Storage.
3. **🔒 FIX (Performance):** Convert the uploaded image to Base64 *during upload*, downscale it, and save the Base64 string directly into `store_branding.logo_base64`.
4. Upsert into `store_branding`.
5. `revalidatePath('/', 'layout')`

#### Task 5.6 — Add to Admin Nav
**Type:** Frontend | **Files:** `src/app/admin/layout.tsx`, `src/components/AdminMobileMenu.tsx`
Add branding link to navigation.

### ✅ Done: Stores have unique visual identities safely injected.

---

## PHASE 6 — Invoice & WhatsApp Refactor (High Performance)

### 🎯 Goal
Invoices and WhatsApp show correct store branding with high-performance PDF rendering.

### Tasks

#### Task 6.1 — Invoice HTML Page
**Type:** Frontend | **File:** `src/app/invoice/[id]/page.tsx`
1. Read `token` from URL search params.
2. Update `orders` query: `.eq('id', id).eq('public_token', token).single()`.
3. Fetch store + branding using `order.store_id`.
4. Replace hardcoded text/logos.

#### Task 6.2 — InvoiceHTML Template (Zero Runtime Fetch) ⚠️ CRITICAL
**Type:** Backend | **File:** `src/templates/InvoiceHTML.ts`
1. Accept `store` and `branding`.
2. **🔒 FIX (Performance):** Use `branding.logo_base64` directly as `src="data:image/jpeg;base64,..."`. NEVER fetch via HTTP inside the Puppeteer PDF generation process.
3. Replace all hardcoded colors, text, and WhatsApp links.

#### Task 6.3 — Invoice API Route
**Type:** Backend | **File:** `src/app/api/invoice/route.ts`
1. Require `token` in query string.
2. Query order via ID + token.
3. Fetch store + branding.
4. Pass to `generateInvoiceHTML()`.
5. Set PDF filename to `${store.slug}-Invoice.pdf`.

#### Task 6.4 — InvoiceActions Component
**Type:** Frontend | **File:** `src/components/InvoiceActions.tsx`
Pass `storeName` and `storeSlug`. Pass `token` to the API route call.

### ✅ Done: High-performance, isolated, securely accessed invoices.

---

## PHASE 7 — Subdomain & Custom Domain

### 🎯 Goal
Route `slug.domain.com` and custom domains securely.

### Tasks

#### Task 7.1 — Domain Admin Page
**Type:** Frontend | **File:** `src/app/admin/settings/domain/page.tsx` (NEW)
Show current subdomain and allow updating `custom_domain`.

#### Task 7.2 — Domain Update Action
**Type:** Backend | **File:** `src/app/actions/domain.ts` (NEW)
Validate domain format. `assertMerchant(supabase)`. Update `stores.custom_domain`.

#### Task 7.3 — Middleware Routing
**Type:** Auth | **File:** `src/middleware.ts`
Already implemented in Phase 2. Ensure testing works.

### ✅ Done: Domains routed natively.

---

## PHASE 8 — Plans & Limits UI

### 🎯 Goal
Display the limits enforced by the DB triggers.

### Tasks

#### Task 8.1 — Plan Config
**Type:** Backend | **File:** `src/lib/plans.ts` (NEW)
Define UI constants for `free`, `basic`, `pro` to match DB limits.

#### Task 8.2 — Plan Usage Admin Page
**Type:** Frontend | **File:** `src/app/admin/settings/plan/page.tsx` (NEW)
1. Fetch store `plan` and `max_products`.
2. `SELECT count(*)` from products.
3. Display current usage vs max limit.

#### Task 8.3 — UI Enforcement in Action
**Type:** Backend | **File:** `src/app/admin/actions.ts`
In `createProduct()`, wrap the `assertMerchant` and `insert` in a try/catch. Explicitly handle the `'PRODUCT_LIMIT_REACHED'` DB exception from the trigger to return a user-friendly error.

### ✅ Done: Limits strictly enforced at DB level and reflected in UI.

---

## PHASE 9 — Security Hardening & Polish

### 🎯 Goal
Final audit, documentation, and cleanup.

### Tasks

#### Task 9.1 — RLS Review
**Type:** Security
Verify ALL tables. No `USING (true)` except safe public tables (e.g., store_branding) or explicitly secured by tokens (orders).

#### Task 9.2 — Hardcoded String Cleanup
**Type:** Refactor
Global search for `RIO BOUQUET`, `RIHAM MOHAMED`, `01124417693`. Remove any remaining ones.

#### Task 9.3 — Service Role Setup
**Type:** Backend | **File:** `src/lib/supabase/admin.ts` (NEW)
Create service role client for future Platform Admin tasks (billing, account suspensions). Never export to client.

#### Task 9.4 — Regression Matrix
**Type:** QA
Verify:
1. Store A cannot edit Store B's products.
2. Orders decrement stock atomically.
3. PDF renders in <2s (due to base64 logo).
4. `www.` subdomain stripped correctly.

#### Task 9.5 — Final Build
**Type:** DevOps
`npm run build`, `npm run lint`.

### ✅ Definition of Done: Production-ready SaaS platform.

---

## 📎 COMPLETE FILE INVENTORY

| File | Action | Phase |
|------|--------|-------|
| `sql/migration-v2-multitenant.sql` | NEW | 1, 3 |
| `src/types/store.ts` | NEW | 1 |
| `src/lib/auth.ts` | NEW | 2 |
| `src/lib/tenant/resolve.ts` | NEW | 2 |
| `src/lib/tenant/get-store.ts` | NEW | 2 |
| `src/lib/tenant/branding.ts` | NEW | 5 |
| `src/lib/plans.ts` | NEW | 8 |
| `src/lib/supabase/admin.ts` | NEW | 9 |
| `src/app/actions/branding.ts` | NEW | 5 |
| `src/app/actions/domain.ts` | NEW | 7 |
| `src/app/admin/settings/branding/page.tsx` | NEW | 5 |
| `src/app/admin/settings/domain/page.tsx` | NEW | 7 |
| `src/app/admin/settings/plan/page.tsx` | NEW | 8 |
| `src/proxy.ts` → `src/middleware.ts` | RENAME+MODIFY | 2 |
| `src/app/admin/layout.tsx` | MODIFY | 2, 5 |
| `src/app/admin/login/page.tsx` | MODIFY | 2 |
| `src/app/admin/actions.ts` | MODIFY | 3, 8 |
| `src/app/admin/dashboard/page.tsx` | MODIFY | 3 |
| `src/app/admin/orders/page.tsx` | MODIFY | 3 |
| `src/app/admin/coupons/page.tsx` | MODIFY | 3 |
| `src/app/admin/settings/page.tsx` | MODIFY | 3 |
| `src/app/actions/order.ts` | MODIFY | 3, 4 |
| `src/app/actions/settings.ts` | MODIFY | 3 |
| `src/app/page.tsx` | MODIFY | 4 |
| `src/app/products/[id]/page.tsx` | MODIFY | 4 |
| `src/app/layout.tsx` | MODIFY | 4, 5 |
| `src/app/not-found.tsx` | MODIFY | 4 |
| `src/app/globals.css` | MODIFY | 5 |
| `src/app/invoice/[id]/page.tsx` | MODIFY | 6 |
| `src/app/api/invoice/route.ts` | MODIFY | 6 |
| `src/templates/InvoiceHTML.ts` | MODIFY | 6 |
| `src/components/CheckoutBox.tsx` | MODIFY | 4 |
| `src/components/WhatsAppButton.tsx` | MODIFY | 4 |
| `src/components/InvoiceActions.tsx` | MODIFY | 6 |
| `src/components/MultiImageUploader.tsx` | MODIFY | 3 |
| `src/components/AdminMobileMenu.tsx` | MODIFY | 5 |
| `src/lib/whatsapp.ts` | MODIFY | 4 |
| `src/lib/invoice-utils.ts` | MODIFY | 6 |
| `src/types/product.ts` | MODIFY | 1 |
| `.env.local` | MODIFY | 0 |
| `.env.example` | MODIFY | 0 |

---

## 📊 EXECUTION SUMMARY

| Phase | Tasks | Risk | Details |
|-------|-------|------|-----------|
| 0 — Audit | 6 | Low | System analysis, variable prep |
| 1 — DB Foundation | 16 | 🔥 High | Migrations, atomic functions, limits triggers |
| 2 — Auth & Resolve | 6 | 🔥 High | Edge-safe middleware, DB-backed auth |
| 3 — Data Scoping | 14 | 🔥 High | Hardened RLS, server action isolation |
| 4 — Storefront | 8 | Medium | Cached layout fetches, atomic order inserts |
| 5 — Branding | 6 | Low | Base64 logos, dynamic CSS variables |
| 6 — Invoices | 4 | Medium | High-perf PDF, token-secured access |
| 7 — Domains | 3 | Low | Unified resolution usage |
| 8 — Plans | 3 | Low | Usage tracking UI reflecting DB limits |
| 9 — Polish | 5 | Medium | Final security sweep |
| **TOTAL** | **~71** | | **Production-Ready & Hardened** |
