-- ============================================================================
-- Give LEGENDARY XP to kevinvera6
-- This will give you enough XP to unlock ALL 5 tier cards including Legendary!
-- ============================================================================

-- Update coach profile with maximum XP-generating stats
-- This will give you approximately 22,500 XP (enough for Tier 5 - Legendary Coach)

UPDATE coaches 
SET 
  -- Subscription tier (3 = Elite) - 3000 XP
  subscription_tier = 3,
  
  -- Platform longevity - 800 XP (4 years * 200)
  longevity_platform_years = 4,
  
  -- Career experience - 1500 XP (10 years * 150)
  career_years = 10,
  
  -- Courses created - 1500 XP (5 courses * 300)
  courses_created = 5,
  
  -- Jobs completed - 10000 XP (100 jobs * 100)
  jobs_completed = 100,
  
  -- Perfect rating - 500 XP
  average_rating = 5.0,
  total_reviews = 50,
  
  -- Excellent consistency - 2.0x
  consistency_multiplier = 2.0,
  
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
  -- Calculate approximate XP
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
-- XP Breakdown for kevinvera6 (LEGENDARY):
-- ============================================================================
-- Base XP (Elite Subscription):   3,000 XP
-- Platform Longevity (4 years):     800 XP
-- Career Experience (10 years):   1,500 XP
-- Courses Created (5):            1,500 XP
-- Jobs Completed (100):          10,000 XP
-- Review Bonus (5.0/5):             500 XP
-- ──────────────────────────────────────
-- Subtotal:                      17,300 XP
-- Consistency Multiplier (2.0x):  × 2.0
-- ──────────────────────────────────────
-- TOTAL XP:                      34,600 XP 🔥
-- ============================================================================
--
-- This will unlock ALL tier cards:
-- ✅ Tier 1: Rookie Coach (0 XP)
-- ✅ Tier 2: Professional Coach (3,000 XP)
-- ✅ Tier 3: Elite Coach (7,000 XP)
-- ✅ Tier 4: Veteran Coach (12,000 XP)
-- ✅ Tier 5: Legendary Coach (20,000 XP) ⭐
-- ============================================================================

