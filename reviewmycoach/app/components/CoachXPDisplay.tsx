'use client';

import { useCoachXP } from '../../lib/hooks/useCoachXP';

/**
 * Example component demonstrating XP display
 * 
 * Usage:
 * <CoachXPDisplay coachId="coach_username" />
 * or
 * <CoachXPDisplay userId="firebase_user_id" />
 */
interface CoachXPDisplayProps {
  coachId?: string;
  userId?: string;
}

export default function CoachXPDisplay({ coachId, userId }: CoachXPDisplayProps) {
  const { xpData, loading, error } = useCoachXP(coachId || null, userId || null);

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error loading XP: {error}</p>
      </div>
    );
  }

  if (!xpData) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">No XP data available</p>
      </div>
    );
  }

  const getTierColor = (tierNumber: number) => {
    switch (tierNumber) {
      case 5:
        return 'text-purple-600 bg-purple-100';
      case 4:
        return 'text-blue-600 bg-blue-100';
      case 3:
        return 'text-green-600 bg-green-100';
      case 2:
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {xpData.coachName}'s XP Score
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-gray-900">
            {xpData.xp.toLocaleString()} XP
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold ${getTierColor(xpData.tier_number)}`}>
            {xpData.tier}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">XP Breakdown</h3>
        <div className="space-y-1">
          {xpData.breakdown_text.map((line, index) => (
            <div
              key={index}
              className={`text-sm ${
                line.includes('Total XP') ? 'font-bold text-gray-900 pt-2 border-t border-gray-200' : 'text-gray-700'
              }`}
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Input Summary */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Input Summary</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>Subscription Tier: {xpData.inputs.subscription_tier}</div>
          <div>Platform Years: {xpData.inputs.longevity_platform_years.toFixed(2)}</div>
          <div>Career Years: {xpData.inputs.career_years}</div>
          <div>Courses: {xpData.inputs.courses_created}</div>
          <div>Jobs Completed: {xpData.inputs.jobs_completed}</div>
          <div>Review Score: {xpData.inputs.review_score.toFixed(1)}/5.0</div>
          <div>Consistency: {xpData.inputs.consistency_multiplier.toFixed(2)}x</div>
        </div>
      </div>
    </div>
  );
}

