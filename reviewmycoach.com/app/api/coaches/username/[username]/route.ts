import { NextRequest, NextResponse } from 'next/server';
import { getCoachByUsername } from '../../../../lib/dataconnect';
import { initializeApp, getApps } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import { adminDb } from '../../../../lib/firebase-admin-server';

// Initialize Firebase Client for Data Connect
let clientApp;
if (getApps().length === 0) {
  clientApp = initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
} else {
  clientApp = getApps()[0];
}

const dataConnect = getDataConnect(clientApp, {
  connector: 'reviewmycoach',
  location: 'us-east4',
  service: 'review-my-coach-service'
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Basic username validation
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ 
        available: false, 
        error: 'Username must be 3-20 characters long and contain only letters, numbers, hyphens, and underscores' 
      }, { status: 400 });
    }

    const usernameLower = username.toLowerCase();

    // Check if username is already taken in Firestore users collection
    const usersSnapshot = await adminDb.collection('users')
      .where('username', '==', usernameLower)
      .limit(1)
      .get();
    const userExists = !usersSnapshot.empty;

    // Check if username is already taken in Data Connect coaches
    let coachExists = false;
    try {
      const result = await getCoachByUsername(dataConnect, { username: usernameLower });
      coachExists = result.data.coaches && result.data.coaches.length > 0;
    } catch (error) {
      // If error, assume available (fail open)
      console.error('Error checking coach username:', error);
    }

    // Username is available if it's not found in either location
    const available = !userExists && !coachExists;

    return NextResponse.json({ 
      available,
      username: usernameLower
    });

  } catch (error) {
    console.error('Error checking username availability:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 