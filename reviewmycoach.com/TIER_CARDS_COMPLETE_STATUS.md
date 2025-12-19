# 🎯 Tier Cards Migration - Complete Status

## ✅ What's Been Completed

### 1. GraphQL Schema (Data Connect)
**File:** `dataconnect/schema/schema.gql`

Added `TierCard` type:
```graphql
type TierCard @table(name: "tier_cards") {
  id: String!
  tierNumber: Int
  tierName: String
  requiredXp: Int
  imageUrl: String
  description: String
  isActive: Boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  data: Any
}
```

Updated `UserCard` type:
- Added `cardType: String` (values: "tier" or "marketplace")
- Added `unlockedAt: Timestamp` (for tier cards)

### 2. GraphQL Queries & Mutations
**File:** `dataconnect/connectors/queries.gql`

New Queries:
- `GetTierCards` - Fetch all active tier cards
- `GetEligibleTierCards($minXp: Int!)` - Get tier cards user qualifies for based on XP

Updated Queries:
- `GetUserCards` - Now includes `cardType` and `unlockedAt` fields

**File:** `dataconnect/connectors/mutations.gql`

New Mutations:
- `UnlockTierCard` - Add a tier card to user's collection with `cardType: "tier"`

Updated Mutations:
- `PurchaseCard` - Now sets `cardType: "marketplace"`

### 3. API Routes Migrated

**`/app/api/cards/tier/unlock/route.ts`** - ✅ Fully migrated to Data Connect
- **POST** - Unlock tier cards based on coach's XP
  - Fetches coach XP from `/api/coaches/[id]/xp`
  - Queries eligible tier cards from Data Connect
  - Unlocks new cards automatically
  - Returns list of newly unlocked cards
  
- **GET** - Check available tier cards (preview mode)
  - Shows unlocked, available, and locked cards
  - Displays next tier to unlock

**`/app/api/cards/user/route.ts`** - Already using Data Connect
- GET - Fetch user's cards (both tier and marketplace)
- POST - Set active card on profile

### 4. Dashboard UI Updated

**`/app/dashboard/coach/cards/page.tsx`** - ✅ Tier cards integrated

New Features:
- **"Tier Cards" tab** - Shows all 5 tier cards
- **XP display** - Shows current XP at the top
- **"Check for New Tier Cards" button** - Manually trigger unlock
- **Visual states:**
  - 🔒 Locked (insufficient XP) - Grayed out with lock icon
  - 🔓 Unlocked (can be activated) - Full color
  - ✅ Active (currently applied) - Green border
- **Progress tracking** - Shows "X/5" unlocked in tab label

### 5. SDK Generated
✅ TypeScript SDK generated with new queries and mutations
- `getTierCards()`
- `getEligibleTierCards()`
- `unlockTierCard()`

### 6. XP System Integration
**File:** `app/lib/xp-calculator.ts`

XP Tier Thresholds:
```typescript
Tier 1: Rookie Coach       - 0 XP
Tier 2: Professional Coach - 3,000 XP
Tier 3: Elite Coach        - 7,000 XP
Tier 4: Veteran Coach      - 12,000 XP
Tier 5: Legendary Coach    - 20,000 XP
```

Function: `getCoachTier(xp: number)` - Maps XP to tier name and number

## ⏳ What Needs to Be Done

### 1. Firebase Authentication (Required)
```bash
firebase login --reauth
```
Your Firebase credentials expired. Run this command to refresh them.

### 2. Deploy Data Connect Schema (Required)
```bash
npx firebase deploy --only dataconnect
```
This will deploy the new `TierCard` type and queries to your Firebase Data Connect instance.

### 3. Run Database Migration (Required)
After deploying the schema, run the SQL migration script:

**Option A: Firebase Console**
1. Go to Firebase Console → Data Connect → SQL Editor
2. Copy and paste contents of `scripts/migrate-tier-cards-to-dataconnect.sql`
3. Execute

**Option B: Direct PostgreSQL (if you have access)**
```bash
psql -h your-host -U your-user -d your-db -f scripts/migrate-tier-cards-to-dataconnect.sql
```

This script will:
- Create `tier_cards` table
- Add `card_type` column to `user_cards`
- Add `unlocked_at` column to `user_cards`
- Insert 5 default tier cards
- Create necessary indexes
- Update constraints

### 4. Upload Tier Card Images (Required)
The migration script uses placeholder URLs. You need to:

1. Design/create 5 tier card images:
   - `tier-1.png` - Rookie Coach (Bronze theme)
   - `tier-2.png` - Professional Coach (Silver theme)
   - `tier-3.png` - Elite Coach (Gold theme)
   - `tier-4.png` - Veteran Coach (Platinum theme)
   - `tier-5.png` - Legendary Coach (Diamond theme)

2. Upload to Firebase Storage or your CDN

3. Update database with real URLs:
```sql
UPDATE tier_cards SET image_url = 'https://your-cdn.com/tier-1.png' WHERE tier_number = 1;
UPDATE tier_cards SET image_url = 'https://your-cdn.com/tier-2.png' WHERE tier_number = 2;
UPDATE tier_cards SET image_url = 'https://your-cdn.com/tier-3.png' WHERE tier_number = 3;
UPDATE tier_cards SET image_url = 'https://your-cdn.com/tier-4.png' WHERE tier_number = 4;
UPDATE tier_cards SET image_url = 'https://your-cdn.com/tier-5.png' WHERE tier_number = 5;
```

### 5. (Optional) Auto-Unlock on XP Calculation
To automatically unlock tier cards when XP is calculated, add this to `/app/api/coaches/[id]/xp/route.ts`:

```typescript
// At the end of the GET handler, after XP is calculated
if (xpResult.total_xp > 0 && userIdParam) {
  // Fire and forget - unlock tier cards in background
  fetch(`${request.nextUrl.origin}/api/cards/tier/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      userId: userIdParam, 
      coachId: coachId,
      coachUsername: coachData.username 
    })
  }).catch(err => console.error('Failed to auto-unlock tier cards:', err));
}
```

## 🧪 Testing Checklist

Once database is set up:

- [ ] Navigate to `/dashboard/coach/cards`
- [ ] Click "Tier Cards" tab
- [ ] Verify all 5 tier cards are displayed
- [ ] Check that cards show correct lock/unlock states based on XP
- [ ] Click "Check for New Tier Cards" button
- [ ] Verify new cards are unlocked if XP qualifies
- [ ] Set a tier card as active
- [ ] Verify it appears on coach profile/cards

## 📁 Files Changed

### Created
- `app/api/cards/tier/unlock/route.ts` (rewritten for Data Connect)
- `scripts/migrate-tier-cards-to-dataconnect.sql`
- `TIER_CARDS_MIGRATION_INSTRUCTIONS.md`
- `TIER_CARDS_COMPLETE_STATUS.md` (this file)

### Modified
- `dataconnect/schema/schema.gql` - Added TierCard type
- `dataconnect/connectors/queries.gql` - Added tier card queries
- `dataconnect/connectors/mutations.gql` - Added UnlockTierCard mutation
- `app/dashboard/coach/cards/page.tsx` - Added tier cards tab and functionality

### SDK Generated
- `dataconnect/app/lib/dataconnect/*` - TypeScript SDK with tier card operations

## 🎮 How Coaches Will Use It

1. **Earn XP** through platform activities (reviews, sessions, courses, etc.)
2. **Check XP** on their profile or dashboard
3. **Visit Cards Dashboard** (`/dashboard/coach/cards`)
4. **View Tier Cards** tab to see progress
5. **Unlock Cards** automatically or manually via "Check for New Tier Cards" button
6. **Activate Card** to display on their profile
7. **Show Off** - Card appears as overlay on profile picture across the site

## 🔄 Migration from Supabase

**Before:** Tier cards were stored in Supabase with the following structure:
- `tier_cards` table in Supabase
- `/api/cards/tier/unlock` used Supabase client
- Storage in Supabase Storage buckets

**After:** Everything migrated to Firebase Data Connect:
- `tier_cards` table in PostgreSQL (via Data Connect)
- `/api/cards/tier/unlock` uses Data Connect GraphQL
- Storage can be Firebase Storage or any CDN
- All queries/mutations use generated TypeScript SDK

**Zero Supabase Dependencies** - The tier cards system is now 100% Firebase-based.

## 🚀 Next Steps

1. Run `firebase login --reauth`
2. Deploy schema: `npx firebase deploy --only dataconnect`
3. Run SQL migration in Firebase Console
4. Upload tier card images
5. Test the system
6. (Optional) Add auto-unlock to XP calculation

## 📊 Current Status

- ✅ Code: 100% Complete
- ✅ Schema: 100% Complete
- ⏳ Database: Pending migration
- ⏳ Images: Pending upload
- ⏳ Deployment: Pending Firebase auth

**Dev Server:** Running on http://localhost:3001

You're ready to deploy once Firebase credentials are refreshed! 🎉

