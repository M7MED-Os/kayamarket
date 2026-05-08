-- Migration: Add super_admin role and allow NULL store_id for it
-- Date: 2026-04-29

-- 1. Drop existing check constraint
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- 2. Add new check constraint including super_admin
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('owner', 'admin', 'merchant', 'staff', 'super_admin'));

-- 3. Make store_id nullable (Super Admin doesn't belong to one store)
ALTER TABLE user_roles ALTER COLUMN store_id DROP NOT NULL;

-- 4. Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_super_admin ON user_roles (user_id) WHERE role = 'super_admin';
