import { NextRequest, NextResponse } from 'next/server';
import { searchCoachesWithFilters, filterCoaches } from '../../../lib/firebase-dataconnect-server';

// In-memory cache for coach search results
const coachCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface SearchParams {
  search?: string;
  sport?: string;
  location?: string;
  gender?: string;
  organization?: string;
  minRating?: string;
  maxRate?: string;
  isVerified?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

interface CoachData {
  id: string;
  username?: string;
  userId?: string;
  displayName?: string;
  bio?: string;
  specialties?: string[];
  sports?: string[];
  certifications?: string[];
  location?: string;
  hourlyRate?: number;
  organization?: string;
  school?: string;
  role?: string;
  gender?: string;
  ageGroup?: string[];
  sourceUrl?: string;
  averageRating?: number;
  totalReviews?: number;
  isVerified?: boolean;
  isPublic?: boolean;
  profileImage?: string;
  hasActiveServices?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse all search parameters
    const params: SearchParams = {
      search: searchParams.get('search') || undefined,
      sport: searchParams.get('sport') || undefined,
      location: searchParams.get('location') || undefined,
      gender: searchParams.get('gender') || undefined,
      organization: searchParams.get('organization') || undefined,
      minRating: searchParams.get('minRating') || undefined,
      maxRate: searchParams.get('maxRate') || undefined,
      isVerified: searchParams.get('isVerified') || undefined,
      sortBy: searchParams.get('sortBy') || 'averageRating',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '12',
    };

    const pageNum = parseInt(params.page || '1', 10);
    const limitNum = parseInt(params.limit || '12', 10);

    // Create cache key from search params
    const cacheKey = searchParams.toString();
    
    // Check cache first
    const cached = coachCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      const response = NextResponse.json(cached.data);
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
      return response;
    }
    
    // Validate pagination parameters
    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Fetch coaches from Firebase Data Connect
    // searchCoachesWithFilters now handles all filtering including searchTerm
    let coaches: any[];
    try {
      coaches = await searchCoachesWithFilters({
        searchTerm: params.search,
        sport: params.sport,
        location: params.location,
        gender: params.gender,
        organization: params.organization,
        minRating: params.minRating ? parseFloat(params.minRating) : undefined,
        maxRate: params.maxRate ? parseFloat(params.maxRate) : undefined,
        isVerified: params.isVerified === 'true' ? true : undefined,
        page: pageNum,
        limit: limitNum,
      });
    } catch (error) {
      console.error('Error fetching coaches from Data Connect:', error);
      
      // Return fallback response
      return NextResponse.json({
        coaches: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasMore: false,
        error: 'Search service temporarily unavailable',
        fallback: true
      });
    }

    // searchCoachesWithFilters already handles filtering, so use coaches directly
    let filteredCoaches = coaches;

    // Convert to API response format
    const formattedCoaches: CoachData[] = filteredCoaches.map((coach: any) => ({
      id: coach.id,
      username: coach.username,
      userId: coach.userId,
      displayName: coach.displayName,
      bio: coach.bio,
      specialties: coach.specialties || [],
      sports: coach.sports || [],
      certifications: coach.certifications || [],
      location: coach.location,
      hourlyRate: coach.hourlyRate ? parseFloat(coach.hourlyRate.toString()) : undefined,
      organization: coach.organization,
      school: coach.school,
      role: coach.role,
      gender: coach.gender,
      ageGroup: coach.ageGroup || [],
      sourceUrl: coach.sourceUrl,
      averageRating: coach.averageRating ? parseFloat(coach.averageRating.toString()) : 0,
      totalReviews: coach.totalReviews || 0,
      isVerified: coach.isVerified || false,
      isPublic: coach.isPublic !== false,
      profileImage: coach.profileImage,
      hasActiveServices: coach.hasActiveServices,
      createdAt: coach.createdAt || null,
      updatedAt: coach.updatedAt || null,
    }));

    // Apply client-side sorting based on user preference
    const sortBy = params.sortBy || 'averageRating';
    const sortOrder = params.sortOrder || 'desc';
    
    formattedCoaches.sort((a, b) => {
      let aValue: any = a[sortBy as keyof CoachData];
      let bValue: any = b[sortBy as keyof CoachData];
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = sortOrder === 'desc' ? -Infinity : Infinity;
      if (bValue === null || bValue === undefined) bValue = sortOrder === 'desc' ? -Infinity : Infinity;
      
      // String comparison for displayName
      if (sortBy === 'displayName') {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
        return sortOrder === 'desc' 
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      }
      
      // Numeric comparison for everything else
      if (sortOrder === 'desc') {
        return Number(bValue) - Number(aValue);
      } else {
        return Number(aValue) - Number(bValue);
      }
    });

    // Calculate pagination info
    let approximateTotal: number;
    let totalPages: number;
    const hasMore = formattedCoaches.length === limitNum;
    
    // If no filters are applied, fetch the total count from cache/database
    if (!params.search && !params.sport && !params.location && !params.gender && 
        !params.organization && !params.minRating && !params.maxRate && !params.isVerified) {
      try {
        // Fetch total count (cached for 5 minutes)
        const countResponse = await fetch(`${request.nextUrl.origin}/api/coaches/count`);
        const countData = await countResponse.json();
        approximateTotal = countData.total || 0;
        totalPages = Math.ceil(approximateTotal / limitNum);
      } catch (error) {
        console.error('Error fetching total count:', error);
        // Fallback to estimation
        approximateTotal = hasMore ? (pageNum * limitNum) + limitNum : (pageNum - 1) * limitNum + formattedCoaches.length;
        totalPages = hasMore ? pageNum + 1 : pageNum;
      }
    } else {
      // With filters, use smart estimation to avoid slow queries
      if (hasMore) {
        approximateTotal = (pageNum * limitNum) + limitNum;
        totalPages = pageNum + 1;
      } else {
        approximateTotal = (pageNum - 1) * limitNum + formattedCoaches.length;
        totalPages = pageNum;
      }
    }

    // Prepare response data
    const responseData = {
      coaches: formattedCoaches,
      total: approximateTotal,
      page: pageNum,
      totalPages: totalPages,
      hasMore,
      limit: limitNum,
      filters: params,
    };

    // Cache the result
    coachCache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    
    // Clean old cache entries (keep cache size manageable)
    if (coachCache.size > 200) {
      const now = Date.now();
      for (const [key, value] of coachCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          coachCache.delete(key);
        }
      }
    }

    // Response with caching headers
    const response = NextResponse.json(responseData);
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300');
    
    return response;

  } catch (error) {
    console.error('Error searching coaches:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
