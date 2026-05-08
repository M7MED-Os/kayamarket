-- Migration: Add plan column to stores
-- Date: 2026-04-29

ALTER TABLE stores ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'pro'));

-- Update existing stores to 'pro' if they have a custom domain already, otherwise 'starter'
UPDATE stores SET plan = 'pro' WHERE custom_domain IS NOT NULL;
UPDATE stores SET plan = 'starter' WHERE plan IS NULL;
