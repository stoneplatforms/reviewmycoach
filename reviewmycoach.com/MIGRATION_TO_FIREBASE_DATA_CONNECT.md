# Migration to Firebase Data Connect - Action Plan

## Overview

This document outlines the complete migration from Supabase to Firebase Data Connect for PostgreSQL.

## Current Status

✅ **Completed:**
1. Firebase Data Connect configuration created (`dataconnect/dataconnect.yaml`)
2. GraphQL schema defined (`dataconnect/schema/schema.gql`)
3. Connectors created for auth, coaches, and reviews
4. Firebase client restored (`app/lib/firebase-client.ts`)
5. Data Connect client wrapper created (`app/lib/firebase-dataconnect.ts`)
6. Setup documentation created

## Required Steps

### 1. Firebase Project Setup (USER ACTION REQUIRED)

**You need to complete these steps manually:**

```bash
# 1. Authenticate with Firebase
firebase login --reauth

# 2. Ensure you're using the correct project
firebase use review-my-coach

# 3. Create Cloud SQL PostgreSQL instance in Google Cloud Console
#    - Instance ID: reviewmycoach-postgres
#    - Region: us-central1
#    - Database: reviewmycoach-db

# 4. Update dataconnect/dataconnect.yaml with your actual instance ID
#    Replace: 'review-my-coach:us-central1:reviewmycoach-postgres'
#    With your actual: 'YOUR-PROJECT-ID:us-central1:reviewmycoach-postgres'

# 5. Run the schema on Cloud SQL
firebase dataconnect:sql:shell
# Then: \i scripts/supabase-schema.sql

# 6. Deploy Data Connect
firebase deploy --only dataconnect

# 7. Generate TypeScript SDKs
firebase dataconnect:sdk:generate
```

### 2. Code Migration Plan

#### Phase 1: Authentication (Priority: HIGH)
- [ ] Update `app/signup/page.tsx` - Use Firebase Auth `createUserWithEmailAndPassword`
- [ ] Update `app/signin/page.tsx` - Use Firebase Auth `signInWithEmailAndPassword`
- [ ] Update `app/onboarding/page.tsx` - Use Firebase Auth state
- [ ] Update `app/verify-email/page.tsx` - Use Firebase Auth email verification
- [ ] Update `app/lib/hooks/useAuth.ts` - Use Firebase Auth `onAuthStateChanged`
- [ ] Remove `app/lib/auth-cookie.ts` - Not needed with Firebase Auth
- [ ] Update `middleware.ts` - Use Firebase Admin Auth to verify tokens

#### Phase 2: Database Operations (Priority: HIGH)
- [ ] Remove `app/lib/supabase-client.ts` - Replace with Data Connect
- [ ] Update all API routes in `app/api/` to use Data Connect queries/mutations
- [ ] Update client components to use generated Data Connect SDKs

#### Phase 3: Specific Page Updates (Priority: MEDIUM)
- [ ] `app/onboarding/page.tsx` - Use Data Connect for user/coach operations
- [ ] `app/dashboard/coach/*` - Use Data Connect for coach data
- [ ] `app/coach/[username]/page.tsx` - Use Data Connect queries
- [ ] `app/coaches/page.tsx` - Use Data Connect for coach search
- [ ] `app/profile/page.tsx` - Use Data Connect for user profile

#### Phase 4: API Routes (Priority: HIGH)
- [ ] `app/api/account/*` - Migrate to Data Connect
- [ ] `app/api/coaches/*` - Migrate to Data Connect
- [ ] `app/api/reviews/*` - Migrate to Data Connect
- [ ] `app/api/auth/user-role/route.ts` - Use Firebase Admin Auth

#### Phase 5: Testing & Cleanup (Priority: LOW)
- [ ] Test authentication flow
- [ ] Test onboarding flow
- [ ] Test coach profile operations
- [ ] Test review operations
- [ ] Remove Supabase dependencies
- [ ] Update documentation

## Key Changes Summary

### Authentication Changes

**Before (Supabase):**
```typescript
import { supabase } from '../lib/supabase';

const { data, error } = await supabase.auth.signUp({
  email, password
});

const session = await supabase.auth.getSession();
```

**After (Firebase):**
```typescript
import { auth } from '../lib/firebase-client';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

const userCredential = await createUserWithEmailAndPassword(auth, email, password);
const user = userCredential.user;

onAuthStateChanged(auth, (user) => {
  // Handle auth state
});
```

### Database Operations Changes

**Before (Supabase):**
```typescript
import { setDoc, getDoc } from '../lib/supabase-client';

await setDoc('users', userId, userData);
const userDoc = await getDoc('users', userId);
```

**After (Firebase Data Connect):**
```typescript
import { CreateUser, GetUser, UpdateUser } from '@/app/lib/dataconnect/auth';

await CreateUser({ id: userId, email, display_name });
const { data } = await GetUser({ id: userId });
await UpdateUser({ id: userId, username: 'newusername' });
```

### Middleware Changes

**Before (Supabase):**
```typescript
const token = request.cookies.get('supabase-token');
const { data } = await supabase.auth.getUser(token);
```

**After (Firebase):**
```typescript
import { getAuth } from 'firebase-admin/auth';

const token = request.cookies.get('firebase-token');
const decodedToken = await getAuth().verifyIdToken(token);
const userId = decodedToken.uid;
```

## Environment Variables

Ensure these are set in your `.env.local`:

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

## Benefits of This Migration

1. **Type Safety**: Auto-generated TypeScript SDKs from GraphQL schema
2. **Unified Platform**: Single platform for Auth + Database
3. **PostgreSQL Power**: Full SQL capabilities with Firebase simplicity
4. **Better DX**: GraphQL queries with relations
5. **Scalability**: Google Cloud infrastructure
6. **Cost**: Potentially lower costs with Cloud SQL

## Rollback Plan

If migration fails:
1. Revert to Supabase by checking out previous commit
2. Keep both systems running in parallel during migration
3. Use feature flags to toggle between Supabase and Firebase

## Timeline Estimate

- **Phase 1 (Auth)**: 2-3 hours
- **Phase 2 (Database)**: 4-6 hours
- **Phase 3 (Pages)**: 3-4 hours
- **Phase 4 (API Routes)**: 4-6 hours
- **Phase 5 (Testing)**: 2-3 hours

**Total**: 15-22 hours of development time

## Next Immediate Steps

1. **YOU**: Run `firebase login --reauth` in your terminal
2. **YOU**: Create Cloud SQL instance in Google Cloud Console
3. **YOU**: Update `dataconnect/dataconnect.yaml` with your instance ID
4. **YOU**: Run `firebase deploy --only dataconnect`
5. **YOU**: Run `firebase dataconnect:sdk:generate`
6. **ME**: Start migrating authentication code
7. **ME**: Update API routes to use Data Connect
8. **ME**: Test and verify the migration

## Questions?

- Do you want to proceed with this migration?
- Do you have access to Google Cloud Console to create the Cloud SQL instance?
- Should we keep Supabase Storage or migrate that too?
- Do you want to run both systems in parallel during migration?

