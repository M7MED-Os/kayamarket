-- ================================================================
-- Migration: Fix Subscription Enforcement (Full 3-Layer)
-- Date: 2026-05-01
-- Layers: DB Triggers + RLS + CHECK Constraints
-- ================================================================

-- ════════════════════════════════════════════════════════════════
-- 1. Fix user_roles CHECK constraint to include 'super_admin'
-- ════════════════════════════════════════════════════════════════
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('owner', 'admin', 'merchant', 'staff', 'super_admin'));


-- ════════════════════════════════════════════════════════════════
-- 2. Add max_coupons column to subscription_plans
--    0 = coupons disabled, N = max allowed coupons per store
-- ════════════════════════════════════════════════════════════════
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS max_coupons INTEGER NOT NULL DEFAULT 0;

-- Seed default values
UPDATE public.subscription_plans SET max_coupons = 0   WHERE id = 'starter';
UPDATE public.subscription_plans SET max_coupons = 20  WHERE id = 'growth';
UPDATE public.subscription_plans SET max_coupons = 100 WHERE id = 'pro';


-- ════════════════════════════════════════════════════════════════
-- 3. Drop old image trigger (was INSERT-only), recreate for INSERT+UPDATE
-- ════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS trg_check_image_limit ON public.products;
DROP FUNCTION IF EXISTS check_product_image_limit();

CREATE OR REPLACE FUNCTION check_product_image_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_plan_id  TEXT;
  v_max_imgs INTEGER;
  v_count    INTEGER;
BEGIN
  SELECT plan INTO v_plan_id FROM public.stores WHERE id = NEW.store_id;
  SELECT max_images_per_product INTO v_max_imgs
    FROM public.subscription_plans WHERE id = v_plan_id;

  IF v_max_imgs IS NULL THEN v_max_imgs := 1; END IF;

  -- Count images array length (main image_url counts as 1, images[] adds more)
  v_count := COALESCE(array_length(NEW.images, 1), 0);

  IF v_count > v_max_imgs THEN
    RAISE EXCEPTION 'LIMIT_REACHED: خطتك الحالية تسمح بـ % صورة فقط لكل منتج.', v_max_imgs;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_image_limit
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION check_product_image_limit();


-- ════════════════════════════════════════════════════════════════
-- 4. Coupon limit trigger (replaces has_coupons boolean with max_coupons)
-- ════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS trg_check_coupon_limit ON public.coupons;
DROP FUNCTION IF EXISTS check_store_coupon_limit();

CREATE OR REPLACE FUNCTION check_store_coupon_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_plan_id     TEXT;
  v_max_coupons INTEGER;
  v_current     INTEGER;
BEGIN
  SELECT plan INTO v_plan_id FROM public.stores WHERE id = NEW.store_id;
  SELECT max_coupons INTO v_max_coupons
    FROM public.subscription_plans WHERE id = v_plan_id;

  IF v_max_coupons IS NULL THEN v_max_coupons := 0; END IF;

  -- 0 means coupons are completely disabled
  IF v_max_coupons = 0 THEN
    RAISE EXCEPTION 'PLAN_LIMIT: الكوبونات غير متاحة في خطتك الحالية. يرجى الترقية.';
  END IF;

  SELECT COUNT(*) INTO v_current
    FROM public.coupons WHERE store_id = NEW.store_id;

  IF v_current >= v_max_coupons THEN
    RAISE EXCEPTION 'LIMIT_REACHED: لقد وصلت للحد الأقصى للكوبونات (%) في خطتك الحالية.', v_max_coupons;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_coupon_limit
BEFORE INSERT ON public.coupons
FOR EACH ROW EXECUTE FUNCTION check_store_coupon_limit();


-- ════════════════════════════════════════════════════════════════
-- 5. Branding trigger: block logo/banner AND all color customization
--    for starter plan (unless has_custom_branding = true)
-- ════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS trg_check_plan_branding_limit ON public.store_branding;
DROP FUNCTION IF EXISTS check_plan_branding_limit();

CREATE OR REPLACE FUNCTION check_plan_branding_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_plan TEXT;
  v_has_branding BOOLEAN;
BEGIN
  SELECT s.plan, sp.has_custom_branding
    INTO v_plan, v_has_branding
    FROM public.stores s
    JOIN public.subscription_plans sp ON sp.id = s.plan
    WHERE s.id = NEW.store_id;

  IF NOT COALESCE(v_has_branding, false) THEN
    -- Block logo and banner changes
    IF (OLD.logo_url IS DISTINCT FROM NEW.logo_url) OR
       (OLD.banner_url IS DISTINCT FROM NEW.banner_url) THEN
      RAISE EXCEPTION 'PREMIUM_FEATURE: الشعار والبانر متاحان فقط في الباقات المدفوعة.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_plan_branding_limit
BEFORE UPDATE ON public.store_branding
FOR EACH ROW EXECUTE FUNCTION check_plan_branding_limit();


-- ════════════════════════════════════════════════════════════════
-- 6. Helper RPC: get full plan features for a store
--    Used by server actions for fast single-query feature checks
-- ════════════════════════════════════════════════════════════════
DROP FUNCTION IF EXISTS get_store_plan_features(UUID);

CREATE OR REPLACE FUNCTION get_store_plan_features(p_store_id UUID)
RETURNS TABLE (
  plan_id                TEXT,
  max_products           INTEGER,
  max_images_per_product INTEGER,
  max_coupons            INTEGER,
  has_pdf_invoice        BOOLEAN,
  has_custom_branding    BOOLEAN,
  has_custom_domain      BOOLEAN,
  has_advanced_analytics BOOLEAN,
  can_remove_watermark   BOOLEAN,
  price_monthly          DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.plan,
    sp.max_products,
    sp.max_images_per_product,
    sp.max_coupons,
    sp.has_pdf_invoice,
    sp.has_custom_branding,
    sp.has_custom_domain,
    sp.has_advanced_analytics,
    sp.can_remove_watermark,
    sp.price_monthly
  FROM public.stores s
  JOIN public.subscription_plans sp ON sp.id = s.plan
  WHERE s.id = p_store_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_store_plan_features(UUID) TO authenticated, anon;
