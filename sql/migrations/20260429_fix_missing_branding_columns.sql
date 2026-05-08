-- Migration: Add missing branding and identity columns
-- Date: 2026-04-29

DO $$ 
BEGIN 
    -- 1. Missing Visual Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='favicon_url') THEN
        ALTER TABLE store_branding ADD COLUMN favicon_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='secondary_color') THEN
        ALTER TABLE store_branding ADD COLUMN secondary_color TEXT DEFAULT '#f8fafc';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='font_family') THEN
        ALTER TABLE store_branding ADD COLUMN font_family TEXT DEFAULT 'Cairo';
    END IF;

    -- 2. Missing Builder Config Columns (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='sections') THEN
        ALTER TABLE store_branding ADD COLUMN sections JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='header_settings') THEN
        ALTER TABLE store_branding ADD COLUMN header_settings JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='footer_settings') THEN
        ALTER TABLE store_branding ADD COLUMN footer_settings JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- 3. Invoice / Payment Identity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='invoice_instapay') THEN
        ALTER TABLE store_branding ADD COLUMN invoice_instapay TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='invoice_wallet') THEN
        ALTER TABLE store_branding ADD COLUMN invoice_wallet TEXT;
    END IF;

    -- 4. Identity / WhatsApp Phone (in stores table if missing, though it should be there)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stores' AND column_name='whatsapp_phone') THEN
        ALTER TABLE stores ADD COLUMN whatsapp_phone TEXT;
    END IF;

END $$;
