-- ================================================================
-- PHASE 3 — FINAL (FIXED + NO ERRORS)
-- ================================================================

-- ================================================================
-- CLEAN OLD POLICIES
-- ================================================================
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ================================================================
-- ADD MISSING COLUMNS
-- ================================================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key UUID;

-- ✅ FIX: add UNIQUE constraint safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'uq_orders_idempotency'
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT uq_orders_idempotency UNIQUE (idempotency_key);
  END IF;
END $$;

-- ================================================================
-- AUDIT LOG
-- ================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  store_id UUID,
  user_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_store_time 
ON audit_log (store_id, created_at DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_insert"
ON audit_log FOR INSERT
WITH CHECK (true);

CREATE POLICY "audit_select_owner"
ON audit_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND store_id = audit_log.store_id
  )
);

REVOKE UPDATE, DELETE ON audit_log FROM authenticated, anon;

-- ================================================================
-- USER ROLES HARDENING
-- ================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_owner_per_store
ON user_roles (store_id)
WHERE role = 'owner';

CREATE INDEX IF NOT EXISTS idx_user_roles_covering
ON user_roles (user_id, store_id, role);

CREATE OR REPLACE FUNCTION block_owner_escalation()
RETURNS trigger AS $$
BEGIN
  IF NEW.role = 'owner' AND OLD.role <> 'owner' THEN
    INSERT INTO audit_log(event_type, store_id, user_id)
    VALUES ('violation', NEW.store_id, NEW.user_id);
    RAISE EXCEPTION 'ROLE_ESCALATION_BLOCKED';
  END IF;

  IF OLD.role = 'owner' AND NEW.role <> 'owner' THEN
    INSERT INTO audit_log(event_type, store_id, user_id)
    VALUES ('violation', OLD.store_id, OLD.user_id);
    RAISE EXCEPTION 'OWNER_DEMOTION_BLOCKED';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_owner_escalation ON user_roles;
CREATE TRIGGER trg_block_owner_escalation
BEFORE UPDATE ON user_roles
FOR EACH ROW EXECUTE FUNCTION block_owner_escalation();

-- ================================================================
-- ORDER RATE LIMIT
-- ================================================================
CREATE OR REPLACE FUNCTION check_order_insert_rate()
RETURNS trigger AS $$
DECLARE v_count INT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(NEW.store_id::text)::bigint);

  SELECT COUNT(*) INTO v_count
  FROM orders
  WHERE store_id = NEW.store_id
  AND created_at >= now() - INTERVAL '60 seconds';

  IF v_count >= 30 THEN
    INSERT INTO audit_log(event_type, store_id)
    VALUES ('order_spike', NEW.store_id);

    RAISE EXCEPTION 'RATE_LIMIT_EXCEEDED';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_rate_limit ON orders;
CREATE TRIGGER trg_order_rate_limit
BEFORE INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION check_order_insert_rate();

-- ================================================================
-- ENABLE RLS
-- ================================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- PRODUCTS POLICIES
-- ================================================================
CREATE POLICY "products_public"
ON products FOR SELECT
USING (
  is_visible = true AND
  EXISTS (
    SELECT 1 FROM stores
    WHERE id = products.store_id AND is_active = true
  )
);

CREATE POLICY "products_merchant"
ON products FOR ALL
USING (
  store_id IN (
    SELECT store_id FROM user_roles WHERE user_id = auth.uid()
  )
);

-- ================================================================
-- ORDERS POLICIES (🔥 FIXED)
-- ================================================================
CREATE POLICY "orders_public_insert"
ON orders FOR INSERT
WITH CHECK (
  store_id IN (SELECT id FROM stores WHERE is_active = true)
  AND idempotency_key IS NOT NULL
);

CREATE POLICY "orders_merchant"
ON orders FOR ALL
USING (
  store_id IN (
    SELECT store_id FROM user_roles WHERE user_id = auth.uid()
  )
);

-- ================================================================
-- COUPONS POLICIES
-- ================================================================
CREATE POLICY "coupons_public_read"
ON coupons FOR SELECT
USING (is_active = true);

CREATE POLICY "coupons_admin"
ON coupons FOR ALL
USING (
  store_id IN (
    SELECT store_id FROM user_roles WHERE user_id = auth.uid()
  )
);

-- ================================================================
-- STORE SETTINGS
-- ================================================================
CREATE POLICY "store_settings_public_read"
ON store_settings FOR SELECT
USING (true);

CREATE POLICY "store_settings_admin"
ON store_settings FOR ALL
USING (
  store_id IN (
    SELECT store_id FROM user_roles WHERE user_id = auth.uid()
  )
);

-- ================================================================
-- STORES
-- ================================================================
CREATE POLICY "stores_public"
ON stores FOR SELECT
USING (is_active = true);

CREATE POLICY "stores_admin"
ON stores FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND store_id = stores.id
  )
);

-- ================================================================
-- USER ROLES
-- ================================================================
CREATE POLICY "user_roles_self"
ON user_roles FOR SELECT
USING (user_id = auth.uid());

-- ================================================================
-- PERFORMANCE INDEX
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_products_visible_store
ON products(store_id, is_visible)
WHERE is_visible = true;

-- ================================================================
-- VERIFY FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION verify_rls_config()
RETURNS TABLE(
  table_name text,
  has_rls boolean,
  policies integer
)
LANGUAGE sql
AS $$
  SELECT 
    c.relname::text,
    c.relrowsecurity,
    (SELECT COUNT(*) FROM pg_policy WHERE polrelid = c.oid)
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
  AND c.relkind = 'r';
$$;

-- السماح بالقراءة العامة (لأي زائر للمتجر)
CREATE POLICY "store_branding_public_read"
ON store_branding FOR SELECT
USING (true);

-- السماح بالتعديل فقط للـ owner/admin
CREATE POLICY "store_branding_owner_write"
ON store_branding FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND store_id = store_branding.store_id
    AND role IN ('owner','admin')
  )
);

-- ================================================================
-- RUN CHECK
-- ================================================================
SELECT * FROM verify_rls_config();