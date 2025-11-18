import { NextRequest, NextResponse } from 'next/server';

// Function to get Firebase instances
async function getFirebaseInstances() {
  try {
    const firebaseAdminModule = await import('../../../lib/firebase-admin');
    return {
      auth: firebaseAdminModule.auth,
      db: firebaseAdminModule.db
    };
  } catch (error) {
    console.error('Failed to load Firebase Admin in coaches claim route:', error);
    return { auth: null, db: null };
  }
}

// GET - Find claimable coach profiles by email
export async function GET(req: NextRequest) {
  const { auth, db } = await getFirebaseInstances();
  
  if (!db || !auth) {
    return NextResponse.json({
      error: 'Service temporarily unavailable'
    }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    // Find unclaimed coach profiles with matching email
    const coachesQuery = await db.collection('coaches')
      .where('email', '==', email)
      .where('isClaimed', '==', false)
      .get();

    const claimableProfiles = coachesQuery.docs.map((doc: any) => ({
      id: doc.id,
      username: doc.data().username,
      displayName: doc.data().displayName,
      email: doc.data().email,
      organization: doc.data().organization,
      role: doc.data().role,
      sports: doc.data().sports,
      phoneNumber: doc.data().phoneNumber,
      sourceUrl: doc.data().sourceUrl,
      verificationStatus: doc.data().verificationStatus
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

// POST - Claim a coach profile
export async function POST(req: NextRequest) {
  const { auth, db } = await getFirebaseInstances();
  
  if (!db || !auth) {
    return NextResponse.json({
      error: 'Service temporarily unavailable'  
    }, { status: 503 });
  }

  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No authentication token provided' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;
    const emailVerified = Boolean((decodedToken as any).email_verified);

    const { coachUsername, verificationData } = await req.json();

    if (!coachUsername) {
      return NextResponse.json({ error: 'Coach username required' }, { status: 400 });
    }

    // Get the coach profile to claim
    const coachRef = db.collection('coaches').doc(coachUsername);
    const coachDoc = await coachRef.get();

    if (!coachDoc.exists) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
    }

    const coachData = coachDoc.data();

    // Verify profile is claimable
    if (!coachData || coachData.isClaimed) {
      return NextResponse.json({ 
        error: 'Profile already claimed',
        message: 'This coach profile has already been claimed by another user'
      }, { status: 400 });
    }

    // Verify email matches
    if (coachData.email !== userEmail) {
      return NextResponse.json({ 
        error: 'Email mismatch',
        message: 'Your email does not match the coach profile email'
      }, { status: 400 });
    }

    // Require the user's email to be verified (school email control)
    if (!emailVerified) {
      return NextResponse.json({ 
        error: 'Email not verified',
        message: 'Please verify your school email before claiming this profile'
      }, { status: 400 });
    }

    // Update the coach profile to mark as claimed and verified via email
    await coachRef.update({
      userId: userId,
      isClaimed: true,
      claimedAt: new Date(),
      verificationStatus: 'verified',
      verificationMethod: 'email',
      updatedAt: new Date()
    });

    // Update user document to set role as coach
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      role: 'coach',
      claimedCoachProfile: coachUsername,
      onboardingCompleted: true,
      updatedAt: new Date()
    });

    // Store verification data if provided
    if (verificationData) {
      const verificationRef = db.collection('identity_verifications').doc(userId);
      await verificationRef.set({
        userId: userId,
        coachUsername: coachUsername,
        verificationData: verificationData,
        status: 'submitted',
        submittedAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,
        notes: ''
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile claimed successfully',
      coachProfile: {
        id: coachDoc.id,
        username: coachData.username,
        displayName: coachData.displayName,
        email: coachData.email,
        sports: coachData.sports,
        organization: coachData.organization,
        role: coachData.role
      }
    });

  } catch (error) {
    console.error('Error claiming coach profile:', error);
    return NextResponse.json({
      error: 'Failed to claim profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}