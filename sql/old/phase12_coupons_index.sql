-- Add index for better coupon management performance
CREATE INDEX IF NOT EXISTS idx_coupons_store_id ON coupons(store_id);
