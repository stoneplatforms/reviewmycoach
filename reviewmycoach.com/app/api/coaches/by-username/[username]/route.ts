import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import { getCoachByUsername, updateCoach } from '../../../../lib/dataconnect';
import { verifyFirebaseToken } from '../../../../lib/firebase-admin-server';

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
    const { username: rawUsername } = await params;
    const username = rawUsername.toLowerCase();

    // Fetch coach from Data Connect
    const result = await getCoachByUsername(dataConnect, { username });
    
    if (result.data.coaches && result.data.coaches.length > 0) {
      const coach = result.data.coaches[0];
      
      return NextResponse.json({
        coach: {
          id: coach.id,
          username: coach.username,
          userId: coach.userId,
          displayName: coach.displayName,
          email: coach.email,
          phoneNumber: coach.phoneNumber,
          bio: coach.bio,
          sports: coach.sports,
          specialties: coach.specialties,
          certifications: coach.certifications,
          location: coach.location,
          organization: coach.organization,
          role: coach.role,
          gender: coach.gender,
          ageGroup: coach.ageGroup,
          availability: coach.availability,
          languages: coach.languages,
          website: coach.website,
          socialMedia: coach.socialMedia,
          hourlyRate: coach.hourlyRate,
          experience: coach.experience,
          averageRating: coach.averageRating,
          totalReviews: coach.totalReviews,
          profileImage: coach.profileImage,
          isVerified: coach.isVerified,
          sourceUrl: coach.sourceUrl,
          activeCardId: coach.activeCardId,
          activeCardImageUrl: coach.activeCardImageUrl,
          createdAt: coach.createdAt,
          updatedAt: coach.updatedAt,
        }
      });
    } else {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching coach by username:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    // Verify Firebase token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 });
    }

    const decodedToken = await verifyFirebaseToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { username: rawUsername } = await params;
    const username = rawUsername.toLowerCase();
    const body = await request.json();

    // Verify the coach belongs to the user
    const result = await getCoachByUsername(dataConnect, { username });
    if (!result.data.coaches || result.data.coaches.length === 0) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    const coach = result.data.coaches[0];
    if (coach.userId !== decodedToken.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update coach profile via Data Connect (handles both profile edits AND card activation)
    await updateCoach(dataConnect, {
      id: coach.id,
      displayName: body.displayName,
      phoneNumber: body.phoneNumber,
      bio: body.bio,
      location: body.location,
      hourlyRate: body.hourlyRate,
      profileImage: body.profileImage,
      activeCardId: body.activeCardId,
      activeCardImageUrl: body.activeCardImageUrl,
    });

    console.log(`✅ Coach updated for ${username}`);
    return NextResponse.json({ 
      success: true, 
      message: body.activeCardId ? 'Active card updated successfully' : 'Coach profile updated'
    });
  } catch (error) {
    console.error('Error updating coach:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

