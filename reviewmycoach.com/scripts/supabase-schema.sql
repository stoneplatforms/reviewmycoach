-- Supabase PostgreSQL Schema for ReviewMyCoach
-- Run this in Supabase SQL Editor before running migration scripts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: Row Level Security is enabled by default in Supabase
-- The ALTER DATABASE command requires superuser permissions and is not needed

-- Users table (extends Supabase auth.users)
-- Note: id is TEXT to support Firebase Auth user IDs (which are strings, not UUIDs)
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

-- Coaches table
CREATE TABLE IF NOT EXISTS public.coaches (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  user_id TEXT,
  display_name TEXT,
  email TEXT,
  phone_number TEXT,
  bio TEXT,
  sports JSONB DEFAULT '[]'::jsonb,
  specialties JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  location TEXT,
  organization TEXT,
  role TEXT,
  gender TEXT,
  age_group JSONB DEFAULT '[]'::jsonb,
  availability JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb,
  website TEXT,
  social_media JSONB DEFAULT '{}'::jsonb,
  profile_completed BOOLEAN DEFAULT FALSE,
  imported_from_pdf BOOLEAN DEFAULT FALSE,
  source_url TEXT,
  has_active_services BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  hourly_rate NUMERIC(10, 2),
  average_rating NUMERIC(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  experience INTEGER,
  profile_image TEXT,
  is_claimed BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status TEXT,
  subscription_status TEXT,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_coaches_username ON public.coaches(username);
CREATE INDEX IF NOT EXISTS idx_coaches_user_id ON public.coaches(user_id);
CREATE INDEX IF NOT EXISTS idx_coaches_email ON public.coaches(email);
CREATE INDEX IF NOT EXISTS idx_coaches_sports ON public.coaches USING GIN (sports);
CREATE INDEX IF NOT EXISTS idx_coaches_location ON public.coaches(location);
CREATE INDEX IF NOT EXISTS idx_coaches_average_rating ON public.coaches(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_coaches_subscription_status ON public.coaches(subscription_status);
CREATE INDEX IF NOT EXISTS idx_coaches_availability ON public.coaches USING GIN (availability);
CREATE INDEX IF NOT EXISTS idx_coaches_languages ON public.coaches USING GIN (languages);
CREATE INDEX IF NOT EXISTS idx_coaches_social_media ON public.coaches USING GIN (social_media);
CREATE INDEX IF NOT EXISTS idx_coaches_data_gin ON public.coaches USING GIN (data);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  coach_id TEXT REFERENCES public.coaches(id) ON DELETE CASCADE,
  coach_username TEXT,
  user_id TEXT,
  email TEXT,
  student_name TEXT,
  rating NUMERIC(2, 1) CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  sport TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_reviews_coach_id ON public.reviews(coach_id);
CREATE INDEX IF NOT EXISTS idx_reviews_coach_username ON public.reviews(coach_username);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_email ON public.reviews(email);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_data_gin ON public.reviews USING GIN (data);

-- Classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  coach_id TEXT REFERENCES public.coaches(id) ON DELETE CASCADE,
  coach_username TEXT,
  title TEXT,
  description TEXT,
  sport TEXT,
  price NUMERIC(10, 2),
  duration INTEGER,
  max_students INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_classes_coach_id ON public.classes(coach_id);
CREATE INDEX IF NOT EXISTS idx_classes_sport ON public.classes(sport);
CREATE INDEX IF NOT EXISTS idx_classes_is_active ON public.classes(is_active);
CREATE INDEX IF NOT EXISTS idx_classes_data_gin ON public.classes USING GIN (data);

-- Services table
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  coach_id TEXT REFERENCES public.coaches(id) ON DELETE CASCADE,
  coach_username TEXT,
  title TEXT,
  description TEXT,
  price NUMERIC(10, 2),
  duration INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  total_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_services_coach_id ON public.services(coach_id);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_data_gin ON public.services USING GIN (data);

-- Jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  sport TEXT,
  location TEXT,
  organization TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_sport ON public.jobs(sport);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_data_gin ON public.jobs USING GIN (data);

-- Job Applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id TEXT PRIMARY KEY,
  job_id TEXT REFERENCES public.jobs(id) ON DELETE CASCADE,
  coach_id TEXT REFERENCES public.coaches(id) ON DELETE CASCADE,
  user_id TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_coach_id ON public.job_applications(coach_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_data_gin ON public.job_applications USING GIN (data);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  coach_id TEXT REFERENCES public.coaches(id) ON DELETE CASCADE,
  user_id TEXT,
  service_id TEXT,
  class_id TEXT,
  status TEXT,
  booking_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_bookings_coach_id ON public.bookings(coach_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_data_gin ON public.bookings USING GIN (data);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  participants JSONB DEFAULT '[]'::jsonb,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations USING GIN (participants);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_data_gin ON public.conversations USING GIN (data);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id TEXT,
  receiver_id TEXT,
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_data_gin ON public.messages USING GIN (data);

-- Cards table
CREATE TABLE IF NOT EXISTS public.cards (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  image_url TEXT,
  price NUMERIC(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_cards_is_active ON public.cards(is_active);
CREATE INDEX IF NOT EXISTS idx_cards_data_gin ON public.cards USING GIN (data);

-- User Cards table
CREATE TABLE IF NOT EXISTS public.user_cards (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  card_id TEXT REFERENCES public.cards(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON public.user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_card_id ON public.user_cards(card_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_data_gin ON public.user_cards USING GIN (data);

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY,
  review_id TEXT REFERENCES public.reviews(id) ON DELETE CASCADE,
  reporter_id TEXT,
  reason TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_data_gin ON public.reports USING GIN (data);

-- Sports table
CREATE TABLE IF NOT EXISTS public.sports (
  id TEXT PRIMARY KEY,
  name TEXT,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_sports_name ON public.sports(name);
CREATE INDEX IF NOT EXISTS idx_sports_data_gin ON public.sports USING GIN (data);

-- Tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id TEXT PRIMARY KEY,
  name TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_category ON public.tags(category);
CREATE INDEX IF NOT EXISTS idx_tags_data_gin ON public.tags USING GIN (data);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  coach_id TEXT REFERENCES public.coaches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_coach_id ON public.bookmarks(coach_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_data_gin ON public.bookmarks USING GIN (data);

-- Identity Verifications table
CREATE TABLE IF NOT EXISTS public.identity_verifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_email TEXT,
  coach_username TEXT,
  status TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  review_notes TEXT,
  personal_info JSONB,
  drivers_license JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_identity_verifications_user_id ON public.identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_status ON public.identity_verifications(status);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_data_gin ON public.identity_verifications USING GIN (data);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT,
  title TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_data_gin ON public.notifications USING GIN (data);

-- Analytics table
CREATE TABLE IF NOT EXISTS public.analytics (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  coach_id TEXT,
  event_type TEXT,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_coach_id ON public.analytics(coach_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_data_gin ON public.analytics USING GIN (data);

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

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for now, tighten based on your needs)
CREATE POLICY "Public read access" ON public.coaches FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.sports FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.cards FOR SELECT USING (true);

-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid()::text = user_id);

-- Similar policies for other tables...
-- Add more restrictive policies based on your security requirements

