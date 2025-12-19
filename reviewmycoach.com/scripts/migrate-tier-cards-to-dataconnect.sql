-- ============================================================================
-- Migrate Tier Cards to Firebase Data Connect (PostgreSQL)
-- ============================================================================

-- Create tier_cards table if it doesn't exist
CREATE TABLE IF NOT EXISTS tier_cards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tier_number INTEGER NOT NULL UNIQUE,
  tier_name TEXT NOT NULL,
  required_xp INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB
);

-- Add card_type column to user_cards if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_cards' AND column_name = 'card_type'
  ) THEN
    ALTER TABLE user_cards ADD COLUMN card_type TEXT CHECK (card_type IN ('tier', 'marketplace'));
    
    -- Set existing cards to 'marketplace' type
    UPDATE user_cards SET card_type = 'marketplace' WHERE card_type IS NULL;
  END IF;
END $$;

-- Add unlocked_at column to user_cards if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_cards' AND column_name = 'unlocked_at'
  ) THEN
    ALTER TABLE user_cards ADD COLUMN unlocked_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Insert default tier cards
INSERT INTO tier_cards (id, tier_number, tier_name, required_xp, image_url, description, is_active)
VALUES
  (gen_random_uuid()::text, 1, 'Rookie Coach', 0, 'https://your-storage-url/tier-1.png', 'Starting tier for all new coaches', TRUE),
  (gen_random_uuid()::text, 2, 'Professional Coach', 3000, 'https://your-storage-url/tier-2.png', 'Earned at 3,000 XP', TRUE),
  (gen_random_uuid()::text, 3, 'Elite Coach', 7000, 'https://your-storage-url/tier-3.png', 'Earned at 7,000 XP', TRUE),
  (gen_random_uuid()::text, 4, 'Veteran Coach', 12000, 'https://your-storage-url/tier-4.png', 'Earned at 12,000 XP', TRUE),
  (gen_random_uuid()::text, 5, 'Legendary Coach', 20000, 'https://your-storage-url/tier-5.png', 'Earned at 20,000 XP', TRUE)
ON CONFLICT (tier_number) DO NOTHING;

-- Create index on tier_number for fast lookups
CREATE INDEX IF NOT EXISTS idx_tier_cards_tier_number ON tier_cards(tier_number);
CREATE INDEX IF NOT EXISTS idx_tier_cards_required_xp ON tier_cards(required_xp);

-- Create index on user_cards for card_type filtering
CREATE INDEX IF NOT EXISTS idx_user_cards_card_type ON user_cards(card_type);
CREATE INDEX IF NOT EXISTS idx_user_cards_user_card_type ON user_cards(user_id, card_type);

-- Update existing user_cards unique constraint to include card_type
DO $$
BEGIN
  -- Drop old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_cards_user_id_card_id_key'
  ) THEN
    ALTER TABLE user_cards DROP CONSTRAINT user_cards_user_id_card_id_key;
  END IF;
  
  -- Add new constraint with card_type
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_cards_user_id_card_id_card_type_key'
  ) THEN
    ALTER TABLE user_cards ADD CONSTRAINT user_cards_user_id_card_id_card_type_key 
      UNIQUE (user_id, card_id, card_type);
  END IF;
END $$;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check tier_cards table
SELECT 'Tier Cards Created:' as status, COUNT(*) as count FROM tier_cards;

-- Check user_cards schema
SELECT 
  'user_cards columns:' as status,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_cards' 
  AND column_name IN ('card_type', 'unlocked_at')
ORDER BY column_name;

-- Show all tier cards
SELECT 
  tier_number,
  tier_name,
  required_xp,
  is_active
FROM tier_cards
ORDER BY tier_number;

