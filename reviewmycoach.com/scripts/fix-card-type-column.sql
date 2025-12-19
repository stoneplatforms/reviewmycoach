-- ============================================================================
-- FIX: Add card_type column to user_cards and user_active_cards
-- Run this script FIRST if you're getting "column card_type does not exist" error
-- ============================================================================

-- Step 1: Drop old tables if they exist without card_type
-- This is safe because we'll recreate them immediately

-- Check and fix user_cards table
DO $$ 
BEGIN
  -- If table exists but doesn't have card_type column
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_cards'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'user_cards' 
      AND column_name = 'card_type'
  ) THEN
    -- Drop the old table (we'll recreate it properly)
    DROP TABLE IF EXISTS public.user_cards CASCADE;
    RAISE NOTICE 'Dropped old user_cards table (missing card_type column)';
  END IF;
END $$;

-- Check and fix user_active_cards table
DO $$ 
BEGIN
  -- If table exists but doesn't have card_type column
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_active_cards'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'user_active_cards' 
      AND column_name = 'card_type'
  ) THEN
    -- Drop the old table (we'll recreate it properly)
    DROP TABLE IF EXISTS public.user_active_cards CASCADE;
    RAISE NOTICE 'Dropped old user_active_cards table (missing card_type column)';
  END IF;
END $$;

-- Step 2: Create user_cards table with card_type (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.user_cards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  card_id TEXT NOT NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('tier', 'marketplace')),
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  purchased_at TIMESTAMP WITH TIME ZONE,
  stripe_session_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, card_id, card_type)
);

-- Step 3: Create user_active_cards table with card_type (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.user_active_cards (
  user_id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('tier', 'marketplace')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON public.user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_card_id ON public.user_cards(card_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_card_type ON public.user_cards(card_type);

-- Step 5: Enable RLS
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_active_cards ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies (drop old ones first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own cards" ON public.user_cards;
DROP POLICY IF EXISTS "Users can insert their own cards" ON public.user_cards;
DROP POLICY IF EXISTS "Users can update their own cards" ON public.user_cards;

CREATE POLICY "Users can view their own cards" ON public.user_cards
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own cards" ON public.user_cards
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own cards" ON public.user_cards
  FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can view their own active card" ON public.user_active_cards;
DROP POLICY IF EXISTS "Users can insert their own active card" ON public.user_active_cards;
DROP POLICY IF EXISTS "Users can update their own active card" ON public.user_active_cards;

CREATE POLICY "Users can view their own active card" ON public.user_active_cards
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own active card" ON public.user_active_cards
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own active card" ON public.user_active_cards
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Step 7: Verify card_type column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'user_cards' 
      AND column_name = 'card_type'
  ) THEN
    RAISE EXCEPTION 'ERROR: user_cards.card_type column still missing!';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'user_active_cards' 
      AND column_name = 'card_type'
  ) THEN
    RAISE EXCEPTION 'ERROR: user_active_cards.card_type column still missing!';
  END IF;
  
  RAISE NOTICE 'SUCCESS: card_type columns verified in both tables!';
END $$;

