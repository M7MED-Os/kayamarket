-- ================================================================
-- SECTION: TRIGGERS
-- ================================================================

-- 1. منع ترقية دور إلى Owner بشكل غير مصرح به
CREATE OR REPLACE FUNCTION block_owner_escalation() RETURNS trigger AS $$
BEGIN
  IF NEW.role = 'owner' AND OLD.role <> 'owner' THEN RAISE EXCEPTION 'ROLE_ESCALATION_BLOCKED'; END IF;
  IF OLD.role = 'owner' AND NEW.role <> 'owner' THEN RAISE EXCEPTION 'OWNER_DEMOTION_BLOCKED'; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_owner_escalation ON user_roles;
CREATE TRIGGER trg_block_owner_escalation BEFORE UPDATE ON user_roles
FOR EACH ROW EXECUTE FUNCTION block_owner_escalation();

-- 2. التحقق من تطابق المتجر للطلبات (منع الحقن العابر للمتاجر)
CREATE OR REPLACE FUNCTION check_order_product_store_match() RETURNS TRIGGER AS $$
DECLARE v_product_store_id UUID;
BEGIN
  IF NEW.product_id IS NULL THEN RETURN NEW; END IF;
  SELECT store_id INTO v_product_store_id FROM products WHERE id = NEW.product_id;
  IF v_product_store_id IS DISTINCT FROM NEW.store_id THEN
    RAISE EXCEPTION 'INTEGRITY_ERROR: product does not belong to this store';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_product_store_match ON orders;
CREATE TRIGGER trg_order_product_store_match BEFORE INSERT OR UPDATE OF product_id, store_id
ON orders FOR EACH ROW EXECUTE FUNCTION check_order_product_store_match();

-- 3. الحد من معدل إرسال الطلبات (Rate Limiter - للحماية من السبام)
CREATE OR REPLACE FUNCTION check_order_insert_rate() RETURNS trigger AS $$
DECLARE v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM orders WHERE store_id = NEW.store_id AND created_at >= now() - INTERVAL '60 seconds';
  IF v_count >= 30 THEN RAISE EXCEPTION 'RATE_LIMIT_EXCEEDED'; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_rate_limit ON orders;
CREATE TRIGGER trg_order_rate_limit BEFORE INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION check_order_insert_rate();
