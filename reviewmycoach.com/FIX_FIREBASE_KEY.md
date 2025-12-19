# Fix Firebase Admin Private Key Error

## Error
```
error:1E08010C:DECODER routines::unsupported
```

## Cause
The `FIREBASE_ADMIN_PRIVATE_KEY` in your `.env.local` file has quotes or formatting issues.

## Solution

### Option 1: Fix the .env.local file directly

Open `.env.local` and find the `FIREBASE_ADMIN_PRIVATE_KEY` line.

**It should look like this (NO quotes around the value):**
```bash
FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC8...\n-----END PRIVATE KEY-----\n
```

**NOT like this (with quotes):**
```bash
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE..."
```

### Option 2: Use the Service Account JSON file

Alternatively, use the JSON file approach which is more reliable:

1. Keep your `Review My Coach Firebase Service Account.json` file in the project root
2. Set this in `.env.local`:
```bash
GOOGLE_APPLICATION_CREDENTIALS=./Review My Coach Firebase Service Account.json
```

3. Remove or comment out these lines:
```bash
# FIREBASE_ADMIN_PRIVATE_KEY=...
# FIREBASE_ADMIN_CLIENT_EMAIL=...
# FIREBASE_ADMIN_PROJECT_ID=...
```

### Option 3: Quick Test

Run this command to test your Firebase Admin connection:
```bash
node -e "const admin = require('firebase-admin'); const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY; console.log('Key length:', key?.length, 'Has newlines:', key?.includes('\\n'));"
```

## After Making Changes

1. Kill the dev server
2. Restart with `npm run dev`
3. The error should be gone

## Current Status

The code has been updated to better handle quoted keys, but the most reliable solution is to use the JSON file approach (Option 2).

