-- Migration: Analytics Views and Functions
-- Adds necessary DB layers for the visual analytics feature.

-- 1. Add 'views_count' to stores to track page visits
ALTER TABLE stores ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0;

-- 2. Function to increment store views atomically
CREATE OR REPLACE FUNCTION increment_store_views(p_store_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE stores SET views_count = COALESCE(views_count, 0) + 1 WHERE id = p_store_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to get store daily sales over a period
CREATE OR REPLACE FUNCTION get_store_daily_sales(p_store_id UUID, p_days INT) 
RETURNS TABLE(sale_date DATE, orders_count BIGINT, total_revenue NUMERIC) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (p_days - 1) * INTERVAL '1 day',
      CURRENT_DATE,
      INTERVAL '1 day'
    )::DATE AS d_date
  )
  SELECT 
    ds.d_date AS sale_date,
    COUNT(o.id) AS orders_count,
    COALESCE(SUM(o.final_price), 0) AS total_revenue
  FROM date_series ds
  LEFT JOIN orders o 
    ON DATE(o.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Cairo') = ds.d_date 
    AND o.store_id = p_store_id
    AND o.status NOT IN ('cancelled', 'refunded', 'failed')
  GROUP BY ds.d_date
  ORDER BY ds.d_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to get top selling products for a store
CREATE OR REPLACE FUNCTION get_top_products(p_store_id UUID, p_limit INT DEFAULT 5)
RETURNS TABLE(product_id UUID, product_name TEXT, total_sales NUMERIC, orders_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oi.product_id,
    MAX(oi.product_name) AS product_name,
    SUM(oi.product_price * oi.quantity) AS total_sales,
    SUM(oi.quantity)::BIGINT AS orders_count
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE o.store_id = p_store_id 
    AND o.status NOT IN ('cancelled', 'refunded', 'failed')
    AND oi.product_id IS NOT NULL
  GROUP BY oi.product_id
  ORDER BY total_sales DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to get basic KPIs (Total Revenue, Total Orders, Total Views)
CREATE OR REPLACE FUNCTION get_store_kpis(p_store_id UUID)
RETURNS TABLE(total_revenue NUMERIC, total_orders BIGINT, total_views INT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(o.final_price), 0) AS total_revenue,
    COUNT(o.id) AS total_orders,
    (SELECT COALESCE(views_count, 0) FROM stores WHERE id = p_store_id LIMIT 1) AS total_views
  FROM orders o
  WHERE o.store_id = p_store_id
    AND o.status NOT IN ('cancelled', 'refunded', 'failed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
