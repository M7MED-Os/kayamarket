-- ================================================================
-- SECTION: BUCKETS & STORAGE SECURITY
-- ================================================================

-- المخزن الموحد للصور والشعارات
INSERT INTO storage.buckets (id, name, public) 
VALUES ('store-assets', 'store-assets', true)
ON CONFLICT (id) DO NOTHING;

-- قراءة للجميع
DROP POLICY IF EXISTS "Public Access store-assets" ON storage.objects;
CREATE POLICY "Public Access store-assets" ON storage.objects FOR SELECT USING ( bucket_id = 'store-assets' );

-- التحكم بناءً على الـ UUID للمتجر كالمجلد الجذري (Folder Level Isolation)
DROP POLICY IF EXISTS "Merchant Management store-assets" ON storage.objects;
CREATE POLICY "Merchant Management store-assets" ON storage.objects FOR ALL 
USING ( 
  bucket_id = 'store-assets' AND 
  (storage.foldername(name))[1] IN (SELECT store_id::text FROM user_roles WHERE user_id = auth.uid())
)
WITH CHECK ( 
  bucket_id = 'store-assets' AND 
  (storage.foldername(name))[1] IN (SELECT store_id::text FROM user_roles WHERE user_id = auth.uid())
);
