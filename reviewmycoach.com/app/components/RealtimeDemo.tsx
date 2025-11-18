'use client';

import { useState, useEffect } from 'react';
import { useRealtimeReviews } from '../lib/hooks/useRealtimeReviews';

interface RealtimeDemoProps {
  coachId: string;
}

export default function RealtimeDemo({ coachId }: RealtimeDemoProps) {
  const { 
    reviews, 
    ratingStats, 
    loading, 
    error, 
    refreshReviews 
  } = useRealtimeReviews(coachId);
  
  const [showDemo, setShowDemo] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Track when reviews change to show real-time updates
  useEffect(() => {
    if (reviews.length > 0) {
      setLastUpdate(new Date());
    }
  }, [reviews.length, ratingStats.averageRating]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingBackground = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-50 border-green-200';
    if (rating >= 4.0) return 'bg-yellow-50 border-yellow-200';
    if (rating >= 3.0) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  if (!showDemo) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowDemo(true)}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          Real-time Demo
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="font-semibold text-gray-900">Real-time Ratings</h3>
          </div>
          <button
            onClick={() => setShowDemo(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status */}
        <div className="mb-3">
          {loading && (
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm">Syncing...</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-red-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Connection Error</span>
            </div>
          )}
          {!loading && !error && (
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">Connected</span>
            </div>
          )}
        </div>

        {/* Current Stats */}
        <div className={`p-3 rounded-lg border ${getRatingBackground(ratingStats.averageRating)} mb-3`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-2xl font-bold ${getRatingColor(ratingStats.averageRating)}`}>
                {ratingStats.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">
                {ratingStats.totalReviews} reviews
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${
                      star <= ratingStats.averageRating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Distribution</h4>
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = ratingStats.ratingDistribution[rating] || 0;
              const percentage = ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-2 text-xs">
                  <span className="w-2 text-gray-600">{rating}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="w-6 text-gray-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Last Update */}
        {lastUpdate && (
          <div className="text-xs text-gray-500 mb-3">
            Last updated: {formatTime(lastUpdate)}
          </div>
        )}

        {/* Recent Reviews */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Reviews</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="p-2 bg-gray-50 rounded text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{review.studentName}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-3 h-3 ${
                          star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 line-clamp-2">
                  {review.reviewText.substring(0, 80)}...
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-3 pt-2 border-t border-gray-100">
          <button
            onClick={refreshReviews}
            className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
} 