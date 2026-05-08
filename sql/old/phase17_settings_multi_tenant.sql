-- ================================================================
-- PHASE 17: Multi-Tenant Store Settings Fix (Updated for RLS)
-- ================================================================

-- 1. Modify store_settings to support multi-tenancy
ALTER TABLE store_settings DROP CONSTRAINT IF EXISTS store_settings_pkey;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS store_id UUID UNIQUE;
ALTER TABLE store_settings ALTER COLUMN id DROP DEFAULT;

-- 2. Make store_id the primary lookup key
CREATE INDEX IF NOT EXISTS idx_store_settings_id ON store_settings(store_id);

-- 3. Add column for updated_at if missing
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Secure the table with RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- حماية القراءة للجميع
DROP POLICY IF EXISTS "store_settings_public_read" ON store_settings;
CREATE POLICY "store_settings_public_read"
ON store_settings FOR SELECT
USING (true);

-- حماية التحكم الكامل للتاجر (إضافة + تعديل + حذف)
DROP POLICY IF EXISTS "store_settings_admin" ON store_settings;
CREATE POLICY "store_settings_admin"
ON store_settings FOR ALL
USING (
  store_id IN (
    SELECT store_id FROM user_roles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  store_id IN (
    SELECT store_id FROM user_roles WHERE user_id = auth.uid()
  )
);
