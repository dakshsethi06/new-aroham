-- =========================================================================
-- AROHAM ADMIN PORTAL - ROLE BASED ACCESS CONTROL (RBAC) MIGRATION
-- =========================================================================
-- Run this script in your Supabase SQL Editor to enforce RBAC schema.

-- 1. Add 'role' column to 'admin_portal_users' if it does not already exist
ALTER TABLE admin_portal_users 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'ADMIN';

-- 2. Set Super Admin role for Niharika and Priyanshu
UPDATE admin_portal_users 
SET role = 'SUPER_ADMIN' 
WHERE mobile_number IN ('7505298939', '8000153840');

-- 3. Set all other existing admin users to ADMIN role if null
UPDATE admin_portal_users 
SET role = 'ADMIN' 
WHERE mobile_number NOT IN ('7505298939', '8000153840') OR role IS NULL;

-- 4. Add check constraint to restrict values to SUPER_ADMIN and ADMIN
ALTER TABLE admin_portal_users 
DROP CONSTRAINT IF EXISTS check_admin_user_role;

ALTER TABLE admin_portal_users 
ADD CONSTRAINT check_admin_user_role 
CHECK (role IN ('SUPER_ADMIN', 'ADMIN'));
