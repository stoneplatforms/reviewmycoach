import { NextRequest, NextResponse } from 'next/server';
import { getStripeInstance } from '../../../lib/stripe';
import { auth } from '../../../lib/firebase-admin';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, updateDoc, query, where, collection, getDocs } from 'firebase/firestore';

// Initialize Firebase client (for Firestore operations)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const clientApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const clientDb = getFirestore(clientApp);

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, plan, idToken } = await request.json();

    // Verify the user is authenticated
    if (!idToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Find coach profile using client SDK
    const coachesRef = collection(clientDb, 'coaches');
    const coachQuery = query(coachesRef, where('userId', '==', userId));
    const coachQuerySnapshot = await getDocs(coachQuery);
    
    if (coachQuerySnapshot.empty) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
    }

    const coachDoc = coachQuerySnapshot.docs[0];
    const coachData = coachDoc.data();
    
    // Check if already subscribed
    if (coachData?.subscriptionStatus === 'active') {
      return NextResponse.json({ error: 'Already subscribed to Coach Pro' }, { status: 400 });
    }

    // Create Stripe customer if doesn't exist
    let customerId = coachData?.stripeCustomerId;
    const stripe = getStripeInstance();
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: decodedToken.email,
        metadata: {
          userId: userId,
          type: 'coach_pro_subscription'
        }
      });
      customerId = customer.id;
      
      // Update coach profile with customer ID using client SDK
      await updateDoc(coachDoc.ref, {
        stripeCustomerId: customerId
      });
    }

    // Get the base URL from the request headers
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription`,
      metadata: {
        userId: userId,
        plan: plan,
        type: 'coach_pro_subscription'
      },
      subscription_data: {
        metadata: {
          userId: userId,
          plan: plan,
          type: 'coach_pro_subscription'
        }
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 