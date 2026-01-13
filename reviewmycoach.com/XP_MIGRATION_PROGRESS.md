# XP System Migration - Progress & Next Steps

## What We Did

### 1. Fixed Coach Profile Page Errors
- Fixed `Cannot read properties of undefined (reading 'join')` error
- Added null checks for `coach.languages`, `coach.availability`, `coach.certifications`
- Rewrote `CoachProfileClient.tsx` with proper error handling

### 2. Fixed Tier Card Disappearing Issue
- **Root Cause**: `GetCoach` query was missing fields like `activeCardImageUrl`
- **Fix**: Updated `queries.gql` to include all fields in `GetCoach` and `GetCoachByUsername`
- Updated `/api/coaches/[id]/route.ts` to return all fields

### 3. Optimized XP to Use Database Storage
**Before**: XP was calculated on every page load (slow)
**After**: XP is stored in `totalXp` field and read directly (fast)

#### Files Changed:
- `dataconnect/connectors/queries.gql` - Added `totalXp` to GetCoach queries
- `app/api/coaches/[id]/route.ts` - Returns `totalXp` from database
- `app/lib/hooks/useRealtimeReviews.ts` - Added `totalXp` to interface
- `app/coach/[username]/CoachProfileClient.tsx` - Uses stored XP instead of calculating

### 4. Created Batch XP Recalculation Endpoint
- `app/api/coaches/recalculate-xp/route.ts` - Handles 100k+ coaches with pagination
- `scripts/recalculate-all-xp.ts` - Script to run full recalculation

---

## What's Not Working Yet

### `updateCoachTotalXP` mutation not in dataconnect SDK

The mutation exists in `mutations.gql`:
```graphql
mutation UpdateCoachTotalXP(
  $id: String!
  $totalXp: Int!
) @auth(level: PUBLIC, insecureReason: "System updates XP on coach actions") {
  coach_update(
    id: $id
    data: {
      totalXp: $totalXp
    }
  )
}
```

But it's NOT exported from the generated dataconnect SDK (`app/lib/dataconnect/`).

---

## Next Steps

### ✅ 1. Regenerate DataConnect SDK - DONE
~~Run this command to regenerate the SDK with the new mutation:~~
```bash
cd reviewmycoach.com
firebase dataconnect:sdk:generate
```

**Status**: ✅ Completed (Jan 4, 2026)
- SDK regenerated successfully
- `updateCoachTotalXp` (camelCase) is now exported
- SDK copied from `dataconnect/app/lib/dataconnect` to `app/lib/dataconnect`
- Fixed import in `app/api/coaches/recalculate-xp/route.ts` from `updateCoachTotalXP` to `updateCoachTotalXp`

### ⚠️ 2. Run XP Recalculation - IN PROGRESS
**Current Status**: Partial completion with timeout issues

**What Worked**:
- First batch of 2000 coaches processed successfully in 36.13 seconds
- Average rate: 55.6 coaches/second
- No errors in first batch

**What Went Wrong**:
- Timeout errors on subsequent batches (2000+ coaches)
- Fetch timeout exceeded (36+ seconds per batch is too long)
- Default fetch timeout is ~30 seconds

**Solutions**:

Option A: Run with smaller batches (recommended for local):
```bash
# Process in smaller chunks to avoid timeouts
for i in {0..50}; do
  offset=$((i * 500))
  echo "Processing offset $offset..."
  curl -X POST "http://localhost:3000/api/coaches/recalculate-xp?offset=$offset&limit=500"
  sleep 2
done
```

Option B: Run against production (better timeout handling):
```bash
BASE_URL=https://reviewmycoach.com npx tsx scripts/recalculate-all-xp.ts
```

Option C: Update script batch size from 2000 to 500:
Edit `scripts/recalculate-all-xp.ts` line 11:
```typescript
const BATCH_SIZE = 500; // Changed from 2000
```

### 3. Verify It Works
Visit a coach profile and check:
- XP displays correctly in sidebar
- Tier card shows and doesn't disappear
- No console errors

**Test URL**: `http://localhost:3000/coach/DJR255` (or any coach username)

---

## Files Modified (Summary)

| File | Change |
|------|--------|
| `dataconnect/connectors/queries.gql` | Added `totalXp` to GetCoach, GetCoachByUsername |
| `dataconnect/connectors/mutations.gql` | Already had `UpdateCoachTotalXP` |
| `app/api/coaches/[id]/route.ts` | Returns all coach fields including `totalXp` |
| `app/api/coaches/recalculate-xp/route.ts` | Batch processing with pagination |
| `app/lib/hooks/useRealtimeReviews.ts` | Added `totalXp` to CoachProfile interface |
| `app/coach/[username]/CoachProfileClient.tsx` | Complete rewrite, uses stored XP |
| `scripts/recalculate-all-xp.ts` | New script for batch XP update |
| `package.json` | Added `cross-env` for OpenSSL fix |

---

## Environment Setup Reminders

### Install dependencies
```bash
npm install
```

### OpenSSL Fix (Windows)
Already added to package.json scripts using `cross-env`:
```json
"dev": "cross-env NODE_OPTIONS=--openssl-legacy-provider next dev"
```

### Firebase Credentials
Make sure `.env.local` has:
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

---

## Quick Test Commands

```bash
# Start dev server
npm run dev

# Test XP endpoint (dry run)
curl -X POST "http://localhost:3000/api/coaches/recalculate-xp?offset=0&limit=10&dryRun=true"

# Run actual XP update for 100 coaches
curl -X POST "http://localhost:3000/api/coaches/recalculate-xp?offset=0&limit=100"

# Run full script
npx tsx scripts/recalculate-all-xp.ts
```
