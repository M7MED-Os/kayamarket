-- ================================================================
-- SECTION: FUNCTIONS & RPCs
-- ================================================================

-- 1. التسجيل الآمن للتاجر (تم إصلاح الثغرة الأمنية)
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

    -- ربط المستخدم بالمتجر كصاحب متجر (Owner) بدلاً من merchant
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
GRANT EXECUTE ON FUNCTION register_new_merchant(TEXT, TEXT) TO authenticated;


-- 2. تتبع المحاولات الفاشلة للكوبونات (مخفية للعامة)
CREATE OR REPLACE FUNCTION _increment_coupon_failure(p_store_id UUID, p_code TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE coupons
    SET failed_attempts = failed_attempts + 1,
        locked_until = CASE WHEN failed_attempts + 1 >= 10 THEN now() + INTERVAL '15 minutes' ELSE locked_until END
    WHERE store_id = p_store_id AND lower(code) = lower(trim(p_code));
END;
$$;
REVOKE EXECUTE ON FUNCTION _increment_coupon_failure(UUID, TEXT) FROM PUBLIC;


-- 3. زيادة عدد استخدام الكوبون
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_store_id UUID, p_code TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE coupons
    SET current_uses = current_uses + 1, failed_attempts = 0, locked_until = NULL
    WHERE store_id = p_store_id AND lower(code) = lower(trim(p_code))
      AND (max_uses IS NULL OR current_uses < max_uses);
    IF NOT FOUND THEN RAISE EXCEPTION 'COUPON_LIMIT_EXCEEDED'; END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION increment_coupon_usage(UUID, TEXT) TO authenticated, anon;


-- 4. التحقق من الكوبونات
CREATE OR REPLACE FUNCTION validate_coupon(p_store_id UUID, p_code TEXT)
RETURNS TABLE (is_valid BOOLEAN, discount_percentage INT, error_message TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_coupon RECORD;
BEGIN
    SELECT * INTO v_coupon FROM coupons WHERE store_id = p_store_id AND lower(code) = lower(trim(p_code)) LIMIT 1;

    IF NOT FOUND THEN
        PERFORM _increment_coupon_failure(p_store_id, p_code);
        RETURN QUERY SELECT false, 0, 'الكوبون غير موجود'; RETURN;
    END IF;

    IF v_coupon.locked_until > now() THEN RETURN QUERY SELECT false, 0, 'تم إيقاف الكوبون مؤقتاً لمحاولات متكررة'; RETURN; END IF;
    IF NOT v_coupon.is_active THEN RETURN QUERY SELECT false, 0, 'هذا الكوبون غير فعال حالياً'; RETURN; END IF;
    IF v_coupon.expires_at < now() THEN RETURN QUERY SELECT false, 0, 'هذا الكوبون منتهي الصلاحية'; RETURN; END IF;
    IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN RETURN QUERY SELECT false, 0, 'تم استنفاد الحد الأقصى'; RETURN; END IF;

    RETURN QUERY SELECT true, v_coupon.discount_percentage, NULL::TEXT;
END;
$$;
GRANT EXECUTE ON FUNCTION validate_coupon(UUID, TEXT) TO authenticated, anon;


-- 5. إنشاء طلب بشكل ذري (تم إصلاح معالجة Idempotency)
CREATE OR REPLACE FUNCTION create_order_atomic_v2(
  p_product_id UUID, p_coupon_code TEXT, p_customer_name TEXT, p_customer_address TEXT,
  p_customer_phone TEXT, p_payment_method TEXT, p_store_id UUID, p_idempotency_key TEXT
) RETURNS TABLE (o_order_id UUID, o_public_token UUID, o_error_message TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_prod RECORD; v_discount INT := 0; v_final NUMERIC; v_id UUID; v_token UUID;
BEGIN
  -- جلب بيانات المنتج
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

  -- إنشاء الطلب (مع التقاط خطأ Idempotency)
  BEGIN
      INSERT INTO orders (
        store_id, product_id, product_name, product_price, coupon_code,
        discount_percentage, final_price, customer_name, customer_address, customer_phone, payment_method, idempotency_key
      ) VALUES (
        v_prod.store_id, p_product_id, v_prod.name, v_prod.price, p_coupon_code,
        v_discount, v_final, p_customer_name, p_customer_address, p_customer_phone, p_payment_method, p_idempotency_key::UUID
      ) RETURNING id, public_token INTO v_id, v_token;
      
      RETURN QUERY SELECT v_id, v_token, NULL::TEXT;
  EXCEPTION WHEN unique_violation THEN
      -- إذا تم إرسال الطلب بالفعل، أرجع البيانات السابقة للمستخدم بدلاً من خطأ عام
      SELECT id, public_token INTO v_id, v_token FROM orders WHERE idempotency_key = p_idempotency_key::UUID;
      RETURN QUERY SELECT v_id, v_token, NULL::TEXT;
  END;
END;
$$;
GRANT EXECUTE ON FUNCTION create_order_atomic_v2(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,UUID,TEXT) TO authenticated, anon;


-- 6. جلب الفواتير بأمان (لروابط الزوار)
CREATE OR REPLACE FUNCTION get_order_invoice(p_order_id UUID, p_token UUID)
RETURNS TABLE (
  order_id UUID, created_at TIMESTAMPTZ, status TEXT, product_name TEXT, product_price NUMERIC,
  coupon_code TEXT, discount_pct INT, final_price NUMERIC, customer_name TEXT, customer_phone TEXT,
  customer_address TEXT, payment_method TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT o.id, o.created_at, o.status, o.product_name, o.product_price,
    o.coupon_code, o.discount_percentage, o.final_price, o.customer_name, o.customer_phone,
    o.customer_address, o.payment_method
  FROM orders o WHERE o.id = p_order_id AND o.public_token = p_token AND o.created_at >= now() - INTERVAL '90 days';
END;
$$;
GRANT EXECUTE ON FUNCTION get_order_invoice(UUID, UUID) TO anon, authenticated;
