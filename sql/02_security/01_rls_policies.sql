-- ================================================================
-- SECTION: ROW LEVEL SECURITY (RLS)
-- ================================================================

-- مسح القيود القديمة
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- تفعيل الـ RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Stores
CREATE POLICY "stores_public_read" ON stores FOR SELECT USING (is_active = true);
CREATE POLICY "stores_admin_all" ON stores FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND store_id = id)
);

-- User Roles
CREATE POLICY "user_roles_self" ON user_roles FOR SELECT USING (user_id = auth.uid());

-- Products
CREATE POLICY "products_public_read" ON products FOR SELECT USING (
  is_visible = true AND EXISTS (SELECT 1 FROM stores WHERE id = products.store_id AND is_active = true)
);
CREATE POLICY "products_merchant_all" ON products FOR ALL USING (
  store_id IN (SELECT store_id FROM user_roles WHERE user_id = auth.uid())
);

-- Orders
CREATE POLICY "orders_public_insert" ON orders FOR INSERT WITH CHECK (
  store_id IN (SELECT id FROM stores WHERE is_active = true) AND idempotency_key IS NOT NULL
);
CREATE POLICY "orders_merchant_all" ON orders FOR ALL USING (
  store_id IN (SELECT store_id FROM user_roles WHERE user_id = auth.uid())
);

-- Coupons
CREATE POLICY "coupons_merchant_all" ON coupons FOR ALL USING (
  store_id IN (SELECT store_id FROM user_roles WHERE user_id = auth.uid())
);
-- ملاحظة: القراءة العامة للكوبونات تتم عبر الـ RPC (validate_coupon) لذا لا نفتح الجدول للـ Public

-- Settings & Branding
CREATE POLICY "settings_public_read" ON store_settings FOR SELECT USING (true);
CREATE POLICY "settings_merchant_all" ON store_settings FOR ALL USING (
  store_id IN (SELECT store_id FROM user_roles WHERE user_id = auth.uid())
);

CREATE POLICY "branding_public_read" ON store_branding FOR SELECT USING (true);
CREATE POLICY "branding_merchant_all" ON store_branding FOR ALL USING (
  store_id IN (SELECT store_id FROM user_roles WHERE user_id = auth.uid())
);

-- Audit
CREATE POLICY "audit_insert" ON audit_log FOR INSERT WITH CHECK (true);
CREATE POLICY "audit_select_owner" ON audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND store_id = audit_log.store_id)
);
REVOKE UPDATE, DELETE ON audit_log FROM authenticated, anon;
