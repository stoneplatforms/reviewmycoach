# Disable Email Confirmation in Supabase

## Problem
By default, Supabase requires email confirmation before users can sign in. This causes:
- Users can't sign in immediately after sign-up
- "Email not confirmed" error when trying to sign in
- No session token available until email is confirmed

## Solution: Disable Email Confirmation

### Option 1: Via Supabase Dashboard (Recommended for Development)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings** → **Email Auth**
3. Find **"Enable email confirmations"** toggle
4. **Turn it OFF** (disable email confirmations)
5. Save changes

### Option 2: Via Supabase API (Programmatic)

You can also disable it via API, but the dashboard method is easier.

## After Disabling Email Confirmation

Once disabled:
- Users will get a session immediately after sign-up
- No email confirmation required
- Users can sign in right away
- Token will be available immediately for middleware

## For Production

If you want email confirmation in production:
- Keep it enabled
- Update sign-up flow to show "Check your email" message
- Users will need to click confirmation link before signing in
- After confirmation, they'll be redirected to onboarding

## Current Code Behavior

The code now handles both cases:
- **If email confirmation is disabled**: Session is available immediately, user is redirected to onboarding
- **If email confirmation is enabled**: User sees message to check email, redirected to sign-in

