/**
 * XP Calculator for ReviewMyCoach Platform
 * 
 * Calculates coach XP based on engagement, contribution, and performance metrics.
 * Rewards both activity and consistency.
 */

export interface XPCalculationInputs {
  subscription_tier: number; // 1 = Basic, 2 = Pro, 3 = Elite
  longevity_platform_years: number; // Years subscribed to RMC
  career_years: number; // Total professional coaching years
  courses_created: number; // Courses or learning modules published
  jobs_completed: number; // Paid sessions, team consults, or assignments fulfilled
  review_score: number; // 0.0-5.0 scale
  consistency_multiplier: number; // 0.5-2.0 typical range
}

export interface XPBreakdown {
  base_xp: number;
  platform_xp: number;
  career_xp: number;
  course_xp: number;
  job_xp: number;
  review_bonus: number;
  subtotal: number;
  consistency_multiplier: number;
  total_xp: number;
}

export interface XPResult {
  total_xp: number;
  breakdown: XPBreakdown;
  tier: string;
  tier_number: number;
}

/**
 * Calculate coach XP based on provided inputs
 */
export function calculateCoachXP(inputs: XPCalculationInputs): XPResult {
  // Calculate base XP components
  const base_xp = inputs.subscription_tier * 1000;
  const platform_xp = inputs.longevity_platform_years * 200;
  const career_xp = inputs.career_years * 150;
  const course_xp = inputs.courses_created * 300;
  const job_xp = inputs.jobs_completed * 100;
  const review_bonus = (inputs.review_score / 5) * 500;

  // Calculate subtotal before multiplier
  const subtotal = base_xp + platform_xp + career_xp + course_xp + job_xp + review_bonus;

  // Apply consistency multiplier
  const total_xp = Math.round(subtotal * inputs.consistency_multiplier);

  // Create breakdown
  const breakdown: XPBreakdown = {
    base_xp,
    platform_xp,
    career_xp,
    course_xp,
    job_xp,
    review_bonus,
    subtotal,
    consistency_multiplier: inputs.consistency_multiplier,
    total_xp,
  };

  // Determine tier
  const { tier, tier_number } = getCoachTier(total_xp);

  return {
    total_xp,
    breakdown,
    tier,
    tier_number,
  };
}

/**
 * Get coach tier based on XP score
 */
export function getCoachTier(xp: number): { tier: string; tier_number: number } {
  if (xp >= 20000) {
    return { tier: 'Legendary Coach', tier_number: 5 };
  } else if (xp >= 12000) {
    return { tier: 'Veteran Coach', tier_number: 4 };
  } else if (xp >= 7000) {
    return { tier: 'Elite Coach', tier_number: 3 };
  } else if (xp >= 3000) {
    return { tier: 'Professional Coach', tier_number: 2 };
  } else {
    return { tier: 'Rookie Coach', tier_number: 1 };
  }
}

/**
 * Format XP breakdown as human-readable strings
 */
export function formatXPBreakdown(breakdown: XPBreakdown): string[] {
  return [
    `Base XP (Subscription): +${breakdown.base_xp.toLocaleString()} XP`,
    `Platform Longevity: +${breakdown.platform_xp.toLocaleString()} XP`,
    `Career Experience: +${breakdown.career_xp.toLocaleString()} XP`,
    `Courses Created: +${breakdown.course_xp.toLocaleString()} XP`,
    `Jobs Completed: +${breakdown.job_xp.toLocaleString()} XP`,
    `Review Bonus: +${breakdown.review_bonus.toLocaleString()} XP`,
    `Subtotal: ${breakdown.subtotal.toLocaleString()} XP`,
    `Consistency Multiplier: ${breakdown.consistency_multiplier}x`,
    `Total XP: ${breakdown.total_xp.toLocaleString()} XP`,
  ];
}

/**
 * Map subscription status to tier number
 * Basic = 1, Pro = 2, Elite = 3
 */
export function mapSubscriptionToTier(
  subscriptionStatus?: string | null,
  subscriptionPlan?: string | null
): number {
  // If no subscription, default to Basic (tier 1)
  if (!subscriptionStatus || subscriptionStatus === 'inactive' || subscriptionStatus === 'cancelled') {
    return 1; // Basic
  }

  // If active subscription, check plan type
  if (subscriptionStatus === 'active') {
    // For now, active subscription = Pro (tier 2)
    // In the future, you can add logic to check for Elite tier
    // For example, if subscriptionPlan includes 'elite' or similar
    return 2; // Pro
  }

  return 1; // Default to Basic
}

/**
 * Calculate years between two dates
 */
export function calculateYearsBetween(startDate: Date | null | undefined, endDate: Date = new Date()): number {
  if (!startDate) {
    return 0;
  }

  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0;
  }

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);

  return Math.max(0, diffYears);
}

/**
 * Calculate consistency multiplier based on session regularity
 * This is a placeholder - implement actual logic based on your data
 * 
 * Typical range: 0.5-2.0
 * - 0.5: Very inconsistent
 * - 1.0: Average consistency
 * - 1.5: Good consistency
 * - 2.0: Excellent consistency
 */
export function calculateConsistencyMultiplier(
  totalSessions: number,
  monthsActive: number,
  averageSessionsPerMonth?: number
): number {
  if (totalSessions === 0 || monthsActive === 0) {
    return 0.5; // Minimum multiplier for new/inactive coaches
  }

  // Calculate average sessions per month
  const avgSessions = averageSessionsPerMonth || totalSessions / Math.max(1, monthsActive);

  // Base multiplier starts at 1.0
  let multiplier = 1.0;

  // Reward consistency: if average sessions per month >= 5, increase multiplier
  if (avgSessions >= 10) {
    multiplier = 2.0; // Excellent consistency
  } else if (avgSessions >= 5) {
    multiplier = 1.5; // Good consistency
  } else if (avgSessions >= 2) {
    multiplier = 1.2; // Above average
  } else if (avgSessions >= 1) {
    multiplier = 1.0; // Average
  } else {
    multiplier = 0.7; // Below average
  }

  // Ensure multiplier stays within bounds
  return Math.max(0.5, Math.min(2.0, multiplier));
}

