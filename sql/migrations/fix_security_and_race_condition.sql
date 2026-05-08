-- ================================================================
-- MIGRATION: Security & Race Condition Fixes
-- Run this in Supabase SQL Editor
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- FIX 1: إصلاح ثغرة تسجيل التجار (الخطورة: حرجة 🔴)
-- الدالة لا تقبل p_user_id من العميل — تستخدم auth.uid() داخلياً
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION register_new_merchant(
    p_store_name TEXT,
    p_store_slug TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_store_id UUID;
    v_caller_id UUID;
BEGIN
    -- استخدام auth.uid() الموثوق لمنع ثغرات انتحال الشخصية
    v_caller_id := auth.uid();

    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'NOT_AUTHENTICATED';
    END IF;

    -- إنشاء المتجر
    INSERT INTO stores (name, slug)
    VALUES (p_store_name, p_store_slug)
    RETURNING id INTO v_store_id;

    -- ربط المستخدم بالمتجر كصاحب متجر (Owner)
    INSERT INTO user_roles (user_id, store_id, role)
    VALUES (v_caller_id, v_store_id, 'owner');

    -- تهيئة الإعدادات
    INSERT INTO store_settings (store_id, cod_enabled, cod_deposit_required, deposit_percentage)
    VALUES (v_store_id, true, false, 50);

    -- تهيئة الهوية البصرية
    INSERT INTO store_branding (store_id, primary_color)
    VALUES (v_store_id, '#e11d48');
END;
$$;

-- إزالة أي صلاحيات قديمة للدالة التي تقبل 3 معاملات (الإصدار الثغرة)
DROP FUNCTION IF EXISTS register_new_merchant(UUID, TEXT, TEXT);

GRANT EXECUTE ON FUNCTION register_new_merchant(TEXT, TEXT) TO authenticated;


-- ────────────────────────────────────────────────────────────────
-- FIX 3: إصلاح Race Condition في إنشاء الطلبات (الخطورة: متوسطة ⚡)
-- يعتمد على INSERT + EXCEPTION بدلاً من SELECT مسبق
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION create_order_atomic_v2(
  p_product_id UUID, p_coupon_code TEXT, p_customer_name TEXT, p_customer_address TEXT,
  p_customer_phone TEXT, p_payment_method TEXT, p_store_id UUID, p_idempotency_key TEXT
) RETURNS TABLE (o_order_id UUID, o_public_token UUID, o_error_message TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_prod RECORD; v_discount INT := 0; v_final NUMERIC; v_id UUID; v_token UUID;
BEGIN
  -- جلب بيانات المنتج مع قفل للتزامن
  SELECT name, price, store_id, stock INTO v_prod FROM products WHERE id = p_product_id FOR UPDATE;
  IF NOT FOUND THEN RETURN QUERY SELECT NULL::UUID, NULL::UUID, 'المنتج غير موجود'::TEXT; RETURN; END IF;
  IF p_store_id IS NOT NULL AND v_prod.store_id != p_store_id THEN RETURN QUERY SELECT NULL::UUID, NULL::UUID, 'المنتج لا يتبع المتجر'::TEXT; RETURN; END IF;
  IF v_prod.stock IS NOT NULL AND v_prod.stock <= 0 THEN RETURN QUERY SELECT NULL::UUID, NULL::UUID, 'نفدت الكمية'::TEXT; RETURN; END IF;

  v_final := v_prod.price;

  -- معالجة الكوبون
  IF p_coupon_code IS NOT NULL AND length(trim(p_coupon_code)) > 0 THEN
    IF NOT (SELECT is_valid FROM validate_coupon(v_prod.store_id, p_coupon_code)) THEN
      RETURN QUERY SELECT NULL::UUID, NULL::UUID, 'كود الخصم غير صالح'::TEXT; RETURN;
    END IF;
    SELECT discount_percentage INTO v_discount FROM coupons WHERE store_id = v_prod.store_id AND lower(code) = lower(p_coupon_code);
    PERFORM increment_coupon_usage(v_prod.store_id, p_coupon_code);
    v_final := v_prod.price - (v_prod.price * v_discount / 100);
  END IF;

  -- تخفيض المخزون
  IF v_prod.stock IS NOT NULL THEN UPDATE products SET stock = stock - 1 WHERE id = p_product_id; END IF;

  -- محاولة INSERT مباشرة — إذا تكرر المفتاح (Race Condition)، نُرجع الطلب الموجود
  BEGIN
    INSERT INTO orders (
      store_id, product_id, product_name, product_price, coupon_code,
      discount_percentage, final_price, customer_name, customer_address,
      customer_phone, payment_method, idempotency_key
    ) VALUES (
      v_prod.store_id, p_product_id, v_prod.name, v_prod.price, p_coupon_code,
      v_discount, v_final, p_customer_name, p_customer_address,
      p_customer_phone, p_payment_method, p_idempotency_key::UUID
    ) RETURNING id, public_token INTO v_id, v_token;

    RETURN QUERY SELECT v_id, v_token, NULL::TEXT;

  EXCEPTION WHEN unique_violation THEN
    -- الطلب أُرسل مسبقاً — أرجع البيانات السابقة بنجاح بدلاً من خطأ عام
    SELECT id, public_token INTO v_id, v_token
    FROM orders
    WHERE idempotency_key = p_idempotency_key::UUID
    LIMIT 1;
    RETURN QUERY SELECT v_id, v_token, NULL::TEXT;
  END;
END;
$$;

GRANT EXECUTE ON FUNCTION create_order_atomic_v2(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,UUID,TEXT) TO authenticated, anon;
