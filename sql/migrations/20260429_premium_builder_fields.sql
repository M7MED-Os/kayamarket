-- Migration: Add Premium Store Builder Fields
-- Description: Adding specific fields for the new structured store layout.

ALTER TABLE public.store_branding 
ADD COLUMN IF NOT EXISTS hero_alignment TEXT DEFAULT 'right',
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS hero_cta_text TEXT DEFAULT 'تسوق الآن',
ADD COLUMN IF NOT EXISTS banner_overlay_opacity INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS features_data JSONB DEFAULT '[
    {"id": "shipping", "title": "شحن سريع", "desc": "توصيل آمن وسريع لكافة المناطق"},
    {"id": "quality", "title": "جودة عالية", "desc": "منتجات مختارة بعناية فائقة"},
    {"id": "speed", "title": "سرعة التنفيذ", "desc": "نجهز طلبك في وقت قياسي"},
    {"id": "service", "title": "خدمة عملاء", "desc": "دعم فني متواصل على مدار الساعة"}
]'::JSONB,
ADD COLUMN IF NOT EXISTS footer_description TEXT;

-- Update comments for clarity
COMMENT ON COLUMN public.store_branding.hero_alignment IS 'Alignment of hero text: right, center, left';
COMMENT ON COLUMN public.store_branding.features_data IS 'JSON storage for the 4 fixed store features';
