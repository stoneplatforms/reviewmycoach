# Quick Start: Supabase Migration

## 🚀 5-Minute Setup

### 1. Create Supabase Project

1. Go to https://supabase.com → **New Project**
2. Copy **Project URL** and **API Keys** from Settings → API

### 2. Set Environment Variables

Add to `.env.local` and Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
MIGRATION_SECRET=your-secret-key
```

### 3. Create Database Schema

1. Supabase Dashboard → **SQL Editor**
2. Copy `scripts/supabase-schema.sql`
3. Paste and **Run**

### 4. Run Migrations

```bash
# Install dependencies
npm install

# Migrate Firestore data
npm run migrate:firestore-to-supabase

# Migrate Firebase Auth users
npm run migrate:firebase-auth-to-supabase
```

### 5. Update Code

Replace Firebase imports:

```typescript
// Before
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../lib/firebase-client';

// After
import { doc, getDoc } from '../lib/supabase-client';
import { supabase } from '../lib/supabase';
```

### 6. Deploy

```bash
git add .
git commit -m "Migrate to Supabase"
git push
```

## ✅ Done!

See `SUPABASE_MIGRATION_GUIDE.md` for detailed instructions.

