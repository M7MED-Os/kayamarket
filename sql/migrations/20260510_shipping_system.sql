-- Migration: Add Shipping Infrastructure
-- Created: 2026-05-10

-- 1. Add shipping config to branding
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS shipping_config JSONB DEFAULT '{"type": "flat", "flat_rate": 0, "governorates": {}}'::jsonb;

-- 2. Add shipping cost to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL DEFAULT 0;

-- 3. Update create_order_multi_v1 to handle shipping cost
-- Note: We update the existing function to avoid breaking changes if it's already in use, 
-- or we can create v2. Let's create v2 for safety but the user asked to update themes.
-- Actually, let's just add the column and update the total price calculation.

CREATE OR REPLACE FUNCTION create_order_multi_v2(
  p_items JSONB,
  p_coupon_code TEXT,
  p_customer_name TEXT,
  p_customer_address TEXT,
  p_customer_phone TEXT,
  p_payment_method TEXT,
  p_store_id UUID,
  p_shipping_cost DECIMAL DEFAULT 0,
  p_idempotency_key TEXT DEFAULT NULL
) RETURNS TABLE(o_order_id UUID, o_public_token UUID, o_error_message TEXT) AS $$
DECLARE
  v_order_id UUID;
  v_token UUID := gen_random_uuid();
  v_total_price DECIMAL := 0;
  v_discount_percent INTEGER := 0;
  v_final_price DECIMAL;
  v_item RECORD;
  v_items_summary TEXT := '';
  v_rows_affected INT;
BEGIN
  -- 1. Idempotency Check
  IF p_idempotency_key IS NOT NULL AND p_idempotency_key <> '' THEN
    SELECT id, public_token INTO v_order_id, v_token FROM orders WHERE idempotency_key = p_idempotency_key::UUID;
    IF FOUND THEN
      RETURN QUERY SELECT v_order_id, v_token, NULL::TEXT;
      RETURN;
    END IF;
  END IF;

  -- 2. Validate and Apply Coupon
  IF p_coupon_code IS NOT NULL AND p_coupon_code <> '' THEN
    SELECT discount_percentage INTO v_discount_percent FROM coupons 
    WHERE code = p_coupon_code 
      AND store_id = p_store_id 
      AND is_active = true 
      AND (expires_at IS NULL OR expires_at > NOW())
      AND (max_uses IS NULL OR current_uses < max_uses)
    FOR UPDATE;
    
    IF NOT FOUND THEN
      RETURN QUERY SELECT NULL::UUID, NULL::UUID, 'كود الخصم غير صحيح، منتهي، أو تجاوز الحد الأقصى للاستخدام'::TEXT;
      RETURN;
    END IF;

    UPDATE coupons 
    SET current_uses = current_uses + 1 
    WHERE code = p_coupon_code AND store_id = p_store_id;
  END IF;

  -- 3. Insert Order Base
  INSERT INTO orders (
    customer_name, customer_address, customer_phone, payment_method, 
    store_id, public_token, idempotency_key, coupon_code, discount_percentage,
    status, product_name, product_price, final_price, shipping_cost
  ) VALUES (
    p_customer_name, p_customer_address, p_customer_phone, p_payment_method,
    p_store_id, v_token, p_idempotency_key::UUID, p_coupon_code, v_discount_percent,
    'pending', 'طلب متعدد المنتجات', 0, 0, p_shipping_cost
  ) RETURNING id INTO v_order_id;

  -- 4. Process Items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT, name TEXT, price DECIMAL) LOOP
    IF v_item.product_id IS NOT NULL THEN
      UPDATE products SET stock = stock - v_item.quantity 
      WHERE id = v_item.product_id AND (stock IS NULL OR stock >= v_item.quantity);
      
      GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
      IF v_rows_affected = 0 THEN
        RAISE EXCEPTION 'OUT_OF_STOCK: %', v_item.name;
      END IF;
    END IF;

    INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity)
    VALUES (v_order_id, v_item.product_id, v_item.name, v_item.price, v_item.quantity);

    IF v_items_summary = '' THEN
      v_items_summary := v_item.name;
    ELSE
      v_items_summary := v_items_summary || '، ' || v_item.name;
    END IF;

    v_total_price := v_total_price + (v_item.price * v_item.quantity);
  END LOOP;

  -- 5. Finalize Price (Discount applies to subtotal, then add shipping)
  v_final_price := (v_total_price - (v_total_price * v_discount_percent / 100)) + p_shipping_cost;
  
  UPDATE orders SET 
    product_price = v_total_price,
    final_price = v_final_price,
    product_name = substring(v_items_summary from 1 for 255)
  WHERE id = v_order_id;

  RETURN QUERY SELECT v_order_id, v_token, NULL::TEXT;

EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT NULL::UUID, NULL::UUID, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update Invoice RPC to include shipping_cost and config
CREATE OR REPLACE FUNCTION get_order_invoice_v3(p_order_id UUID, p_token UUID DEFAULT NULL)
RETURNS TABLE (
  order_id UUID, created_at TIMESTAMPTZ, status TEXT, product_name TEXT, product_price NUMERIC,
  coupon_code TEXT, discount_pct INT, final_price NUMERIC, shipping_cost NUMERIC, customer_name TEXT, customer_phone TEXT,
  customer_address TEXT, payment_method TEXT, store_id UUID,
  items JSONB,
  store_name TEXT, logo_url TEXT, tagline TEXT, primary_color TEXT, instapay TEXT, wallet TEXT, whatsapp TEXT,
  cod_deposit_required BOOLEAN, deposit_percentage INT, policies TEXT, store_plan TEXT, store_slug TEXT,
  shipping_config JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT 
    o.id, o.created_at, o.status, o.product_name, o.product_price,
    o.coupon_code, o.discount_percentage, o.final_price, o.shipping_cost, o.customer_name, o.customer_phone,
    o.customer_address, o.payment_method, o.store_id,
    (SELECT jsonb_agg(jsonb_build_object(
      'id', oi.id,
      'product_name', oi.product_name,
      'product_price', oi.product_price,
      'quantity', oi.quantity
    )) FROM order_items oi WHERE oi.order_id = o.id),
    s.name, b.logo_url, b.tagline, b.primary_color, b.invoice_instapay, b.invoice_wallet, s.whatsapp_phone,
    st.cod_deposit_required, st.deposit_percentage, st.policies, s.plan, s.slug,
    b.shipping_config
  FROM orders o 
  JOIN stores s ON s.id = o.store_id
  LEFT JOIN store_branding b ON b.store_id = s.id
  LEFT JOIN store_settings st ON st.store_id = s.id
  WHERE o.id = p_order_id 
    AND (
      (p_token IS NOT NULL AND o.public_token = p_token) 
      OR 
      (auth.uid() = s.user_id) 
    );
END;
$$;

GRANT EXECUTE ON FUNCTION create_order_multi_v2(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, DECIMAL, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_order_invoice_v3(UUID, UUID) TO anon, authenticated;
