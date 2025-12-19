# Quick Start: Firestore to PostgreSQL Migration

## 🚀 Quick Migration Steps

### 1. Set Up PostgreSQL on Vercel

1. Go to your Vercel project → **Storage** → **Create Database** → **Postgres**
2. Create database (connection string auto-added as `POSTGRES_URL`)

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Environment Variables

Add to Vercel project settings or `.env.local`:

```bash
# Firebase Admin (for exporting)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# PostgreSQL (auto-set by Vercel Postgres)
POSTGRES_URL=postgresql://user:pass@host:port/db

# Migration Security
MIGRATION_SECRET=your-secret-key-here
```

### 4. Run Migration

**Option A: Via API (Recommended for Vercel)**

```bash
curl -X POST https://your-app.vercel.app/api/migrate \
  -H "Authorization: Bearer your-secret-key-here"
```

**Option B: Local Script**

```bash
npm run migrate:firestore-to-postgres
```

### 5. Check Migration Status

```bash
curl https://your-app.vercel.app/api/migrate \
  -H "Authorization: Bearer your-secret-key-here"
```

### 6. Update Codebase

Replace Firestore imports with PostgreSQL utilities:

```typescript
// Before
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase-client';

// After  
import { doc, getDoc } from '../lib/postgres';
```

### 7. Deploy

```bash
git add .
git commit -m "Migrate to PostgreSQL"
git push
```

## 📋 What Gets Migrated

- ✅ Users
- ✅ Coaches  
- ✅ Reviews
- ✅ Classes
- ✅ Services
- ✅ Jobs & Applications
- ✅ Bookings
- ✅ Messages/Conversations
- ✅ Cards & User Cards
- ✅ Reports
- ✅ Sports, Tags, Categories
- ✅ Bookmarks
- ✅ Notifications
- ✅ Analytics
- ✅ Identity Verifications

## 🔍 Verification

After migration, verify:

1. **Data Counts Match**: Compare Firestore document counts with PostgreSQL
2. **Key Features Work**: Test login, coach profiles, reviews
3. **Search Works**: Test coach search functionality
4. **Dashboard Loads**: Check coach and user dashboards

## ⚠️ Important Notes

- **Backup First**: Export Firestore data before migration
- **Test Environment**: Run migration on staging first
- **Keep Firebase**: Don't delete Firebase until migration verified
- **Monitor**: Watch Vercel logs during migration

## 🆘 Troubleshooting

**Connection Error**: Check `POSTGRES_URL` is set correctly

**Migration Fails**: Check Firebase Admin credentials are valid

**Missing Data**: Re-run migration (it's idempotent - safe to run multiple times)

**Performance Issues**: Add indexes for frequently queried fields

## 📚 Full Documentation

See `MIGRATION_GUIDE.md` for detailed instructions.

