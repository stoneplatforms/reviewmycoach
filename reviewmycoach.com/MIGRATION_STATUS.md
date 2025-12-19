# Supabase Migration Status

## ✅ Completed

### Core Infrastructure
- [x] Created Supabase client utilities (`app/lib/supabase.ts`)
- [x] Created Firestore-like API wrapper (`app/lib/supabase-client.ts`)
- [x] Updated `useAuth` hook to use Supabase Auth
- [x] Updated middleware to use Supabase Auth token verification
- [x] Updated auth-cookie utility for Supabase tokens

### Authentication Pages
- [x] Updated signin page (`app/signin/page.tsx`)
- [x] Updated signup page (`app/signup/page.tsx`)
- [x] Updated Navbar component for Supabase sign-out

### Dashboard Pages
- [x] Updated dashboard layout (`app/dashboard/layout.tsx`)
- [x] Updated user dashboard (`app/dashboard/page.tsx`)
- [x] Updated coach dashboard (`app/dashboard/coach/page.tsx`)

### Real-time Hooks
- [x] Updated `useRealtimeReviews` hook
- [x] Updated `useRealtimeCoach` hook

### API Routes
- [x] Updated `/api/auth/user-role` route
- [x] Updated `/api/coaches` route (GET and POST)
- [x] Updated `/api/coaches/[id]/reviews` route

### Backward Compatibility
- [x] Updated `firebase-client.ts` to re-export Supabase
- [x] Updated `firebase-admin.ts` to provide compatibility layer

## 🔄 In Progress

### API Routes (Remaining)
- [ ] `/api/coaches/[id]/route.ts`
- [ ] `/api/coaches/[id]/xp/route.ts`
- [ ] `/api/coaches/username/[username]/route.ts`
- [ ] `/api/reviews/written/route.ts`
- [ ] `/api/reviews/recent/route.ts`
- [ ] `/api/search/coaches/route.ts`
- [ ] `/api/search/suggestions/route.ts`
- [ ] `/api/cards/*` routes
- [ ] `/api/stripe/*` routes
- [ ] `/api/messages/route.ts`
- [ ] `/api/classes/route.ts`
- [ ] `/api/services/route.ts`
- [ ] `/api/bookings/route.ts`
- [ ] `/api/jobs/*` routes
- [ ] `/api/subscription/*` routes
- [ ] `/api/account/*` routes
- [ ] `/api/analytics/route.ts`
- [ ] `/api/reports/route.ts`
- [ ] `/api/tags/*` routes
- [ ] `/api/sports/route.ts`
- [ ] `/api/identity/verify/route.ts`
- [ ] `/api/notifications/email/route.ts`

### Pages (Remaining)
- [ ] `/app/coaches/page.tsx`
- [ ] `/app/coach/[username]/page.tsx`
- [ ] `/app/coach/[username]/CoachProfileClient.tsx`
- [ ] `/app/profile/page.tsx`
- [ ] `/app/onboarding/page.tsx`
- [ ] `/app/admin/*` pages
- [ ] `/app/dashboard/coach/*` pages
- [ ] `/app/cards-marketplace/page.tsx`
- [ ] `/app/subscription/page.tsx`
- [ ] `/app/jobs/post/page.tsx`
- [ ] `/app/sitemap.ts`

### Components (Remaining)
- [ ] `/app/components/OurCoachesSection.tsx`
- [ ] `/app/components/MessagingModal.tsx`
- [ ] `/app/components/BookingModal.tsx`
- [ ] `/app/components/JobApplicationModal.tsx`
- [ ] `/app/components/RealtimeReviewModal.tsx`
- [ ] `/app/components/ReportReviewModal.tsx`
- [ ] `/app/components/AnalyticsDashboard.tsx`

## 📝 Migration Patterns

### Authentication
```typescript
// Before (Firebase)
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase-client';
await signInWithEmailAndPassword(auth, email, password);

// After (Supabase)
import { supabase } from '../lib/supabase';
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
```

### Database Queries
```typescript
// Before (Firestore)
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase-client';
const userRef = doc(db, 'users', userId);
const userSnap = await getDoc(userRef);

// After (Supabase)
import { doc, getDoc } from '../lib/supabase-client';
const userSnap = await doc('users', userId).get();
```

### Real-time Subscriptions
```typescript
// Before (Firestore)
import { onSnapshot } from 'firebase/firestore';
const unsubscribe = onSnapshot(queryRef, (snapshot) => { ... });

// After (Supabase)
import { supabase } from '../lib/supabase';
const channel = supabase.channel('reviews').on('postgres_changes', { ... }).subscribe();
```

## 🔧 Next Steps

1. **Complete API Routes Migration**
   - Update all remaining API routes to use Supabase
   - Test each route thoroughly

2. **Complete Pages Migration**
   - Update all remaining pages
   - Test user flows

3. **Complete Components Migration**
   - Update all remaining components
   - Test component interactions

4. **Testing**
   - Test authentication flows
   - Test database operations
   - Test real-time features
   - Test file uploads (if using Supabase Storage)

5. **Cleanup**
   - Remove Firebase dependencies from package.json
   - Remove Firebase configuration files
   - Update environment variables documentation

## ⚠️ Important Notes

- The `supabase-client.ts` wrapper provides Firestore-like APIs for easier migration
- Field names are converted from camelCase to snake_case (e.g., `createdAt` → `created_at`)
- Real-time subscriptions use Supabase's `postgres_changes` event
- Authentication tokens are stored in cookies as `supabase-token` (was `firebase-token`)

## 🐛 Known Issues

- Some API routes may still reference Firebase - needs systematic update
- Field name mappings may need adjustment based on actual schema
- Real-time subscriptions may need optimization for performance

