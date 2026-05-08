-- Migration: Add Address to Store Branding
-- Description: Adding address field to store_branding for better merchant identity control.

ALTER TABLE public.store_branding 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Update comment for clarity
COMMENT ON COLUMN public.store_branding.address IS 'Physical address of the store to be displayed in the footer';
