# Complete Firebase Migration Status

## Migration Overview
Moving from **Supabase** to **Firebase** completely:
- Authentication: Supabase Auth → Firebase Auth ✅
- User Profiles: Supabase DB → Firestore ✅
- Coaches: Supabase → Firebase Data Connect ✅
- Reviews: Supabase → Firebase Data Connect (TODO)
- Other Data: Supabase → Firebase Data Connect (TODO)

---

## ✅ Completed Migrations

### 1. Firebase Auth Setup
- ✅ Firebase client configuration (`app/lib/firebase-client.ts`)
- ✅ Auth, Firestore, and Data Connect initialized

### 2. Sign Up Page (`app/signup/page.tsx`)
- ✅ Migrated to `createUserWithEmailAndPassword()`
- ✅ User documents now created in Firestore
- ✅ Email verification via `sendEmailVerification()`
- ✅ Google OAuth via `signInWithPopup()`

### 3. Sign In Page (`app/signin/page.tsx`)
- ✅ Migrated to `signInWithEmailAndPassword()`
- ✅ Email verification check
- ✅ Google OAuth via `signInWithPopup()`
- ✅ ID token stored in cookies

### 4. Email Verification (`app/verify-email/page.tsx`)
- ✅ Complete rewrite for Firebase Auth
- ✅ Handles `applyActionCode()` for email verification
- ✅ Resend verification emails
- ✅ Auto-redirect after verification

### 5. useAuth Hook (`app/lib/hooks/useAuth.ts`)
- ✅ Migrated to Firebase `onAuthStateChanged()`
- ✅ Reads user data from Firestore
- ✅ Stores Firebase ID tokens in cookies

### 6. Coaches Data
- ✅ Already migrated to Firebase Data Connect
- ✅ Search and listings working

---

## ⚠️ CRITICAL: Remaining Work

### 1. Middleware (`middleware.ts`) - NEEDS UPDATE
**Current State:** Still using Supabase token verification

**Required Changes:**
```typescript
// OLD: Supabase verification
const token = request.cookies.get('supabase-token')?.value;
await verifySupabaseToken(token);

// NEW: Firebase verification
const token = request.cookies.get('firebase-token')?.value;
await verifyFirebaseToken(token); // Use Firebase Admin SDK
```

**Action Items:**
1. Update cookie name from `supabase-token` to `firebase-token`
2. Create `verifyFirebaseToken()` function using Firebase Admin SDK
3. Update `/api/auth/user-role` endpoint to use Firestore
4. Test all protected routes

### 2. Auth Cookie Helper (`app/lib/auth-cookie.ts`)
**Needs Update:**
- Change cookie name from `supabase-token` to `firebase-token`

### 3. Reviews Migration to Firebase Data Connect
**Current:** Still in Supabase
**Target:** Firebase Data Connect

**Steps:**
1. Add review queries to `dataconnect/connectors/queries.gql`
2. Add review mutations to `dataconnect/connectors/mutations.gql`
3. Generate SDK: `firebase dataconnect:sdk:generate`
4. Update `useRealtimeReviews` hook
5. Deploy to Data Connect

### 4. API Routes - Remove Supabase Dependencies
**Files that need updating:**
- `/api/auth/user-role` - Use Firestore instead of Supabase
- `/api/services/*` - Already using compatibility wrapper (OK for now)
- `/api/coaches/*` - Already using compatibility wrapper (OK for now)

### 5. Firestore Compatibility Wrappers
**Files using old Supabase wrappers:**
- `app/lib/supabase-client.ts` - Update to use Firestore directly
- `app/lib/hooks/useRealtimeReviews.ts` - Update to use Firestore

---

## 🔧 Quick Fixes Needed

### Fix 1: Update auth-cookie.ts
```typescript
// Change cookie name
export async function setAuthToken(token: string) {
  document.cookie = `firebase-token=${token}; path=/; max-age=604800; SameSite=Lax`;
}

export function clearAuthToken() {
  document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}
```

### Fix 2: Create Firebase Admin Token Verification
```typescript
// middleware.ts
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

async function verifyFirebaseToken(token: string) {
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    return { uid: decodedToken.uid, email: decodedToken.email };
  } catch (error) {
    return null;
  }
}
```

### Fix 3: Update API Route for User Role
```typescript
// app/api/auth/user-role/route.ts
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase-client';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return NextResponse.json(userSnap.data());
  }
  
  return NextResponse.json({ error: 'User not found' }, { status: 404 });
}
```

---

## 📋 Testing Checklist

### Authentication Flow
- [ ] Sign up with email/password
- [ ] Receive verification email
- [ ] Click verification link
- [ ] Sign in with verified account
- [ ] Sign up with Google OAuth
- [ ] Sign in with Google OAuth
- [ ] Sign out
- [ ] Password reset (if implemented)

### Protected Routes
- [ ] Access `/dashboard` without auth → redirects to `/signin`
- [ ] Access `/dashboard` with auth → loads dashboard
- [ ] Access `/onboarding` without completing → stays on onboarding
- [ ] Access `/dashboard` without onboarding → redirects to onboarding
- [ ] Coach role → redirects to `/dashboard/coach`
- [ ] Student role → stays on `/dashboard`

### Data Access
- [ ] Coach profiles load correctly
- [ ] Reviews display (after migration)
- [ ] Services load (after migration)
- [ ] User profile data loads

---

## 🚀 Deployment Steps

### Before Deploying:
1. ✅ Ensure Firebase project is set up
2. ✅ Cloud SQL instance is running
3. ✅ Data Connect schema is deployed
4. ⚠️ **BACKUP SUPABASE DATA** before migrating
5. ⚠️ Test thoroughly in development

### Environment Variables Needed:
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Remove these after migration:
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Migration Steps:
1. Deploy new code to staging
2. Test all authentication flows
3. Migrate user data from Supabase to Firestore
4. Migrate reviews to Data Connect
5. Test data access
6. Deploy to production
7. Monitor for errors
8. Remove Supabase packages

---

## 📦 Packages to Remove (After Full Migration)
```bash
npm uninstall @supabase/supabase-js @supabase/ssr
```

---

## ⚡ Current Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Firebase Auth | ✅ Migrated | Sign up/in working |
| Firestore Users | ✅ Migrated | User profiles in Firestore |
| Email Verification | ✅ Migrated | Firebase email verification |
| useAuth Hook | ✅ Migrated | Using Firebase Auth |
| Middleware | ⚠️ **NEEDS UPDATE** | Still using Supabase verification |
| Auth Cookies | ⚠️ **NEEDS UPDATE** | Cookie name needs changing |
| Coaches Data | ✅ Migrated | Firebase Data Connect |
| Reviews | ❌ Not Started | Still in Supabase |
| Services/XP | ⚠️ Partial | Using compatibility wrapper |

---

## 🎯 Next Steps (Priority Order)

1. **HIGH PRIORITY:**
   - Update `middleware.ts` to use Firebase Admin SDK
   - Update `auth-cookie.ts` cookie names
   - Create `/api/auth/user-role` endpoint for Firestore
   - Test authentication flow end-to-end

2. **MEDIUM PRIORITY:**
   - Migrate reviews to Firebase Data Connect
   - Update `useRealtimeReviews` to use Firestore
   - Test all data access

3. **LOW PRIORITY:**
   - Remove Supabase compatibility wrappers
   - Remove Supabase packages
   - Clean up old code

---

## ⚠️ IMPORTANT WARNINGS

1. **DO NOT deploy to production yet** - middleware needs updating
2. **Backup all Supabase data** before final migration
3. **Test thoroughly** in development first
4. **Users will need to re-authenticate** after deployment
5. **Email templates** may need updating in Firebase Console

---

## 🆘 Need Help?

If you encounter issues:
1. Check Firebase Console for auth errors
2. Check browser console for client-side errors
3. Check server logs for API errors
4. Verify environment variables are set correctly
5. Ensure Firebase Admin SDK is initialized properly

