-- ================================================================
-- PHASE: Coupon System Hardening (Final Production Fixes)
-- ================================================================

-- 1. Ensure schema columns exist
ALTER TABLE coupons
ADD COLUMN IF NOT EXISTS failed_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- 2. Brute-force protection helper (Internal only)
DROP FUNCTION IF EXISTS _increment_coupon_failure(UUID, TEXT);

CREATE OR REPLACE FUNCTION _increment_coupon_failure(
  p_store_id UUID,
  p_code     TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempts INT;
BEGIN
  UPDATE coupons
  SET failed_attempts = COALESCE(failed_attempts, 0) + 1
  WHERE store_id = p_store_id
    AND lower(code) = lower(trim(p_code))
  RETURNING failed_attempts INTO v_attempts;

  -- Lock for 15 mins after 5 failures
  IF v_attempts >= 5 THEN
    UPDATE coupons
    SET locked_until = now() + interval '15 minutes',
        failed_attempts = 0
    WHERE store_id = p_store_id
      AND lower(code) = lower(trim(p_code));
  END IF;
END;
$$;

-- 3. Atomic usage increment (Race-condition safe)
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
    AND lower(code) = lower(trim(p_code))
    AND (max_uses IS NULL OR current_uses < max_uses);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'COUPON_LIMIT_EXCEEDED';
  END IF;
END;
$$;

-- 4. Optimized validate_coupon
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
  -- Fetch coupon (Case-insensitive + Store isolation)
  SELECT c.*
  INTO   v_coupon
  FROM   coupons c
  WHERE  c.store_id  = p_store_id
    AND  lower(c.code) = lower(trim(p_code))
  LIMIT 1;

  -- 1. Not found
  IF NOT FOUND THEN
    PERFORM _increment_coupon_failure(p_store_id, p_code);
    RETURN QUERY SELECT false, 0, 'الكوبون غير موجود';
    RETURN;
  END IF;

  -- 2. Brute-force lockout
  IF v_coupon.locked_until IS NOT NULL AND v_coupon.locked_until > now() THEN
    RETURN QUERY SELECT false, 0, 'تم إيقاف محاولات استخدام الكوبون مؤقتاً';
    RETURN;
  END IF;

  -- 3. Not active
  IF NOT v_coupon.is_active THEN
    RETURN QUERY SELECT false, 0, 'هذا الكوبون غير فعال حالياً';
    RETURN;
  END IF;

  -- 4. Expired
  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
    RETURN QUERY SELECT false, 0, 'هذا الكوبون منتهي الصلاحية';
    RETURN;
  END IF;

  -- 5. Limit reached
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN QUERY SELECT false, 0, 'هذا الكوبون وصل للحد الأقصى للاستخدام';
    RETURN;
  END IF;

  -- Success
  RETURN QUERY SELECT true, v_coupon.discount_percentage, NULL;
END;
$$;

-- 5. Performance & Integrity Indexes
-- Case-insensitive lookup index
CREATE INDEX IF NOT EXISTS idx_coupons_code_lower
ON coupons(store_id, lower(code));

-- Multi-tenant unique constraint
-- (Drops existing to ensure correct columns if needed)
DROP INDEX IF EXISTS unique_coupon_code_per_store;
CREATE UNIQUE INDEX unique_coupon_code_per_store
ON coupons(store_id, lower(code));

-- 6. Permissions
REVOKE EXECUTE ON FUNCTION _increment_coupon_failure(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION validate_coupon(UUID, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION increment_coupon_usage(UUID, TEXT) TO authenticated, anon;
