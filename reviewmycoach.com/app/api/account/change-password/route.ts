import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { newPassword, idToken } = await request.json();

    if (!newPassword || !idToken) {
      return NextResponse.json(
        { error: 'New password and authentication token are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Verify the user's identity token
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Update password in Firebase Auth
    await auth.updateUser(userId, {
      password: newPassword
    });

    return NextResponse.json({
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}

// Generate password reset link
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate password reset link
    const link = await auth.generatePasswordResetLink(email);

    return NextResponse.json({
      message: 'Password reset link generated successfully',
      resetLink: link
    });

  } catch (error) {
    console.error('Error generating password reset link:', error);
    return NextResponse.json(
      { error: 'Failed to generate password reset link' },
      { status: 500 }
    );
  }
} 