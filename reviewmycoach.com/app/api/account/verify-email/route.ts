import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '../../../lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 400 }
      );
    }

    // Verify the user's identity token
  
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Get user data
    const user = await auth.getUser(userId);
    
    if (!user.email) {
      return NextResponse.json(
        { error: 'No email address found for this user' },
        { status: 400 }
      );
    }

    // Generate and send verification email
    const link = await auth.generateEmailVerificationLink(user.email);

    return NextResponse.json({
      message: 'Verification email sent successfully. Please check your email.',
      verificationLink: link
    });

  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
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

    // Get user data
    const user = await auth.getUser(userId);

    // Update coach profile in Firestore if verified
    if (user.emailVerified) {
      const coachRef = db.collection('coaches').doc(userId);
      const coachDoc = await coachRef.get();
      
      if (coachDoc.exists) {
        await coachRef.update({
          emailVerified: true,
          updatedAt: new Date()
        });
      }
    }

    return NextResponse.json({
      emailVerified: user.emailVerified,
      email: user.email
    });

  } catch (error) {
    console.error('Error checking email verification:', error);
    return NextResponse.json(
      { error: 'Failed to check email verification status' },
      { status: 500 }
    );
  }
} 