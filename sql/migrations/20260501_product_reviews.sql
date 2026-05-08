-- Migration: Product Reviews and Ratings System
-- Created: 2026-05-01

-- 1. Create product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_product_reviews_store_id ON product_reviews(store_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_status ON product_reviews(status);

-- 3. Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Public can read ONLY approved reviews for a product
DROP POLICY IF EXISTS "Allow public read approved reviews" ON product_reviews;
CREATE POLICY "Allow public read approved reviews" ON product_reviews
FOR SELECT
USING (status = 'approved');

-- Public can insert new reviews (they default to pending)
DROP POLICY IF EXISTS "Allow public insert reviews" ON product_reviews;
CREATE POLICY "Allow public insert reviews" ON product_reviews
FOR INSERT
WITH CHECK (
  status = 'pending' -- Force new reviews to be pending
);

-- Merchants can manage reviews for their own store
DROP POLICY IF EXISTS "Allow merchants to manage their store reviews" ON product_reviews;
CREATE POLICY "Allow merchants to manage their store reviews" ON product_reviews
FOR ALL
USING (
  store_id IN (
    SELECT store_id FROM user_roles WHERE user_id = auth.uid()
  )
);

-- 5. RPC to get aggregate ratings (average & count)
-- This is more efficient than fetching all reviews and calculating on the client
CREATE OR REPLACE FUNCTION get_product_rating(p_product_id UUID)
RETURNS TABLE (average_rating NUMERIC, total_reviews BIGINT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ROUND(AVG(rating)::NUMERIC, 1), 0.0) AS average_rating,
    COUNT(*) AS total_reviews
  FROM product_reviews
  WHERE product_id = p_product_id AND status = 'approved';
END;
$$;

GRANT EXECUTE ON FUNCTION get_product_rating(UUID) TO anon, authenticated;
