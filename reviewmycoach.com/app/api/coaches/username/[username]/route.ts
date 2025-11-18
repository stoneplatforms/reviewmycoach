import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Basic username validation
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ 
        available: false, 
        error: 'Username must be 3-20 characters long and contain only letters, numbers, hyphens, and underscores' 
      }, { status: 400 });
    }

    // Check if username is already taken
    const coachesRef = db.collection('coaches');
    const q = coachesRef.where('username', '==', username);
    const querySnapshot = await q.get();

    const available = querySnapshot.empty;

    return NextResponse.json({ 
      available,
      username 
    });

  } catch (error) {
    console.error('Error checking username availability:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 