-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, name)
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public categories are viewable by everyone"
ON categories FOR SELECT
USING (true);

CREATE POLICY "Merchants can manage their own categories"
ON categories FOR ALL
TO authenticated
USING (store_id IN (
    SELECT store_id FROM user_roles WHERE user_id = auth.uid()
));

-- Add index
CREATE INDEX IF NOT EXISTS categories_store_id_idx ON categories(store_id);
