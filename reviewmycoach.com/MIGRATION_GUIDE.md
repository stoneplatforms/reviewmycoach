# Migration Guide: Firestore to PostgreSQL

This guide will help you migrate your ReviewMyCoach application from Firestore to PostgreSQL on Vercel.

## Prerequisites

1. **Vercel Account** with a project set up
2. **PostgreSQL Database** (Vercel Postgres recommended)
3. **Firebase Admin Credentials** (for exporting data)
4. **Node.js 20.x** installed locally

## Step 1: Set Up PostgreSQL on Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Create Database** → **Postgres**
3. Create a new Postgres database
4. Copy the connection string (it will be automatically added as `POSTGRES_URL` environment variable)

Alternatively, you can use an external PostgreSQL database:
- **Neon** (https://neon.tech) - Serverless Postgres
- **Supabase** (https://supabase.com) - Open source Firebase alternative
- **Railway** (https://railway.app) - Simple Postgres hosting

## Step 2: Install Dependencies

The project already includes `@vercel/postgres`. If you need to install it:

```bash
npm install @vercel/postgres
```

For the migration script, install TypeScript execution:

```bash
npm install --save-dev tsx
```

## Step 3: Set Up Environment Variables

Add these environment variables to your Vercel project:

### Required for Migration Script:
```bash
# Firebase Admin (for exporting data)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# PostgreSQL Connection (Vercel Postgres auto-provides POSTGRES_URL)
POSTGRES_URL=postgresql://user:password@host:port/database
```

### For Production (Vercel):
- `POSTGRES_URL` - Automatically set by Vercel Postgres
- `POSTGRES_HOST` - Optional, if using external database
- `POSTGRES_PORT` - Optional, default 5432
- `POSTGRES_DATABASE` - Optional
- `POSTGRES_USER` - Optional
- `POSTGRES_PASSWORD` - Optional

## Step 4: Run the Migration Script

### Option A: Run Locally

1. Make sure you have all environment variables set in a `.env.local` file:

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

2. Run the migration script:

```bash
npx tsx scripts/migrate-firestore-to-postgres.ts
```

### Option B: Run on Vercel (Recommended)

1. Create a new API route for migration:

Create `app/api/migrate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Add authentication check here
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.MIGRATION_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Import and run migration
  const { migrate } = await import('../../../scripts/migrate-firestore-to-postgres');
  const result = await migrate();
  
  return NextResponse.json(result);
}
```

2. Set `MIGRATION_SECRET` in environment variables
3. Call the endpoint:

```bash
curl -X POST https://your-app.vercel.app/api/migrate \
  -H "Authorization: Bearer YOUR_MIGRATION_SECRET"
```

## Step 5: Update Codebase

The migration includes a PostgreSQL utility module (`app/lib/postgres.ts`) that provides Firestore-like APIs. However, you'll need to update your codebase to use it.

### Update Firebase Client Imports

Replace Firestore imports:

**Before:**
```typescript
import { doc, getDoc, setDoc, collection, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase-client';
```

**After:**
```typescript
import { doc, getDoc, setDoc, collection, query, where } from '../lib/postgres';
// No need for db import
```

### Update API Routes

**Before:**
```typescript
import { db } from '../../lib/firebase-admin';

const userRef = db.collection('users').doc(userId);
const userSnap = await userRef.get();
```

**After:**
```typescript
import { doc, getDoc } from '../../lib/postgres';

const userSnap = await doc('users', userId).get();
```

### Update Client Components

**Before:**
```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase-client';

const q = query(collection(db, 'coaches'), where('sport', '==', 'Tennis'));
const snapshot = await getDocs(q);
```

**After:**
```typescript
import { collection, query, where, getDocs } from '../lib/postgres';

const q = query('coaches', where('sport', '==', 'Tennis'));
const snapshot = await q.get();
```

## Step 6: Test the Migration

1. **Verify Data Migration:**
   - Check that all collections were migrated
   - Verify document counts match
   - Spot-check a few documents

2. **Test Key Features:**
   - User authentication
   - Coach profile viewing
   - Review creation
   - Search functionality
   - Dashboard features

3. **Monitor Performance:**
   - Check query performance
   - Monitor database connections
   - Watch for errors in Vercel logs

## Step 7: Update Middleware

The middleware currently uses Firebase Admin SDK. Update it to use PostgreSQL:

**Update `middleware.ts`:**
```typescript
import { sql } from '@vercel/postgres';

// Replace Firebase Admin calls with PostgreSQL queries
const userDoc = await sql`
  SELECT * FROM users WHERE user_id = ${userId} LIMIT 1
`;
```

## Step 8: Deploy to Vercel

1. Commit your changes:
```bash
git add .
git commit -m "Migrate from Firestore to PostgreSQL"
```

2. Push to trigger deployment:
```bash
git push origin main
```

3. Monitor the deployment in Vercel dashboard

## Troubleshooting

### Connection Issues

If you see connection errors:
- Verify `POSTGRES_URL` is set correctly
- Check database is accessible from Vercel
- Ensure IP whitelist allows Vercel IPs (if using external DB)

### Migration Errors

- **"Table doesn't exist"**: The migration script auto-creates tables. Run it again.
- **"Column doesn't exist"**: The script auto-creates columns. Missing columns fall back to JSONB.
- **"Data type mismatch"**: Check the data conversion logic in the migration script.

### Performance Issues

- Add indexes for frequently queried fields
- Use connection pooling (Vercel Postgres handles this automatically)
- Consider using read replicas for heavy read workloads

## Rollback Plan

If you need to rollback:

1. Keep Firebase credentials active
2. Update environment variables to point back to Firestore
3. Revert code changes
4. Redeploy

## Additional Resources

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [@vercel/postgres Package](https://github.com/vercel/storage/tree/main/packages/postgres)

## Support

If you encounter issues:
1. Check Vercel logs: `vercel logs`
2. Check database logs in your provider's dashboard
3. Review migration script output for errors

