import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '../../../lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { currentEmail, newEmail, idToken } = await request.json();

    if (!currentEmail || !newEmail || !idToken) {
      return NextResponse.json(
        { error: 'Current email, new email, and authentication token are required' },
        { status: 400 }
      );
    }

    // Verify the user's identity token
  
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Verify current email matches
    const user = await auth.getUser(userId);
    if (user.email !== currentEmail) {
      return NextResponse.json(
        { error: 'Current email does not match' },
        { status: 400 }
      );
    }

    // Update email in Firebase Auth
    await auth.updateUser(userId, {
      email: newEmail,
      emailVerified: false // Reset email verification status
    });

    // Send verification email
    const link = await auth.generateEmailVerificationLink(newEmail);
    
    // Update coach profile in Firestore if it exists
    const coachRef = db.collection('coaches').doc(userId);
    const coachDoc = await coachRef.get();
    
    if (coachDoc.exists) {
      await coachRef.update({
        email: newEmail,
        emailVerified: false,
        updatedAt: new Date()
      });
    }

    return NextResponse.json({
      message: 'Email updated successfully. Please check your new email for verification.',
      verificationLink: link
    });

  } catch (error) {
    console.error('Error updating email:', error);
    return NextResponse.json(
      { error: 'Failed to update email' },
      { status: 500 }
    );
  }
} 