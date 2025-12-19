# 🎮 Tier Cards - Complete User Flow

## Overview
Tier cards are special profile cards that coaches unlock automatically as they earn XP on the platform. Think of them like achievement badges or rank insignias that display on their profile picture.

---

## 🎯 The 5 Tier Cards

| Tier | Name | Required XP | Theme |
|------|------|-------------|-------|
| 1 | **Rookie Coach** | 0 XP | Bronze/Beginner |
| 2 | **Professional Coach** | 3,000 XP | Silver |
| 3 | **Elite Coach** | 7,000 XP | Gold |
| 4 | **Veteran Coach** | 12,000 XP | Platinum |
| 5 | **Legendary Coach** | 20,000 XP | Diamond |

---

## 📈 How Coaches Earn XP

XP is calculated based on multiple factors (see `app/lib/xp-calculator.ts`):

### Base Components
- **Subscription Tier** - Basic (1000 XP), Pro (2000 XP), Elite (3000 XP)
- **Platform Longevity** - 200 XP per year on ReviewMyCoach
- **Career Experience** - 150 XP per year of coaching career
- **Courses Created** - 300 XP per course/module published
- **Jobs Completed** - 100 XP per paid session/consultation
- **Review Score** - Up to 500 XP bonus (based on average rating)

### Multiplier
- **Consistency Multiplier** (0.5x - 2.0x) - Rewards regular activity
  - 2.0x = 10+ sessions/month (Excellent)
  - 1.5x = 5-9 sessions/month (Good)
  - 1.2x = 2-4 sessions/month (Above Average)
  - 1.0x = 1 session/month (Average)
  - 0.7x = <1 session/month (Below Average)

### Example Calculation
```
Coach Profile:
- Pro Subscription (2000 XP)
- 2 years on platform (400 XP)
- 5 years coaching career (750 XP)
- 3 courses created (900 XP)
- 50 jobs completed (5000 XP)
- 4.5/5 average rating (450 XP)
- Consistency: 1.5x

Subtotal: 9,500 XP
Total: 9,500 × 1.5 = 14,250 XP

Result: Veteran Coach (Tier 4) ✅
```

---

## 🔄 User Flow: From XP to Tier Card

### Step 1: Coach Earns XP
```
Coach Activity → XP Calculation → Total XP Updated
```

**Triggers:**
- Completing a session
- Receiving a review
- Creating a course
- Subscription upgrade
- Platform milestones

**API:** `GET /api/coaches/[id]/xp?userId=xxx`

---

### Step 2: Check for Tier Card Eligibility

**Manual Check:**
1. Coach goes to `/dashboard/coach/cards`
2. Clicks "Tier Cards" tab
3. Sees current XP: **14,250 XP**
4. Sees tier card status:
   - ✅ Tier 1: Unlocked (Active)
   - ✅ Tier 2: Unlocked
   - ✅ Tier 3: Unlocked
   - ✅ Tier 4: Unlocked
   - 🔒 Tier 5: Locked (Need 20,000 XP)

**API:** `GET /api/cards/tier/unlock?userId=xxx&coachId=xxx`

---

### Step 3: Unlock New Tier Cards

**Manual Unlock:**
1. Coach clicks "Check for New Tier Cards" button
2. System calls API with coach's userId and XP
3. API queries eligible cards from database
4. API checks which cards coach already owns
5. API unlocks new cards (adds to `user_cards` table)
6. Success message: "🎉 Unlocked 2 new tier card(s)!"

**API:** `POST /api/cards/tier/unlock`
```json
{
  "userId": "abc123",
  "coachId": "abc123",
  "coachUsername": "john_coach"
}
```

**Response:**
```json
{
  "success": true,
  "unlockedCards": [
    {
      "id": "tier-3-id",
      "tierName": "Elite Coach",
      "tierNumber": 3,
      "imageUrl": "https://cdn.com/tier-3.png"
    },
    {
      "id": "tier-4-id",
      "tierName": "Veteran Coach",
      "tierNumber": 4,
      "imageUrl": "https://cdn.com/tier-4.png"
    }
  ],
  "totalXP": 14250,
  "message": "Unlocked 2 new tier card(s)!"
}
```

---

### Step 4: Activate a Tier Card

1. Coach sees unlocked cards in "My Cards" or "Tier Cards" tab
2. Coach clicks "Set as Active" on desired card
3. System updates coach profile with `activeCardId` and `activeCardImageUrl`
4. Card now appears on coach's profile picture across the site

**API:** `POST /api/cards/user`
```json
{
  "cardId": "tier-4-id",
  "cardImageUrl": "https://cdn.com/tier-4.png",
  "coachUsername": "john_coach"
}
```

**Updates:**
- `user_cards` table: Sets `is_active = true` for selected card
- `coaches` table: Sets `active_card_id` and `active_card_image_url`

---

### Step 5: Card Displays on Profile

**Where Cards Appear:**
1. **Search Results** (`/search`) - Overlay on profile picture
2. **Our Coaches Section** (homepage) - Overlay on profile picture
3. **Coach Profile Page** (`/coach/[username]`) - Overlay on profile picture
4. **Coach Cards** (various components) - Overlay on profile picture

**Component:** `app/components/CoachCard.tsx`
```tsx
{coach.activeCardImageUrl && (
  <div className="absolute inset-0 pointer-events-none">
    <img
      src={coach.activeCardImageUrl}
      alt="Profile Card"
      className="w-full h-full object-cover"
    />
  </div>
)}
```

---

## 🔐 Locked vs Unlocked States

### Locked Card (Insufficient XP)
```
┌─────────────────────┐
│                     │
│    🔒 LOCKED        │
│                     │
│  Need 20,000 XP     │
│  (Current: 14,250)  │
│                     │
└─────────────────────┘
```
- Grayed out appearance
- Lock icon displayed
- Shows required XP
- No action buttons

### Unlocked Card (Available)
```
┌─────────────────────┐
│                     │
│  Veteran Coach      │
│     Tier 4          │
│                     │
│  [Set as Active]    │
│                     │
└─────────────────────┘
```
- Full color display
- Card image visible
- "Set as Active" button enabled
- Can be selected

### Active Card (Currently Applied)
```
┌─────────────────────┐
│   ✅ ACTIVE         │
│                     │
│  Veteran Coach      │
│     Tier 4          │
│                     │
│     [Active]        │
│                     │
└─────────────────────┘
```
- Green border
- "Active" badge
- Button disabled
- Shows on profile

---

## 🔄 Auto-Unlock (Optional Implementation)

To automatically unlock tier cards when XP is calculated, add this to `/app/api/coaches/[id]/xp/route.ts`:

```typescript
// After calculating XP
const xpResult = calculateCoachXP(inputs);

// Auto-unlock tier cards (fire and forget)
if (xpResult.total_xp > 0 && userIdParam) {
  fetch(`${request.nextUrl.origin}/api/cards/tier/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      userId: userIdParam, 
      coachId: coachId,
      coachUsername: coachData.username 
    })
  }).catch(err => console.error('Failed to auto-unlock:', err));
}

return NextResponse.json(xpResult);
```

**Benefits:**
- Coaches don't need to manually check
- Immediate gratification when XP milestones are reached
- Can show notification: "🎉 New tier card unlocked!"

**Trade-offs:**
- Extra API call on every XP calculation
- May unlock cards coach doesn't know about yet
- Could be overwhelming if multiple cards unlock at once

---

## 📊 Database Schema

### `tier_cards` Table
```sql
CREATE TABLE tier_cards (
  id TEXT PRIMARY KEY,
  tier_number INTEGER UNIQUE,
  tier_name TEXT,
  required_xp INTEGER,
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### `user_cards` Table
```sql
CREATE TABLE user_cards (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  coach_username TEXT,
  card_id TEXT,
  card_type TEXT, -- 'tier' or 'marketplace'
  card_name TEXT,
  card_image_url TEXT,
  is_active BOOLEAN,
  unlocked_at TIMESTAMP, -- For tier cards
  purchased_at TIMESTAMP, -- For marketplace cards
  stripe_payment_id TEXT,
  created_at TIMESTAMP,
  UNIQUE(user_id, card_id, card_type)
);
```

### `coaches` Table (relevant fields)
```sql
ALTER TABLE coaches ADD COLUMN active_card_id TEXT;
ALTER TABLE coaches ADD COLUMN active_card_image_url TEXT;
```

---

## 🎨 UI/UX Design Notes

### Tier Cards Tab
- Shows all 5 tier cards in a grid
- XP progress bar at the top
- "Check for New Tier Cards" button
- Visual hierarchy: Active > Unlocked > Locked

### Card States
- **Locked:** Opacity 50%, lock icon, no interaction
- **Unlocked:** Full opacity, hover effects, "Set as Active" button
- **Active:** Green border, "Active" badge, disabled button

### Notifications
- Toast/alert when new cards are unlocked
- Badge count on "Tier Cards" tab (e.g., "Tier Cards (3/5)")
- XP progress indicator

### Mobile Responsive
- Grid: 1 column on mobile, 2 on tablet, 3 on desktop
- Cards stack vertically on small screens
- Touch-friendly buttons

---

## 🧪 Testing Scenarios

### Scenario 1: New Coach (0 XP)
- Should see Tier 1 (Rookie) unlocked by default
- All other tiers locked
- Can activate Tier 1 card

### Scenario 2: Mid-Level Coach (5,000 XP)
- Tiers 1-2 unlocked
- Tier 3 locked (need 7,000 XP)
- Shows "2,000 XP to next tier"

### Scenario 3: High-Level Coach (15,000 XP)
- Tiers 1-4 unlocked
- Tier 5 locked (need 20,000 XP)
- Can switch between any unlocked tier

### Scenario 4: Legendary Coach (25,000 XP)
- All 5 tiers unlocked
- Can choose any tier card
- Shows max tier achievement

---

## 🚀 Future Enhancements

### Tier Card Variations
- Multiple designs per tier (e.g., Veteran Coach - Gold, Silver, Bronze)
- Seasonal/limited edition tier cards
- Custom tier cards for special achievements

### Gamification
- XP leaderboard
- Tier card collection achievements
- Badges for unlocking all tiers

### Social Features
- Share tier card unlocks on social media
- Compare tier progress with other coaches
- Tier-based matchmaking/recommendations

### Analytics
- Track which tier cards are most popular
- Monitor XP progression rates
- A/B test XP thresholds

---

## 📚 Related Documentation

- **XP System:** `COACH_XP_SYSTEM.md`
- **Migration Guide:** `TIER_CARDS_MIGRATION_INSTRUCTIONS.md`
- **Complete Status:** `TIER_CARDS_COMPLETE_STATUS.md`
- **Original Guide:** `TIER_CARDS_COMPLETE_GUIDE.md` (Supabase version)

---

**Status:** ✅ Fully implemented and ready for deployment
**Tech Stack:** Firebase Data Connect, PostgreSQL, GraphQL, TypeScript
**Last Updated:** December 5, 2025

