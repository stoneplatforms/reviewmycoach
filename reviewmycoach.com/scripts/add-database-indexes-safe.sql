-- Database Indexes for Performance Optimization (Safe Version)
-- Run this in Supabase SQL Editor to improve query performance
-- This version skips pg_trgm indexes if the extension isn't available

-- Indexes for coaches table (most important for search)
CREATE INDEX IF NOT EXISTS idx_coaches_is_public ON public.coaches(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_coaches_average_rating ON public.coaches(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_coaches_total_reviews ON public.coaches(total_reviews DESC);
CREATE INDEX IF NOT EXISTS idx_coaches_hourly_rate ON public.coaches(hourly_rate);
CREATE INDEX IF NOT EXISTS idx_coaches_location ON public.coaches(location);
CREATE INDEX IF NOT EXISTS idx_coaches_gender ON public.coaches(gender);
CREATE INDEX IF NOT EXISTS idx_coaches_organization ON public.coaches(organization);
CREATE INDEX IF NOT EXISTS idx_coaches_is_verified ON public.coaches(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_coaches_created_at ON public.coaches(created_at DESC);

-- GIN indexes for array/JSONB columns (for array-contains queries)
CREATE INDEX IF NOT EXISTS idx_coaches_sports_gin ON public.coaches USING GIN(sports);
CREATE INDEX IF NOT EXISTS idx_coaches_specialties_gin ON public.coaches USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_coaches_age_group_gin ON public.coaches USING GIN(age_group);
CREATE INDEX IF NOT EXISTS idx_coaches_data_gin ON public.coaches USING GIN(data);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_coaches_public_rating ON public.coaches(is_public, average_rating DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_coaches_public_reviews ON public.coaches(is_public, total_reviews DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_coaches_location_public ON public.coaches(location, is_public) WHERE is_public = true;

-- Indexes for reviews table
CREATE INDEX IF NOT EXISTS idx_reviews_coach_id ON public.reviews(coach_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_email ON public.reviews(email);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Analyze tables to update statistics
ANALYZE public.coaches;
ANALYZE public.reviews;
ANALYZE public.users;

-- Note: Full-text search indexes (pg_trgm) are optional
-- To enable them:
-- 1. Go to Supabase Dashboard > Database > Extensions
-- 2. Enable "pg_trgm" extension
-- 3. Then run the full version: add-database-indexes.sql

