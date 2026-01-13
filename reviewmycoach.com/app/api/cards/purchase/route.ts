import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import { purchaseCard, updateCoachActiveCard, getMarketplaceCard, getCoachByUsername } from '../../../lib/dataconnect';
import { verifyFirebaseToken } from '../../../lib/firebase-admin-server';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';

// Lazy initialization function for Stripe
function getStripeInstance() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-05-28.basil',
  });
}

// Lazy initialization function for DataConnect
function getDataConnectInstance() {
  // Check if required environment variables are available
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    throw new Error('Firebase configuration is not available');
  }

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

  return getDataConnect(clientApp, {
    connector: 'reviewmycoach',
    location: 'us-east4',
    service: 'review-my-coach-service'
  });
}

/**
 * POST /api/cards/purchase
 * Purchase a marketplace card
 */
export async function POST(request: NextRequest) {
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

    const { cardId, paymentMethodId, coachUsername } = await request.json();

    if (!cardId || !paymentMethodId || !coachUsername) {
      return NextResponse.json(
        { error: 'cardId, paymentMethodId, and coachUsername are required' },
        { status: 400 }
      );
    }

    // Get DataConnect instance
    const dataConnect = getDataConnectInstance();

    // Get the marketplace card
    const cardResult = await getMarketplaceCard(dataConnect, { id: cardId });
    if (!cardResult.data.marketplaceCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const card = cardResult.data.marketplaceCard;

    // Get Stripe instance
    const stripe = getStripeInstance();

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round((card.price || 0) * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      metadata: {
        cardId: cardId,
        userId: decodedToken.uid,
        coachUsername: coachUsername,
      },
    });

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment failed', status: paymentIntent.status },
        { status: 402 }
      );
    }

    // Add card to user's collection
    const userCardId = uuidv4();
    await purchaseCard(dataConnect, {
      id: userCardId,
      userId: decodedToken.uid,
      coachUsername: coachUsername,
      cardId: cardId,
      cardName: card.name || '',
      cardImageUrl: card.imageUrl || '',
      stripePaymentId: paymentIntent.id,
    });

    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      cardId: userCardId,
      message: 'Card purchased successfully! You can now select it from your collection.',
    });

  } catch (error) {
    console.error('Error purchasing card:', error);
    return NextResponse.json(
      { error: 'Failed to purchase card', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
