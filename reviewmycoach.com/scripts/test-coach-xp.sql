-- ============================================================================
-- Test: Give Yourself High XP for Tier Card Testing
-- Run this in Supabase SQL Editor
-- Replace 'your-user-id' with your actual user ID
-- ============================================================================

-- Find your user ID:
-- 1. Sign in to your app
-- 2. Check your profile/dashboard - your user ID is in the URL or auth
-- 3. Or run: SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Option 1: Update coach data to give high XP
-- This modifies the factors that contribute to XP calculation

-- Update your coach profile with high values:
UPDATE public.coaches
SET 
  -- Set subscription to Pro (tier 2) or Elite (tier 3)
  -- Note: Check your actual column names - might be subscription_status or subscriptionStatus
  subscription_status = 'active',  -- or 'pro' or 'elite' depending on your schema
  
  -- Set high career years (each year = 150 XP)
  experience = 50,  -- 50 years = 7,500 XP from career alone
  
  -- Set high average rating (max 5.0 = 500 XP bonus)
  average_rating = 5.0,
  
  -- Set created_at to be older (for platform longevity)
  -- Each year = 200 XP, so 5 years = 1,000 XP
  created_at = NOW() - INTERVAL '5 years'
  
WHERE user_id = 'your-user-id';

-- If subscription_status column doesn't exist, you might need to add it:
-- ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
-- ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT NULL;

-- Option 2: Direct XP override (if you add an xp column)
-- First, add an xp column if it doesn't exist:
-- ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT NULL;

-- Then set a specific XP value:
-- UPDATE public.coaches
-- SET total_xp = 20000  -- Legendary tier (20,000+ XP)
-- WHERE user_id = 'your-user-id';

-- Option 3: Quick test values for different tiers:
-- Tier 2 (Professional): 3,000 XP
-- UPDATE public.coaches 
-- SET experience = 20, average_rating = 4.0, subscription_status = 'active', created_at = NOW() - INTERVAL '2 years'
-- WHERE user_id = 'your-user-id';

-- Tier 3 (Elite): 7,000 XP  
-- UPDATE public.coaches 
-- SET experience = 40, average_rating = 4.5, subscription_status = 'active', created_at = NOW() - INTERVAL '3 years'
-- WHERE user_id = 'your-user-id';

-- Tier 4 (Veteran): 12,000 XP
-- UPDATE public.coaches 
-- SET experience = 60, average_rating = 4.8, subscription_status = 'active', created_at = NOW() - INTERVAL '4 years'
-- WHERE user_id = 'your-user-id';

-- Tier 5 (Legendary): 20,000+ XP
-- UPDATE public.coaches 
-- SET experience = 100, average_rating = 5.0, subscription_status = 'active', created_at = NOW() - INTERVAL '5 years'
-- WHERE user_id = 'your-user-id';

-- Verify your changes:
-- SELECT 
--   user_id,
--   display_name,
--   experience,
--   average_rating,
--   subscription_status,
--   subscription_plan,
--   created_at
-- FROM public.coaches
-- WHERE user_id = 'your-user-id';

-- Then test XP calculation:
-- GET /api/coaches/[coach-id]/xp?userId=your-user-id

