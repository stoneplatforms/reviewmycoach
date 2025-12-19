import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../../lib/firebase-admin-server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token is required' }, { status: 400 });
    }

    const decodedToken = await verifyFirebaseToken(token);
    
    if (decodedToken) {
      return NextResponse.json({
        valid: true,
        uid: decodedToken.uid,
        email: decodedToken.email,
      });
    }

    return NextResponse.json({ valid: false, error: 'Invalid token' }, { status: 401 });
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

