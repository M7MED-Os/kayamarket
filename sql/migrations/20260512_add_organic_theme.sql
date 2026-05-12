-- Migration: Add Organic Theme
-- Description: Inserts the new nature-themed storefront into the platform themes catalog.

INSERT INTO platform_themes (
  id, 
  name, 
  description, 
  preview_url, 
  required_plan, 
  is_free, 
  is_active, 
  is_visible, 
  is_default
) VALUES (
  'organic',
  'الطبيعة (Organic Eco)',
  'تصميم طبيعي وهادئ يعتمد على الألوان الترابية والمنحنيات الناعمة، مثالي للمنتجات العضوية والمستدامة.',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop',
  'starter',
  true,
  true,
  true,
  false
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  preview_url = EXCLUDED.preview_url,
  required_plan = EXCLUDED.required_plan,
  is_free = EXCLUDED.is_free,
  is_active = EXCLUDED.is_active,
  is_visible = EXCLUDED.is_visible;
