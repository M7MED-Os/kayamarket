-- Migration: Add is_default to platform_themes
-- Description: Allows setting a default theme for new stores.

-- 1. Add is_default column
ALTER TABLE platform_themes ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- 2. Ensure only one theme is default
-- (Optional but recommended: Create a unique index for is_default where it's true)
-- CREATE UNIQUE INDEX IF NOT EXISTS unique_default_theme ON platform_themes (is_default) WHERE is_default = true;

-- 3. Set 'default' as the initial default theme if it exists
UPDATE platform_themes SET is_default = true WHERE id = 'default';
