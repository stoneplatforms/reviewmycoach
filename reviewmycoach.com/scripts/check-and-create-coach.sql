-- Check if coach exists
SELECT id, username, display_name, email FROM coaches WHERE username = 'kevinvera6';

-- If no results above, run this to create the coach profile:
-- Replace YOUR_USER_ID and YOUR_EMAIL with your actual values

/*
INSERT INTO coaches (
  id, 
  user_id, 
  username, 
  display_name, 
  email,
  bio,
  sports,
  experience,
  hourly_rate,
  location,
  average_rating,
  total_reviews,
  is_public,
  subscription_tier,
  longevity_platform_years,
  career_years,
  courses_created,
  jobs_completed,
  consistency_multiplier,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid()::text,
  'YOUR_USER_ID',
  'kevinvera6',
  'Kevin Vera',
  'kvvpid@gmail.com',
  'Professional coach',
  ARRAY['Basketball'],
  5,
  50,
  'United States',
  4.5,
  24,
  TRUE,
  2,
  2,
  5,
  3,
  50,
  1.5,
  NOW(),
  NOW()
);
*/

