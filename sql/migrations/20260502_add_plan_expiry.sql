-- Add plan_expires_at to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN public.stores.plan_expires_at IS 'When the current subscription plan expires. NULL means indefinite (usually for starter/free).';
