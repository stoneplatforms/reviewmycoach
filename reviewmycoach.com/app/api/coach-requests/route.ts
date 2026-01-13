import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
// import { createCoachRequest, getPendingCoachRequests } from '../../lib/dataconnect';
import { verifyFirebaseToken } from '../../lib/firebase-admin-server';
import { v4 as uuidv4 } from 'uuid';

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

/**
 * POST /api/coach-requests
 * Submit a new coach request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { coachName, school, sport } = body;

    // Validate required fields
    if (!coachName || !school || !sport) {
      return NextResponse.json(
        { error: 'coachName, school, and sport are required' },
        { status: 400 }
      );
    }

    // Try to get user info from auth token (optional - users can submit without being logged in)
    let userId: string | undefined;
    let userName: string | undefined;

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const decodedToken = await verifyFirebaseToken(token);
        if (decodedToken) {
          userId = decodedToken.uid;
          userName = decodedToken.email || undefined;
        }
      } catch (error) {
        // If token is invalid, continue without user info
        console.log('Invalid token provided, submitting request without user info');
      }
    }

    // Create coach request
    // TODO: Re-enable after schema is deployed to database
    /*
    const requestId = uuidv4();
    await createCoachRequest(dataConnect, {
      id: requestId,
      submittedByUserId: userId,
      submittedByName: userName,
      coachName: coachName,
      school: school,
      sport: sport,
    });
    */

    return NextResponse.json({
      success: true,
      requestId: uuidv4(),
      message: 'Coach request feature temporarily disabled. Please contact support.',
    });

  } catch (error) {
    console.error('Error creating coach request:', error);
    return NextResponse.json(
      { error: 'Failed to submit coach request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/coach-requests
 * Get all pending coach requests (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 });
    }

    const decodedToken = await verifyFirebaseToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // TODO: Verify user is admin
    // For now, any authenticated user can view requests
    // In production, check if user has admin role

    // Fetch pending coach requests
    // TODO: Re-enable after schema is deployed to database
    /*
    const result = await getPendingCoachRequests(dataConnect);
    const requests = result.data.coachRequests || [];
    */

    return NextResponse.json({
      success: true,
      requests: [],
      count: 0,
    });

  } catch (error) {
    console.error('Error fetching coach requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coach requests', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
