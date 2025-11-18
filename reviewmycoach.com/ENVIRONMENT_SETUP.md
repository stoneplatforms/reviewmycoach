# Environment Setup Guide

## Issues Fixed

### 1. connect/route.ts and services/route.ts Authentication Errors

The errors you were experiencing were due to missing or incorrectly configured environment variables. The Firebase Admin SDK cannot authenticate properly, which causes the "Getting metadata from plugin failed" error.

### 2. Username-based Coach Routes (SSR)

I've implemented a new username-based route structure for coaches:
- **New route**: `/coach/[username]` (e.g., `/coach/johndoe`)
- **Old route**: `/coach/[id]` (still works for backward compatibility)
- **Benefits**: Better SEO, user-friendly URLs, proper SSR optimization

### 3. Improved Error Handling

Enhanced error handling throughout the application:
- Better authentication error messages
- Environment variable validation
- Graceful fallbacks for missing data

## Required Environment Variables

Create a `.env.local` file in the `reviewmycoach` directory with the following variables:

### Firebase Admin SDK Configuration
```
FIREBASE_ADMIN_PROJECT_ID=your-firebase-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-firebase-admin-client-email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-here\n-----END PRIVATE KEY-----"
```

### Firebase Client SDK Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
```

### Stripe Configuration
```
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

### Application Configuration
```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### reCAPTCHA Configuration
```
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

## How to Get the Values

### Firebase Admin SDK
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Extract the values:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (keep the quotes and \n characters)

### Firebase Client SDK
1. Go to Project Settings > General
2. Under "Your apps" section, find your web app
3. Copy the config values

### Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to Developers > API Keys
3. Copy your publishable and secret keys
4. For webhook secret, go to Developers > Webhooks and get the endpoint secret

### reCAPTCHA
1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Create a new site or use existing
3. Get the site key and secret key

## Steps to Fix

1. Create the `.env.local` file with all the variables above
2. Restart your development server: `npm run dev`
3. The `connect/route.ts` should now work properly

## Important Notes

- The `FIREBASE_ADMIN_PRIVATE_KEY` should be enclosed in quotes and keep the \n characters
- Make sure all environment variables are properly set before starting the server
- Never commit the `.env.local` file to version control
- The `.env.local` file should be in the same directory as your `package.json`

## Testing

After setting up the environment variables, you can test the routes by:

### 1. Testing Username-based Coach Routes
```bash
# Visit coach profiles using usernames
http://localhost:3000/coach/johndoe
http://localhost:3000/coach/coach_username

# The old ID-based routes still work for backward compatibility
http://localhost:3000/coach/coach_id_123
```

### 2. Testing API Routes
```bash
# Test services API
curl -X GET "http://localhost:3000/api/services?coachId=coach_id&limit=10"

# Test connect route (requires authentication)
curl -X POST "http://localhost:3000/api/stripe/connect" \
  -H "Content-Type: application/json" \
  -d '{"idToken": "your_firebase_token", "email": "coach@example.com"}'
```

### 3. Testing Search Functionality
```bash
# Test username search
curl -X GET "http://localhost:3000/api/coaches/username/johndoe"

# Test general search
curl -X GET "http://localhost:3000/api/search/coaches?search=tennis"
```

## Troubleshooting

If you're still having issues, check:
- All environment variables are spelled correctly
- The Firebase Admin private key is properly formatted (with proper \n characters)
- Your Firebase project has the necessary permissions
- The Stripe API keys are valid and from the correct environment (test/live)
- Usernames are properly set in coach profiles
- Firestore indexes are deployed (see `firestore.indexes.json`) 