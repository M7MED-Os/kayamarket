-- Migration: Add FAQ Data Column
-- Description: Adding faq_data JSONB column to store_branding table.

ALTER TABLE public.store_branding 
ADD COLUMN IF NOT EXISTS faq_data JSONB DEFAULT '[
    {"q": "كم يستغرق توصيل الطلب؟", "a": "يستغرق التوصيل عادةً من 2 إلى 5 أيام عمل حسب منطقتك."},
    {"q": "هل يمكنني إرجاع أو استبدال المنتج؟", "a": "نعم، يمكنك الإرجاع خلال 14 يوماً من تاريخ الاستلام."},
    {"q": "ما هي طرق الدفع المتاحة؟", "a": "نوفر الدفع عند الاستلام، والمحافظ الإلكترونية، والتحويل البنكي."},
    {"q": "كيف يمكنني تتبع طلبي؟", "a": "سيتم إرسال رابط تتبع عبر الواتساب فور تأكيد طلبك."}
]'::JSONB;

COMMENT ON COLUMN public.store_branding.faq_data IS 'JSON storage for merchant FAQ questions and answers';
