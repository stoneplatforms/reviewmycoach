'use client';

import { useState } from 'react';
import { User } from 'firebase/auth';

interface RealtimeReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  coachId: string;
  coachName: string;
  coachUsername?: string;
  user: User | null;
  onReviewSubmitted?: () => void;
}

export default function RealtimeReviewModal({
  isOpen,
  onClose,
  coachId,
  coachName,
  coachUsername,
  user,
  onReviewSubmitted
}: RealtimeReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [sport, setSport] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setRating(0);
    setReviewText('');
    setSport('');
    setHoveredRating(0);
    setError(null);
    setIsSubmitting(false);
    setSuccess(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async () => {
    // Client-side validation
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (reviewText.trim().length < 10) {
      setError('Review must be at least 10 characters long');
      return;
    }

    if (reviewText.trim().length > 1000) {
      setError('Review must be less than 1000 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Build headers - try to get auth token with a timeout
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (user) {
        try {
          const tokenPromise = user.getIdToken();
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Token timeout')), 5000)
          );
          const token = await Promise.race([tokenPromise, timeoutPromise]);
          headers['Authorization'] = `Bearer ${token}`;
        } catch {
          // Continue without auth - API supports anonymous reviews
          console.log('Submitting as anonymous (token unavailable)');
        }
      }

      const response = await fetch(`/api/coaches/${coachId}/reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          rating,
          reviewText: reviewText.trim(),
          sport: sport.trim() || undefined,
          coachUsername: coachUsername || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit review');
        setIsSubmitting(false);
        return;
      }

      // Success
      setSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => {
        resetForm();
        onClose();
        onReviewSubmitted?.();
      }, 2000);

    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit review. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const canSubmit = rating > 0 && reviewText.trim().length >= 10 && !isSubmitting;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {success ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Submitted!</h3>
            <p className="text-gray-600">Thank you for your feedback.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Review {coachName}
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body - NO <form>, just a div to avoid native validation */}
            <div className="p-6 space-y-6">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rate your experience *
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="w-10 h-10 cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      disabled={isSubmitting}
                    >
                      <svg
                        className={`w-full h-full ${
                          star <= (hoveredRating || rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {rating > 0 ? `${rating} out of 5` : 'Select a rating'}
                  </span>
                </div>
              </div>

              {/* Sport */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport (optional)
                </label>
                <input
                  type="text"
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  placeholder="e.g., Tennis, Basketball"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={isSubmitting}
                />
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your review *
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this coach..."
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
                  disabled={isSubmitting}
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  <span>{reviewText.length}/1000</span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`px-6 py-2 rounded-md transition-colors flex items-center ${
                    canSubmit
                      ? 'bg-gray-900 text-white hover:bg-black cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
