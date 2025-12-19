-- Fix missing display names for coaches by using username as fallback
-- Since the coaches table doesn't have first_name/last_name columns

-- Update display_name from username when it's empty
UPDATE coaches
SET display_name = username
WHERE (display_name IS NULL OR display_name = '' OR TRIM(display_name) = '')
  AND username IS NOT NULL;

-- Verify the update
SELECT 
  COUNT(*) as total_coaches,
  COUNT(CASE WHEN display_name IS NOT NULL AND display_name != '' THEN 1 END) as coaches_with_display_name,
  COUNT(CASE WHEN display_name IS NULL OR display_name = '' THEN 1 END) as missing_display_name
FROM coaches;

-- Show sample of coaches that were updated
SELECT 
  username, 
  display_name
FROM coaches 
WHERE display_name = username
LIMIT 50;

