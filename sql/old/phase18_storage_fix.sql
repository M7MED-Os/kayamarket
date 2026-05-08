-- ================================================================
-- PHASE 18: Storage Bucket Fix
-- ================================================================

-- 1. Create 'store-assets' bucket for logos and product images with proper path isolation
INSERT INTO storage.buckets (id, name, public) 
VALUES ('store-assets', 'store-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public read access to 'store-assets'
DROP POLICY IF EXISTS "Public Access store-assets" ON storage.objects;
CREATE POLICY "Public Access store-assets" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'store-assets' );

-- 3. Allow authenticated users to manage their own store assets
DROP POLICY IF EXISTS "Merchant Management store-assets" ON storage.objects;
CREATE POLICY "Merchant Management store-assets" 
ON storage.objects FOR ALL 
USING ( 
  bucket_id = 'store-assets' 
  AND (storage.foldername(name))[1] IN (
    SELECT store_id::text FROM user_roles WHERE user_id = auth.uid()
  )
)
WITH CHECK ( 
  bucket_id = 'store-assets' 
  AND (storage.foldername(name))[1] IN (
    SELECT store_id::text FROM user_roles WHERE user_id = auth.uid()
  )
);
