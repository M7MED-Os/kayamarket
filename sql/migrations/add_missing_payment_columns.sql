-- 1. Fix store_settings ID based on its actual type
DO $$ 
DECLARE 
    col_type text;
BEGIN 
    SELECT data_type INTO col_type 
    FROM information_schema.columns 
    WHERE table_name = 'store_settings' AND column_name = 'id';

    IF col_type = 'integer' OR col_type = 'bigint' THEN
        CREATE SEQUENCE IF NOT EXISTS store_settings_id_seq;
        ALTER TABLE store_settings ALTER COLUMN id SET DEFAULT nextval('store_settings_id_seq');
        PERFORM setval('store_settings_id_seq', COALESCE((SELECT MAX(id) FROM store_settings), 0) + 1, false);
    ELSIF col_type = 'uuid' THEN
        ALTER TABLE store_settings ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
END $$;

-- 2. Fix store_branding ID based on its actual type
DO $$ 
DECLARE 
    col_type text;
BEGIN 
    SELECT data_type INTO col_type 
    FROM information_schema.columns 
    WHERE table_name = 'store_branding' AND column_name = 'id';

    IF col_type = 'integer' OR col_type = 'bigint' THEN
        CREATE SEQUENCE IF NOT EXISTS store_branding_id_seq;
        ALTER TABLE store_branding ALTER COLUMN id SET DEFAULT nextval('store_branding_id_seq');
        PERFORM setval('store_branding_id_seq', COALESCE((SELECT MAX(id) FROM store_branding), 0) + 1, false);
    ELSIF col_type = 'uuid' THEN
        ALTER TABLE store_branding ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
END $$;

-- 3. Add Missing Columns (WhatsApp, InstaPay, Wallet, Deposit)
DO $$ 
BEGIN 
    -- WhatsApp Phone in Stores
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stores' AND column_name='whatsapp_phone') THEN
        ALTER TABLE stores ADD COLUMN whatsapp_phone TEXT;
    END IF;

    -- Payment Info in Store Branding
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='invoice_instapay') THEN
        ALTER TABLE store_branding ADD COLUMN invoice_instapay TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_branding' AND column_name='invoice_wallet') THEN
        ALTER TABLE store_branding ADD COLUMN invoice_wallet TEXT;
    END IF;

    -- Deposit Settings in Store Settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_settings' AND column_name='cod_deposit_required') THEN
        ALTER TABLE store_settings ADD COLUMN cod_deposit_required BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_settings' AND column_name='deposit_percentage') THEN
        ALTER TABLE store_settings ADD COLUMN deposit_percentage NUMERIC DEFAULT 0;
    END IF;
END $$;
