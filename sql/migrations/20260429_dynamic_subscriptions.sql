-- 1. Create Subscription Plans Table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id TEXT PRIMARY KEY, -- 'starter', 'growth', 'pro'
    name TEXT NOT NULL,
    max_products INTEGER NOT NULL DEFAULT 5,
    max_images_per_product INTEGER NOT NULL DEFAULT 1,
    has_pdf_invoice BOOLEAN DEFAULT FALSE,
    has_custom_branding BOOLEAN DEFAULT FALSE,
    has_custom_domain BOOLEAN DEFAULT FALSE,
    has_advanced_analytics BOOLEAN DEFAULT FALSE,
    has_coupons BOOLEAN DEFAULT FALSE,
    can_remove_watermark BOOLEAN DEFAULT FALSE,
    price_monthly DECIMAL(10, 2) DEFAULT 0.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Populate initial data
INSERT INTO public.subscription_plans (id, name, max_products, max_images_per_product, has_pdf_invoice, has_custom_branding, has_custom_domain, has_advanced_analytics, has_coupons, can_remove_watermark, price_monthly)
VALUES 
('starter', 'Free', 5, 1, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 0.00),
('growth', 'Pro', 100, 5, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, 300.00),
('pro', 'Pro Plus', 1000, 10, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 500.00)
ON CONFLICT (id) DO UPDATE SET
    max_products = EXCLUDED.max_products,
    max_images_per_product = EXCLUDED.max_images_per_product,
    has_pdf_invoice = EXCLUDED.has_pdf_invoice,
    has_custom_branding = EXCLUDED.has_custom_branding,
    has_custom_domain = EXCLUDED.has_custom_domain,
    has_advanced_analytics = EXCLUDED.has_advanced_analytics,
    has_coupons = EXCLUDED.has_coupons,
    can_remove_watermark = EXCLUDED.can_remove_watermark;

-- 3. Create a Function to enforce product limits
CREATE OR REPLACE FUNCTION check_store_product_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_plan_id TEXT;
    v_max_products INTEGER;
    v_current_count INTEGER;
BEGIN
    -- Get store's current plan
    SELECT plan INTO v_plan_id FROM public.stores WHERE id = NEW.store_id;
    
    -- Get max products for this plan
    SELECT max_products INTO v_max_products FROM public.subscription_plans WHERE id = v_plan_id;
    
    -- Count existing products
    SELECT COUNT(*) INTO v_current_count FROM public.products WHERE store_id = NEW.store_id;
    
    IF v_current_count >= v_max_products THEN
        RAISE EXCEPTION 'LIMIT_REACHED: لقد وصلت للحد الأقصى للمنتجات المسموح به في خطتك الحالية (%)', v_max_products;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create Trigger
DROP TRIGGER IF EXISTS trg_check_product_limit ON public.products;
CREATE TRIGGER trg_check_product_limit
BEFORE INSERT ON public.products
FOR EACH ROW EXECUTE FUNCTION check_store_product_limit();

-- 5. Enable RLS and add policies for subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read plans (for pricing page and limits display)
DROP POLICY IF EXISTS "Plans are viewable by everyone" ON public.subscription_plans;
CREATE POLICY "Plans are viewable by everyone"
ON public.subscription_plans FOR SELECT
USING (true);

-- Only Super Admin can modify plans
DROP POLICY IF EXISTS "Only Super Admin can modify plans" ON public.subscription_plans;
CREATE POLICY "Only Super Admin can modify plans"
ON public.subscription_plans FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'super_admin'
    )
);
