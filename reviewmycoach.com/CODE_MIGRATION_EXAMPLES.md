# Code Migration Examples

This document shows how to migrate specific code patterns from Firebase to Supabase.

## Authentication

### Sign In

**Before (Firebase):**
```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase-client';

const userCredential = await signInWithEmailAndPassword(auth, email, password);
const user = userCredential.user;
```

**After (Supabase):**
```typescript
import { supabase } from '../lib/supabase';

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) throw error;
const user = data.user;
```

### Sign Up

**Before (Firebase):**
```typescript
import { createUserWithEmailAndPassword } from 'firebase/auth';

const userCredential = await createUserWithEmailAndPassword(auth, email, password);
```

**After (Supabase):**
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
});
```

### Google OAuth

**Before (Firebase):**
```typescript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
```

**After (Supabase):**
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
});
```

### Sign Out

**Before (Firebase):**
```typescript
import { signOut } from 'firebase/auth';

await signOut(auth);
```

**After (Supabase):**
```typescript
await supabase.auth.signOut();
```

### Get Current User

**Before (Firebase):**
```typescript
import { useAuthState } from 'react-firebase-hooks/auth';

const [user, loading, error] = useAuthState(auth);
```

**After (Supabase):**
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  supabase.auth.getUser().then(({ data: { user } }) => {
    setUser(user);
    setLoading(false);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
    setLoading(false);
  });

  return () => subscription.unsubscribe();
}, []);
```

## Database Queries

### Get Document

**Before (Firebase):**
```typescript
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase-client';

const userRef = doc(db, 'users', userId);
const userSnap = await getDoc(userRef);
if (userSnap.exists()) {
  const userData = userSnap.data();
}
```

**After (Supabase):**
```typescript
import { doc, getDoc } from '../lib/supabase-client';

const userSnap = await doc('users', userId).get();
if (userSnap) {
  const userData = userSnap.data();
}
```

### Set Document

**Before (Firebase):**
```typescript
import { doc, setDoc } from 'firebase/firestore';

const userRef = doc(db, 'users', userId);
await setDoc(userRef, { name: 'John', email: 'john@example.com' });
```

**After (Supabase):**
```typescript
import { doc, setDoc } from '../lib/supabase-client';

await doc('users', userId).set({ name: 'John', email: 'john@example.com' });
```

### Query Collection

**Before (Firebase):**
```typescript
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const q = query(
  collection(db, 'coaches'),
  where('sport', '==', 'Tennis'),
  orderBy('averageRating', 'desc'),
  limit(10)
);
const snapshot = await getDocs(q);
snapshot.forEach((doc) => {
  console.log(doc.id, doc.data());
});
```

**After (Supabase):**
```typescript
import { getDocs, where, orderBy, limit } from '../lib/supabase-client';

const snapshot = await getDocs('coaches', {
  where: [['sport', '==', 'Tennis']],
  orderBy: [['average_rating', 'desc']],
  limit: 10,
});

snapshot.docs.forEach((doc) => {
  console.log(doc.id, doc.data());
});
```

### Real-time Subscriptions

**Before (Firebase):**
```typescript
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

const reviewsRef = collection(db, 'coaches', coachId, 'reviews');
const q = query(reviewsRef, orderBy('createdAt', 'desc'));

const unsubscribe = onSnapshot(q, (snapshot) => {
  const reviews = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  setReviews(reviews);
});
```

**After (Supabase):**
```typescript
import { onSnapshot, orderBy } from '../lib/supabase-client';

const unsubscribe = onSnapshot(
  'reviews',
  (snapshot) => {
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setReviews(reviews);
  },
  {
    where: [['coach_id', '==', coachId]],
    orderBy: [['created_at', 'desc']],
  }
);
```

## File Storage

### Upload File

**Before (Firebase Storage):**
```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase-client';

const storageRef = ref(storage, `coaches/${userId}/profile.jpg`);
await uploadBytes(storageRef, file);
const url = await getDownloadURL(storageRef);
```

**After (Supabase Storage):**
```typescript
import { supabase } from '../lib/supabase';

const { data, error } = await supabase.storage
  .from('coaches')
  .upload(`${userId}/profile.jpg`, file);

if (error) throw error;

const { data: { publicUrl } } = supabase.storage
  .from('coaches')
  .getPublicUrl(`${userId}/profile.jpg`);
```

### Delete File

**Before (Firebase):**
```typescript
import { ref, deleteObject } from 'firebase/storage';

const storageRef = ref(storage, `coaches/${userId}/profile.jpg`);
await deleteObject(storageRef);
```

**After (Supabase):**
```typescript
await supabase.storage
  .from('coaches')
  .remove([`${userId}/profile.jpg`]);
```

## API Routes

### Before (Firebase Admin)

```typescript
import { db } from '../../lib/firebase-admin';

const userDoc = await db.collection('users').doc(userId).get();
if (userDoc.exists) {
  const userData = userDoc.data();
}
```

### After (Supabase Admin)

```typescript
import { supabaseAdmin } from '../../lib/supabase';

const { data: userData, error } = await supabaseAdmin
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();

if (error) throw error;
```

## Common Patterns

### Check Authentication

**Before:**
```typescript
import { useAuthState } from 'react-firebase-hooks/auth';

const [user, loading] = useAuthState(auth);
```

**After:**
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
    setLoading(false);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);
```

### Update User Profile

**Before:**
```typescript
import { updateProfile } from 'firebase/auth';

await updateProfile(auth.currentUser, {
  displayName: 'New Name',
});
```

**After:**
```typescript
const { error } = await supabase.auth.updateUser({
  data: {
    display_name: 'New Name',
  },
});
```

These examples cover the most common migration patterns. For more details, see `SUPABASE_MIGRATION_GUIDE.md`.

