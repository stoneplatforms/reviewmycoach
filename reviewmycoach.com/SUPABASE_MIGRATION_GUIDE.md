# Complete Supabase Migration Guide

This guide will help you migrate your ReviewMyCoach application from Firebase (Firestore + Auth) to Supabase (PostgreSQL + Auth).

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Set Up Supabase](#step-1-set-up-supabase)
3. [Step 2: Install Dependencies](#step-2-install-dependencies)
4. [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
5. [Step 4: Create Database Schema](#step-4-create-database-schema)
6. [Step 5: Migrate Firestore Data](#step-5-migrate-firestore-data)
7. [Step 6: Migrate Firebase Auth](#step-6-migrate-firebase-auth)
8. [Step 7: Update Codebase](#step-7-update-codebase)
9. [Step 8: Test Migration](#step-8-test-migration)
10. [Step 9: Deploy](#step-9-deploy)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- ✅ Supabase account (sign up at https://supabase.com)
- ✅ Firebase Admin credentials (for data export)
- ✅ Node.js 20.x installed
- ✅ Git repository access

---

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `reviewmycoach` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start

4. Wait for project to be created (~2 minutes)

### 1.2 Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this secret!

---

## Step 2: Install Dependencies

```bash
cd reviewmycoach.com
npm install
```

This will install:
- `@supabase/supabase-js` - Supabase client library
- `tsx` - TypeScript execution (for migration scripts)

---

## Step 3: Configure Environment Variables

### 3.1 Local Development (.env.local)

Create/update `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (service_role key - keep secret!)

# Firebase Admin (for migration only)
FIREBASE_ADMIN_PROJECT_ID=your-firebase-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Migration Security
MIGRATION_SECRET=your-secret-key-here
```

### 3.2 Vercel Production

Add the same environment variables in Vercel:
1. Go to your project → **Settings** → **Environment Variables**
2. Add all variables from above
3. Make sure to set them for **Production**, **Preview**, and **Development**

---

## Step 4: Create Database Schema

### 4.1 Run Schema SQL

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **"New Query"**
3. Copy contents of `scripts/supabase-schema.sql`
4. Paste and click **"Run"**
5. Verify tables were created in **Table Editor**

### 4.2 Verify Tables

You should see these tables:
- `users`
- `coaches`
- `reviews`
- `classes`
- `services`
- `jobs`
- `job_applications`
- `bookings`
- `conversations`
- `messages`
- `cards`
- `user_cards`
- `reports`
- `sports`
- `tags`
- `bookmarks`
- `identity_verifications`
- `notifications`
- `analytics`

---

## Step 5: Migrate Firestore Data

### Option A: Run Migration Script Locally

```bash
npm run migrate:firestore-to-supabase
```

This will:
- ✅ Connect to Firestore
- ✅ Connect to Supabase
- ✅ Export all collections
- ✅ Import into Supabase PostgreSQL
- ✅ Show progress and errors

### Option B: Run Migration via API (Recommended for Production)

1. Deploy your app to Vercel first
2. Call the migration endpoint:

```bash
curl -X POST https://your-app.vercel.app/api/migrate/firestore \
  -H "Authorization: Bearer YOUR_MIGRATION_SECRET"
```

### 5.1 Verify Data Migration

1. Go to Supabase Dashboard → **Table Editor**
2. Check a few tables (e.g., `coaches`, `reviews`)
3. Verify document counts match Firestore
4. Spot-check a few records

---

## Step 6: Migrate Firebase Auth

### 6.1 Run Auth Migration Script

```bash
npm run migrate:firebase-auth-to-supabase
```

This will:
- ✅ Export all Firebase Auth users
- ✅ Import into Supabase Auth
- ✅ Preserve email, display name, photo URL
- ✅ Handle OAuth providers (Google, etc.)

### 6.2 Important Notes

⚠️ **Password Migration**: Firebase doesn't expose password hashes. Users with email/password auth will need to:
- Reset their password, OR
- Use "Forgot Password" flow

📧 **Email Users**: You may want to send an email notification about the migration.

### 6.3 Verify Auth Migration

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Verify user count matches Firebase
3. Test login with a migrated user

---

## Step 7: Update Codebase

### 7.1 Update Imports

Replace Firebase imports with Supabase:

**Before:**
```typescript
import { doc, getDoc, collection, query, where } from 'firebase/firestore';
import { auth } from '../lib/firebase-client';
import { db } from '../lib/firebase-client';
```

**After:**
```typescript
import { doc, getDoc, collection, query, where } from '../lib/supabase-client';
import { supabase } from '../lib/supabase';
```

### 7.2 Update Authentication

**Before:**
```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase-client';

await signInWithEmailAndPassword(auth, email, password);
```

**After:**
```typescript
import { supabase } from '../lib/supabase';

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

### 7.3 Update Database Queries

**Before:**
```typescript
const userRef = doc(db, 'users', userId);
const userSnap = await getDoc(userRef);
```

**After:**
```typescript
const userSnap = await doc('users', userId).get();
```

### 7.4 Update Real-time Subscriptions

**Before:**
```typescript
import { onSnapshot } from 'firebase/firestore';

const unsubscribe = onSnapshot(query, (snapshot) => {
  // Handle updates
});
```

**After:**
```typescript
import { onSnapshot } from '../lib/supabase-client';

const unsubscribe = onSnapshot('reviews', (snapshot) => {
  // Handle updates
}, { where: [['coach_id', '==', coachId]] });
```

### 7.5 Update File Storage

**Before:**
```typescript
import { storage } from '../lib/firebase-client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storageRef = ref(storage, `coaches/${userId}/profile.jpg`);
await uploadBytes(storageRef, file);
const url = await getDownloadURL(storageRef);
```

**After:**
```typescript
import { supabase } from '../lib/supabase';

const { data, error } = await supabase.storage
  .from('coaches')
  .upload(`${userId}/profile.jpg`, file);

const { data: { publicUrl } } = supabase.storage
  .from('coaches')
  .getPublicUrl(`${userId}/profile.jpg`);
```

---

## Step 8: Test Migration

### 8.1 Test Checklist

- [ ] **Authentication**
  - [ ] Sign in with email/password
  - [ ] Sign in with Google OAuth
  - [ ] Sign up new user
  - [ ] Sign out

- [ ] **Database Queries**
  - [ ] Load coach profiles
  - [ ] Load reviews
  - [ ] Search coaches
  - [ ] Create/update coach profile

- [ ] **Real-time Features**
  - [ ] New reviews appear in real-time
  - [ ] Rating updates automatically

- [ ] **File Storage**
  - [ ] Upload profile image
  - [ ] View uploaded images

- [ ] **API Routes**
  - [ ] Test all API endpoints
  - [ ] Verify data is correct

### 8.2 Common Issues

**Issue**: "Table doesn't exist"
- **Solution**: Run schema.sql again

**Issue**: "RLS policy violation"
- **Solution**: Check Row Level Security policies in Supabase

**Issue**: "Auth user not found"
- **Solution**: Verify auth migration completed successfully

---

## Step 9: Deploy

### 9.1 Commit Changes

```bash
git add .
git commit -m "Migrate from Firebase to Supabase"
```

### 9.2 Push to Vercel

```bash
git push origin main
```

Vercel will automatically deploy with new environment variables.

### 9.3 Verify Production

1. Test production site
2. Check Vercel logs for errors
3. Monitor Supabase dashboard for queries

---

## Troubleshooting

### Migration Script Errors

**Error**: "Missing Supabase environment variables"
- **Solution**: Check `.env.local` has all required variables

**Error**: "Table doesn't exist"
- **Solution**: Run `supabase-schema.sql` first

**Error**: "Connection timeout"
- **Solution**: Check Supabase project is active, verify URL is correct

### Code Errors

**Error**: "supabase is not defined"
- **Solution**: Import from `../lib/supabase` not `firebase-client`

**Error**: "RLS policy violation"
- **Solution**: Update RLS policies in Supabase dashboard

**Error**: "Auth session not found"
- **Solution**: Check auth migration completed, verify user exists in Supabase Auth

### Performance Issues

- **Slow queries**: Add indexes in Supabase dashboard
- **Too many requests**: Check query patterns, use pagination
- **Real-time not working**: Verify Supabase real-time is enabled

---

## Rollback Plan

If you need to rollback:

1. **Keep Firebase active** during migration
2. **Update environment variables** to point back to Firebase
3. **Revert code changes** (git revert)
4. **Redeploy**

---

## Post-Migration Checklist

- [ ] All data migrated successfully
- [ ] All users can authenticate
- [ ] Real-time features working
- [ ] File uploads working
- [ ] API routes functioning
- [ ] Production site tested
- [ ] Monitoring set up
- [ ] Documentation updated

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Migration Guide](https://supabase.com/docs/guides/auth/auth-migration)
- [Supabase Real-time Guide](https://supabase.com/docs/guides/realtime)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)

---

## Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Check Vercel logs
3. Review migration script output
4. Verify environment variables are set correctly

Good luck with your migration! 🚀

