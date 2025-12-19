-- Fix Migration Errors
-- Run this in Supabase SQL Editor to fix the current errors

-- ============================================
-- FIX 1: Users Table - Change id from UUID to TEXT
-- ============================================
-- Firebase Auth user IDs are strings, not UUIDs
-- If the table already exists with UUID, we need to recreate it

-- Step 1: Backup existing data (if any)
CREATE TABLE IF NOT EXISTS public.users_backup AS SELECT * FROM public.users;

-- Step 2: Drop the table (will lose data if not backed up)
-- Only run this if you're okay losing existing data or have backed it up
-- DROP TABLE IF EXISTS public.users CASCADE;

-- Step 3: Recreate with TEXT id
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE,
  email TEXT,
  display_name TEXT,
  username TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_data_gin ON public.users USING GIN (data);

-- Step 4: Restore data from backup (if you had data)
-- INSERT INTO public.users SELECT * FROM public.users_backup;
-- DROP TABLE public.users_backup;

-- ============================================
-- FIX 2: Coaches Table - Add missing columns
-- ============================================
ALTER TABLE public.coaches 
ADD COLUMN IF NOT EXISTS has_active_services BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- Create indexes if needed
CREATE INDEX IF NOT EXISTS idx_coaches_has_active_services ON public.coaches(has_active_services);
CREATE INDEX IF NOT EXISTS idx_coaches_is_public ON public.coaches(is_public);

