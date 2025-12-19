# Tier Cards Migration to Firebase Data Connect

## Overview
The tier cards system has been migrated from Supabase to Firebase Data Connect (PostgreSQL). This system allows coaches to unlock special profile cards based on their XP milestones.

## What Changed

### 1. GraphQL Schema Updates
- Added `TierCard` type to `schema.gql`
- Added `cardType` field to `UserCard` type
- Added `unlockedAt` field to `UserCard` type

### 2. New Queries
- `GetTierCards` - Get all active tier cards
- `GetEligibleTierCards` - Get tier cards a user qualifies for based on XP

### 3. New Mutations
- `UnlockTierCard` - Add a tier card to user's collection

### 4. Updated API Routes
- `/api/cards/tier/unlock` - Now uses Data Connect instead of Supabase
  - POST: Unlock tier cards based on XP
  - GET: Check which tier cards are available

### 5. Updated Dashboard
- `/app/dashboard/coach/cards/page.tsx` - Now includes "Tier Cards" tab
  - Shows locked/unlocked tier cards
  - Displays current XP
  - Allows coaches to unlock and activate tier cards

## Database Migration Required

**IMPORTANT:** You need to run the SQL migration script to add the `tier_cards` table and update the `user_cards` table.

### Option 1: Firebase Console (Recommended)
1. Run `firebase login --reauth` to refresh your credentials
2. Deploy Data Connect schema: `npx firebase deploy --only dataconnect`
3. Go to Firebase Console → Data Connect → SQL Editor
4. Run the migration script: `scripts/migrate-tier-cards-to-dataconnect.sql`

### Option 2: Direct SQL (If you have direct PostgreSQL access)
```bash
psql -h your-postgres-host -U your-user -d your-database -f scripts/migrate-tier-cards-to-dataconnect.sql
```

## XP Tier Thresholds

The system uses the following XP thresholds:

| Tier | Name | Required XP |
|------|------|-------------|
| 1 | Rookie Coach | 0 |
| 2 | Professional Coach | 3,000 |
| 3 | Elite Coach | 7,000 |
| 4 | Veteran Coach | 12,000 |
| 5 | Legendary Coach | 20,000 |

These are defined in:
- Database: `tier_cards` table
- Code: `app/lib/xp-calculator.ts` (`getCoachTier` function)

## How It Works

### 1. Automatic Unlocking
When a coach's XP is calculated (via `/api/coaches/[id]/xp`), they can unlock tier cards by calling:

```typescript
POST /api/cards/tier/unlock
{
  userId: "user-id",
  coachId: "coach-id",
  coachUsername: "username"
}
```

This will:
1. Fetch the coach's current XP
2. Query eligible tier cards (where `required_xp <= totalXP`)
3. Check which cards the user already owns
4. Unlock any new cards they qualify for

### 2. Manual Check
Coaches can manually check for new tier cards in the dashboard:
- Go to `/dashboard/coach/cards`
- Click "Tier Cards" tab
- Click "Check for New Tier Cards" button

### 3. Activating Cards
Once unlocked, coaches can set a tier card as active:
- It will appear as a background/overlay on their profile picture
- Visible on coach cards, search results, and profile pages

## Integration Points

### XP Calculation
The XP system is in `/api/coaches/[id]/xp/route.ts` and uses `app/lib/xp-calculator.ts`.

To auto-unlock tier cards when XP changes, you could add this to the XP route:

```typescript
// After XP is calculated
if (xpResult.total_xp > 0) {
  // Trigger tier card unlock (fire and forget)
  fetch(`${request.nextUrl.origin}/api/cards/tier/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, coachId: userId, coachUsername })
  }).catch(err => console.error('Failed to unlock tier cards:', err));
}
```

### Card Display
Tier cards are displayed alongside marketplace cards in:
- `/app/dashboard/coach/cards/page.tsx` - Management interface
- `/app/components/CoachCard.tsx` - Already shows `activeCardImageUrl`

## Testing

1. **Create a test coach with XP:**
   ```typescript
   // Use the XP calculator to set up a coach with specific XP
   GET /api/coaches/[username]/xp?userId=xxx
   ```

2. **Check available tier cards:**
   ```typescript
   GET /api/cards/tier/unlock?userId=xxx&coachId=xxx
   ```

3. **Unlock tier cards:**
   ```typescript
   POST /api/cards/tier/unlock
   { userId: "xxx", coachId: "xxx", coachUsername: "test" }
   ```

4. **Verify in dashboard:**
   - Go to `/dashboard/coach/cards`
   - Check "Tier Cards" tab
   - Verify locked/unlocked states match XP

## Tier Card Images

**TODO:** Upload tier card images to Firebase Storage or your CDN and update the `image_url` values in the database.

Default placeholder URLs are set in the migration script. Update them with:

```sql
UPDATE tier_cards SET image_url = 'https://your-cdn.com/tier-1.png' WHERE tier_number = 1;
UPDATE tier_cards SET image_url = 'https://your-cdn.com/tier-2.png' WHERE tier_number = 2;
-- etc...
```

## Troubleshooting

### "Operation not found" errors
- Make sure you've deployed the Data Connect schema: `npx firebase deploy --only dataconnect`
- Regenerate the SDK: `npx firebase dataconnect:sdk:generate`

### Tier cards not unlocking
- Check the coach's XP: `GET /api/coaches/[id]/xp?userId=xxx`
- Verify tier cards exist in database: `SELECT * FROM tier_cards;`
- Check API logs for errors

### Cards not displaying
- Verify the card was unlocked: `SELECT * FROM user_cards WHERE user_id = 'xxx' AND card_type = 'tier';`
- Check that `activeCardImageUrl` is set on the coach profile
- Ensure `CoachCard` component is rendering the card overlay

## Next Steps

1. ✅ Schema updated
2. ✅ SDK generated
3. ✅ API routes migrated
4. ✅ Dashboard updated
5. ⏳ Deploy schema to Firebase Data Connect
6. ⏳ Run SQL migration script
7. ⏳ Upload tier card images
8. ⏳ Test with real coaches
9. ⏳ (Optional) Auto-unlock on XP calculation

