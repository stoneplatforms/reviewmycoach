import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import {
  getCoachByUsername,
  getUserCards,
  unlockTierCard,
  updateCoachTotalXp,
} from '../../../../lib/dataconnect';
import {
  calculateXpFromCoach,
  getEligibleTierCards,
  TIER_CARDS,
} from '../../../../lib/xp-service';

// Initialize Firebase
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
  service: 'review-my-coach-service',
});

/**
 * POST - Recalculate XP for a coach and auto-unlock eligible tier cards
 *
 * This should be called whenever XP-affecting fields change:
 * - subscriptionTier, longevityPlatformYears, careerYears
 * - coursesCreated, jobsCompleted, averageRating, consistencyMultiplier
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: coachId } = await params;
    const body = await request.json().catch(() => ({}));

    // Option 1: Pass coach data directly (faster, no extra fetch)
    // Option 2: Pass userId/username to fetch fresh data
    const { coach: coachData, userId, username } = body;

    let coach = coachData;
    let coachUsername = username;
    let coachUserId = userId;

    // If coach data not provided, fetch it
    if (!coach && username) {
      const result = await getCoachByUsername(dataConnect, { username });
      const coaches = result.data.coaches || [];
      if (coaches.length === 0) {
        return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
      }
      coach = coaches[0];
      coachUsername = coach.username;
      coachUserId = coach.userId;
    }

    if (!coach) {
      return NextResponse.json(
        { error: 'Coach data or username required' },
        { status: 400 }
      );
    }

    // Calculate XP
    const totalXp = calculateXpFromCoach(coach);
    const previousXp = coach.totalXp || 0;

    // Update totalXp in database
    await updateCoachTotalXp(dataConnect, {
      id: coachId,
      totalXp: totalXp,
    });

    // Get eligible tier cards
    const eligibleCards = getEligibleTierCards(totalXp);

    // Get user's existing tier cards
    let existingCardIds = new Set<string>();
    if (coachUserId) {
      try {
        const userCardsResult = await getUserCards(dataConnect, {
          userId: coachUserId,
        });
        const userCards = userCardsResult.data.userCards || [];
        existingCardIds = new Set(
          userCards
            .filter((c: any) => c.cardType === 'tier')
            .map((c: any) => c.cardId)
        );
      } catch (err) {
        console.warn('Could not fetch user cards:', err);
      }
    }

    // Unlock new eligible cards
    const newlyUnlocked: typeof TIER_CARDS[number][] = [];

    for (const card of eligibleCards) {
      if (!existingCardIds.has(card.id) && coachUserId && coachUsername) {
        try {
          const userCardId = `uc_${coachUserId}_${card.id}_${Date.now()}`;
          await unlockTierCard(dataConnect, {
            id: userCardId,
            userId: coachUserId,
            coachUsername: coachUsername,
            cardId: card.id,
            cardName: card.tierName,
            cardImageUrl: card.imageUrl,
          });
          newlyUnlocked.push(card);
          console.log(`✅ Unlocked ${card.tierName} for ${coachUsername}`);
        } catch (err) {
          console.error(`Failed to unlock ${card.tierName}:`, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      coachId,
      previousXp,
      totalXp,
      xpGained: totalXp - previousXp,
      eligibleCards: eligibleCards.map((c) => c.tierName),
      newlyUnlocked: newlyUnlocked.map((c) => ({
        id: c.id,
        name: c.tierName,
        imageUrl: c.imageUrl,
      })),
    });
  } catch (error) {
    console.error('Error updating XP:', error);
    return NextResponse.json(
      { error: 'Failed to update XP' },
      { status: 500 }
    );
  }
}
