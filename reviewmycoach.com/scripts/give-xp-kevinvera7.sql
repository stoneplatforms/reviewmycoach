-- Give XP to kevinvera7 for testing
-- Run this in Cloud SQL Studio: https://console.cloud.google.com/sql/instances

-- Update coach XP fields
UPDATE coaches 
SET 
  -- Subscription tier: 2 (Professional) = 2000 XP
  subscription_tier = 2,
  
  -- Platform longevity: 2 years = 400 XP
  longevity_platform_years = 2,
  
  -- Career experience: 5 years = 750 XP
  career_years = 5,
  
  -- Courses created: 3 courses = 900 XP
  courses_created = 3,
  
  -- Jobs completed: 50 jobs = 5000 XP
  jobs_completed = 50,
  
  -- Average rating: 4.5/5 = 450 XP (before multiplier)
  average_rating = 4.5,
  
  -- Total reviews: 24
  total_reviews = 24,
  
  -- Consistency multiplier - 1.5x
  consistency_multiplier = 1.5,
  
  updated_at = NOW()
WHERE username = 'kevinvera7';

-- Verify the update
SELECT 
  username,
  display_name,
  subscription_tier,
  longevity_platform_years,
  career_years,
  courses_created,
  jobs_completed,
  average_rating,
  total_reviews,
  consistency_multiplier,
  -- Calculate approximate XP (this is just for display, actual XP is calculated by API)
  (
    (subscription_tier * 1000) +
    (longevity_platform_years * 200) +
    (career_years * 150) +
    (courses_created * 300) +
    (jobs_completed * 100) +
    ((average_rating / 5) * 500)
  ) * consistency_multiplier as estimated_xp
FROM coaches
WHERE username = 'kevinvera7';

-- Expected result:
-- Subscription: 2 * 1000 = 2000
-- Platform years: 2 * 200 = 400
-- Career years: 5 * 150 = 750
-- Courses: 3 * 300 = 900
-- Jobs: 50 * 100 = 5000
-- Rating: (4.5/5) * 500 = 450
-- Subtotal: 9500
-- With 1.5x multiplier: 9500 * 1.5 = 14,250 XP
-- This qualifies for Veteran Coach (Tier 4, requires 12,000 XP)

