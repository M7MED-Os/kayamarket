-- 1. Add sales_count column to products if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='sales_count') THEN
        ALTER TABLE products ADD COLUMN sales_count INT DEFAULT 0;
    END IF;
END $$;

-- 2. Update the create_order_multi_v1 RPC to increment sales_count
DROP FUNCTION IF EXISTS create_order_multi_v1(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, UUID);
DROP FUNCTION IF EXISTS create_order_multi_v1(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT);

CREATE OR REPLACE FUNCTION create_order_multi_v1(
  p_items JSONB,
  p_coupon_code TEXT,
  p_customer_name TEXT,
  p_customer_address TEXT,
  p_customer_phone TEXT,
  p_payment_method TEXT,
  p_store_id UUID,
  p_idempotency_key TEXT DEFAULT NULL
) RETURNS TABLE (o_order_id UUID, o_public_token UUID, o_error_message TEXT) AS $$
DECLARE
  v_order_id UUID;
  v_token UUID := gen_random_uuid();
  v_total_price DECIMAL := 0;
  v_final_price DECIMAL := 0;
  v_discount_percent INT := 0;
  v_item RECORD;
  v_items_summary TEXT := '';
  v_rows_affected INT;
  v_coupon_valid BOOLEAN;
  v_coupon_discount INT;
BEGIN
  -- 1. Idempotency Check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id, public_token INTO v_order_id, v_token
    FROM orders 
    WHERE idempotency_key = p_idempotency_key::UUID 
    LIMIT 1;
    
    IF FOUND THEN
      RETURN QUERY SELECT v_order_id, v_token, NULL::TEXT;
      RETURN;
    END IF;
  END IF;

  -- 2. Coupon Validation (if provided)
  IF p_coupon_code IS NOT NULL AND p_coupon_code != '' THEN
    SELECT discount_percentage, 
           (is_active = true AND (expires_at IS NULL OR expires_at > now()) AND (max_uses IS NULL OR current_uses < max_uses))
    INTO v_coupon_discount, v_coupon_valid
    FROM coupons
    WHERE code = p_coupon_code AND store_id = p_store_id;

    IF v_coupon_valid THEN
      v_discount_percent := v_coupon_discount;
    ELSE
      RETURN QUERY SELECT NULL::UUID, NULL::UUID, 'كود الخصم غير صالح أو منتهي الصلاحية'::TEXT;
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
    -- Decrement stock and increment sales_count
    IF v_item.product_id IS NOT NULL THEN
      UPDATE products 
      SET stock = stock - v_item.quantity,
          sales_count = COALESCE(sales_count, 0) + v_item.quantity
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
