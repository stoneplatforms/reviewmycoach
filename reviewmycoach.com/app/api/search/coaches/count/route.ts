import { NextRequest, NextResponse } from 'next/server';
import { searchCoachesWithFilters } from '../../../../lib/firebase-dataconnect-server';

// Cache for count results (5 minutes)
const countCache = new Map<string, { count: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Create cache key from search params
    const cacheKey = searchParams.toString();
    
    // Check cache first
    const cached = countCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ total: cached.count, cached: true });
    }
    
    // Parse search parameters
    const params = {
      search: searchParams.get('search') || undefined,
      sport: searchParams.get('sport') || undefined,
      location: searchParams.get('location') || undefined,
      gender: searchParams.get('gender') || undefined,
      organization: searchParams.get('organization') || undefined,
      minRating: searchParams.get('minRating') || undefined,
      maxRate: searchParams.get('maxRate') || undefined,
      isVerified: searchParams.get('isVerified') || undefined,
    };

    // Fetch coaches in batches to get accurate count
    // Data Connect has a 10k limit per query, so we need to paginate
    let total = 0;
    let page = 1;
    const batchSize = 10000;
    
    while (true) {
      const coaches = await searchCoachesWithFilters({
        searchTerm: params.search,
        sport: params.sport,
        location: params.location,
        gender: params.gender,
        organization: params.organization,
        minRating: params.minRating ? parseFloat(params.minRating) : undefined,
        maxRate: params.maxRate ? parseFloat(params.maxRate) : undefined,
        isVerified: params.isVerified === 'true' ? true : undefined,
        page,
        limit: batchSize,
      });
      
      total += coaches.length;
      
      // If we got less than batchSize, we've reached the end
      if (coaches.length < batchSize) {
        break;
      }
      
      page++;
    }
    
    // Cache the result
    countCache.set(cacheKey, { count: total, timestamp: Date.now() });
    
    // Clean old cache entries (keep cache size manageable)
    if (countCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of countCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          countCache.delete(key);
        }
      }
    }

    const response = NextResponse.json({ total, cached: false });
    
    // Add cache headers
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;

  } catch (error) {
    console.error('Error counting coaches:', error);
    return NextResponse.json(
      { error: 'Failed to count coaches', total: 0 },
      { status: 500 }
    );
  }
}

