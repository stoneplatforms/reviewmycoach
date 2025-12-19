# Firebase Data Connect Migration Status

## ✅ Completed

1. **Firebase Data Connect Setup**
   - Created `dataconnect/dataconnect.yaml` configuration
   - Connected to service: `review-my-coach-service`
   - Connected to Cloud SQL instance: `review-my-coach-instance`
   - Database: `review-my-coach-database`
   - Location: `us-east4`

2. **GraphQL Schema Created**
   - All tables converted to camelCase (Firebase Data Connect requirement)
   - Created types for: Users, Coaches, Reviews, Classes, Services, Jobs, JobApplications, Bookings, Conversations, Messages, Cards, UserCards, Reports, Sports, Tags, Bookmarks, IdentityVerifications
   - Schema file: `dataconnect/schema/schema.gql`

3. **Queries & Mutations Created**
   - User queries: GetUser, GetUserByEmail, GetUserByUsername, CheckUsernameAvailability
   - Coach queries: GetCoach, GetCoachByUsername, GetClaimableCoaches, CheckCoachUsernameAvailability, SearchCoaches
   - Review queries: GetCoachReviews, GetRecentReviews
   - User mutations: CreateUser, UpdateUser, CompleteOnboarding
   - Coach mutations: CreateCoach, UpdateCoach, ClaimCoach
   - Review mutations: CreateReview
   - Files: `dataconnect/connectors/queries.gql` and `dataconnect/connectors/mutations.gql`

4. **Auth Levels Configured**
   - Public queries marked with `@auth(level: PUBLIC)` for unauthenticated access
   - User-specific queries/mutations marked with `@auth(level: USER)`

5. **Firebase Client Restored**
   - `app/lib/firebase-client.ts` - Firebase Auth and Firestore client
   - `app/lib/firebase-dataconnect.ts` - Data Connect client wrapper
   - Ready for emulator support in development

## ⏳ In Progress

1. **Cloud SQL Instance Provisioning**
   - Status: Still provisioning (can take up to 20 minutes)
   - Instance: `review-my-coach-instance`
   - Once ready, we can deploy the schema

2. **Schema Deployment**
   - Schema is validated and ready
   - Waiting for Cloud SQL instance to be running
   - Command to run once ready: `npx firebase deploy --only dataconnect --force`

## 🔄 Next Steps

### Step 1: Wait for Cloud SQL (Required)
Check if the instance is ready:
```bash
npx firebase dataconnect:sql:migrate review-my-coach-service
```

If you get an error about the instance not running, wait a few more minutes and try again.

### Step 2: Deploy Schema & Generate SDKs
Once Cloud SQL is running:
```bash
# Deploy the schema
npx firebase deploy --only dataconnect --force

# Generate TypeScript SDKs
npx firebase dataconnect:sdk:generate
```

This will create typed SDKs in `app/lib/dataconnect/`

### Step 3: Migrate Authentication Code
Update these files to use Firebase Auth:
- `app/signup/page.tsx` - Replace Supabase with Firebase `createUserWithEmailAndPassword`
- `app/signin/page.tsx` - Replace Supabase with Firebase `signInWithEmailAndPassword`
- `app/onboarding/page.tsx` - Use Firebase `onAuthStateChanged`
- `app/verify-email/page.tsx` - Use Firebase `sendEmailVerification`
- `app/lib/hooks/useAuth.ts` - Use Firebase Auth hooks
- `middleware.ts` - Use Firebase Admin Auth

### Step 4: Update Database Operations
Replace Supabase database calls with Data Connect:
- Remove `app/lib/supabase-client.ts`
- Replace `setDoc`, `getDoc` with Data Connect mutations/queries
- Update all API routes in `app/api/`

### Step 5: Test Everything
- Test sign-up flow
- Test sign-in flow
- Test onboarding flow
- Test email verification
- Test coach profile operations

## 📝 Key Changes Made

### Field Naming Convention
All database fields are now camelCase in GraphQL (Firebase requirement):
- `user_id` → `userId`
- `display_name` → `displayName`
- `first_name` → `firstName`
- `created_at` → `createdAt`
- etc.

The schema maps these to snake_case PostgreSQL columns using `@col(name: "snake_case")`.

### Authentication Flow
**Old (Supabase):**
```typescript
const { data, error } = await supabase.auth.signUp({...});
```

**New (Firebase):**
```typescript
const userCredential = await createUserWithEmailAndPassword(auth, email, password);
await sendEmailVerification(userCredential.user);
```

### Database Operations
**Old (Supabase):**
```typescript
await setDoc('users', userId, userData);
```

**New (Data Connect - after SDK generation):**
```typescript
import { CreateUser } from '@/app/lib/dataconnect';
await CreateUser({ id: userId, email, displayName });
```

## ⚠️ Important Notes

1. **Cloud SQL Provisioning Time**: The Cloud SQL instance can take 10-20 minutes to provision. Be patient!

2. **Insecure Warnings**: Firebase Data Connect shows security warnings for operations that don't validate user ownership. These are intentional for public operations like viewing coach profiles.

3. **No Rollback Yet**: Once we deploy and migrate data, rolling back will be complex. Make sure you're committed to this migration.

4. **Environment Variables**: You'll need to add Firebase config to your `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   ```

## 🎯 Current Status Summary

✅ Firebase Data Connect configured  
✅ GraphQL schema created (camelCase)  
✅ Queries & mutations defined  
✅ Firebase client ready  
⏳ **WAITING: Cloud SQL instance to finish provisioning**  
⏸️ Schema deployment (blocked by Cloud SQL)  
⏸️ SDK generation (blocked by schema deployment)  
⏸️ Code migration (blocked by SDKs)  

## 📊 Estimated Timeline

- Cloud SQL provisioning: **5-15 more minutes**
- Schema deployment: **2-3 minutes**
- SDK generation: **1 minute**
- Auth migration: **1-2 hours**
- Database migration: **3-4 hours**
- Testing: **1-2 hours**

**Total remaining:** ~6-10 hours of active development

## 🚀 Ready to Continue?

Once the Cloud SQL instance is ready, run:
```bash
cd /Users/kevinvera/Documents/GitHub/reviewmycoach/reviewmycoach.com
npx firebase deploy --only dataconnect --force
npx firebase dataconnect:sdk:generate
```

Then I'll continue migrating the authentication and database code!

