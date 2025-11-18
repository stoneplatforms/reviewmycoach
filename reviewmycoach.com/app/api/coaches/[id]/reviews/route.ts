import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase-admin';
import { auth } from '../../../../lib/firebase-admin';

interface ReviewData {
  studentId: string;
  studentName: string;
  rating: number;
  reviewText: string;
  sport?: string;
}

// POST - Create a new review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: coachId } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    let userId = null;
    let isAuthenticated = false;
    
    // Try to verify token if provided, but don't require it
    if (token) {
      try {
        const decodedToken = await auth.verifyIdToken(token);
        userId = decodedToken.uid;
        isAuthenticated = true;
      } catch {
        console.log('Invalid token provided, treating as anonymous user');
        // Continue as anonymous user
      }
    }

    const body = await request.json();
    const { rating, reviewText, sport } = body;
    
    // Generate unique ID for anonymous users
    const effectiveUserId = userId || `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Debug logging
    console.log('Review submission data:', {
      coachId,
      userId: effectiveUserId,
      isAuthenticated,
      rating,
      reviewText: reviewText?.substring(0, 50) + '...',
      sport
    });

    // Basic validation only
    if (!rating) {
      return NextResponse.json({ error: 'Rating is required' }, { status: 400 });
    }

    if (!reviewText) {
      return NextResponse.json({ error: 'Review text is required' }, { status: 400 });
    }

    // Get user's username (or use Anonymous for non-authenticated users)
    let studentName = 'Anonymous User';
    if (isAuthenticated && userId) {
      try {
        const userDoc = await db.doc(`users/${userId}`).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          // Use username if available, fallback to displayName, then Anonymous
          studentName = userData?.username || userData?.displayName || 'Anonymous User';
        }
              } catch {
          console.log('Could not fetch user data, using Anonymous');
        }
      }

      console.log('Using student name:', studentName, isAuthenticated ? '(authenticated user)' : '(anonymous user)');

      // Create the review
    const reviewData: ReviewData & { userId: string; createdAt: Date } = {
      userId: effectiveUserId, // Use effective user ID (works for both auth and anonymous)
      studentId: effectiveUserId,
      studentName,
      rating: Number(rating), // Ensure it's a number
      reviewText: String(reviewText).trim(),
      sport: sport || null,
      createdAt: new Date()
    };

    console.log('Writing review to Firestore:', {
      collection: `coaches/${coachId}/reviews`,
      data: reviewData
    });

    const reviewRef = await db.collection('coaches').doc(coachId).collection('reviews').add(reviewData);
    
    console.log('Review created successfully with ID:', reviewRef.id);

    // Update coach's average rating and review count
    await updateCoachRating(coachId);

    return NextResponse.json({ 
      success: true, 
      reviewId: reviewRef.id,
      message: 'Review created successfully'
    });

  } catch (error) {
    console.error('Error creating review:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Fetch coach reviews
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: coachId } = await params;
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit') || '20';
    const limitNum = parseInt(limitParam, 10);

    const reviewsQuery = db.collection('coaches').doc(coachId).collection('reviews')
      .orderBy('createdAt', 'desc')
      .limit(limitNum);

    const reviewsSnapshot = await reviewsQuery.get();
    const reviews = reviewsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || null
    }));

    return NextResponse.json({ reviews });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to update coach's average rating
async function updateCoachRating(coachId: string) {
  try {
    console.log('Updating coach rating for:', coachId);
    
    const reviewsQuery = db.collection('coaches').doc(coachId).collection('reviews');
    const reviewsSnapshot = await reviewsQuery.get();
    
    if (reviewsSnapshot.empty) {
      console.log('No reviews found for coach:', coachId);
      return;
    }

    let totalRating = 0;
    let reviewCount = 0;

    reviewsSnapshot.forEach((doc: any) => {
      const data = doc.data();
      if (data.rating && typeof data.rating === 'number') {
        totalRating += data.rating;
        reviewCount++;
      }
    });

    if (reviewCount === 0) {
      console.log('No valid ratings found for coach:', coachId);
      return;
    }

    const averageRating = totalRating / reviewCount;
    
    console.log('Calculated stats:', {
      coachId,
      totalRating,
      reviewCount,
      averageRating: Math.round(averageRating * 10) / 10
    });

    // Update coach document
    const updateData = {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews: reviewCount,
      updatedAt: new Date()
    };

    await db.doc(`coaches/${coachId}`).update(updateData);
    console.log('Successfully updated coach rating:', coachId);

  } catch (error) {
    console.error('Error updating coach rating:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Don't throw the error - let the review creation succeed even if rating update fails
  }
} 