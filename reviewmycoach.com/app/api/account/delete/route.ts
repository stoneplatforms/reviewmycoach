import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '../../../lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { confirmText, idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 400 }
      );
    }

    // Verify confirmation text
    if (confirmText !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Confirmation text must be exactly "DELETE MY ACCOUNT"' },
        { status: 400 }
      );
    }

    // Verify the user's identity token
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Get user data before deletion
    const user = await auth.getUser(userId);

    try {
      // Delete user data from Firestore collections
      const batch = db.batch();
      
      // Delete coach profile
      const coachRef = db.collection('coaches').doc(userId);
      const coachDoc = await coachRef.get();
      if (coachDoc.exists) {
        batch.delete(coachRef);
      }

      // Delete user's reviews (as reviewer)
      const reviewsQuery = await db.collection('reviews').where('userId', '==', userId).get();
      reviewsQuery.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete user's bookings
      const bookingsQuery = await db.collection('bookings').where('userId', '==', userId).get();
      bookingsQuery.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete bookings where user is the coach
      const coachBookingsQuery = await db.collection('bookings').where('coachId', '==', userId).get();
      coachBookingsQuery.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Commit the batch deletion
      await batch.commit();

      // Delete user from Firebase Auth (this must be done after Firestore operations)
      await auth.deleteUser(userId);

      return NextResponse.json({
        message: 'Account deleted successfully',
        deletedEmail: user.email
      });

    } catch (firestoreError) {
      console.error('Error deleting user data from Firestore:', firestoreError);
      
      // If Firestore deletion fails, still try to delete from Auth
      try {
        await auth.deleteUser(userId);
        return NextResponse.json({
          message: 'Account deleted from authentication, but some data may remain in database',
          deletedEmail: user.email,
          warning: 'Some user data may not have been completely removed'
        });
      } catch (authError) {
        console.error('Error deleting user from Auth:', authError);
        return NextResponse.json(
          { error: 'Failed to delete account completely' },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}

// Get account deletion info (what will be deleted)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idToken = searchParams.get('idToken');

    if (!idToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 400 }
      );
    }

    // Verify the user's identity token
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Count user's data
    const coachRef = db.collection('coaches').doc(userId);
    const coachDoc = await coachRef.get();
    
    const reviewsQuery = await db.collection('reviews').where('userId', '==', userId).get();
    const bookingsQuery = await db.collection('bookings').where('userId', '==', userId).get();
    const coachBookingsQuery = await db.collection('bookings').where('coachId', '==', userId).get();

    const dataToDelete = {
      coachProfile: coachDoc.exists,
      reviewsAsUser: reviewsQuery.size,
      bookingsAsUser: bookingsQuery.size,
      bookingsAsCoach: coachBookingsQuery.size,
      authAccount: true
    };

    return NextResponse.json({
      dataToDelete,
      totalItems: Object.values(dataToDelete).reduce((sum: number, value) => {
        if (typeof value === 'number') {
          return sum + value;
        }
        return sum + (value ? 1 : 0);
      }, 0)
    });

  } catch (error) {
    console.error('Error getting account deletion info:', error);
    return NextResponse.json(
      { error: 'Failed to get account deletion info' },
      { status: 500 }
    );
  }
} 