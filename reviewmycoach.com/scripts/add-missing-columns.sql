-- Add missing columns to existing tables
-- Run this in Supabase SQL Editor if you already created tables

-- ============================================
-- COACHES TABLE - Add missing columns
-- ============================================
ALTER TABLE public.coaches 
ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS imported_from_pdf BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS has_active_services BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_coaches_availability ON public.coaches USING GIN (availability);
CREATE INDEX IF NOT EXISTS idx_coaches_languages ON public.coaches USING GIN (languages);
CREATE INDEX IF NOT EXISTS idx_coaches_social_media ON public.coaches USING GIN (social_media);

-- ============================================
-- CREATE MISSING TABLES
-- ============================================

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  parent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_data_gin ON public.categories USING GIN (data);

-- Settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_data_gin ON public.settings USING GIN (data);

-- Verifications table (general verifications)
CREATE TABLE IF NOT EXISTS public.verifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT,
  status TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON public.verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON public.verifications(status);
CREATE INDEX IF NOT EXISTS idx_verifications_data_gin ON public.verifications USING GIN (data);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  review_id TEXT REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_comments_review_id ON public.comments(review_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_data_gin ON public.comments USING GIN (data);

-- Enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id TEXT PRIMARY KEY,
  class_id TEXT REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id TEXT,
  status TEXT,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_enrollments_class_id ON public.enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_data_gin ON public.enrollments USING GIN (data);

-- Stripe Accounts table
CREATE TABLE IF NOT EXISTS public.stripe_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  coach_id TEXT REFERENCES public.coaches(id) ON DELETE CASCADE,
  account_id TEXT UNIQUE,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_stripe_accounts_user_id ON public.stripe_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_accounts_coach_id ON public.stripe_accounts(coach_id);
CREATE INDEX IF NOT EXISTS idx_stripe_accounts_account_id ON public.stripe_accounts(account_id);
CREATE INDEX IF NOT EXISTS idx_stripe_accounts_status ON public.stripe_accounts(status);
CREATE INDEX IF NOT EXISTS idx_stripe_accounts_data_gin ON public.stripe_accounts USING GIN (data);

-- Payment Intents table
CREATE TABLE IF NOT EXISTS public.payment_intents (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  coach_id TEXT REFERENCES public.coaches(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2),
  currency TEXT DEFAULT 'usd',
  status TEXT,
  intent_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON public.payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_coach_id ON public.payment_intents(coach_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON public.payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_intent_id ON public.payment_intents(intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_data_gin ON public.payment_intents USING GIN (data);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  coach_id TEXT REFERENCES public.coaches(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  price NUMERIC(10, 2),
  duration INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_courses_coach_id ON public.courses(coach_id);
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON public.courses(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_data_gin ON public.courses USING GIN (data);

-- Admin Notifications table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id TEXT PRIMARY KEY,
  type TEXT,
  title TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON public.admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON public.admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_data_gin ON public.admin_notifications USING GIN (data);

-- Enable RLS on new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

