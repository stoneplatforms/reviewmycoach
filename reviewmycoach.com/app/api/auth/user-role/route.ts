import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin-server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user document from Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    
    return NextResponse.json({
      role: userData?.role || null,
      onboardingCompleted: userData?.onboardingCompleted || false,
      email: userData?.email || null,
      displayName: userData?.displayName || null,
      username: userData?.username || null,
    });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
