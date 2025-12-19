import { NextRequest, NextResponse } from 'next/server';
import { fetchCoachReviews, fetchRecentReviews, addReview } from '../../lib/reviews-dataconnect';

// GET - Fetch reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('coachId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (coachId) {
      // Fetch reviews for specific coach
      const reviews = await fetchCoachReviews(coachId, limit);
      return NextResponse.json({ reviews });
    } else {
      // Fetch recent reviews across all coaches
      const reviews = await fetchRecentReviews(limit);
      return NextResponse.json({ reviews });
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['coachId', 'coachUsername', 'studentName', 'rating', 'reviewText', 'sport'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate rating
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Generate review ID
    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create review in Data Connect
    await addReview({
      id: reviewId,
      coachId: body.coachId,
      coachUsername: body.coachUsername,
      userId: body.userId,
      email: body.email,
      studentName: body.studentName,
      rating: body.rating,
      reviewText: body.reviewText,
      sport: body.sport,
    });

    return NextResponse.json({ 
      success: true,
      reviewId,
      message: 'Review created successfully'
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

