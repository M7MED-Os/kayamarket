-- Enforce unique coupon code per store (multi-tenant safety)
CREATE UNIQUE INDEX IF NOT EXISTS unique_coupon_code_per_store
ON coupons(store_id, code);
