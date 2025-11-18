import { NextRequest, NextResponse } from 'next/server';
import { auth, db, findCoachByUserId } from '../../lib/firebase-admin';

// GET - Fetch available courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport');
    const level = searchParams.get('level');
    const coachId = searchParams.get('coachId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db.collection('courses').orderBy('createdAt', 'desc');

    // Only show active courses
    query = query.where('isActive', '==', true);

    if (sport && sport !== 'all') {
      query = query.where('sport', '==', sport);
    }

    if (level && level !== 'all') {
      query = query.where('level', '==', level);
    }

    if (coachId) {
      query = query.where('coachId', '==', coachId);
    }

    query = query.limit(limit).offset(offset);

    const snapshot = await query.get();
    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }));

    return NextResponse.json({ courses, total: snapshot.size });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST - Create a new course (requires Coach Pro subscription)
export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      description, 
      price, 
      duration, 
      level, 
      sport,
      curriculum,
      thumbnail,
      idToken 
    } = await request.json();

    // Validate required fields
    if (!title || !description || !price || !duration || !level || !sport || !idToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate price
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    // Validate level
    if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
      return NextResponse.json(
        { error: 'Level must be beginner, intermediate, or advanced' },
        { status: 400 }
      );
    }

    // Authenticate user
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Check if user is a coach
    const coachProfile = await findCoachByUserId(userId);
    
    if (!coachProfile) {
      return NextResponse.json(
        { error: 'Coach profile not found' },
        { status: 404 }
      );
    }

    // Check if coach has active subscription (Coach Pro required for course creation)
    if (coachProfile.data.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { error: 'Coach Pro subscription required to create courses' },
        { status: 403 }
      );
    }

    // Create course document
    const courseRef = db.collection('courses').doc();
    const courseData = {
      id: courseRef.id,
      title,
      description,
      price,
      duration,
      level,
      sport,
      curriculum: curriculum || [],
      thumbnail: thumbnail || null,
      coachId: userId,
      coachName: coachProfile.data.displayName || 'Unknown Coach',
      coachUsername: coachProfile.data.username || null,
      isActive: true,
      enrollments: 0,
      rating: 0,
      totalRatings: 0,
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await courseRef.set(courseData);

    // Update coach profile to indicate they have courses
    await coachProfile.ref.update({
      hasCourses: true,
      totalCourses: (coachProfile.data.totalCourses || 0) + 1,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      message: 'Course created successfully',
      ...courseData,
      createdAt: courseData.createdAt.toISOString(),
      updatedAt: courseData.updatedAt.toISOString(),
    });

  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
} 