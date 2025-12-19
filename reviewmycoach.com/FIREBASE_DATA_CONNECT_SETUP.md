# Firebase Data Connect Setup Guide

This guide will help you migrate from Supabase to Firebase Data Connect for PostgreSQL.

## Prerequisites

1. Firebase CLI installed (`npm install -g firebase-tools`)
2. Firebase project with Data Connect enabled
3. Cloud SQL PostgreSQL instance

## Step 1: Authenticate with Firebase

```bash
firebase login --reauth
```

## Step 2: Create Cloud SQL Instance

1. Go to Google Cloud Console
2. Navigate to SQL
3. Create a new PostgreSQL instance:
   - Instance ID: `reviewmycoach-postgres`
   - Region: `us-central1`
   - Database version: PostgreSQL 15
   - Machine type: Shared core (for development) or Dedicated core (for production)

4. Create a database named `reviewmycoach-db`

5. Note your instance connection name (format: `project-id:region:instance-id`)

## Step 3: Update Data Connect Configuration

Update `dataconnect/dataconnect.yaml` with your actual Cloud SQL instance ID:

```yaml
specVersion: 'v1alpha'
serviceId: 'reviewmycoach'
location: 'us-central1'
schema:
  source: './schema'
  datasource:
    postgresql:
      database: 'reviewmycoach-db'
      cloudSql:
        instanceId: 'YOUR-PROJECT-ID:us-central1:reviewmycoach-postgres'
connectorDirs:
  - './connectors'
```

## Step 4: Set Up Cloud SQL Schema

Run the existing schema file against your Cloud SQL database:

```bash
# Connect to Cloud SQL
gcloud sql connect reviewmycoach-postgres --user=postgres --database=reviewmycoach-db

# Or use the Firebase CLI
firebase dataconnect:sql:shell

# Then run the schema
\i scripts/supabase-schema.sql
```

## Step 5: Deploy Data Connect Schema

```bash
# Deploy the Data Connect service
firebase deploy --only dataconnect

# Or use the migration command
firebase dataconnect:sql:migrate
```

## Step 6: Generate TypeScript SDK

```bash
# Generate typed SDKs for all connectors
firebase dataconnect:sdk:generate
```

This will create TypeScript SDKs in:
- `app/lib/dataconnect/auth/`
- `app/lib/dataconnect/coaches/`
- `app/lib/dataconnect/reviews/`

## Step 7: Install Firebase Data Connect SDK

The Firebase SDK (v11.9.0) already includes Data Connect support. No additional packages needed!

## Step 8: Initialize Data Connect in Your App

Create a new file `app/lib/firebase-dataconnect.ts`:

```typescript
import { getDataConnect, connectDataConnectEmulator } from 'firebase/data-connect';
import { app } from './firebase-client';

// Initialize Data Connect
export const dataConnect = getDataConnect(app, {
  connector: 'reviewmycoach',
  location: 'us-central1',
  service: 'reviewmycoach'
});

// Connect to emulator in development
if (process.env.NODE_ENV === 'development') {
  connectDataConnectEmulator(dataConnect, 'localhost', 9399);
}
```

## Step 9: Use Generated SDKs

Example usage:

```typescript
import { GetUser, UpdateUser } from '@/app/lib/dataconnect/auth';
import { GetCoachByUsername, UpdateCoach } from '@/app/lib/dataconnect/coaches';
import { GetCoachReviews, CreateReview } from '@/app/lib/dataconnect/reviews';

// Query a user
const { data } = await GetUser({ id: userId });

// Update a user
await UpdateUser({ 
  id: userId, 
  username: 'newusername',
  onboarding_completed: true 
});

// Get coach by username
const { data: coach } = await GetCoachByUsername({ username: 'coach123' });

// Get reviews for a coach
const { data: reviews } = await GetCoachReviews({ 
  coach_id: coachId, 
  limit: 10 
});
```

## Step 10: Update Authentication

Firebase Data Connect works seamlessly with Firebase Auth. Update your auth code:

```typescript
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { CreateUser } from '@/app/lib/dataconnect/auth';

const auth = getAuth();

// Sign up
const { user } = await createUserWithEmailAndPassword(auth, email, password);

// Create user document in PostgreSQL via Data Connect
await CreateUser({
  id: user.uid,
  email: user.email!,
  display_name: displayName,
  role: 'user'
});

// Sign in
await signInWithEmailAndPassword(auth, email, password);
```

## Step 11: Update Middleware

Update `middleware.ts` to use Firebase Auth:

```typescript
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from './app/lib/firebase-admin';

const auth = getAuth(adminApp);

// Verify token
const decodedToken = await auth.verifyIdToken(token);
const userId = decodedToken.uid;
```

## Step 12: Local Development with Emulators

```bash
# Start Firebase emulators
firebase emulators:start

# This will start:
# - Auth Emulator (port 9099)
# - Data Connect Emulator (port 9399)
# - Firestore Emulator (port 8080) - if needed for migration
```

## Step 13: Migrate Existing Data

If you have existing data in Supabase:

1. Export data from Supabase
2. Transform to match PostgreSQL schema
3. Import into Cloud SQL

Or use the existing migration scripts and adapt them for Cloud SQL.

## Benefits of Firebase Data Connect

1. **Type-Safe**: Auto-generated TypeScript SDKs
2. **GraphQL**: Flexible queries with relations
3. **PostgreSQL**: Full SQL power with Firebase simplicity
4. **Integrated**: Works seamlessly with Firebase Auth
5. **Scalable**: Cloud SQL with Firebase's infrastructure
6. **Real-time**: Can combine with Firestore for real-time features

## Next Steps

1. Authenticate with Firebase CLI
2. Create Cloud SQL instance
3. Update `dataconnect.yaml` with your instance ID
4. Deploy schema
5. Generate SDKs
6. Update application code to use Data Connect

## Troubleshooting

### Connection Issues

```bash
# Test Cloud SQL connection
gcloud sql connect reviewmycoach-postgres --user=postgres

# Check Data Connect status
firebase dataconnect:services:list
```

### Schema Issues

```bash
# Check schema diff
firebase dataconnect:sql:diff

# Migrate schema
firebase dataconnect:sql:migrate
```

### SDK Generation Issues

```bash
# Regenerate SDKs
firebase dataconnect:sdk:generate --force
```

## Resources

- [Firebase Data Connect Documentation](https://firebase.google.com/docs/data-connect)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [GraphQL Schema Reference](https://firebase.google.com/docs/data-connect/gql-schema-reference)

