-- ============================================================================
-- Update Tier Card Image URLs
-- Run this AFTER uploading images to Supabase Storage bucket "tier-cards"
-- Replace [your-project-id] with your actual Supabase project ID
-- ============================================================================

-- Get your project ID from: Supabase Dashboard → Settings → General → Reference ID
-- Or look at your Supabase URL: https://[your-project-id].supabase.co

-- Update tier card URLs with your project ID
-- Note: Use /storage/v1/ (v1 = version 1, not vl)
UPDATE public.tier_cards 
SET image_url = 'https://cfpjwggvkfgflxxynjus.supabase.co/storage/v1/object/public/tier-cards/tier-1.png'
WHERE tier_number = 1;

UPDATE public.tier_cards 
SET image_url = 'https://cfpjwggvkfgflxxynjus.supabase.co/storage/v1/object/public/tier-cards/tier-2.png'
WHERE tier_number = 2;

UPDATE public.tier_cards 
SET image_url = 'https://cfpjwggvkfgflxxynjus.supabase.co/storage/v1/object/public/tier-cards/tier-3.png'
WHERE tier_number = 3;

UPDATE public.tier_cards 
SET image_url = 'https://cfpjwggvkfgflxxynjus.supabase.co/storage/v1/object/public/tier-cards/tier-4.png'
WHERE tier_number = 4;

UPDATE public.tier_cards 
SET image_url = 'https://cfpjwggvkfgflxxynjus.supabase.co/storage/v1/object/public/tier-cards/tier-5.png'
WHERE tier_number = 5;

-- Verify URLs were updated
SELECT tier_number, tier_name, image_url FROM public.tier_cards ORDER BY tier_number;

