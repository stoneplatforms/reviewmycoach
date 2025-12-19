-- ========================================
-- COMPLETE FIX: Active Cards + Coach Names
-- Run this entire script in Cloud SQL Studio
-- ========================================

-- 1. Add active card columns (if not already present)
ALTER TABLE coaches 
  ADD COLUMN IF NOT EXISTS active_card_id TEXT,
  ADD COLUMN IF NOT EXISTS active_card_image_url TEXT;

-- 2. Fix missing display names by using username as fallback
UPDATE coaches
SET display_name = username
WHERE (display_name IS NULL OR display_name = '' OR TRIM(display_name) = '')
  AND username IS NOT NULL;

-- 3. Verify the updates
SELECT 
  'Active Card Columns' as check_type,
  COUNT(*) as total_coaches,
  COUNT(active_card_id) as coaches_with_active_card
FROM coaches

UNION ALL

SELECT 
  'Display Names' as check_type,
  COUNT(*) as total_coaches,
  COUNT(CASE WHEN display_name IS NOT NULL AND display_name != '' THEN 1 END) as coaches_with_name
FROM coaches;

-- 4. Show sample of results
SELECT 
  username,
  display_name,
  active_card_id,
  active_card_image_url
FROM coaches
LIMIT 20;

