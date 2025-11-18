import { NextRequest, NextResponse } from 'next/server';

// Lazy initialization of Firebase Admin SDK
let auth: any = null;
let db: any = null;

try {
  const firebaseAdmin = require('../../../../lib/firebase-admin');
  auth = firebaseAdmin.auth;
  db = firebaseAdmin.db;
} catch (error) {
  console.error('Failed to initialize Firebase Admin in class booking route:', error);
}

// POST - Book a class
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!db || !auth) {
    return NextResponse.json({
      error: 'Service temporarily unavailable'
    }, { status: 503 });
  }

  try {
    const resolvedParams = await params;
    const classId = resolvedParams.id;
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get user details
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userData = userDoc.data();

    // Get class details
    const classDoc = await db.collection('classes').doc(classId).get();
    if (!classDoc.exists) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const classData = classDoc.data();

    // Check if class is still available
    if (classData.currentParticipants >= classData.maxParticipants) {
      return NextResponse.json({ error: 'Class is fully booked' }, { status: 400 });
    }

    // Check if user already booked this class
    const existingBooking = classData.participants?.find((p: any) => p.userId === userId);
    if (existingBooking) {
      return NextResponse.json({ error: 'You have already booked this class' }, { status: 400 });
    }

    // Create Stripe checkout session if class has a price
    let checkoutUrl = null;
    let bookingStatus = 'confirmed';

    if (classData.price > 0) {
      const stripe = require('../../../../lib/stripe');
      
      try {
        const session = await stripe.stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price: classData.stripePriceId,
            quantity: 1,
          }],
          mode: 'payment',
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?booking=success&classId=${classId}`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/classes/${classId}?booking=cancelled`,
          customer_email: userData.email,
          metadata: {
            classId: classId,
            userId: userId,
            type: 'class_booking'
          },
          payment_intent_data: {
            application_fee_amount: Math.round(classData.price * 100 * 0.1), // 10% platform fee
            transfer_data: {
              destination: classData.stripeAccountId,
            },
            metadata: {
              classId: classId,
              userId: userId,
              coachId: classData.coachId
            }
          }
        });

        checkoutUrl = session.url;
        bookingStatus = 'pending_payment';
      } catch (stripeError) {
        console.error('Stripe checkout session creation failed:', stripeError);
        return NextResponse.json({
          error: 'Failed to create payment session',
          details: 'Please try again later'
        }, { status: 500 });
      }
    }

    // Create booking record
    const booking = {
      classId: classId,
      userId: userId,
      userName: userData.displayName || userData.email,
      userEmail: userData.email,
      status: bookingStatus,
      bookedAt: new Date(),
      paymentStatus: classData.price > 0 ? 'pending' : 'not_required',
      checkoutUrl: checkoutUrl,
      classDetails: {
        title: classData.title,
        sport: classData.sport,
        type: classData.type,
        schedules: classData.schedules,
        price: classData.price,
        coachName: classData.coachName
      }
    };

    // Save booking
    const bookingRef = await db.collection('bookings').add(booking);

    // If free class, update class participants immediately
    if (classData.price === 0) {
      const participant = {
        userId: userId,
        userName: userData.displayName || userData.email,
        userEmail: userData.email,
        bookedAt: new Date(),
        bookingId: bookingRef.id
      };

      await db.collection('classes').doc(classId).update({
        participants: [...(classData.participants || []), participant],
        currentParticipants: (classData.currentParticipants || 0) + 1,
        updatedAt: new Date()
      });

      // Send confirmation email/notification here
      console.log(`Free class booking confirmed for user ${userId} in class ${classId}`);
    }

    return NextResponse.json({
      bookingId: bookingRef.id,
      status: bookingStatus,
      checkoutUrl: checkoutUrl,
      message: classData.price > 0 
        ? 'Please complete payment to confirm your booking'
        : 'Booking confirmed! Check your email for class details.'
    });

  } catch (error) {
    console.error('Error booking class:', error);
    return NextResponse.json({
      error: 'Failed to book class',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Get booking details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!db || !auth) {
    return NextResponse.json({
      error: 'Service temporarily unavailable'
    }, { status: 503 });
  }

  try {
    const resolvedParams = await params;
    const classId = resolvedParams.id;
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get user's booking for this class
    const bookingQuery = await db.collection('bookings')
      .where('classId', '==', classId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (bookingQuery.empty) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const bookingDoc = bookingQuery.docs[0];
    const booking = {
      id: bookingDoc.id,
      ...bookingDoc.data(),
      bookedAt: bookingDoc.data().bookedAt?.toDate().toISOString()
    };

    return NextResponse.json({ booking });

  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({
      error: 'Failed to fetch booking details'
    }, { status: 500 });
  }
}

// DELETE - Cancel booking
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!db || !auth) {
    return NextResponse.json({
      error: 'Service temporarily unavailable'
    }, { status: 503 });
  }

  try {
    const resolvedParams = await params;
    const classId = resolvedParams.id;
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get user's booking
    const bookingQuery = await db.collection('bookings')
      .where('classId', '==', classId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (bookingQuery.empty) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const bookingDoc = bookingQuery.docs[0];
    const bookingData = bookingDoc.data();

    // Check cancellation policy (e.g., 24 hours before class)
    const classDoc = await db.collection('classes').doc(classId).get();
    const classData = classDoc.data();
    
    // Simple cancellation check - can be made more sophisticated
    const now = new Date();
    const classStart = new Date(classData.schedules[0].date + 'T' + classData.schedules[0].startTime);
    const hoursUntilClass = (classStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilClass < 24) {
      return NextResponse.json({
        error: 'Cancellation not allowed',
        message: 'Classes cannot be cancelled less than 24 hours before start time'
      }, { status: 400 });
    }

    // Remove participant from class
    const updatedParticipants = classData.participants?.filter((p: any) => p.userId !== userId) || [];
    
    await db.collection('classes').doc(classId).update({
      participants: updatedParticipants,
      currentParticipants: Math.max(0, (classData.currentParticipants || 0) - 1),
      updatedAt: new Date()
    });

    // Update booking status
    await db.collection('bookings').doc(bookingDoc.id).update({
      status: 'cancelled',
      cancelledAt: new Date()
    });

    // Handle refund if payment was made
    if (bookingData.paymentStatus === 'completed') {
      // Implement refund logic here
      console.log(`Refund required for booking ${bookingDoc.id}`);
    }

    return NextResponse.json({
      message: 'Booking cancelled successfully',
      refundInfo: bookingData.paymentStatus === 'completed' 
        ? 'Refund will be processed within 5-7 business days'
        : null
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json({
      error: 'Failed to cancel booking'
    }, { status: 500 });
  }
}