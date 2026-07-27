-- Aroham Database Setup Script
-- Run this script in Supabase SQL Editor: https://supabase.com/dashboard/project/lzzdfsphevmzbkkoskxb/sql

-- 1. Create Products table for admin uploaded products
CREATE TABLE IF NOT EXISTS public.products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  subtitle TEXT DEFAULT 'Vedic Energized & Authentic',
  category TEXT NOT NULL,
  purpose TEXT DEFAULT 'Sacred Harmony',
  price BIGINT NOT NULL DEFAULT 0,
  original_price BIGINT,
  rating NUMERIC(2,1) DEFAULT 5.0,
  reviews INT DEFAULT 1,
  img TEXT,
  badges JSONB DEFAULT '["Authentic", "Energized"]'::jsonb,
  short_desc TEXT,
  description TEXT,
  benefits JSONB DEFAULT '[]'::jsonb,
  use_for JSONB DEFAULT '[]'::jsonb,
  material TEXT,
  size TEXT DEFAULT 'NA',
  weight TEXT DEFAULT 'NA',
  stock INT NOT NULL DEFAULT 100,
  reserved INT NOT NULL DEFAULT 0,
  emoji TEXT DEFAULT '🕉️',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Allow public read access to products for Aroham website
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

-- 2. Add status column to existing users table if missing
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
UPDATE public.users SET status = 'ACTIVE' WHERE status IS NULL;

-- 3. Add status column to existing astrologers table if missing
ALTER TABLE public.astrologers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
UPDATE public.astrologers SET status = 'ACTIVE' WHERE status IS NULL;

-- 4. Create Admin Portal Users table
CREATE TABLE IF NOT EXISTS public.admin_portal_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile_number TEXT UNIQUE NOT NULL,
  mpin_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_portal_users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.admin_portal_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service Role full access on admin_portal_users" ON public.admin_portal_users;
CREATE POLICY "Service Role full access on admin_portal_users" ON public.admin_portal_users FOR ALL USING (true);

-- 5. Seed Admin User (Mobile: 7505298939 | MPIN: 123456 | Name: Niharika)
INSERT INTO public.admin_portal_users (mobile_number, mpin_hash, name)
VALUES ('7505298939', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Niharika')
ON CONFLICT (mobile_number) DO UPDATE SET name = 'Niharika', mpin_hash = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';
