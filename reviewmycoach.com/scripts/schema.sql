-- PostgreSQL Schema for ReviewMyCoach
-- This schema is auto-created by the migration script, but you can use this as reference

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  email VARCHAR(255),
  display_name VARCHAR(255),
  username VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role VARCHAR(50),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_data_gin ON users USING GIN (data);

-- Coaches table
CREATE TABLE IF NOT EXISTS coaches (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255),
  user_id VARCHAR(255),
  display_name VARCHAR(255),
  email VARCHAR(255),
  phone_number VARCHAR(50),
  bio TEXT,
  sports JSONB,
  specialties JSONB,
  certifications JSONB,
  location VARCHAR(255),
  organization VARCHAR(255),
  role VARCHAR(255),
  gender VARCHAR(50),
  age_group JSONB,
  hourly_rate NUMERIC(10, 2),
  average_rating NUMERIC(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  experience INTEGER,
  profile_image VARCHAR(500),
  is_claimed BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(50),
  subscription_status VARCHAR(50),
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_coaches_username ON coaches(username);
CREATE INDEX IF NOT EXISTS idx_coaches_user_id ON coaches(user_id);
CREATE INDEX IF NOT EXISTS idx_coaches_email ON coaches(email);
CREATE INDEX IF NOT EXISTS idx_coaches_sports ON coaches USING GIN (sports);
CREATE INDEX IF NOT EXISTS idx_coaches_location ON coaches(location);
CREATE INDEX IF NOT EXISTS idx_coaches_average_rating ON coaches(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_coaches_subscription_status ON coaches(subscription_status);
CREATE INDEX IF NOT EXISTS idx_coaches_data_gin ON coaches USING GIN (data);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(255) PRIMARY KEY,
  coach_id VARCHAR(255),
  coach_username VARCHAR(255),
  user_id VARCHAR(255),
  email VARCHAR(255),
  student_name VARCHAR(255),
  rating NUMERIC(2, 1),
  review_text TEXT,
  sport VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_reviews_coach_id ON reviews(coach_id);
CREATE INDEX IF NOT EXISTS idx_reviews_coach_username ON reviews(coach_username);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_email ON reviews(email);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_data_gin ON reviews USING GIN (data);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id VARCHAR(255) PRIMARY KEY,
  coach_id VARCHAR(255),
  coach_username VARCHAR(255),
  title VARCHAR(255),
  description TEXT,
  sport VARCHAR(100),
  price NUMERIC(10, 2),
  duration INTEGER,
  max_students INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_classes_coach_id ON classes(coach_id);
CREATE INDEX IF NOT EXISTS idx_classes_sport ON classes(sport);
CREATE INDEX IF NOT EXISTS idx_classes_is_active ON classes(is_active);
CREATE INDEX IF NOT EXISTS idx_classes_data_gin ON classes USING GIN (data);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(255) PRIMARY KEY,
  coach_id VARCHAR(255),
  coach_username VARCHAR(255),
  title VARCHAR(255),
  description TEXT,
  price NUMERIC(10, 2),
  duration INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  total_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_services_coach_id ON services(coach_id);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_data_gin ON services USING GIN (data);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  sport VARCHAR(100),
  location VARCHAR(255),
  organization VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_sport ON jobs(sport);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_data_gin ON jobs USING GIN (data);

-- Job Applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id VARCHAR(255) PRIMARY KEY,
  job_id VARCHAR(255),
  coach_id VARCHAR(255),
  user_id VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_coach_id ON job_applications(coach_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_data_gin ON job_applications USING GIN (data);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(255) PRIMARY KEY,
  coach_id VARCHAR(255),
  user_id VARCHAR(255),
  service_id VARCHAR(255),
  class_id VARCHAR(255),
  status VARCHAR(50),
  booking_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_bookings_coach_id ON bookings(coach_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_data_gin ON bookings USING GIN (data);

-- Messages/Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(255) PRIMARY KEY,
  participants JSONB,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN (participants);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_data_gin ON conversations USING GIN (data);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(255) PRIMARY KEY,
  conversation_id VARCHAR(255),
  sender_id VARCHAR(255),
  receiver_id VARCHAR(255),
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_data_gin ON messages USING GIN (data);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500),
  price NUMERIC(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_cards_is_active ON cards(is_active);
CREATE INDEX IF NOT EXISTS idx_cards_data_gin ON cards USING GIN (data);

-- User Cards table
CREATE TABLE IF NOT EXISTS user_cards (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  card_id VARCHAR(255),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_card_id ON user_cards(card_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_data_gin ON user_cards USING GIN (data);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(255) PRIMARY KEY,
  review_id VARCHAR(255),
  reporter_id VARCHAR(255),
  reason TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_data_gin ON reports USING GIN (data);

-- Sports table
CREATE TABLE IF NOT EXISTS sports (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  icon_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_sports_name ON sports(name);
CREATE INDEX IF NOT EXISTS idx_sports_data_gin ON sports USING GIN (data);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  category VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category);
CREATE INDEX IF NOT EXISTS idx_tags_data_gin ON tags USING GIN (data);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  coach_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_coach_id ON bookmarks(coach_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_data_gin ON bookmarks USING GIN (data);

-- Identity Verifications table
CREATE TABLE IF NOT EXISTS identity_verifications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  user_email VARCHAR(255),
  coach_username VARCHAR(255),
  status VARCHAR(50),
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by VARCHAR(255),
  review_notes TEXT,
  personal_info JSONB,
  drivers_license JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_identity_verifications_user_id ON identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_status ON identity_verifications(status);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_data_gin ON identity_verifications USING GIN (data);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  type VARCHAR(100),
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_data_gin ON notifications USING GIN (data);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  coach_id VARCHAR(255),
  event_type VARCHAR(100),
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_coach_id ON analytics(coach_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_data_gin ON analytics USING GIN (data);

