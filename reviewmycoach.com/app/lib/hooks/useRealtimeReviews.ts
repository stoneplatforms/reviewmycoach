import { useState, useEffect, useCallback } from 'react';
import { fetchCoachReviews, calculateRatingStats, updateCoachStats } from '../reviews-dataconnect';

interface Review {
  id: string;
  studentId: string;
  studentName: string;
  rating: number;
  reviewText: string;
  createdAt: string | null;
  sport?: string;
}

interface RatingStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

interface UseRealtimeReviewsReturn {
  reviews: Review[];
  ratingStats: RatingStats;
  loading: boolean;
  error: string | null;
  refreshReviews: () => void;
}

export function useRealtimeReviews(coachId: string): UseRealtimeReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load reviews from Data Connect
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const reviewsData = await fetchCoachReviews(coachId, 100);
      
      // Convert to Review format
      const formattedReviews: Review[] = reviewsData.map((review: any) => ({
        id: review.id,
        studentId: review.userId || review.studentId || '',
        studentName: review.studentName,
        rating: review.rating,
        reviewText: review.reviewText,
        createdAt: review.createdAt || null,
        sport: review.sport,
      }));

      // Calculate new rating stats
      const newStats = calculateRatingStats(formattedReviews);
      
      // Update state
      setReviews(formattedReviews);
      setRatingStats(newStats);
      
      // Update coach stats in Data Connect
      if (newStats.totalReviews > 0) {
        await updateCoachStats(coachId, newStats.averageRating, newStats.totalReviews);
      }
      
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('Failed to load reviews');
      setLoading(false);
    }
  }, [coachId]);

  // Load reviews on mount and set up polling for updates
  useEffect(() => {
    if (!coachId) {
      setError('Coach ID is required');
      setLoading(false);
      return;
    }

    // Initial load
    loadReviews();

    // Poll for updates every 30 seconds (Data Connect doesn't have real-time subscriptions)
    const interval = setInterval(() => {
      loadReviews();
    }, 30000);

    return () => clearInterval(interval);
  }, [coachId, loadReviews]);

  // Manual refresh function
  const refreshReviews = useCallback(() => {
    loadReviews();
  }, [loadReviews]);

  return {
    reviews,
    ratingStats,
    loading,
    error,
    refreshReviews
  };
}

// Hook for real-time coach profile updates (using Firestore for real-time)
interface CoachProfile {
  id: string;
  userId: string;
  displayName: string;
  email?: string;
  bio: string;
  sports: string[];
  experience: number;
  certifications: string[];
  hourlyRate: number;
  location: string;
  availability: string[];
  specialties: string[];
  languages: string[];
  averageRating: number;
  totalReviews: number;
  profileImage?: string;
  phoneNumber?: string;
  website?: string;
  isVerified: boolean;
  organization?: string;
  role?: string;
  gender?: string;
  ageGroup?: string[];
  sourceUrl?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  [key: string]: unknown;
}

export function useRealtimeCoach(coachId: string) {
  const [coach, setCoach] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coachId) {
      setError('Coach ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch coach from Data Connect (poll every 30 seconds)
    const loadCoach = async () => {
      try {
        // For now, we'll fetch from the API which uses Data Connect
        const response = await fetch(`/api/coaches/${coachId}`);
        if (response.ok) {
          const data = await response.json();
          setCoach(data);
        } else {
          setError('Coach not found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading coach:', err);
        setError('Failed to load coach profile');
        setLoading(false);
      }
    };

    loadCoach();

    // Poll for updates every 30 seconds
    const interval = setInterval(loadCoach, 30000);

    return () => clearInterval(interval);
  }, [coachId]);

  return { coach, loading, error };
}
