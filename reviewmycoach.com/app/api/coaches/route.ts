import { NextRequest, NextResponse } from 'next/server';

// Function to get Firebase instance
async function getFirebaseDb() {
  try {
    const firebaseAdminModule = await import('../../lib/firebase-admin');
    return firebaseAdminModule.db || null;
  } catch (error) {
    console.error('Failed to load Firebase Admin in coaches route:', error);
    return null;
  }
}

interface CoachData {
  id: string;
  displayName?: string;
  email?: string;
  bio?: string;
  specialties?: string[];
  sports?: string[];
  hourlyRate?: number;
  organization?: string;
  role?: string;
  gender?: string;
  ageGroup?: string[];
  sourceUrl?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: any;
}

// GET - Fetch coaches with filtering and pagination
export async function GET(request: NextRequest) {
  const db = await getFirebaseDb();
  
  // Early return if Firebase isn't initialized
  if (!db) {
    console.error('Firebase not initialized - returning empty coaches list');
    return NextResponse.json({ 
      coaches: [],
      count: 0,
      page: 1,
      limit: 20,
      hasMore: false,
      error: 'Firebase connection not available'
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const limitParam = parseInt(searchParams.get('limit') || '20', 10);
    const pageParam = searchParams.get('page') || '1';
    const sportsParam = searchParams.get('sports');
    const locationParam = searchParams.get('location');
    const minRatingParam = searchParams.get('minRating');
    const maxRateParam = searchParams.get('maxRate');
    const isVerifiedParam = searchParams.get('isVerified');
    const searchTermParam = searchParams.get('search');
    const genderParam = searchParams.get('gender');
    const organizationParam = searchParams.get('organization');
    const roleParam = searchParams.get('role');
    const ageGroupParam = searchParams.get('ageGroup');
    const sortByParam = searchParams.get('sortBy') || 'averageRating'; // averageRating, hourlyRate, experience
    const sortOrderParam = searchParams.get('sortOrder') || 'desc';

    // Build base query
    let baseQuery: any = db.collection('coaches');

    // Add filters
    if (sportsParam) {
      const sports = sportsParam.split(',');
      baseQuery = baseQuery.where('sports', 'array-contains-any', sports);
    }

    if (locationParam) {
      baseQuery = baseQuery.where('location', '==', locationParam);
    }

    if (minRatingParam) {
      const minRating = parseFloat(minRatingParam);
      baseQuery = baseQuery.where('averageRating', '>=', minRating);
    }

    if (isVerifiedParam === 'true') {
      baseQuery = baseQuery.where('isVerified', '==', true);
    }

    if (genderParam) {
      baseQuery = baseQuery.where('gender', '==', genderParam);
    }

    if (roleParam) {
      baseQuery = baseQuery.where('role', '==', roleParam);
    }

    // Add sorting
    const sortOrder = sortOrderParam === 'asc' ? 'asc' : 'desc';
    baseQuery = baseQuery.orderBy(sortByParam, sortOrder);

    // Add limit
    baseQuery = baseQuery.limit(limitParam);

    // Execute query
    const querySnapshot = await baseQuery.get();

    let coaches = querySnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || null,
        updatedAt: data.updatedAt?.toDate().toISOString() || null,
      };
    });

    // Client-side filtering for more complex searches
    if (searchTermParam) {
      const searchTerm = searchTermParam.toLowerCase();
      coaches = coaches.filter((coach: CoachData) => 
        coach.displayName?.toLowerCase().includes(searchTerm) ||
        coach.bio?.toLowerCase().includes(searchTerm) ||
        coach.specialties?.some((s: string) => s.toLowerCase().includes(searchTerm)) ||
        coach.sports?.some((s: string) => s.toLowerCase().includes(searchTerm)) ||
        coach.organization?.toLowerCase().includes(searchTerm)
      );
    }

    if (organizationParam) {
      coaches = coaches.filter((coach: CoachData) => 
        coach.organization?.toLowerCase().includes(organizationParam.toLowerCase())
      );
    }

    if (ageGroupParam) {
      coaches = coaches.filter((coach: CoachData) => 
        coach.ageGroup?.some((age: string) => age.toLowerCase().includes(ageGroupParam.toLowerCase()))
      );
    }

    if (maxRateParam) {
      const maxRate = parseFloat(maxRateParam);
      coaches = coaches.filter((coach: CoachData) => coach.hourlyRate && coach.hourlyRate <= maxRate);
    }

    return NextResponse.json({
      coaches,
      count: coaches.length,
      page: parseInt(pageParam, 10),
      limit: limitParam,
      hasMore: querySnapshot.docs.length === limitParam
    });

  } catch (error) {
    console.error('Error fetching coaches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new coach profile
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Note: For production, you'd want to use firebase-admin here
    // This is simplified for the example
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['displayName', 'bio', 'sports', 'experience'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ 
          error: `${field} is required` 
        }, { status: 400 });
      }
    }

    // Validate field types and values
    if (!Array.isArray(body.sports) || body.sports.length === 0) {
      return NextResponse.json({ 
        error: 'At least one sport must be selected' 
      }, { status: 400 });
    }

    if (typeof body.experience !== 'number' || body.experience < 0 || body.experience > 50) {
      return NextResponse.json({ 
        error: 'Experience must be a number between 0 and 50' 
      }, { status: 400 });
    }

    if (body.hourlyRate && (body.hourlyRate < 0 || body.hourlyRate > 1000)) {
      return NextResponse.json({ 
        error: 'Hourly rate must be between 0 and 1000' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Coach profile creation endpoint ready. Implement with proper authentication.' 
    });

  } catch (error) {
    console.error('Error creating coach profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 