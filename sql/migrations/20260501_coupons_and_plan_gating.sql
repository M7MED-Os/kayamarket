-- Migration: Coupon uniqueness fix and Plan gating for branding
-- Created: 2026-05-01

-- 1. Fix Coupon Uniqueness
-- Allow different stores to have the same coupon code
ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_code_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_store_code ON coupons(store_id, code);

-- 2. Plan Gating for Logo/Banner (Database Level)
CREATE OR REPLACE FUNCTION check_plan_branding_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_plan TEXT;
BEGIN
  SELECT plan INTO v_plan FROM stores WHERE id = NEW.store_id;
  
  -- If plan is starter, prevent changing logo or banner
  IF v_plan = 'starter' THEN
    -- Check if logo_url or banner_url changed
    IF (OLD.logo_url IS DISTINCT FROM NEW.logo_url) OR (OLD.banner_url IS DISTINCT FROM NEW.banner_url) THEN
      RAISE EXCEPTION 'PREMIUM_FEATURE: Logo and Banner are not available on the Starter plan.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_plan_branding_limit ON store_branding;
CREATE TRIGGER trg_check_plan_branding_limit
BEFORE UPDATE ON store_branding
FOR EACH ROW EXECUTE FUNCTION check_plan_branding_limit();

-- 3. Ensure RPC uses store_id for coupon validation (Already done in multi_v1 but double check)
-- create_order_multi_v1 already has: WHERE code = p_coupon_code AND store_id = p_store_id
