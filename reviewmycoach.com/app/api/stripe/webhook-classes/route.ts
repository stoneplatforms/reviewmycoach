import { NextRequest, NextResponse } from 'next/server';

// Lazy initialization of Firebase Admin SDK
let db: any = null;

try {
  const firebaseAdmin = require('../../../lib/firebase-admin');
  db = firebaseAdmin.db;
} catch (error) {
  console.error('Failed to initialize Firebase Admin in stripe webhook:', error);
}

const stripe = require('../../../lib/stripe');

export async function POST(req: NextRequest) {
  if (!db) {
    console.error('Firebase not initialized - cannot process webhook');
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event;

    try {
      event = stripe.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: any) {
  try {
    console.log('Processing checkout completion for session:', session.id);

    // Check if this is a class booking
    if (session.metadata?.type !== 'class_booking') {
      console.log('Not a class booking, skipping');
      return;
    }

    const { classId, userId } = session.metadata;

    if (!classId || !userId) {
      console.error('Missing required metadata in checkout session');
      return;
    }

    // Get the booking record
    const bookingQuery = await db.collection('bookings')
      .where('classId', '==', classId)
      .where('userId', '==', userId)
      .where('status', '==', 'pending_payment')
      .limit(1)
      .get();

    if (bookingQuery.empty) {
      console.error('No pending booking found for class:', classId, 'user:', userId);
      return;
    }

    const bookingDoc = bookingQuery.docs[0];
    const bookingData = bookingDoc.data();

    // Update booking status
    await db.collection('bookings').doc(bookingDoc.id).update({
      status: 'confirmed',
      paymentStatus: 'completed',
      stripeSessionId: session.id,
      confirmedAt: new Date()
    });

    // Get class document
    const classDoc = await db.collection('classes').doc(classId).get();
    if (!classDoc.exists) {
      console.error('Class not found:', classId);
      return;
    }

    const classData = classDoc.data();

    // Add participant to class
    const participant = {
      userId: userId,
      userName: bookingData.userName,
      userEmail: bookingData.userEmail,
      bookedAt: bookingData.bookedAt,
      bookingId: bookingDoc.id,
      paymentConfirmed: true
    };

    const updatedParticipants = [...(classData.participants || []), participant];

    await db.collection('classes').doc(classId).update({
      participants: updatedParticipants,
      currentParticipants: updatedParticipants.length,
      updatedAt: new Date()
    });

    console.log(`Successfully confirmed booking for user ${userId} in class ${classId}`);

    // Send confirmation email/notification here
    await sendBookingConfirmation(bookingData, classData);

  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

async function handlePaymentSucceeded(paymentIntent: any) {
  try {
    console.log('Payment succeeded for:', paymentIntent.id);

    const { classId, userId, coachId } = paymentIntent.metadata;

    if (classId && userId && coachId) {
      // Log successful payment for analytics
      await db.collection('payment_logs').add({
        type: 'class_booking',
        paymentIntentId: paymentIntent.id,
        classId,
        userId,
        coachId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'succeeded',
        createdAt: new Date()
      });

      console.log(`Payment logged successfully for class booking ${classId}`);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  try {
    console.log('Payment failed for:', paymentIntent.id);

    const { classId, userId } = paymentIntent.metadata;

    if (classId && userId) {
      // Update booking status to failed
      const bookingQuery = await db.collection('bookings')
        .where('classId', '==', classId)
        .where('userId', '==', userId)
        .where('status', '==', 'pending_payment')
        .limit(1)
        .get();

      if (!bookingQuery.empty) {
        const bookingDoc = bookingQuery.docs[0];
        
        await db.collection('bookings').doc(bookingDoc.id).update({
          status: 'payment_failed',
          paymentStatus: 'failed',
          failedAt: new Date(),
          failureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
        });

        console.log(`Booking marked as payment failed for class ${classId}`);
      }
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleAccountUpdated(account: any) {
  try {
    console.log('Stripe account updated:', account.id);

    // Update coach's Stripe account status in database
    const coachQuery = await db.collection('coaches')
      .where('stripeAccountId', '==', account.id)
      .limit(1)
      .get();

    if (!coachQuery.empty) {
      const coachDoc = coachQuery.docs[0];
      
      await db.collection('coaches').doc(coachDoc.id).update({
        stripeAccountStatus: account.charges_enabled ? 'active' : 'pending',
        stripePayoutsEnabled: account.payouts_enabled,
        stripeRequirements: account.requirements,
        updatedAt: new Date()
      });

      console.log(`Coach Stripe account status updated: ${account.id}`);
    }
  } catch (error) {
    console.error('Error handling account update:', error);
  }
}

async function sendBookingConfirmation(bookingData: any, classData: any) {
  try {
    // This would integrate with your email service (SendGrid, AWS SES, etc.)
    console.log('Sending booking confirmation email...');
    
    // Email data for future email service integration
    console.log('Email would be sent to:', bookingData.userEmail);
    console.log('Subject:', `Booking Confirmed: ${classData.title}`);
    console.log('Booking details:', {
      userName: bookingData.userName,
      className: classData.title,
      coachName: classData.coachName,
      classType: classData.type,
      location: classData.location,
      zoomJoinUrl: classData.zoomJoinUrl,
      schedules: classData.schedules,
      price: classData.price,
      currency: classData.currency
    });

    // Example email sending logic (replace with your email service)
    // await emailService.send(emailData);
    
    console.log('Booking confirmation email queued for:', bookingData.userEmail);
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
  }
}

// Utility function to handle refunds (for cancellations)
async function processRefund(paymentIntentId: string, amount?: number) {
  try {
    const refund = await stripe.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount, // If not specified, refunds the full amount
      reason: 'requested_by_customer'
    });

    console.log('Refund processed:', refund.id);
    return refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
}