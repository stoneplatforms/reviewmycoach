import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '../../../lib/firebase-admin';

// GET - Check user's subscription status
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify the token
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    const userId = decodedToken.uid;

    // Check user's subscription in Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const subscription = userData?.subscription;

    // Default to no subscription
    let subscriptionStatus = {
      isActive: false,
      plan: 'free',
      expiresAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null
    };

    if (subscription) {
      // Check if subscription is active and not expired
      const now = new Date();
      const expiresAt = subscription.expiresAt ? subscription.expiresAt.toDate() : null;
      
      subscriptionStatus = {
        isActive: subscription.isActive === true && (!expiresAt || expiresAt > now),
        plan: subscription.plan || 'free',
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        stripeCustomerId: subscription.stripeCustomerId || null,
        stripeSubscriptionId: subscription.stripeSubscriptionId || null
      };
    }

    return NextResponse.json(subscriptionStatus);
    
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
}