-- Fix missing display names for coaches
-- This sets display_name from first_name + last_name, or from username as fallback

-- Step 1: Update display_name from first_name + last_name
UPDATE coaches
SET display_name = TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')))
WHERE (display_name IS NULL OR display_name = '' OR display_name = ' ')
  AND (first_name IS NOT NULL AND first_name != '')
  AND (last_name IS NOT NULL AND last_name != '');

-- Step 2: Update display_name from first_name only
UPDATE coaches
SET display_name = TRIM(first_name)
WHERE (display_name IS NULL OR display_name = '' OR display_name = ' ')
  AND (first_name IS NOT NULL AND first_name != '');

-- Step 3: Update display_name from last_name only
UPDATE coaches
SET display_name = TRIM(last_name)
WHERE (display_name IS NULL OR display_name = '' OR display_name = ' ')
  AND (last_name IS NOT NULL AND last_name != '');

-- Step 4: Update display_name from username as fallback
UPDATE coaches
SET display_name = username
WHERE (display_name IS NULL OR display_name = '' OR display_name = ' ')
  AND username IS NOT NULL;

-- Verify the update
SELECT 
  COUNT(*) as total_coaches,
  COUNT(display_name) as coaches_with_display_name,
  COUNT(*) - COUNT(display_name) as missing_display_name
FROM coaches;

-- Show sample of coaches with their names
SELECT 
  username, 
  display_name, 
  first_name, 
  last_name 
FROM coaches 
LIMIT 20;

