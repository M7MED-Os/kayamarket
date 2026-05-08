-- ================================================================
-- CREATE_ORDER_ATOMIC_V2 (FIXED AMBIGUITY)
-- ترانزاكشن ذري لإنشاء الطلبات، إدارة الكوبونات، وتخفيض المخزون
-- ================================================================

DROP FUNCTION IF EXISTS create_order_atomic_v2(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT);

CREATE OR REPLACE FUNCTION create_order_atomic_v2(
  p_product_id       UUID,
  p_coupon_code      TEXT,
  p_customer_name    TEXT,
  p_customer_address TEXT,
  p_customer_phone   TEXT,
  p_payment_method   TEXT,
  p_store_id         UUID,
  p_idempotency_key  TEXT
)
RETURNS TABLE (
  o_order_id      UUID,
  o_public_token  UUID,
  o_error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_name       TEXT;
  v_product_price      NUMERIC;
  v_product_store_id   UUID;
  v_product_stock      INT;
  v_discount_pct       INT := 0;
  v_final_price        NUMERIC;
  v_order_id           UUID;
  v_public_token       UUID;
  v_coupon_valid       BOOLEAN;
  v_coupon_error       TEXT;
  v_existing_order_id  UUID;
  v_existing_token     UUID;
BEGIN
  -- ── 1. التحقق من مفتاح منع التكرار (Idempotency) ────────────
  IF p_idempotency_key IS NOT NULL AND p_idempotency_key <> '' THEN
    SELECT id, public_token INTO v_existing_order_id, v_existing_token
    FROM orders
    WHERE idempotency_key = p_idempotency_key::UUID;

    IF FOUND THEN
      RETURN QUERY SELECT v_existing_order_id, v_existing_token, NULL::TEXT;
      RETURN;
    END IF;
  END IF;

  -- ── 2. جلب بيانات المنتج والتحقق من الوجود ──────────────────
  SELECT name, price, store_id, stock
  INTO   v_product_name, v_product_price, v_product_store_id, v_product_stock
  FROM   products
  WHERE  id = p_product_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, 'المنتج غير موجود'::TEXT;
    RETURN;
  END IF;

  -- ── 3. عزل البيانات (Multi-tenant check) ────────────────────
  IF p_store_id IS NOT NULL AND v_product_store_id != p_store_id THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, 'عذراً، المنتج لا ينتمي لهذا المتجر'::TEXT;
    RETURN;
  END IF;

  -- ── 4. التحقق من توفر المخزون ──────────────────────────────
  IF v_product_stock IS NOT NULL AND v_product_stock <= 0 THEN
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, 'عذراً، نفدت الكمية حالياً'::TEXT;
    RETURN;
  END IF;

  -- ── 5. معالجة الكوبون (إذا وجد) ─────────────────────────────
  v_final_price := v_product_price;

  IF p_coupon_code IS NOT NULL AND length(trim(p_coupon_code)) > 0 THEN
    -- استدعاء دالة التحقق
    SELECT is_valid, discount_percentage, error_message
    INTO   v_coupon_valid, v_discount_pct, v_coupon_error
    FROM   validate_coupon(v_product_store_id, p_coupon_code);

    IF NOT v_coupon_valid THEN
      RETURN QUERY SELECT NULL::UUID, NULL::UUID, COALESCE(v_coupon_error, 'كود الخصم غير صالح');
      RETURN;
    END IF;

    -- زيادة الاستخدام بشكل ذري
    BEGIN
      PERFORM increment_coupon_usage(v_product_store_id, p_coupon_code);
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT NULL::UUID, NULL::UUID, 'عذراً، انتهت استخدامات الكوبون للتو'::TEXT;
      RETURN;
    END;

    v_final_price := v_product_price - (v_product_price * v_discount_pct / 100);
  END IF;

  -- ── 6. تخفيض المخزون ────────────────────────────────────────
  IF v_product_stock IS NOT NULL THEN
    UPDATE products
    SET stock = stock - 1
    WHERE id = p_product_id AND stock > 0;

    IF NOT FOUND THEN
      RETURN QUERY SELECT NULL::UUID, NULL::UUID, 'عذراً، نفدت الكمية أثناء الطلب'::TEXT;
      RETURN;
    END IF;
  END IF;

  -- ── 7. إدراج الطلب ──────────────────────────────────────────
  INSERT INTO orders (
    store_id,
    product_id,
    product_name,
    product_price,
    coupon_code,
    discount_percentage,
    final_price,
    customer_name,
    customer_address,
    customer_phone,
    payment_method,
    idempotency_key
  ) VALUES (
    v_product_store_id,
    p_product_id,
    v_product_name,
    v_product_price,
    CASE WHEN v_discount_pct > 0 THEN p_coupon_code ELSE NULL END,
    v_discount_pct,
    v_final_price,
    p_customer_name,
    p_customer_address,
    p_customer_phone,
    p_payment_method,
    p_idempotency_key::UUID
  )
  RETURNING id, public_token INTO v_order_id, v_public_token;

  -- ── 8. إرجاع النتيجة ────────────────────────────────────────
  RETURN QUERY SELECT v_order_id, v_public_token, NULL::TEXT;

EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT NULL::UUID, NULL::UUID, 'حدث خطأ تقني أثناء معالجة الطلب'::TEXT;
END;
$$;

-- منح الصلاحيات
GRANT EXECUTE ON FUNCTION create_order_atomic_v2(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT) TO authenticated, anon;
