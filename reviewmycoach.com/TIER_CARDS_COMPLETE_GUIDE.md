# Tier Cards System - Complete Implementation Guide

## Overview

This system allows coaches to earn tier cards based on XP milestones (like Fortnite skins) and purchase marketplace cards. Cards can be applied to coach profile pictures to display on coach cards throughout the site.

## What is `card_type`?

`card_type` is a column that indicates what kind of card a user owns:
- **`'tier'`** - Cards earned through XP milestones (Rookie, Professional, Elite, Veteran, Legendary)
- **`'marketplace'`** - Cards purchased from the marketplace

It exists in:
- `user_cards` table - all cards owned by users
- `user_active_cards` table - currently active card for each user

## System Architecture

### Database Tables

1. **`tier_cards`** - Defines tier cards that can be earned
2. **`marketplace_cards`** - Cards available for purchase
3. **`user_cards`** - Cards owned by users (both tier and marketplace)
4. **`user_active_cards`** - Currently active card for each user

### Storage

- **Supabase Storage Bucket**: `tier-cards` (for tier card images)
- **Supabase Storage Bucket**: `marketplace-cards` (for marketplace card images)

## Setup Instructions

### Step 1: Run Database Schema

Run the SQL file in Supabase SQL Editor:
```bash
scripts/add-tier-cards-schema.sql
```

This creates all necessary tables, indexes, RLS policies, and default tier cards.

**If you get "column card_type does not exist" error:**
- Make sure you ran the ENTIRE script (not just parts)
- The script includes automatic fixes for missing columns
- Check tables exist: `SELECT table_name FROM information_schema.tables WHERE table_name IN ('user_cards', 'user_active_cards');`

### Step 2: Set Up Supabase Storage

1. **Create Storage Buckets:**
   - Go to Supabase Dashboard → Storage
   - Create bucket: `tier-cards` (set to **Public**)
   - Create bucket: `marketplace-cards` (set to **Public**)

2. **Upload Tier Card Images:**
   - Go to Storage → `tier-cards` bucket
   - Upload images with exact names:
     - `tier-1.png` (Rookie Coach)
     - `tier-2.png` (Professional Coach)
     - `tier-3.png` (Elite Coach)
     - `tier-4.png` (Veteran Coach)
     - `tier-5.png` (Legendary Coach)

3. **Get Public URLs:**
   After uploading, Supabase generates URLs like:
   ```
   https://[your-project].supabase.co/storage/v1/object/public/tier-cards/tier-1.png
   ```

4. **Update Database with Image URLs:**
   ```sql
   UPDATE public.tier_cards 
   SET image_url = 'https://[your-project].supabase.co/storage/v1/object/public/tier-cards/tier-1.png'
   WHERE tier_number = 1;
   
   -- Repeat for tiers 2-5 with their respective URLs
   ```

5. **Storage Policies:**
   Go to Storage → `tier-cards` → Policies and add:
   ```sql
   CREATE POLICY "Public Access" ON storage.objects
   FOR SELECT USING (bucket_id = 'tier-cards');
   ```

### Step 3: Upload via API (Alternative)

```typescript
import { supabase } from './lib/supabase';

const file = // your file object
const fileName = 'tier-1.png';

const { data, error } = await supabase.storage
  .from('tier-cards')
  .upload(fileName, file, {
    cacheControl: '3600',
    upsert: false
  });

if (!error) {
  const { data: { publicUrl } } = supabase.storage
    .from('tier-cards')
    .getPublicUrl(fileName);
  console.log('Public URL:', publicUrl);
}
```

## How It Works

### Tier Card Unlocking

When a coach's XP changes, call the unlock API:

```typescript
// POST /api/cards/tier/unlock
{
  userId: "user-id",
  coachId: "coach-id"
}
```

**XP Thresholds:**
- Tier 1 (Rookie): 0 XP
- Tier 2 (Professional): 3,000 XP
- Tier 3 (Elite): 7,000 XP
- Tier 4 (Veteran): 12,000 XP
- Tier 5 (Legendary): 20,000 XP

This will:
1. Fetch coach's current XP
2. Check which tier cards they qualify for
3. Unlock any new cards automatically (with duplicate protection)
4. Return list of newly unlocked cards

### Applying Cards

Users can apply a card to their profile:

```typescript
// POST /api/cards/user
{
  userId: "user-id",
  cardId: "card-id",
  cardType: "tier" | "marketplace"
}
```

### Viewing Cards

```typescript
// GET /api/cards/user?userId=xxx
// Returns all owned cards and active card
```

**Dashboard:** `/dashboard/coach/cards`

### Marketplace Purchase

```typescript
// POST /api/cards/purchase
{
  cardId: "card-id",
  userId: "user-id"
}
```

Creates Stripe checkout session. Webhook adds card to `user_cards` after payment.

## Duplicate Protection

✅ **SQL Level:**
- `UNIQUE(user_id, card_id, card_type)` on `user_cards`
- Primary key on `user_active_cards` (one per user)

✅ **API Level:**
- Unlock route uses `upsert` with conflict handling
- Purchase route checks for existing cards
- Webhook uses `upsert` for duplicate deliveries

## Integration Points

### 1. Auto-Unlock on XP Update

Add this to your XP calculation/update logic:

```typescript
// After XP is calculated/updated
await fetch('/api/cards/tier/unlock', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, coachId })
});
```

### 2. Display Card Overlay on Coach Cards

The `OurCoachesSection` component automatically fetches active cards:

```typescript
// Already implemented - fetches via /api/cards/user
// Displays card overlay on coach profile images
```

### 3. Dashboard Route

Coaches can view/manage cards at:
- `/dashboard/coach/cards`

## API Routes

### Tier Cards
- `POST /api/cards/tier/unlock` - Unlock tier cards based on XP
- `GET /api/cards/user?userId=xxx` - Get user's cards
- `POST /api/cards/user` - Set active card

### Marketplace
- `GET /api/cards/marketplace` - List marketplace cards
- `POST /api/cards/purchase` - Purchase a marketplace card

## File Structure

```
app/
├── api/
│   └── cards/
│       ├── tier/unlock/route.ts
│       ├── user/route.ts
│       ├── marketplace/route.ts
│       └── purchase/route.ts
├── dashboard/coach/cards/page.tsx
└── components/OurCoachesSection.tsx (updated to fetch cards)

scripts/
└── add-tier-cards-schema.sql (complete schema)
```

## Testing

1. **Test Tier Unlocking:**
   - Create a coach with XP
   - Call `/api/cards/tier/unlock`
   - Verify cards are unlocked in database
   - Check `/dashboard/coach/cards` page

2. **Test Card Application:**
   - Apply a card via API
   - Verify `user_active_cards` table
   - Check card displays on coach profile

3. **Test Marketplace Purchase:**
   - Purchase a card via Stripe
   - Verify webhook adds card to `user_cards`
   - Check card appears in dashboard

## Troubleshooting

**Error: "column card_type does not exist"**
- Run the complete `add-tier-cards-schema.sql` script
- The script includes automatic fixes for missing columns
- Verify: `SELECT column_name FROM information_schema.columns WHERE table_name = 'user_cards' AND column_name = 'card_type';`

**Cards not unlocking:**
- Check XP calculation is correct
- Verify tier_cards table has correct required_xp values
- Check API logs for errors

**Images not displaying:**
- Verify storage bucket is public
- Check image URLs in database
- Verify storage policies allow public read

**Card not applying:**
- Check user owns the card in `user_cards` table
- Verify `user_active_cards` is being updated
- Check RLS policies allow updates

## Storage Location Summary

**Where to upload card images:**
1. Go to Supabase Dashboard → Storage
2. Create bucket: `tier-cards` (Public)
3. Upload: `tier-1.png`, `tier-2.png`, `tier-3.png`, `tier-4.png`, `tier-5.png`
4. Copy public URLs and update database

**Public URL format:**
```
https://[project-id].supabase.co/storage/v1/object/public/tier-cards/tier-1.png
```

## Routing Verification

✅ **Tier cards unlock based on XP** - `POST /api/cards/tier/unlock`
✅ **Cards can be applied** - `POST /api/cards/user`
✅ **Marketplace cards can be purchased** - `POST /api/cards/purchase`
✅ **Cards show in dashboard** - `/dashboard/coach/cards`
✅ **Cards display on coach cards** - `OurCoachesSection` component

All routing logic matches requirements! 🎉

