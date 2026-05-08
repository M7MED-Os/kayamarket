-- ================================================================
-- PHASE 10 — INVENTORY INTELLIGENCE
-- ================================================================

CREATE OR REPLACE FUNCTION decrement_stock_if_available(p_product_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stock INT;
BEGIN
  -- Lock the product row to prevent concurrent race conditions
  SELECT stock INTO v_stock FROM products WHERE id = p_product_id FOR UPDATE;
  
  -- If stock is NULL, it means infinite stock
  IF v_stock IS NULL THEN
    RETURN TRUE; 
  END IF;
  
  -- If stock is available, decrement it
  IF v_stock > 0 THEN
    UPDATE products SET stock = stock - 1 WHERE id = p_product_id;
    RETURN TRUE;
  END IF;
  
  -- Stock is 0 or negative
  RETURN FALSE;
END;
$$;

-- Allow anon and authenticated to call it during checkout
GRANT EXECUTE ON FUNCTION decrement_stock_if_available(UUID) TO anon, authenticated;
