-- ================================================================
-- PHASE 2 — BUSINESS LOGIC LAYER
-- Safe to run on existing DB: uses IF NOT EXISTS / guards
-- Requires: Phase 1 + Phase 3 already applied
-- ================================================================

-- ================================================================
-- SECTION 1: COUPON TABLE — ADD MISSING COLUMNS (Brute-Force Guard)
-- ================================================================

ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until    TIMESTAMPTZ;

-- Ensure store_id exists on coupons (Phase 1 backfill requirement)
-- (No-op if already present; safe guard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'coupons'
      AND column_name  = 'store_id'
  ) THEN
    ALTER TABLE coupons ADD COLUMN store_id UUID;
  END IF;
END $$;

-- Index for fast coupon lookup by store + code (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_coupons_store_code
  ON coupons (store_id, lower(code));

-- ================================================================
-- SECTION 2: ORDERS TABLE — ADD PUBLIC TOKEN + PRODUCT_ID
-- ================================================================

-- public_token: anonymous read access for invoice links
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS public_token UUID NOT NULL DEFAULT gen_random_uuid();

-- Unique index so we can look up by (id, public_token) quickly
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_public_token
  ON orders (public_token);

-- product_id: FK to products for store-isolation integrity check
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'orders'
      AND column_name  = 'product_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN product_id UUID;
  END IF;
END $$;

-- Index to speed up the integrity trigger join
CREATE INDEX IF NOT EXISTS idx_orders_product_id
  ON orders (product_id)
  WHERE product_id IS NOT NULL;

-- ================================================================
-- SECTION 3: INTERNAL HELPER — _increment_coupon_failure()
-- Called only from validate_coupon(); NOT exposed to API.
-- ================================================================

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
  v_new_attempts INT;
  v_lock_until   TIMESTAMPTZ;
BEGIN
  -- Input guards
  IF p_store_id IS NULL OR p_code IS NULL OR length(trim(p_code)) = 0 THEN
    RETURN;
  END IF;

  UPDATE coupons
  SET failed_attempts = failed_attempts + 1,
      locked_until    = CASE
                          WHEN failed_attempts + 1 >= 10
                          THEN now() + INTERVAL '15 minutes'
                          ELSE locked_until
                        END
  WHERE store_id = p_store_id
    AND lower(code) = lower(trim(p_code))
  RETURNING failed_attempts, locked_until
  INTO v_new_attempts, v_lock_until;

  -- Audit every failure; no-op if coupon row not found
  IF FOUND THEN
    INSERT INTO audit_log (event_type, store_id, details)
    VALUES (
      'coupon_failed_attempt',
      p_store_id,
      jsonb_build_object(
        'code',           lower(trim(p_code)),
        'attempts',       v_new_attempts,
        'locked_until',   v_lock_until
      )
    );
  END IF;
END;
$$;

-- Revoke direct invocation from API roles
REVOKE EXECUTE ON FUNCTION _increment_coupon_failure(UUID, TEXT)
  FROM PUBLIC, anon, authenticated;

-- ================================================================
-- SECTION 4: validate_coupon(p_store_id, p_code)
-- Returns: (is_valid BOOLEAN, discount_percentage INT)
-- ================================================================

CREATE OR REPLACE FUNCTION validate_coupon(
  p_store_id UUID,
  p_code     TEXT
)
RETURNS TABLE (
  is_valid            BOOLEAN,
  discount_percentage INT
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
    RAISE EXCEPTION 'INVALID_INPUT: store_id is required';
  END IF;

  IF p_code IS NULL OR length(trim(p_code)) = 0 THEN
    RAISE EXCEPTION 'INVALID_INPUT: coupon code is required';
  END IF;

  IF length(trim(p_code)) > 100 THEN
    RAISE EXCEPTION 'INVALID_INPUT: coupon code too long';
  END IF;

  -- ── Fetch coupon (same store only, case-insensitive match) ────
  SELECT c.*
  INTO   v_coupon
  FROM   coupons c
  WHERE  c.store_id  = p_store_id
    AND  lower(c.code) = lower(trim(p_code));

  -- ── Coupon not found ──────────────────────────────────────────
  IF NOT FOUND THEN
    -- Still call failure tracker to prevent enumeration timing attacks;
    -- it's a no-op when the row doesn't exist.
    PERFORM _increment_coupon_failure(p_store_id, p_code);
    RETURN QUERY SELECT false, 0;
    RETURN;
  END IF;

  -- ── Lockout check ─────────────────────────────────────────────
  IF v_coupon.locked_until IS NOT NULL AND v_coupon.locked_until > now() THEN
    INSERT INTO audit_log (event_type, store_id, details)
    VALUES (
      'coupon_locked_attempt',
      p_store_id,
      jsonb_build_object('code', lower(trim(p_code)), 'locked_until', v_coupon.locked_until)
    );
    RETURN QUERY SELECT false, 0;
    RETURN;
  END IF;

  -- ── Business rule checks ──────────────────────────────────────

  -- Not active
  IF NOT v_coupon.is_active THEN
    PERFORM _increment_coupon_failure(p_store_id, p_code);
    RETURN QUERY SELECT false, 0;
    RETURN;
  END IF;

  -- Expired
  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
    PERFORM _increment_coupon_failure(p_store_id, p_code);
    RETURN QUERY SELECT false, 0;
    RETURN;
  END IF;

  -- Exceeded max uses
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    PERFORM _increment_coupon_failure(p_store_id, p_code);
    RETURN QUERY SELECT false, 0;
    RETURN;
  END IF;

  -- ── SUCCESS — increment usage, reset failure counter ─────────
  UPDATE coupons
  SET current_uses    = current_uses + 1,
      failed_attempts = 0,
      locked_until    = NULL
  WHERE id = v_coupon.id;

  INSERT INTO audit_log (event_type, store_id, details)
  VALUES (
    'coupon_applied',
    p_store_id,
    jsonb_build_object(
      'coupon_id',            v_coupon.id,
      'code',                 v_coupon.code,
      'discount_percentage',  v_coupon.discount_percentage
    )
  );

  RETURN QUERY SELECT true, v_coupon.discount_percentage;
END;
$$;

-- Grant only to authenticated (merchants validate at checkout server-side)
-- anon callers may also need this in a public-storefront model — grant as needed.
GRANT EXECUTE ON FUNCTION validate_coupon(UUID, TEXT) TO authenticated, anon;

-- ================================================================
-- SECTION 5: ORDER INTEGRITY TRIGGER
-- Prevents cross-store product injection on INSERT / UPDATE
-- ================================================================

CREATE OR REPLACE FUNCTION check_order_product_store_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_product_store_id UUID;
BEGIN
  -- Only run when product_id is provided
  IF NEW.product_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Look up the product's owning store
  SELECT store_id
  INTO   v_product_store_id
  FROM   products
  WHERE  id = NEW.product_id;

  -- Product does not exist
  IF NOT FOUND THEN
    RAISE EXCEPTION 'INTEGRITY_ERROR: product % does not exist', NEW.product_id;
  END IF;

  -- Store mismatch → cross-tenant injection attempt
  IF v_product_store_id IS DISTINCT FROM NEW.store_id THEN
    INSERT INTO audit_log (event_type, store_id, details)
    VALUES (
      'cross_store_product_injection',
      NEW.store_id,
      jsonb_build_object(
        'order_store_id',   NEW.store_id,
        'product_id',       NEW.product_id,
        'product_store_id', v_product_store_id
      )
    );
    RAISE EXCEPTION 'INTEGRITY_ERROR: product does not belong to this store';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_product_store_match ON orders;
CREATE TRIGGER trg_order_product_store_match
BEFORE INSERT OR UPDATE OF product_id, store_id
ON orders
FOR EACH ROW
EXECUTE FUNCTION check_order_product_store_match();

-- ================================================================
-- SECTION 6: get_order_invoice(p_order_id, p_token)
-- Secure public invoice access — SECURITY DEFINER, 90-day window
-- ================================================================

CREATE OR REPLACE FUNCTION get_order_invoice(
  p_order_id UUID,
  p_token    UUID
)
RETURNS TABLE (
  order_id         UUID,
  created_at       TIMESTAMPTZ,
  status           TEXT,
  product_name     TEXT,
  product_price    NUMERIC,
  coupon_code      TEXT,
  discount_pct     INT,
  final_price      NUMERIC,
  customer_name    TEXT,
  customer_phone   TEXT,
  customer_address TEXT,
  payment_method   TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- ── Input validation ──────────────────────────────────────────
  IF p_order_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_INPUT: order_id is required';
  END IF;

  IF p_token IS NULL THEN
    RAISE EXCEPTION 'INVALID_INPUT: token is required';
  END IF;

  -- ── Return safe subset only ───────────────────────────────────
  -- Deliberately NOT returning: store_id, idempotency_key, product_id,
  -- internal audit fields, or anything outside the 90-day window.
  RETURN QUERY
  SELECT
    o.id                   AS order_id,
    o.created_at,
    o.status,
    o.product_name,
    o.product_price,
    o.coupon_code,
    o.discount_percentage  AS discount_pct,
    o.final_price,
    o.customer_name,
    o.customer_phone,
    o.customer_address,
    o.payment_method
  FROM orders o
  WHERE o.id           = p_order_id
    AND o.public_token = p_token
    AND o.created_at  >= now() - INTERVAL '90 days';
    -- Returns 0 rows if token mismatch OR order older than 90 days
    -- Never raises an exception — timing-safe no-op on bad input.
END;
$$;

-- Available to anon (public invoice links don't require login)
GRANT EXECUTE ON FUNCTION get_order_invoice(UUID, UUID) TO anon, authenticated;

-- ================================================================
-- SECTION 7: IDEMPOTENCY SAFETY — Verify constraint exists
-- (Phase 3 added it; this block is a defensive guard only)
-- ================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_orders_idempotency'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT uq_orders_idempotency UNIQUE (idempotency_key);
    RAISE NOTICE 'uq_orders_idempotency constraint created (was missing)';
  ELSE
    RAISE NOTICE 'uq_orders_idempotency constraint already exists — no action needed';
  END IF;
END $$;

-- Index to make idempotency lookups O(1)
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key
  ON orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ================================================================
-- SECTION 8: PERFORMANCE INDEXES
-- ================================================================

-- Coupon lockout queries
CREATE INDEX IF NOT EXISTS idx_coupons_locked_until
  ON coupons (locked_until)
  WHERE locked_until IS NOT NULL;

-- Invoice token lookups
CREATE INDEX IF NOT EXISTS idx_orders_invoice_lookup
  ON orders (id, public_token, created_at);

-- ================================================================
-- SECTION 9: VALIDATION QUERY
-- Run after applying to verify everything landed correctly.
-- ================================================================

SELECT
  obj_description(p.oid, 'pg_proc') AS description,
  n.nspname || '.' || p.proname     AS function,
  p.prosecdef                        AS is_security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'validate_coupon',
    '_increment_coupon_failure',
    'check_order_product_store_match',
    'get_order_invoice'
  )
ORDER BY p.proname;
