ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS fb_pixel_id TEXT,
ADD COLUMN IF NOT EXISTS tiktok_pixel_id TEXT,
ADD COLUMN IF NOT EXISTS google_analytics_id TEXT;
