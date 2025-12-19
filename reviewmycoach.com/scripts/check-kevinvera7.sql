-- Check if kevinvera7 exists in the database
SELECT 
  id,
  username,
  display_name,
  email,
  user_id,
  subscription_tier,
  longevity_platform_years,
  career_years,
  courses_created,
  jobs_completed,
  average_rating,
  total_reviews,
  consistency_multiplier,
  created_at,
  updated_at
FROM coaches
WHERE username = 'kevinvera7' OR username = 'KevinVera7' OR LOWER(username) = 'kevinvera7';

-- If no results, check all coaches with similar names
SELECT 
  id,
  username,
  display_name,
  email
FROM coaches
WHERE username ILIKE '%kevin%' OR display_name ILIKE '%kevin%';

