-- ================================================================
-- COUPON VALIDITY LOGIC (Production Hardening)
-- ================================================================

-- 1. Create a function to increment usage (Step 5)
DROP FUNCTION IF EXISTS increment_coupon_usage(UUID, TEXT);

CREATE OR REPLACE FUNCTION increment_coupon_usage(
  p_store_id UUID,
  p_code     TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE coupons
  SET current_uses = current_uses + 1,
      failed_attempts = 0,
      locked_until = NULL
  WHERE store_id = p_store_id
    AND lower(code) = lower(trim(p_code));
END;
$$;

-- 2. Update validate_coupon to meet Step 4 requirements
-- Decouples validation from usage increment.
DROP FUNCTION IF EXISTS validate_coupon(UUID, TEXT);

CREATE OR REPLACE FUNCTION validate_coupon(
  p_store_id UUID,
  p_code     TEXT
)
RETURNS TABLE (
  is_valid            BOOLEAN,
  discount_percentage INT,
  error_message      TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon RECORD;
BEGIN
  -- ── Input validation ──────────────────────────────────────────
  IF p_store_id IS NULL THEN
    RETURN QUERY SELECT false, 0, 'رقم المتجر مطلوب';
    RETURN;
  END IF;

  IF p_code IS NULL OR length(trim(p_code)) = 0 THEN
    RETURN QUERY SELECT false, 0, 'كود الكوبون مطلوب';
    RETURN;
  END IF;

  -- ── Fetch coupon ──────────────────────────────────────────────
  SELECT c.*
  INTO   v_coupon
  FROM   coupons c
  WHERE  c.store_id  = p_store_id
    AND  lower(c.code) = lower(trim(p_code));

  -- ── Coupon not found ──────────────────────────────────────────
  IF NOT FOUND THEN
    PERFORM _increment_coupon_failure(p_store_id, p_code);
    RETURN QUERY SELECT false, 0, 'الكوبون غير موجود';
    RETURN;
  END IF;

  -- ── Lockout check ─────────────────────────────────────────────
  IF v_coupon.locked_until IS NOT NULL AND v_coupon.locked_until > now() THEN
    RETURN QUERY SELECT false, 0, 'تم إيقاف محاولات استخدام الكوبون مؤقتاً';
    RETURN;
  END IF;

  -- ── Business rule checks ──────────────────────────────────────

  -- Not active
  IF NOT v_coupon.is_active THEN
    RETURN QUERY SELECT false, 0, 'هذا الكوبون غير فعال حالياً';
    RETURN;
  END IF;

  -- Expired
  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
    RETURN QUERY SELECT false, 0, 'هذا الكوبون منتهي الصلاحية';
    RETURN;
  END IF;

  -- Exceeded max uses
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN QUERY SELECT false, 0, 'هذا الكوبون وصل للحد الأقصى للاستخدام';
    RETURN;
  END IF;

  -- ── SUCCESS ───────────────────────────────────────────────────
  RETURN QUERY SELECT true, v_coupon.discount_percentage, NULL;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION validate_coupon(UUID, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION increment_coupon_usage(UUID, TEXT) TO authenticated, anon;
