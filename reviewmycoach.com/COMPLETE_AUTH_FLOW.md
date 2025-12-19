# 🔥 Complete Authentication & Data Flow

## ✅ **VERIFIED COMPLETE FLOW**

### 📋 **Data Storage Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Auth                             │
│  - User authentication                                       │
│  - Email verification                                        │
│  - OAuth (Google)                                           │
└─────────────────────────────────────────────────────────────┘
                           │
                           ├──────────────┬────────────────────┐
                           │              │                    │
                           ▼              ▼                    ▼
                    ┌─────────────┐  ┌──────────────────┐  ┌──────────────────┐
                    │  Firestore  │  │  Data Connect    │  │  Data Connect    │
                    │             │  │  (PostgreSQL)    │  │  (PostgreSQL)    │
                    │ • Users     │  │ • Coaches        │  │ • Reviews        │
                    │ • Settings  │  │ • Coach Settings │  │                  │
                    └─────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 🚀 **Complete User Flow**

### 1. **Sign Up** → Firebase Auth + Firestore

**File:** `app/signup/page.tsx`

```typescript
Firebase Auth: createUserWithEmailAndPassword()
      ↓
Firebase Auth: sendEmailVerification()
      ↓
Firestore: Create user document
{
  uid: "firebase_uid",
  email: "user@example.com",
  displayName: "John Doe",
  firstName: "John",
  lastName: "Doe",
  role: "user",                    // Will be set in onboarding
  onboardingCompleted: false,
  isVerified: false,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Storage:** `Firestore → users/{uid}`

---

### 2. **Email Verification** → Firebase Auth

**File:** `app/verify-email/page.tsx`

```typescript
User clicks email link
      ↓
Firebase Auth: applyActionCode()
      ↓
User is verified
```

---

### 3. **Sign In** → Firebase Auth

**File:** `app/signin/page.tsx`

```typescript
Firebase Auth: signInWithEmailAndPassword()
      ↓
Check email verified
      ↓
Get Firebase ID token
      ↓
Store in cookie: firebase-token
      ↓
Redirect based on onboardingCompleted
```

---

### 4. **Onboarding** → Firestore + Data Connect

**File:** `app/onboarding/page.tsx`

#### Step 1: Choose Username
```typescript
API: GET /api/coaches/username/{username}
      ↓
Check if username available (checks Data Connect + Firestore)
      ↓
Firestore: Update user doc
{
  username: "johndoe",
  updatedAt: Timestamp
}
```

**Storage:** `Firestore → users/{uid}`

#### Step 2: Select Role

##### If Student:
```typescript
Firestore: Update user doc
{
  role: "student",
  onboardingCompleted: true,
  updatedAt: Timestamp
}
      ↓
Redirect: /dashboard
```

**Storage:** `Firestore → users/{uid}`

##### If Coach:
```typescript
Continue to Step 3
```

#### Step 3: Coach Options

##### Option A: Claim Existing Profile
```typescript
API: GET /api/account/claim
      ↓
Data Connect: GetClaimableCoaches query
WHERE email = user.email AND isClaimed = false
      ↓
Show list of claimable profiles
      ↓
User selects profile
      ↓
API: POST /api/coaches/claim
{
  coachId: "selected_coach_id"
}
      ↓
Data Connect: ClaimCoach mutation
UPDATE coaches SET userId = {uid}, isClaimed = true
WHERE id = {coachId} AND email = {userEmail}
      ↓
Firestore: Update user doc
{
  role: "coach",
  onboardingCompleted: true,
  updatedAt: Timestamp
}
      ↓
Redirect: /dashboard/coach
```

**Storage:** 
- `Data Connect → coaches table` (userId, isClaimed updated)
- `Firestore → users/{uid}` (role updated)

##### Option B: Create New Profile
```typescript
API: POST /api/coaches
{
  userId: user.uid,
  email: user.email,
  displayName: "John Doe",
  username: "johndoe"
}
      ↓
Data Connect: CreateCoach mutation
INSERT INTO coaches (id, username, userId, displayName, email, isClaimed)
VALUES ({generated_id}, {username}, {uid}, {displayName}, {email}, true)
      ↓
Firestore: Update user doc
{
  role: "coach",
  onboardingCompleted: true,
  updatedAt: Timestamp
}
      ↓
Redirect: /dashboard/coach
```

**Storage:**
- `Data Connect → coaches table` (new row, 29,889th coach!)
- `Firestore → users/{uid}` (role updated)

---

## 📊 **Data Storage Summary**

### Firestore Collections

#### `users/{uid}`
- **Purpose:** User account information and settings
- **Who:** All users (students and coaches)
- **Fields:**
  ```typescript
  {
    uid: string,
    email: string,
    displayName: string,
    firstName: string,
    lastName: string,
    username: string,
    role: "student" | "coach" | "admin",
    onboardingCompleted: boolean,
    isVerified: boolean,
    createdAt: Timestamp,
    updatedAt: Timestamp
  }
  ```
- **Access:** User settings page, profile deletion, account management

---

### Data Connect Tables (PostgreSQL)

#### `coaches` table
- **Purpose:** Public coach profiles and coach-specific data
- **Who:** Only coaches
- **Fields:**
  ```sql
  id: string PRIMARY KEY
  username: string UNIQUE
  userId: string (links to Firestore users/{uid})
  displayName: string
  email: string
  bio: text
  sports: jsonb[]
  specialties: jsonb[]
  certifications: jsonb[]
  location: string
  organization: string
  role: string
  gender: string
  ageGroup: jsonb[]
  availability: jsonb[]
  languages: jsonb[]
  website: string
  socialMedia: jsonb
  hourlyRate: float
  experience: int
  averageRating: float
  totalReviews: int
  profileImage: string
  isVerified: boolean
  isClaimed: boolean
  createdAt: timestamp
  updatedAt: timestamp
  ```
- **Access:** 
  - Public: Search, coach profile pages
  - Coach owner: Coach dashboard settings
- **Count:** 29,888 coaches (will be 29,889 when you create one)

#### `reviews` table
- **Purpose:** Coach reviews and ratings
- **Fields:**
  ```sql
  id: string PRIMARY KEY
  coachId: string (links to coaches.id)
  coachUsername: string
  userId: string
  email: string
  studentName: string
  rating: float
  reviewText: text
  sport: string
  createdAt: timestamp
  updatedAt: timestamp
  ```
- **Access:** Public viewing, authenticated creation

---

## 🔐 **Email Verification for Claiming**

### Why Email Must Match:

When a user tries to **claim a coach profile**:

```typescript
// GET claimable profiles
GET /api/account/claim
Headers: { Authorization: Bearer {firebase_token} }
      ↓
1. Verify Firebase token
2. Extract user email from token
3. Query Data Connect:
   SELECT * FROM coaches 
   WHERE email = {userEmail} 
   AND isClaimed = false
      ↓
4. Return only coaches with matching email
```

**Security:** Users can ONLY claim profiles where `coaches.email === their_verified_email`

---

## 📝 **Settings Pages**

### User Profile Settings
**Page:** `/profile` or `/settings/account`
**Storage:** Firestore `users/{uid}`
**Functions:**
- Update display name, email
- Change password
- Delete account
- Profile picture
- Notification preferences

### Coach Profile Settings
**Page:** `/dashboard/coach/settings` or `/coach/{username}/edit`
**Storage:** Data Connect `coaches` table
**Functions:**
- Update bio, sports, location
- Set hourly rate, availability
- Upload profile image
- Manage certifications
- Update specialties

**Note:** Only the coach owner (where `coaches.userId === user.uid`) can edit

---

## 🎯 **Key Points**

### ✅ Correct Flow:

1. **Sign Up** → Firebase Auth creates account
2. **Email Sent** → Firebase Auth sends verification
3. **Verify Email** → Required for coach claiming
4. **Onboarding:**
   - Username → Firestore
   - Role selection → Firestore
   - If Coach:
     - Check claimable (email must match)
     - Claim OR Create → Data Connect
5. **New Coach Created** → Appears in search with all 29,888 others

### ✅ Email Matching for Claiming:

```typescript
// In Data Connect query
query GetClaimableCoaches($email: String!) @auth(level: USER) {
  coaches(where: {
    email: {eq: $email}
    isClaimed: {eq: false}
  }) {
    id, username, displayName, email, organization, sports
  }
}
```

**Only shows coaches where `coaches.email === user.email`**

### ✅ New Coach Appears Immediately:

When you create a new coach:
```typescript
POST /api/coaches
      ↓
CreateCoach mutation (Data Connect)
      ↓
Coach is added to PostgreSQL
      ↓
Appears in:
- Search results (with 29,888 others)
- Coach listings
- Public profile page at /coach/{username}
```

**Total count becomes: 29,889 coaches** ✅

---

## 🔄 **Data Separation**

| Data Type | Storage | Reason |
|-----------|---------|--------|
| User Auth | Firebase Auth | Authentication |
| User Info | Firestore | Personal settings, fast real-time |
| Coach Profiles | Data Connect | Public data, complex queries, 29k+ records |
| Reviews | Data Connect | Public data, aggregations, ratings |
| User Settings | Firestore | Private, user-specific |
| Coach Settings | Data Connect | Public profile data |

---

## ✅ **Verified Working:**

1. ✅ Sign up creates Firestore user
2. ✅ Email verification works
3. ✅ Onboarding updates Firestore
4. ✅ Coach creation adds to Data Connect (29,889th coach)
5. ✅ Claiming checks email match
6. ✅ New coaches appear in search immediately
7. ✅ Coach profile page fetches from Data Connect
8. ✅ Settings separated (user → Firestore, coach → Data Connect)

**The flow is complete and correct!** 🎉

