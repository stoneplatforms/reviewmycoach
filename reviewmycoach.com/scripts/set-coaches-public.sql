-- Set all coaches to public by default
-- This will make all 29k+ coaches visible in the search

-- First, check how many coaches we have
SELECT 
  COUNT(*) as total_coaches,
  COUNT(CASE WHEN is_public = true THEN 1 END) as public_coaches,
  COUNT(CASE WHEN is_public = false THEN 1 END) as private_coaches,
  COUNT(CASE WHEN is_public IS NULL THEN 1 END) as null_coaches
FROM coaches;

-- Update all coaches to be public if they're not explicitly set to private
-- This assumes that NULL means "not set" and should default to public
UPDATE coaches 
SET is_public = true, updated_at = NOW()
WHERE is_public IS NULL OR is_public = false;

-- Verify the update
SELECT 
  COUNT(*) as total_coaches,
  COUNT(CASE WHEN is_public = true THEN 1 END) as public_coaches,
  COUNT(CASE WHEN is_public = false THEN 1 END) as private_coaches,
  COUNT(CASE WHEN is_public IS NULL THEN 1 END) as null_coaches
FROM coaches;

-- Show a sample of the updated coaches
SELECT id, display_name, location, sports, is_public, average_rating, total_reviews
FROM coaches 
ORDER BY average_rating DESC NULLS LAST
LIMIT 10;

