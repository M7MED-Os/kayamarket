-- Add Builder/Branding Columns to store_branding table
DO $$ 
BEGIN 
    -- 1. Hero & Banner
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='banner_url') THEN
        ALTER TABLE store_branding ADD COLUMN banner_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='show_hero') THEN
        ALTER TABLE store_branding ADD COLUMN show_hero BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='hero_title') THEN
        ALTER TABLE store_branding ADD COLUMN hero_title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='hero_description') THEN
        ALTER TABLE store_branding ADD COLUMN hero_description TEXT;
    END IF;

    -- 2. Announcement Bar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='announcement_text') THEN
        ALTER TABLE store_branding ADD COLUMN announcement_text TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='announcement_enabled') THEN
        ALTER TABLE store_branding ADD COLUMN announcement_enabled BOOLEAN DEFAULT FALSE;
    END IF;

    -- 3. Social Links
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='facebook_url') THEN
        ALTER TABLE store_branding ADD COLUMN facebook_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='instagram_url') THEN
        ALTER TABLE store_branding ADD COLUMN instagram_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='tiktok_url') THEN
        ALTER TABLE store_branding ADD COLUMN tiktok_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='youtube_url') THEN
        ALTER TABLE store_branding ADD COLUMN youtube_url TEXT;
    END IF;

END $$;
