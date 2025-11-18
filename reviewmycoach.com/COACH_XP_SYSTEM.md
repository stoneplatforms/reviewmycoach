# Coach XP System Documentation

## Overview

The Coach XP (Experience Points) system rewards coaches based on their engagement, contribution, and performance on the ReviewMyCoach platform. XP rewards both activity and consistency, encouraging long-term commitment and quality contributions.

## XP Calculation Formula

The XP system uses the following formula:

```
base_xp = subscription_tier * 1000
platform_xp = longevity_platform_years * 200
career_xp = career_years * 150
course_xp = courses_created * 300
job_xp = jobs_completed * 100
review_bonus = (review_score / 5) * 500

total_xp = (base_xp + platform_xp + career_xp + course_xp + job_xp + review_bonus) * consistency_multiplier
```

### Input Parameters

- **subscription_tier** (integer): 1 = Basic, 2 = Pro, 3 = Elite
- **longevity_platform_years** (float): Years the coach has been subscribed to RMC
- **career_years** (float): Total professional coaching years
- **courses_created** (integer): Courses or learning modules published on RMC
- **jobs_completed** (integer): Paid sessions, team consults, or assignments fulfilled
- **review_score** (float): Average rating on a 0.0-5.0 scale
- **consistency_multiplier** (float): Reflects session regularity and reliability (0.5-2.0 typical range)

## Coach Tiers

Coaches are categorized into 5 tiers based on their total XP:

| Tier | XP Range | Title |
|------|----------|-------|
| 1 | 0-2,999 | Rookie Coach |
| 2 | 3,000-6,999 | Professional Coach |
| 3 | 7,000-11,999 | Elite Coach |
| 4 | 12,000-19,999 | Veteran Coach |
| 5 | 20,000+ | Legendary Coach |

## Usage

### API Endpoint

**GET** `/api/coaches/[id]/xp`

Calculate and return XP score for a coach.

**Query Parameters:**
- `id`: Coach ID (username or userId)
- `userId`: Optional, if provided, searches by userId instead of id

**Example Request:**
```bash
GET /api/coaches/johndoe/xp
# or
GET /api/coaches/dummy/xp?userId=firebase_user_id
```

**Example Response:**
```json
{
  "coachId": "firebase_user_id",
  "coachUsername": "johndoe",
  "coachName": "John Doe",
  "xp": 5420,
  "tier": "Professional Coach",
  "tier_number": 2,
  "breakdown": {
    "base_xp": 2000,
    "platform_xp": 400,
    "career_xp": 750,
    "course_xp": 900,
    "job_xp": 500,
    "review_bonus": 400,
    "subtotal": 4950,
    "consistency_multiplier": 1.095,
    "total_xp": 5420
  },
  "breakdown_text": [
    "Base XP (Subscription): +2,000 XP",
    "Platform Longevity: +400 XP",
    "Career Experience: +750 XP",
    "Courses Created: +900 XP",
    "Jobs Completed: +500 XP",
    "Review Bonus: +400 XP",
    "Subtotal: 4,950 XP",
    "Consistency Multiplier: 1.095x",
    "Total XP: 5,420 XP"
  ],
  "inputs": {
    "subscription_tier": 2,
    "subscription_status": "active",
    "longevity_platform_years": 2.0,
    "career_years": 5,
    "courses_created": 3,
    "jobs_completed": 5,
    "review_score": 4.0,
    "consistency_multiplier": 1.095
  }
}
```

### React Hook

Use the `useCoachXP` hook in your React components:

```tsx
import { useCoachXP } from '../lib/hooks/useCoachXP';

function MyComponent() {
  const { xpData, loading, error } = useCoachXP('coach_username');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!xpData) return <div>No data</div>;
  
  return (
    <div>
      <h2>{xpData.coachName}: {xpData.xp} XP</h2>
      <p>Tier: {xpData.tier}</p>
    </div>
  );
}
```

### Display Component

Use the pre-built `CoachXPDisplay` component:

```tsx
import CoachXPDisplay from '../components/CoachXPDisplay';

function CoachProfile() {
  return (
    <div>
      <CoachXPDisplay coachId="johndoe" />
      {/* or */}
      <CoachXPDisplay userId="firebase_user_id" />
    </div>
  );
}
```

### Direct Calculation

You can also use the calculation functions directly:

```typescript
import { calculateCoachXP, getCoachTier } from '../lib/xp-calculator';

const inputs = {
  subscription_tier: 2,
  longevity_platform_years: 2.0,
  career_years: 5,
  courses_created: 3,
  jobs_completed: 5,
  review_score: 4.0,
  consistency_multiplier: 1.1,
};

const result = calculateCoachXP(inputs);
console.log(`Total XP: ${result.total_xp}`);
console.log(`Tier: ${result.tier}`);
```

## Consistency Multiplier

The consistency multiplier rewards coaches who maintain regular activity. It's calculated based on:

- Total sessions (bookings + job applications)
- Months active on the platform
- Average sessions per month

**Multiplier Ranges:**
- 0.5: Very inconsistent (new/inactive coaches)
- 0.7: Below average (< 1 session/month)
- 1.0: Average (1-2 sessions/month)
- 1.2: Above average (2-5 sessions/month)
- 1.5: Good consistency (5-10 sessions/month)
- 2.0: Excellent consistency (10+ sessions/month)

## Implementation Details

### Data Sources

The XP calculation automatically pulls data from:

1. **Subscription Tier**: `coach.subscriptionStatus` and `coach.subscriptionPlan`
2. **Platform Longevity**: `coach.createdAt` or `coach.subscriptionStartDate`
3. **Career Years**: `coach.experience` or `coach.careerYears`
4. **Courses Created**: Counts from `courses` collection where `coachId` matches and `isActive === true`
5. **Jobs Completed**: Counts from `bookings` (status: 'completed') and `job_applications` (status: 'accepted' or 'completed')
6. **Review Score**: `coach.averageRating`
7. **Consistency**: Calculated from booking history

### Files

- **Core Logic**: `app/lib/xp-calculator.ts`
- **API Endpoint**: `app/api/coaches/[id]/xp/route.ts`
- **React Hook**: `app/lib/hooks/useCoachXP.ts`
- **Display Component**: `app/components/CoachXPDisplay.tsx`

## Future Enhancements

Potential improvements to consider:

1. **Elite Tier Detection**: Add logic to detect Elite subscription tier (tier 3)
2. **Advanced Consistency**: More sophisticated consistency calculation based on session patterns
3. **XP History**: Track XP changes over time
4. **Achievements**: Add achievement badges for milestones
5. **Leaderboards**: Create XP leaderboards for coaches
6. **XP Rewards**: Implement rewards/perks for higher tiers

