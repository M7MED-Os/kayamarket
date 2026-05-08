-- Migration: Add Mobile Hero Visibility Toggle
-- Description: Adding a toggle to control whether the hero image is shown on mobile devices.

ALTER TABLE public.store_branding 
ADD COLUMN IF NOT EXISTS show_hero_mobile BOOLEAN DEFAULT TRUE;

-- Update comment for clarity
COMMENT ON COLUMN public.store_branding.show_hero_mobile IS 'Visibility toggle for the hero side-image on mobile viewports';
