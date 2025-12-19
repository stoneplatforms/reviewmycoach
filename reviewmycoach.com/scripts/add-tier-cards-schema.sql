-- ============================================================================
-- Tier Cards System - Complete Schema & Setup
-- Run this ENTIRE file in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 0: FIX EXISTING TABLES (drop old tables without card_type)
-- ============================================================================

-- Drop old user_cards table if it exists without card_type column
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_cards'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'user_cards' 
      AND column_name = 'card_type'
  ) THEN
    DROP TABLE IF EXISTS public.user_cards CASCADE;
    RAISE NOTICE 'Dropped old user_cards table (missing card_type column)';
  END IF;
END $$;

-- Drop old user_active_cards table if it exists without card_type column
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_active_cards'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'user_active_cards' 
      AND column_name = 'card_type'
  ) THEN
    DROP TABLE IF EXISTS public.user_active_cards CASCADE;
    RAISE NOTICE 'Dropped old user_active_cards table (missing card_type column)';
  END IF;
END $$;

-- ============================================================================
-- PART 1: CREATE TABLES
-- ============================================================================

-- Tier Cards Table (cards earned through XP milestones)
CREATE TABLE IF NOT EXISTS public.tier_cards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tier_number INTEGER NOT NULL UNIQUE,
  tier_name TEXT NOT NULL,
  required_xp INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace Cards Table (cards that can be purchased)
CREATE TABLE IF NOT EXISTS public.marketplace_cards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Cards Table (cards owned by users - both tier and marketplace)
-- card_type: 'tier' = earned through XP, 'marketplace' = purchased
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

-- User Active Card Table (which card is currently applied to profile)
CREATE TABLE IF NOT EXISTS public.user_active_cards (
  user_id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('tier', 'marketplace')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PART 2: CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON public.user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_card_id ON public.user_cards(card_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_card_type ON public.user_cards(card_type);
CREATE INDEX IF NOT EXISTS idx_tier_cards_tier_number ON public.tier_cards(tier_number);
CREATE INDEX IF NOT EXISTS idx_tier_cards_required_xp ON public.tier_cards(required_xp);
CREATE INDEX IF NOT EXISTS idx_marketplace_cards_is_active ON public.marketplace_cards(is_active);
CREATE INDEX IF NOT EXISTS idx_marketplace_cards_is_featured ON public.marketplace_cards(is_featured);

-- ============================================================================
-- PART 3: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.tier_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_active_cards ENABLE ROW LEVEL SECURITY;

-- Tier cards: Public read access
CREATE POLICY "Tier cards are viewable by everyone" ON public.tier_cards
  FOR SELECT USING (true);

-- Marketplace cards: Public read access
CREATE POLICY "Marketplace cards are viewable by everyone" ON public.marketplace_cards
  FOR SELECT USING (true);

-- User cards: Users can only see their own cards
CREATE POLICY "Users can view their own cards" ON public.user_cards
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own cards" ON public.user_cards
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own cards" ON public.user_cards
  FOR UPDATE USING (auth.uid()::text = user_id);

-- User active cards: Users can only manage their own active card
CREATE POLICY "Users can view their own active card" ON public.user_active_cards
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own active card" ON public.user_active_cards
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own active card" ON public.user_active_cards
  FOR UPDATE USING (auth.uid()::text = user_id);

-- ============================================================================
-- PART 4: INSERT DEFAULT TIER CARDS
-- ============================================================================

INSERT INTO public.tier_cards (tier_number, tier_name, required_xp, image_url, description) VALUES
  (1, 'Rookie Coach', 0, '/tiers/tier-1.png', 'Starting your coaching journey'),
  (2, 'Professional Coach', 3000, '/tiers/tier-2.png', 'Reached Professional level'),
  (3, 'Elite Coach', 7000, '/tiers/tier-3.png', 'Achieved Elite status'),
  (4, 'Veteran Coach', 12000, '/tiers/tier-4.png', 'Became a Veteran'),
  (5, 'Legendary Coach', 20000, '/tiers/tier-5.png', 'Legendary achievement unlocked')
ON CONFLICT (tier_number) DO NOTHING;

-- ============================================================================
-- PART 5: FIX MISSING COLUMNS (MUST RUN - fixes existing tables)
-- ============================================================================

-- Fix user_cards table: Add card_type column if missing
DO $$ 
BEGIN
  -- If table exists but card_type column is missing
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_cards'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'user_cards' 
      AND column_name = 'card_type'
  ) THEN
    -- Try to add column (will fail if table has data and no default)
    BEGIN
      ALTER TABLE public.user_cards 
      ADD COLUMN card_type TEXT;
      
      -- Set default value for existing rows
      UPDATE public.user_cards SET card_type = 'tier' WHERE card_type IS NULL;
      
      -- Make it NOT NULL with constraint
      ALTER TABLE public.user_cards 
      ALTER COLUMN card_type SET NOT NULL,
      ADD CONSTRAINT user_cards_card_type_check CHECK (card_type IN ('tier', 'marketplace'));
      
      -- Add index
      CREATE INDEX IF NOT EXISTS idx_user_cards_card_type ON public.user_cards(card_type);
      
      -- Drop old unique constraint if exists (might be on user_id, card_id only)
      ALTER TABLE public.user_cards DROP CONSTRAINT IF EXISTS user_cards_user_id_card_id_key;
      
      -- Add new unique constraint with card_type
      ALTER TABLE public.user_cards 
      ADD CONSTRAINT user_cards_user_id_card_id_card_type_key 
      UNIQUE(user_id, card_id, card_type);
      
    EXCEPTION WHEN OTHERS THEN
      -- If adding column fails, drop and recreate table
      DROP TABLE IF EXISTS public.user_cards CASCADE;
      
      CREATE TABLE public.user_cards (
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
      
      CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON public.user_cards(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_cards_card_id ON public.user_cards(card_id);
      CREATE INDEX IF NOT EXISTS idx_user_cards_card_type ON public.user_cards(card_type);
      
      ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can view their own cards" ON public.user_cards
        FOR SELECT USING (auth.uid()::text = user_id);
      CREATE POLICY "Users can insert their own cards" ON public.user_cards
        FOR INSERT WITH CHECK (auth.uid()::text = user_id);
      CREATE POLICY "Users can update their own cards" ON public.user_cards
        FOR UPDATE USING (auth.uid()::text = user_id);
    END;
  END IF;
END $$;

-- Fix user_active_cards table: Add card_type column if missing
DO $$ 
BEGIN
  -- If table exists but card_type column is missing
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_active_cards'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'user_active_cards' 
      AND column_name = 'card_type'
  ) THEN
    -- Try to add column
    BEGIN
      ALTER TABLE public.user_active_cards 
      ADD COLUMN card_type TEXT;
      
      -- Set default value for existing rows
      UPDATE public.user_active_cards SET card_type = 'tier' WHERE card_type IS NULL;
      
      -- Make it NOT NULL with constraint
      ALTER TABLE public.user_active_cards 
      ALTER COLUMN card_type SET NOT NULL,
      ADD CONSTRAINT user_active_cards_card_type_check CHECK (card_type IN ('tier', 'marketplace'));
      
    EXCEPTION WHEN OTHERS THEN
      -- If adding column fails, drop and recreate table
      DROP TABLE IF EXISTS public.user_active_cards CASCADE;
      
      CREATE TABLE public.user_active_cards (
        user_id TEXT PRIMARY KEY,
        card_id TEXT NOT NULL,
        card_type TEXT NOT NULL CHECK (card_type IN ('tier', 'marketplace')),
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      ALTER TABLE public.user_active_cards ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can view their own active card" ON public.user_active_cards
        FOR SELECT USING (auth.uid()::text = user_id);
      CREATE POLICY "Users can insert their own active card" ON public.user_active_cards
        FOR INSERT WITH CHECK (auth.uid()::text = user_id);
      CREATE POLICY "Users can update their own active card" ON public.user_active_cards
        FOR UPDATE USING (auth.uid()::text = user_id);
    END;
  END IF;
END $$;

-- Ensure unique constraint exists on user_cards (if table has card_type)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_cards'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'user_cards' 
      AND column_name = 'card_type'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_cards_user_id_card_id_card_type_key'
  ) THEN
    -- Drop old constraint if exists
    ALTER TABLE public.user_cards DROP CONSTRAINT IF EXISTS user_cards_user_id_card_id_key;
    
    -- Add new constraint
    ALTER TABLE public.user_cards 
    ADD CONSTRAINT user_cards_user_id_card_id_card_type_key 
    UNIQUE(user_id, card_id, card_type);
  END IF;
END $$;

-- ============================================================================
-- PART 6: VERIFICATION (automatically runs to confirm fix)
-- ============================================================================

-- Verify card_type column exists (this will error if it doesn't exist)
DO $$
BEGIN
  -- Check user_cards
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'user_cards' 
      AND column_name = 'card_type'
  ) THEN
    RAISE EXCEPTION 'ERROR: user_cards.card_type column still missing after fix!';
  END IF;
  
  -- Check user_active_cards
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'user_active_cards' 
      AND column_name = 'card_type'
  ) THEN
    RAISE EXCEPTION 'ERROR: user_active_cards.card_type column still missing after fix!';
  END IF;
  
  RAISE NOTICE 'SUCCESS: card_type columns verified in both tables!';
END $$;

-- Optional: Run these queries manually to see table structure:
-- SELECT table_name, column_name, data_type, is_nullable
-- FROM information_schema.columns 
-- WHERE table_schema = 'public'
--   AND table_name IN ('user_cards', 'user_active_cards')
-- ORDER BY table_name, ordinal_position;
