-- Fix existing HTML entities in the categories table
UPDATE categories
SET name = REPLACE(name, '&amp;', '&');

-- Fix existing HTML entities in the products table
UPDATE products
SET 
  name = REPLACE(name, '&amp;', '&'),
  category = REPLACE(category, '&amp;', '&'),
  description = REPLACE(description, '&amp;', '&');

-- Fix existing HTML entities in store_branding
UPDATE store_branding
SET 
  hero_title = REPLACE(hero_title, '&amp;', '&'),
  hero_description = REPLACE(hero_description, '&amp;', '&'),
  announcement_text = REPLACE(announcement_text, '&amp;', '&');
