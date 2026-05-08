-- Create Table for Manual Plan Upgrade Requests
CREATE TABLE IF NOT EXISTS public.plan_upgrade_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.subscription_plans(id),
    sender_phone TEXT NOT NULL,
    receipt_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.plan_upgrade_requests ENABLE ROW LEVEL SECURITY;

-- Merchants can view their own requests
CREATE POLICY "Merchants can view their own upgrade requests"
ON public.plan_upgrade_requests FOR SELECT
TO authenticated
USING (
    store_id IN (
        SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
);

-- Merchants can insert their own requests
CREATE POLICY "Merchants can submit upgrade requests"
ON public.plan_upgrade_requests FOR INSERT
TO authenticated
WITH CHECK (
    store_id IN (
        SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
);

-- Super Admin can view and update all requests
CREATE POLICY "Super Admin can manage all upgrade requests"
ON public.plan_upgrade_requests FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'super_admin'
    )
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_plan_upgrade_requests_updated_at
BEFORE UPDATE ON public.plan_upgrade_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
