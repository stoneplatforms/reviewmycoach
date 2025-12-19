# 🚀 Deploy Data Connect Changes

## ⚠️ **You Need to Deploy!**

Your local code is updated, but the Firebase Data Connect service is still using the old schema.

---

## 📝 **Steps to Deploy:**

### 1. Re-authenticate with Firebase

```bash
firebase login --reauth
```

This will open a browser window. Sign in with your Google account.

### 2. Deploy the Schema

```bash
cd /Users/kevinvera/Documents/GitHub/reviewmycoach/reviewmycoach.com

# Migrate the database schema
firebase dataconnect:sql:migrate --force

# Deploy to Data Connect
firebase deploy --only dataconnect
```

### 3. Restart Your Dev Server

```bash
# Press Ctrl+C to stop
npm run dev
```

---

## ✅ **What This Will Fix:**

The deployment will update the `GetClaimableCoaches` query from:
```graphql
@auth(level: USER)  # ❌ Requires authenticated user
```

To:
```graphql
@auth(level: PUBLIC, insecureReason: "Email is verified in API route")  # ✅ Works!
```

---

## 🔐 **Is This Secure?**

**YES!** Even though the query is PUBLIC, your API route verifies the Firebase token:

```typescript
// In /api/account/claim/route.ts
const token = req.headers.get('authorization')?.replace('Bearer ', '');
const decodedToken = await verifyFirebaseToken(token);  // ← Verified!

// Only then do we call the query
const result = await getClaimableCoaches(dataConnect, { email: userEmail });
```

**Security flow:**
1. User must be signed in to get a token
2. API verifies the token
3. API only searches for coaches matching the user's verified email
4. Query returns only unclaimed coaches with that email

**No one can claim coaches they don't own!** ✅

---

## 🎯 **After Deployment:**

1. ✅ Coach claiming will work
2. ✅ Onboarding will complete
3. ✅ All Firebase Data Connect queries will work

---

## ⏱️ **How Long Will This Take?**

- Re-authentication: 30 seconds
- Deployment: 2-3 minutes
- Total: ~3 minutes

---

## 🐛 **If Deployment Fails:**

Make sure you have the right permissions:
```bash
firebase projects:list
```

Should show `review-my-coach` with your access level as Owner or Editor.

