import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '../../../lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { isPublic, idToken } = await request.json();

    if (typeof isPublic !== 'boolean' || !idToken) {
      return NextResponse.json(
        { error: 'Profile visibility status and authentication token are required' },
        { status: 400 }
      );
    }

    // Verify the user's identity token
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Update profile visibility in Firestore
    const coachRef = db.collection('coaches').doc(userId);
    const coachDoc = await coachRef.get();
    
    if (!coachDoc.exists) {
      return NextResponse.json(
        { error: 'Coach profile not found' },
        { status: 404 }
      );
    }

    await coachRef.update({
      isPublic: isPublic,
      updatedAt: new Date()
    });

    return NextResponse.json({
      message: `Profile is now ${isPublic ? 'public' : 'private'}`,
      isPublic: isPublic
    });

  } catch (error) {
    console.error('Error updating profile visibility:', error);
    return NextResponse.json(
      { error: 'Failed to update profile visibility' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idToken = searchParams.get('idToken');

    if (!idToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 400 }
      );
    }

    // Verify the user's identity token
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Get current profile visibility
    const coachRef = db.collection('coaches').doc(userId);
    const coachDoc = await coachRef.get();
    
    if (!coachDoc.exists) {
      return NextResponse.json(
        { error: 'Coach profile not found' },
        { status: 404 }
      );
    }

    const coachData = coachDoc.data();
    const isPublic = coachData?.isPublic !== false; // Default to true if not set

    return NextResponse.json({
      isPublic: isPublic
    });

  } catch (error) {
    console.error('Error getting profile visibility:', error);
    return NextResponse.json(
      { error: 'Failed to get profile visibility' },
      { status: 500 }
    );
  }
} 