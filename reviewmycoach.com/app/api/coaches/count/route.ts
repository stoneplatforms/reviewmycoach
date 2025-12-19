import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import { searchCoachesAdvanced } from '../../../lib/dataconnect';

// Initialize Firebase Client App for Data Connect
let clientApp;
if (getApps().length === 0) {
  clientApp = initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
} else {
  clientApp = getApps()[0];
}

const dataConnect = getDataConnect(clientApp, {
  connector: 'reviewmycoach',
  location: 'us-east4',
  service: 'review-my-coach-service'
});

// Cache the total count (refresh every 5 minutes)
let cachedCount: { total: number; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * GET /api/coaches/count
 * Returns the total number of coaches in the database
 * This is cached to avoid hitting the database on every request
 */
export async function GET(request: NextRequest) {
  try {
    // Check cache first
    if (cachedCount && Date.now() - cachedCount.timestamp < CACHE_DURATION) {
      return NextResponse.json({ 
        total: cachedCount.total, 
        cached: true,
        lastUpdated: new Date(cachedCount.timestamp).toISOString()
      });
    }

    // Query Data Connect for count using sampling
    // We fetch the first 10k coaches and check if there are more
    // This is much faster than fetching all 30k coaches
    const result = await searchCoachesAdvanced(dataConnect, {
      offset: 0,
      limit: 10000
    });
    
    const firstBatch = result.data.coaches?.length || 0;
    
    // If we got exactly 10k, there are likely more
    if (firstBatch === 10000) {
      // Fetch second batch to check
      const result2 = await searchCoachesAdvanced(dataConnect, {
        offset: 10000,
        limit: 10000
      });
      const secondBatch = result2.data.coaches?.length || 0;
      
      if (secondBatch === 10000) {
        // Fetch third batch
        const result3 = await searchCoachesAdvanced(dataConnect, {
          offset: 20000,
          limit: 10000
        });
        const thirdBatch = result3.data.coaches?.length || 0;
        const total = firstBatch + secondBatch + thirdBatch;
        
        // If third batch is also 10k, there might be more, but cap at 30k for now
        cachedCount = { total, timestamp: Date.now() };
      } else {
        const total = firstBatch + secondBatch;
        cachedCount = { total, timestamp: Date.now() };
      }
    } else {
      cachedCount = { total: firstBatch, timestamp: Date.now() };
    }
    
    const total = cachedCount.total;

    // Update cache
    cachedCount = {
      total,
      timestamp: Date.now()
    };

    const response = NextResponse.json({ 
      total, 
      cached: false,
      lastUpdated: new Date().toISOString()
    });

    // Add cache headers (5 minutes)
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');

    return response;

  } catch (error) {
    console.error('Error counting coaches:', error);
    
    // If we have a cached count, return it even if stale
    if (cachedCount) {
      return NextResponse.json({ 
        total: cachedCount.total, 
        cached: true,
        stale: true,
        error: 'Count query failed, using cached value',
        lastUpdated: new Date(cachedCount.timestamp).toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Failed to count coaches', total: 0 },
      { status: 500 }
    );
  }
}

