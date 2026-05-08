-- ================================================================
-- Migration: Add Professional WhatsApp and Favicon Enforcement
-- Date: 2026-05-01
-- ================================================================

-- 1. Add has_professional_whatsapp to subscription_plans
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS has_professional_whatsapp BOOLEAN DEFAULT FALSE;

-- Update defaults (Starter = False, Growth/Pro = True)
UPDATE public.subscription_plans SET has_professional_whatsapp = FALSE WHERE id = 'starter';
UPDATE public.subscription_plans SET has_professional_whatsapp = TRUE WHERE id IN ('growth', 'pro');

-- 2. Ensure favicon_url exists in store_branding
ALTER TABLE public.store_branding
  ADD COLUMN IF NOT EXISTS favicon_url TEXT;

-- 3. Update the Branding Trigger to include favicon_url
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
    -- Block logo, banner, and favicon changes for plans without branding
    IF (OLD.logo_url IS DISTINCT FROM NEW.logo_url) OR
       (OLD.banner_url IS DISTINCT FROM NEW.banner_url) OR
       (OLD.favicon_url IS DISTINCT FROM NEW.favicon_url) THEN
      RAISE EXCEPTION 'PREMIUM_FEATURE: الشعار والبانر وأيقونة المتجر متاحة فقط في الباقات المدفوعة.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_plan_branding_limit
BEFORE UPDATE ON public.store_branding
FOR EACH ROW EXECUTE FUNCTION check_plan_branding_limit();

-- 4. Update the RPC helper for fast plan fetching
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
  has_professional_whatsapp BOOLEAN,
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
    sp.has_professional_whatsapp,
    sp.price_monthly
  FROM public.stores s
  JOIN public.subscription_plans sp ON sp.id = s.plan
  WHERE s.id = p_store_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_store_plan_features(UUID) TO authenticated, anon;
