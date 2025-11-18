/**
 * React Hook for fetching coach XP data
 * 
 * Usage:
 * const { xp, loading, error } = useCoachXP(coachId);
 */

import { useState, useEffect } from 'react';

export interface CoachXPData {
  coachId: string;
  coachName: string;
  xp: number;
  tier: string;
  tier_number: number;
  breakdown: {
    base_xp: number;
    platform_xp: number;
    career_xp: number;
    course_xp: number;
    job_xp: number;
    review_bonus: number;
    subtotal: number;
    consistency_multiplier: number;
    total_xp: number;
  };
  breakdown_text: string[];
  inputs: {
    subscription_tier: number;
    subscription_status: string;
    longevity_platform_years: number;
    career_years: number;
    courses_created: number;
    jobs_completed: number;
    review_score: number;
    consistency_multiplier: number;
  };
}

export function useCoachXP(coachId: string | null, userId?: string | null) {
  const [xpData, setXpData] = useState<CoachXPData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coachId && !userId) {
      setXpData(null);
      setLoading(false);
      return;
    }

    const fetchXP = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = userId
          ? `/api/coaches/${coachId || 'dummy'}/xp?userId=${userId}`
          : `/api/coaches/${coachId}/xp`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch XP: ${response.statusText}`);
        }

        const data = await response.json();
        setXpData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch coach XP');
        setXpData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchXP();
  }, [coachId, userId]);

  return { xpData, loading, error };
}

