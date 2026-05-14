-- 1. Fix existing HTML entities in the products table first
UPDATE products
SET 
  name = REPLACE(name, '&amp;', '&'),
  category = REPLACE(category, '&amp;', '&'),
  description = REPLACE(description, '&amp;', '&')
WHERE name LIKE '%&amp;%' OR category LIKE '%&amp;%' OR description LIKE '%&amp;%';

-- 2. Fix existing HTML entities in store_branding
UPDATE store_branding
SET 
  hero_title = REPLACE(hero_title, '&amp;', '&'),
  hero_description = REPLACE(hero_description, '&amp;', '&'),
  announcement_text = REPLACE(announcement_text, '&amp;', '&')
WHERE hero_title LIKE '%&amp;%' OR hero_description LIKE '%&amp;%' OR announcement_text LIKE '%&amp;%';

-- 3. Delete the malformed categories (since the correct ones already exist and products are now linked to them)
DELETE FROM categories
WHERE name LIKE '%&amp;%';
