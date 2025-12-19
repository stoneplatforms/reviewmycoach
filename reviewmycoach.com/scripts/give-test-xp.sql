-- ============================================================================
-- Give Test XP to kevinvera6
-- This will give you enough XP to unlock multiple tier cards for testing
-- ============================================================================

-- Update coach profile with XP-generating stats
-- This will give you approximately 14,250 XP (enough for Tier 4 - Veteran Coach)

UPDATE coaches 
SET 
  -- Subscription tier (1=Basic, 2=Pro, 3=Elite) - 2000 XP
  subscription_tier = 2,
  
  -- Platform longevity (years on ReviewMyCoach) - 400 XP (2 years * 200)
  longevity_platform_years = 2,
  
  -- Career experience (total coaching years) - 750 XP (5 years * 150)
  career_years = 5,
  
  -- Courses created - 900 XP (3 courses * 300)
  courses_created = 3,
  
  -- Jobs completed (paid sessions) - 5000 XP (50 jobs * 100)
  jobs_completed = 50,
  
  -- Average rating (4.5/5) - 450 XP
  average_rating = 4.5,
  total_reviews = 24,
  
  -- Consistency multiplier - 1.5x
  consistency_multiplier = 1.5,
  
  updated_at = NOW()
WHERE username = 'kevinvera6';

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
WHERE username = 'kevinvera6';

-- ============================================================================
-- XP Breakdown for kevinvera6:
-- ============================================================================
-- Base XP (Pro Subscription):     2,000 XP
-- Platform Longevity (2 years):     400 XP
-- Career Experience (5 years):      750 XP
-- Courses Created (3):              900 XP
-- Jobs Completed (50):            5,000 XP
-- Review Bonus (4.5/5):             450 XP
-- ──────────────────────────────────────
-- Subtotal:                       9,500 XP
-- Consistency Multiplier (1.5x):  × 1.5
-- ──────────────────────────────────────
-- TOTAL XP:                      14,250 XP
-- ============================================================================
--
-- This will unlock:
-- ✅ Tier 1: Rookie Coach (0 XP)
-- ✅ Tier 2: Professional Coach (3,000 XP)
-- ✅ Tier 3: Elite Coach (7,000 XP)
-- ✅ Tier 4: Veteran Coach (12,000 XP)
-- 🔒 Tier 5: Legendary Coach (20,000 XP) - Need 5,750 more XP
-- ============================================================================

