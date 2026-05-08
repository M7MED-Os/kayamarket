-- 1. جدول المنتجات (Products)
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL,
    original_price DECIMAL DEFAULT NULL, -- السعر قبل الخصم
    image_url TEXT,
    images TEXT[] DEFAULT '{}',
    category TEXT DEFAULT 'أخرى',
    views_count INTEGER DEFAULT 0,
    stock INTEGER DEFAULT NULL, -- المخزون
    sale_end_date TIMESTAMPTZ DEFAULT NULL, -- تاريخ نهاية العرض
    is_visible BOOLEAN DEFAULT TRUE, -- إخفاء/إظهار المنتج
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول الطلبات (Orders)
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_name TEXT NOT NULL,
    product_price DECIMAL NOT NULL,
    coupon_code TEXT,
    discount_percentage INTEGER DEFAULT 0,
    final_price DECIMAL NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT NOT NULL,
    payment_method TEXT,
    status TEXT DEFAULT 'pending', -- الحالات: pending, confirmed, delivered, cancelled
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول كوبونات الخصم (Coupons)
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_percentage INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_uses INTEGER DEFAULT NULL,
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. إعدادات المتجر (Store Settings)
CREATE TABLE IF NOT EXISTS store_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    cod_enabled BOOLEAN DEFAULT TRUE,
    cod_deposit_required BOOLEAN DEFAULT FALSE,
    deposit_percentage INTEGER DEFAULT 50,
    policies TEXT
);

-- إدراج الإعدادات الافتراضية
INSERT INTO store_settings (id, cod_enabled, cod_deposit_required, deposit_percentage, policies) 
VALUES (1, true, false, 50, 'تطبق الشروط والأحكام الخاصة بالمتجر.')
ON CONFLICT (id) DO NOTHING;

-- 4. وظيفة لزيادة عداد المشاهدات (Function to increment views)
CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET views_count = views_count + 1
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- 5. إعدادات الحماية (RLS Policies - اختياري)
-- ملاحظة: هذه الإعدادات تجعل القراءة للجميع والكتابة للآدمن فقط
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Allow admin all access" ON products FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admin all access" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow public insert" ON orders FOR INSERT WITH CHECK (true); -- لكي يتمكن الزبائن من الطلب

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON coupons FOR SELECT USING (true);
CREATE POLICY "Allow admin all access" ON coupons FOR ALL USING (auth.role() = 'authenticated');


-- 1. إنشاء مخزن الصور (Create Storage Bucket)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- 2. صلاحيات القراءة للجميع (Allow Public to view images)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'product-images' );

-- 3. صلاحيات الرفع والحذف والتحكم للآدمن فقط (Allow Authenticated users to manage images)
CREATE POLICY "Admin Management" 
ON storage.objects FOR ALL 
USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' )
WITH CHECK ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );
