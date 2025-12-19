import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../../lib/firebase-admin-server';
import { initializeApp, getApps } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import { getClaimableCoaches } from '../../../lib/dataconnect';

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

// GET - Find claimable coach profiles by email
export async function GET(req: NextRequest) {
  try {
    // Verify Firebase token
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 });
    }

    const decodedToken = await verifyFirebaseToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userEmail = decodedToken.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'Email not found in token' }, { status: 400 });
    }

    // Find unclaimed coach profiles with matching email from Data Connect
    const result = await getClaimableCoaches(dataConnect, { email: userEmail });
    const coaches = result.data.coaches || [];

    const claimableProfiles = coaches.map((coach: any) => ({
      id: coach.id,
      username: coach.username,
      displayName: coach.displayName,
      email: coach.email,
      organization: coach.organization,
      role: coach.role,
      sports: coach.sports || [],
    }));

    return NextResponse.json({ 
      claimableProfiles,
      count: claimableProfiles.length 
    });

  } catch (error) {
    console.error('Error finding claimable profiles:', error);
    return NextResponse.json({
      error: 'Failed to find claimable profiles',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
