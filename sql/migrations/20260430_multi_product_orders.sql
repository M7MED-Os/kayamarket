-- Migration: Multi-product orders support
-- Created: 2026-04-30

-- 1. Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add payment fields to store_branding if they don't exist
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS invoice_instapay TEXT;
ALTER TABLE store_branding ADD COLUMN IF NOT EXISTS invoice_wallet TEXT;

-- 2. Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 3. Security Policies
DROP POLICY IF EXISTS "Allow public read items" ON order_items;
CREATE POLICY "Allow public read items" ON order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow merchants to manage their order items" ON order_items;
CREATE POLICY "Allow merchants to manage their order items" ON order_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.store_id IN (
      SELECT store_id FROM user_roles WHERE user_id = auth.uid()
    )
  )
);

-- 4. Atomic Multi-product Order Function
CREATE OR REPLACE FUNCTION create_order_multi_v1(
  p_items JSONB, -- Array of {product_id, quantity, name, price}
  p_coupon_code TEXT,
  p_customer_name TEXT,
  p_customer_address TEXT,
  p_customer_phone TEXT,
  p_payment_method TEXT,
  p_store_id UUID,
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

  -- 2. Validate and Apply Coupon (if provided)
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

    -- Increment usage counter
    UPDATE coupons 
    SET current_uses = current_uses + 1 
    WHERE code = p_coupon_code AND store_id = p_store_id;
  END IF;

  -- 3. Insert Order Base
  INSERT INTO orders (
    customer_name, customer_address, customer_phone, payment_method, 
    store_id, public_token, idempotency_key, coupon_code, discount_percentage,
    status, product_name, product_price, final_price
  ) VALUES (
    p_customer_name, p_customer_address, p_customer_phone, p_payment_method,
    p_store_id, v_token, p_idempotency_key::UUID, p_coupon_code, v_discount_percent,
    'pending', 'طلب متعدد المنتجات', 0, 0
  ) RETURNING id INTO v_order_id;

  -- 4. Process Items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT, name TEXT, price DECIMAL) LOOP
    -- Decrement stock (if product exists)
    IF v_item.product_id IS NOT NULL THEN
      UPDATE products SET stock = stock - v_item.quantity 
      WHERE id = v_item.product_id AND (stock IS NULL OR stock >= v_item.quantity);
      
      GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
      IF v_rows_affected = 0 THEN
        RAISE EXCEPTION 'OUT_OF_STOCK: %', v_item.name;
      END IF;
    END IF;

    -- Insert item record
    INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity)
    VALUES (v_order_id, v_item.product_id, v_item.name, v_item.price, v_item.quantity);

    IF v_items_summary = '' THEN
      v_items_summary := v_item.name;
    ELSE
      v_items_summary := v_items_summary || '، ' || v_item.name;
    END IF;

    v_total_price := v_total_price + (v_item.price * v_item.quantity);
  END LOOP;

  -- 5. Finalize Price and Summary
  v_final_price := v_total_price - (v_total_price * v_discount_percent / 100);
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

-- 5. Updated Invoice RPC to include items and store details
-- Allows access by Token OR by being the Store Owner
DROP FUNCTION IF EXISTS get_order_invoice_v2(UUID, UUID);
CREATE OR REPLACE FUNCTION get_order_invoice_v2(p_order_id UUID, p_token UUID DEFAULT NULL)
RETURNS TABLE (
  order_id UUID, created_at TIMESTAMPTZ, status TEXT, product_name TEXT, product_price NUMERIC,
  coupon_code TEXT, discount_pct INT, final_price NUMERIC, customer_name TEXT, customer_phone TEXT,
  customer_address TEXT, payment_method TEXT, store_id UUID,
  items JSONB,
  store_name TEXT, logo_url TEXT, tagline TEXT, primary_color TEXT, instapay TEXT, wallet TEXT, whatsapp TEXT,
  cod_deposit_required BOOLEAN, deposit_percentage INT, policies TEXT, store_plan TEXT, store_slug TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT 
    o.id, o.created_at, o.status, o.product_name, o.product_price,
    o.coupon_code, o.discount_percentage, o.final_price, o.customer_name, o.customer_phone,
    o.customer_address, o.payment_method, o.store_id,
    (SELECT jsonb_agg(jsonb_build_object(
      'id', oi.id,
      'product_name', oi.product_name,
      'product_price', oi.product_price,
      'quantity', oi.quantity
    )) FROM order_items oi WHERE oi.order_id = o.id),
    s.name, b.logo_url, b.tagline, b.primary_color, b.invoice_instapay, b.invoice_wallet, s.whatsapp_phone,
    st.cod_deposit_required, st.deposit_percentage, st.policies, s.plan, s.slug
  FROM orders o 
  JOIN stores s ON s.id = o.store_id
  LEFT JOIN store_branding b ON b.store_id = s.id
  LEFT JOIN store_settings st ON st.store_id = s.id
  WHERE o.id = p_order_id 
    AND (
      (p_token IS NOT NULL AND o.public_token = p_token) -- Customer access
      OR 
      (auth.uid() = s.user_id) -- Merchant/Owner access
      OR
      (p_token IS NULL AND o.public_token IS NULL) -- Fallback for legacy
    );
END;
$$;

-- Critical Fix: Ensure every order has a token if missing
-- This fixes the "token=null" problem for older orders
DO $$
BEGIN
    UPDATE orders SET public_token = gen_random_uuid() WHERE public_token IS NULL;
END $$;

GRANT EXECUTE ON FUNCTION get_order_invoice_v2(UUID, UUID) TO anon, authenticated;
