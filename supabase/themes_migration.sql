-- Create platform_themes table
CREATE TABLE IF NOT EXISTS platform_themes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    preview_url TEXT,
    is_free BOOLEAN DEFAULT false,
    required_plan TEXT DEFAULT 'starter', -- starter, growth, pro
    is_active BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE platform_themes ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for storefronts and admin settings)
CREATE POLICY "Themes are viewable by everyone" 
ON platform_themes FOR SELECT 
USING (is_visible = true OR is_active = true);

-- Allow full access for service role / admin
CREATE POLICY "Admins have full access" 
ON platform_themes FOR ALL 
USING (true)
WITH CHECK (true);

-- Insert Initial Themes
INSERT INTO platform_themes (id, name, description, required_plan, is_free, preview_url)
VALUES 
('default', 'الافتراضي (Premium Mesh)', 'تصميم عصري بخلفيات متدرجة وتأثيرات زجاجية، مثالي للمتاجر التي تبحث عن مظهر فخم.', 'starter', true, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'),
('elegant', 'الأنيق (Minimal Elegant)', 'تصميم بسيط ونظيف يركز على المنتجات والصور الاحترافية، مناسب لمتاجر الأزياء والمجوهرات.', 'growth', false, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop'),
('floral', 'بلوم — Bloom 🌸', 'ثيم رومانسي فاخر مخصص لمتاجر الورود والهدايا. تصميم عاطفي بألوان وردية ناعمة وأشكال قوسية أنيقة.', 'growth', false, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2670&auto=format&fit=crop'),
('dark-vogue', 'دارك فوغ (Dark Vogue)', 'ثيم غامق بلمسات ذهبية يعطي طابعاً حصرياً وفخماً للمنتجات الفاخرة.', 'pro', false, 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop')
ON CONFLICT (id) DO NOTHING;
