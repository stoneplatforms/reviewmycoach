-- Fix Users Table - Change id from UUID to TEXT
-- Run this in Supabase SQL Editor if you already created the users table

-- Drop the foreign key constraint if it exists
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Change id column type from UUID to TEXT
-- Note: This requires dropping and recreating the table if it has data
-- For existing data, you'll need to migrate it

-- Option 1: If table is empty, drop and recreate
-- DROP TABLE IF EXISTS public.users CASCADE;
-- Then run the updated CREATE TABLE from supabase-schema.sql

-- Option 2: If table has data, create a new column and migrate
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS id_new TEXT;

-- Copy data from old id (if it was UUID) or use user_id
UPDATE public.users 
SET id_new = COALESCE(user_id, id::text)
WHERE id_new IS NULL;

-- Make id_new the primary key (requires dropping old primary key first)
-- This is complex, so better to recreate the table if possible

-- For now, the migration script will handle TEXT IDs correctly
-- The main issue is the schema expects UUID but Firebase uses TEXT

