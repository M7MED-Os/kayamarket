-- ================================================================
-- PHASE 11 — MERCHANT REGISTRATION HELPER
-- ================================================================

CREATE OR REPLACE FUNCTION register_new_merchant(
  p_user_id UUID,
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
BEGIN
  -- 1. Create the store
  INSERT INTO stores (name, slug)
  VALUES (p_store_name, p_store_slug)
  RETURNING id INTO v_store_id;

  -- 2. Link user to store as merchant
  INSERT INTO user_roles (user_id, store_id, role)
  VALUES (p_user_id, v_store_id, 'merchant');

  -- 3. Initialize default settings for the new store
  INSERT INTO store_settings (store_id, cod_enabled, cod_deposit_required, deposit_percentage)
  VALUES (v_store_id, true, false, 50);

  -- 4. Initialize default branding
  INSERT INTO store_branding (store_id, primary_color)
  VALUES (v_store_id, '#e11d48');
END;
$$;

-- Grant access to authenticated users (they just signed up)
GRANT EXECUTE ON FUNCTION register_new_merchant(UUID, TEXT, TEXT) TO authenticated;
