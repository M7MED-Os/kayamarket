ALTER TABLE products 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- تحديث المنتجات الحالية بـ slug مبدئي بناءً على المعرف (ID) لتجنب القيم الفارغة
UPDATE products SET slug = id::text WHERE slug IS NULL;

-- جعل الحقل فريداً لكل متجر (اختياري ولكن يفضل للـ SEO)
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(store_id, slug);
