import { NextRequest, NextResponse } from 'next/server';
import { getStripeInstance } from '../../../lib/stripe';
import { db } from '../../../lib/firebase-admin';
import Stripe from 'stripe';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig || !endpointSecret) {
      return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      const stripe = getStripeInstance();
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;
      
      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Find the booking with this payment intent ID
    const bookingsRef = db.collection('bookings');
    const bookingQuery = await bookingsRef
      .where('paymentIntentId', '==', paymentIntent.id)
      .limit(1)
      .get();

    if (bookingQuery.empty) {
      console.error('No booking found for payment intent:', paymentIntent.id);
      return;
    }

    const bookingDoc = bookingQuery.docs[0];
    const bookingRef = bookingDoc.ref;

    // Update booking status
    await bookingRef.update({
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentCompletedAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Booking confirmed for payment intent:', paymentIntent.id);

    // TODO: Send confirmation email/notification to coach and student
    
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Find the booking with this payment intent ID
    const bookingsRef = db.collection('bookings');
    const bookingQuery = await bookingsRef
      .where('paymentIntentId', '==', paymentIntent.id)
      .limit(1)
      .get();

    if (bookingQuery.empty) {
      console.error('No booking found for payment intent:', paymentIntent.id);
      return;
    }

    const bookingDoc = bookingQuery.docs[0];
    const bookingRef = bookingDoc.ref;

    // Update booking status
    await bookingRef.update({
      status: 'payment_failed',
      paymentStatus: 'failed',
      paymentFailedAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Booking payment failed for payment intent:', paymentIntent.id);

    // TODO: Send failure notification to student
    
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  try {
    // Find the coach's stripe account record
    const stripeAccountsRef = db.collection('stripe_accounts');
    const accountQuery = await stripeAccountsRef
      .where('stripeAccountId', '==', account.id)
      .limit(1)
      .get();

    if (accountQuery.empty) {
      console.error('No coach account found for Stripe account:', account.id);
      return;
    }

    const accountDoc = accountQuery.docs[0];
    const accountRef = accountDoc.ref;

    // Determine account status
    let accountStatus = 'pending';
    if (account.charges_enabled && account.payouts_enabled) {
      accountStatus = 'active';
    } else if (account.requirements?.currently_due && account.requirements.currently_due.length > 0) {
      accountStatus = 'requires_action';
    }

    // Update account status
    await accountRef.update({
      accountStatus,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements,
      updatedAt: new Date(),
    });

    console.log('Coach account updated:', account.id, 'Status:', accountStatus);
    
  } catch (error) {
    console.error('Error handling account updated:', error);
  }
}

async function handleTransferCreated(transfer: Stripe.Transfer) {
  try {
    // This is called when funds are transferred to the coach's account
    // We can use this to track when payment is actually released to the coach
    console.log('Transfer created:', transfer.id, 'Amount:', transfer.amount);
    
    // TODO: Update booking record with transfer information
    // TODO: Send notification to coach about payment received
    
  } catch (error) {
    console.error('Error handling transfer created:', error);
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    // Handle card purchase completion
    if (session.metadata?.type === 'card_purchase') {
      const { userId, cardId } = session.metadata;
      
      if (!userId || !cardId) {
        console.error('Missing userId or cardId in checkout session metadata');
        return;
      }

      // TODO: Migrate to Firebase Data Connect
      // const { supabaseAdmin } = await import('../../../lib/supabase');
      // if (!supabaseAdmin) {
      //   console.error('Supabase admin not configured');
      //   return;
      // }

      // Get card data from marketplace
      // const { data: cardData, error: cardError } = await supabaseAdmin
      //   .from('marketplace_cards')
      //   .select('*')
      //   .eq('id', cardId)
      //   .single();

      // if (cardError || !cardData) {
      //   console.error('Card not found in marketplace:', cardId);
      //   return;
      // }

      // Add card to user's collection (using upsert to handle duplicates)
      // const { error: insertError } = await supabaseAdmin
      //   .from('user_cards')
      //   .upsert({
      //     user_id: userId,
      //     card_id: cardId,
      //     card_type: 'marketplace',
      //     purchased_at: new Date().toISOString(),
      //     stripe_session_id: session.id,
      //     is_active: true,
      //     updated_at: new Date().toISOString(),
      //   }, {
      //     onConflict: 'user_id,card_id,card_type',
      //     ignoreDuplicates: false, // Update if exists (e.g., if webhook fires twice)
      //   });

      // if (insertError) {
      //   // If it's a duplicate (unique violation), that's okay - card already exists
      //   if (insertError.code === '23505') {
      //     console.log(`Card ${cardId} already exists for user ${userId} (duplicate webhook)`);
      //   } else {
      //     console.error('Error adding card to user collection:', insertError);
      //   }
      // } else {
      //   console.log(`Card ${cardId} added to user ${userId}'s collection`);
      // }
      console.log('TODO: Implement marketplace card purchase with Firebase Data Connect');
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
} 