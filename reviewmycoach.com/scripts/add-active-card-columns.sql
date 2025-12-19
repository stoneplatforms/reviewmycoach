-- Add active_card_id and active_card_image_url columns to coaches table
-- This allows coaches to have an active tier card that displays on their profile

-- Add columns if they don't exist
ALTER TABLE coaches 
  ADD COLUMN IF NOT EXISTS active_card_id TEXT,
  ADD COLUMN IF NOT EXISTS active_card_image_url TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'coaches' 
  AND column_name IN ('active_card_id', 'active_card_image_url');

-- Show sample of coaches with active cards
SELECT username, display_name, active_card_id, active_card_image_url
FROM coaches
WHERE active_card_id IS NOT NULL
LIMIT 10;

