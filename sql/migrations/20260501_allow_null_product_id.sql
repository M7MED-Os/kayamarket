-- Migration: Make product_id nullable in product_reviews to support Store Reviews
ALTER TABLE product_reviews ALTER COLUMN product_id DROP NOT NULL;
