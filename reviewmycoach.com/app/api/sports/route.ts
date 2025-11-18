import { NextRequest, NextResponse } from 'next/server';

// Lazy-load firebase-admin wrapper similar to other routes
async function getFirebaseDb() {
  try {
    const firebaseAdminModule = await import('../../lib/firebase-admin');
    return firebaseAdminModule.db || null;
  } catch (error) {
    console.error('Failed to load Firebase Admin in sports route:', error);
    return null;
  }
}

interface SportsResponse {
  sports: string[];
  fallback?: boolean;
}

export async function GET(_request: NextRequest) {
  const db = await getFirebaseDb();

  if (!db) {
    // Fallback to a static list matching public/Widgets gifs when Firebase isn't available
    const fallbackSports = [
      'Baseball','Basketball','Bowling','Cheer and Dance','Cross Country','Fencing','Field Hockey','Golf','Gymnastics','Ice Hockey','Lacrosse','Rowing','Rugby','Skiing','Soccer','Softball','Swimming','Tennis','Track and Field','Volleyball','Water Polo','Wrestling'
    ];
    return NextResponse.json({ sports: fallbackSports, fallback: true } satisfies SportsResponse);
  }

  try {
    const snapshot = await db.collection('coaches').select('sports').get();
    const sportSet = new Set<string>();

    snapshot.forEach((doc: any) => {
      const data = doc.data();
      const sports: unknown = data?.sports;
      if (Array.isArray(sports)) {
        for (const s of sports) {
          if (typeof s === 'string' && s.trim()) {
            sportSet.add(s.trim());
          }
        }
      }
    });

    const sports = Array.from(sportSet).sort((a, b) => a.localeCompare(b));
    return NextResponse.json({ sports } as SportsResponse);
  } catch (error) {
    console.error('Error fetching sports:', error);
    return NextResponse.json({ sports: [], fallback: true } as SportsResponse);
  }
}


