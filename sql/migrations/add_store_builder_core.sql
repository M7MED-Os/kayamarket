-- Add Advanced Builder Columns to store_branding table
DO $$ 
BEGIN 
    -- 1. Section Management (JSONB for flexibility)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='sections') THEN
        ALTER TABLE store_branding ADD COLUMN sections JSONB DEFAULT '[
            {"id": "announcement", "enabled": true, "type": "announcement"},
            {"id": "header", "enabled": true, "type": "header"},
            {"id": "hero", "enabled": true, "type": "hero"},
            {"id": "features", "enabled": true, "type": "features"},
            {"id": "products", "enabled": true, "type": "products"},
            {"id": "footer", "enabled": true, "type": "footer"}
        ]'::jsonb;
    END IF;

    -- 2. Header & Footer Detailed Settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='header_settings') THEN
        ALTER TABLE store_branding ADD COLUMN header_settings JSONB DEFAULT '{"layout": "left", "sticky": true, "showCart": true}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='footer_settings') THEN
        ALTER TABLE store_branding ADD COLUMN footer_settings JSONB DEFAULT '{"layout": "simple", "showSocial": true}'::jsonb;
    END IF;

    -- 3. Advanced Branding
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='secondary_color') THEN
        ALTER TABLE store_branding ADD COLUMN secondary_color TEXT DEFAULT '#f8fafc';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='font_family') THEN
        ALTER TABLE store_branding ADD COLUMN font_family TEXT DEFAULT 'Cairo';
    END IF;

END $$;
