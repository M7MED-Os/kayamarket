-- Enable RLS on previously unprotected tables

-- 1. order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_public_read" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id)
);
CREATE POLICY "order_items_merchant_all" ON order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM orders o 
    JOIN user_roles ur ON ur.store_id = o.store_id 
    WHERE o.id = order_items.order_id AND ur.user_id = auth.uid())
);

-- 2. product_reviews
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_insert" ON product_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_public_read_approved" ON product_reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "reviews_merchant_all" ON product_reviews FOR ALL USING (
  store_id IN (SELECT store_id FROM user_roles WHERE user_id = auth.uid())
);

-- 3. platform_settings (Read for all, update via service role only)
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platform_settings_read" ON platform_settings FOR SELECT USING (true);

-- 4. subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_public_read" ON subscription_plans FOR SELECT USING (true);

-- 5. platform_themes
ALTER TABLE platform_themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "themes_public_read" ON platform_themes FOR SELECT USING (is_active = true AND is_visible = true);

-- 6. plan_upgrade_requests
ALTER TABLE plan_upgrade_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "upgrade_requests_merchant_all" ON plan_upgrade_requests FOR ALL USING (
  store_id IN (SELECT store_id FROM user_roles WHERE user_id = auth.uid())
);

-- 7. categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_merchant_all" ON categories FOR ALL USING (
  store_id IN (SELECT store_id FROM user_roles WHERE user_id = auth.uid())
);
