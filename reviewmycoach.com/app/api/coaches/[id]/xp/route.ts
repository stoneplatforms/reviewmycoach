import { NextRequest, NextResponse } from 'next/server';
import { db, findCoachByUserId } from '../../../../lib/firebase-admin';
import {
  calculateCoachXP,
  mapSubscriptionToTier,
  calculateYearsBetween,
  calculateConsistencyMultiplier,
  formatXPBreakdown,
  type XPCalculationInputs,
  type XPResult,
} from '../../../../lib/xp-calculator';

/**
 * GET /api/coaches/[id]/xp
 * 
 * Calculate and return XP score for a coach
 * 
 * Query parameters:
 * - id: Coach ID (username or userId)
 * - userId: Optional, if provided, searches by userId instead of id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: coachId } = await params;
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');

    let coachDoc;
    let coachData;

    // If userId is provided, search by userId
    if (userIdParam) {
      const coachProfile = await findCoachByUserId(userIdParam);
      if (!coachProfile) {
        return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
      }
      coachDoc = coachProfile.doc;
      coachData = coachProfile.data;
    } else {
      // Otherwise, search by coach ID (username)
      const coachRef = db.doc(`coaches/${coachId}`);
      const coachSnap = await coachRef.get();

      if (!coachSnap.exists) {
        return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
      }

      coachData = coachSnap.data();
      if (!coachData) {
        return NextResponse.json({ error: 'Coach data not found' }, { status: 404 });
      }
    }

    // Get subscription tier
    const subscriptionStatus = coachData.subscriptionStatus || 'inactive';
    const subscriptionPlan = coachData.subscriptionPlan || null;
    const subscription_tier = mapSubscriptionToTier(subscriptionStatus, subscriptionPlan);

    // Calculate platform longevity (years since joining RMC)
    const createdAt = coachData.createdAt?.toDate?.() || coachData.createdAt || null;
    const subscriptionStartDate = coachData.subscriptionStartDate?.toDate?.() || coachData.subscriptionStartDate || null;
    
    // Use subscription start date if available, otherwise use createdAt
    const platformStartDate = subscriptionStartDate || createdAt;
    const longevity_platform_years = calculateYearsBetween(platformStartDate);

    // Get career years (from experience field or careerYears)
    const career_years = coachData.experience || coachData.careerYears || 0;

    // Count courses created
    let courses_created = 0;
    try {
      const coursesQuery = db.collection('courses')
        .where('coachId', '==', coachData.userId || coachId)
        .where('isActive', '==', true);
      const coursesSnapshot = await coursesQuery.get();
      courses_created = coursesSnapshot.size;
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Use cached value if available
      courses_created = coachData.totalCourses || 0;
    }

    // Count jobs completed (from bookings and job applications)
    let jobs_completed = 0;
    try {
      // Count completed bookings
      const bookingsQuery = db.collection('bookings')
        .where('coachId', '==', coachData.userId || coachId)
        .where('status', '==', 'completed');
      const bookingsSnapshot = await bookingsQuery.get();
      const completedBookings = bookingsSnapshot.size;

      // Count accepted/completed job applications
      const applicationsQuery = db.collection('job_applications')
        .where('coachId', '==', coachData.userId || coachId)
        .where('status', 'in', ['accepted', 'completed']);
      const applicationsSnapshot = await applicationsQuery.get();
      const completedApplications = applicationsSnapshot.size;

      jobs_completed = completedBookings + completedApplications;
    } catch (error) {
      console.error('Error fetching jobs/completed bookings:', error);
      // Use cached value if available
      jobs_completed = coachData.jobsCompleted || coachData.totalJobsCompleted || 0;
    }

    // Get review score
    const review_score = coachData.averageRating || 0;

    // Calculate consistency multiplier
    // This is a simplified version - you may want to enhance this based on actual session data
    let consistency_multiplier = 1.0;
    try {
      // Get total bookings (completed + confirmed) to calculate consistency
      const allBookingsQuery = db.collection('bookings')
        .where('coachId', '==', coachData.userId || coachId)
        .where('status', 'in', ['confirmed', 'completed']);
      const allBookingsSnapshot = await allBookingsQuery.get();
      const totalSessions = allBookingsSnapshot.size;

      // Calculate months active
      const monthsActive = Math.max(1, longevity_platform_years * 12);

      consistency_multiplier = calculateConsistencyMultiplier(totalSessions, monthsActive);
    } catch (error) {
      console.error('Error calculating consistency multiplier:', error);
      // Default to 1.0 if calculation fails
      consistency_multiplier = 1.0;
    }

    // Prepare inputs for XP calculation
    const inputs: XPCalculationInputs = {
      subscription_tier,
      longevity_platform_years,
      career_years,
      courses_created,
      jobs_completed,
      review_score,
      consistency_multiplier,
    };

    // Calculate XP
    const xpResult: XPResult = calculateCoachXP(inputs);

    // Format breakdown for display
    const breakdownText = formatXPBreakdown(xpResult.breakdown);

    // Return result
    return NextResponse.json({
      coachId: userIdParam ? coachData.userId : coachId,
      coachUsername: coachData.username || coachId,
      coachName: coachData.displayName || 'Unknown Coach',
      xp: xpResult.total_xp,
      tier: xpResult.tier,
      tier_number: xpResult.tier_number,
      breakdown: xpResult.breakdown,
      breakdown_text: breakdownText,
      inputs: {
        subscription_tier,
        subscription_status: subscriptionStatus,
        longevity_platform_years: Math.round(longevity_platform_years * 100) / 100,
        career_years,
        courses_created,
        jobs_completed,
        review_score: Math.round(review_score * 100) / 100,
        consistency_multiplier: Math.round(consistency_multiplier * 100) / 100,
      },
    });

  } catch (error) {
    console.error('Error calculating coach XP:', error);
    return NextResponse.json(
      { error: 'Failed to calculate coach XP', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

