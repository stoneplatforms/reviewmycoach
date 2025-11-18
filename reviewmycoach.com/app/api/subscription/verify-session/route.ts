import { NextRequest, NextResponse } from 'next/server';
import { getStripeInstance } from '../../../lib/stripe';
import { auth, findCoachByUserId } from '../../../lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, idToken } = await request.json();

    // Verify the user is authenticated
    if (!idToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

      let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
  }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const stripe = getStripeInstance();
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify the session belongs to the authenticated user
    if (session.metadata?.userId !== decodedToken.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // Get subscription details
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Update coach profile with subscription information
    const coachProfile = await findCoachByUserId(decodedToken.uid);
    
    if (!coachProfile) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
    }

    const updateData = {
      subscriptionStatus: 'active',
      subscriptionId: subscriptionId,
      subscriptionPlan: session.metadata?.plan || 'monthly',
      stripeCustomerId: session.customer,
      subscriptionStartDate: new Date((subscription as any).current_period_start * 1000),
      subscriptionEndDate: new Date((subscription as any).current_period_end * 1000),
      updatedAt: new Date()
    };

    await coachProfile.ref.update(updateData);

    // Return subscription details
    return NextResponse.json({
      success: true,
      plan: session.metadata?.plan || 'monthly',
      status: 'active',
      nextBilling: new Date((subscription as any).current_period_end * 1000).toISOString(),
      subscriptionId: subscriptionId
    });

  } catch (error) {
    console.error('Error verifying subscription session:', error);
    return NextResponse.json(
      { error: 'Failed to verify subscription session' },
      { status: 500 }
    );
  }
} 