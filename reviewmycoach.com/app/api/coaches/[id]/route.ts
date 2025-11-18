import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase-admin';
import { auth } from '../../../lib/firebase-admin';

// GET - Fetch coach profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: coachId } = await params;
    
    const coachRef = db.doc(`coaches/${coachId}`);
    const coachSnap = await coachRef.get();
    
    if (!coachSnap.exists) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    const data = coachSnap.data();
    if (!data) {
      return NextResponse.json({ error: 'Coach data not found' }, { status: 404 });
    }
    const serializedData = {
      ...data,
      createdAt: data.createdAt?.toDate().toISOString() || null,
      updatedAt: data.updatedAt?.toDate().toISOString() || null,
    };

    return NextResponse.json({
      id: coachSnap.id,
      ...serializedData
    });

  } catch (error) {
    console.error('Error fetching coach:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update coach profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: coachId } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the token
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Check if user owns this coach profile
    const coachRef = db.doc(`coaches/${coachId}`);
    const coachSnap = await coachRef.get();
    
    if (!coachSnap.exists) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    const coachData = coachSnap.data();
    if (!coachData) {
      return NextResponse.json({ error: 'Coach data not found' }, { status: 404 });
    }
    if (coachData.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = await request.json();
    
    // Validate and sanitize updates
    const allowedFields = [
      'displayName', 'bio', 'sports', 'experience', 'certifications',
      'hourlyRate', 'location', 'availability', 'specialties', 'languages',
      'profileImage', 'phoneNumber', 'website', 'socialMedia', 'organization',
      'role', 'gender', 'ageGroup', 'sourceUrl'
    ];

    const sanitizedUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = value;
      }
    }

    // Add update timestamp
    sanitizedUpdates.updatedAt = new Date();

    // Validate specific fields
    if (sanitizedUpdates.hourlyRate && (sanitizedUpdates.hourlyRate < 0 || sanitizedUpdates.hourlyRate > 1000)) {
      return NextResponse.json({ error: 'Hourly rate must be between 0 and 1000' }, { status: 400 });
    }

    if (sanitizedUpdates.experience && (sanitizedUpdates.experience < 0 || sanitizedUpdates.experience > 50)) {
      return NextResponse.json({ error: 'Experience must be between 0 and 50 years' }, { status: 400 });
    }

    if (sanitizedUpdates.sports && (!Array.isArray(sanitizedUpdates.sports) || sanitizedUpdates.sports.length === 0)) {
      return NextResponse.json({ error: 'At least one sport must be selected' }, { status: 400 });
    }

    // Update the document
    await coachRef.update(sanitizedUpdates);

    return NextResponse.json({ 
      success: true, 
      message: 'Coach profile updated successfully' 
    });

  } catch (error) {
    console.error('Error updating coach:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 