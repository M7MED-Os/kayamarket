-- ================================================================
-- SECTION: TABLES & SCHEMAS
-- ================================================================

-- 1. المتاجر (Stores)
CREATE TABLE IF NOT EXISTS stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    custom_domain TEXT UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. صلاحيات المستخدمين (User Roles)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'merchant', 'staff')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, store_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_owner_per_store ON user_roles (store_id) WHERE role = 'owner';
CREATE INDEX IF NOT EXISTS idx_user_roles_covering ON user_roles (user_id, store_id, role);

-- 3. إعدادات المتجر (Store Settings)
CREATE TABLE IF NOT EXISTS store_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID UNIQUE NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    cod_enabled BOOLEAN DEFAULT TRUE,
    cod_deposit_required BOOLEAN DEFAULT FALSE,
    deposit_percentage INTEGER DEFAULT 50,
    policies TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. الهوية البصرية (Store Branding)
CREATE TABLE IF NOT EXISTS store_branding (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID UNIQUE NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    primary_color TEXT DEFAULT '#e11d48',
    logo_url TEXT,
    tagline TEXT,
    footer_text TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. المنتجات (Products)
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL,
    original_price DECIMAL DEFAULT NULL,
    image_url TEXT,
    images TEXT[] DEFAULT '{}',
    category TEXT DEFAULT 'أخرى',
    views_count INTEGER DEFAULT 0,
    stock INTEGER DEFAULT NULL,
    sale_end_date TIMESTAMPTZ DEFAULT NULL,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_visible_store ON products(store_id, is_visible) WHERE is_visible = true;

-- 6. الكوبونات (Coupons)
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    discount_percentage INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_uses INTEGER DEFAULT NULL,
    current_uses INTEGER DEFAULT 0,
    failed_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS unique_coupon_code_per_store ON coupons(store_id, lower(code));
CREATE INDEX IF NOT EXISTS idx_coupons_locked_until ON coupons (locked_until) WHERE locked_until IS NOT NULL;

-- 7. الطلبات (Orders)
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    public_token UUID NOT NULL DEFAULT gen_random_uuid(),
    idempotency_key UUID UNIQUE,
    product_name TEXT NOT NULL,
    product_price DECIMAL NOT NULL,
    coupon_code TEXT,
    discount_percentage INTEGER DEFAULT 0,
    final_price DECIMAL NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT NOT NULL,
    payment_method TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_public_token ON orders (public_token);
CREATE INDEX IF NOT EXISTS idx_orders_invoice_lookup ON orders (id, public_token, created_at);

-- 8. سجل التدقيق (Audit Log)
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_store_time ON audit_log (store_id, created_at DESC);
