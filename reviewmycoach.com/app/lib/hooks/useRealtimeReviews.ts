import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase-client';

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

  // Calculate rating statistics from reviews
  const calculateRatingStats = useCallback((reviewsData: Review[]): RatingStats => {
    if (reviewsData.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const totalReviews = reviewsData.length;
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    reviewsData.forEach(review => {
      totalRating += review.rating;
      const ratingKey = Math.floor(review.rating) as keyof typeof ratingDistribution;
      if (ratingKey >= 1 && ratingKey <= 5) {
        ratingDistribution[ratingKey]++;
      }
    });

    const averageRating = totalRating / totalReviews;

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews,
      ratingDistribution
    };
  }, []);

  // Update coach document with new rating stats
  const updateCoachRatingStats = useCallback(async (stats: RatingStats) => {
    try {
      const coachRef = doc(db, 'coaches', coachId);
      await updateDoc(coachRef, {
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating coach rating stats:', error);
    }
  }, [coachId]);

  // Set up real-time listener
  useEffect(() => {
    if (!coachId) {
      setError('Coach ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const reviewsRef = collection(db, 'coaches', coachId, 'reviews');
    const reviewsQuery = query(reviewsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        try {
          const reviewsData: Review[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            reviewsData.push({
              id: doc.id,
              studentId: data.studentId,
              studentName: data.studentName,
              rating: data.rating,
              reviewText: data.reviewText,
              createdAt: data.createdAt?.toDate().toISOString() || null,
              sport: data.sport
            });
          });

          // Calculate new rating stats
          const newStats = calculateRatingStats(reviewsData);
          
          // Update state
          setReviews(reviewsData);
          setRatingStats(newStats);
          
          // Update coach document with new stats
          updateCoachRatingStats(newStats);
          
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error('Error processing reviews snapshot:', err);
          setError('Failed to load reviews');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to reviews:', err);
        setError('Failed to connect to reviews');
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, [coachId, calculateRatingStats, updateCoachRatingStats]);

  // Manual refresh function
  const refreshReviews = useCallback(() => {
    setLoading(true);
    setError(null);
    // The real-time listener will automatically refresh when this is called
  }, []);

  return {
    reviews,
    ratingStats,
    loading,
    error,
    refreshReviews
  };
}

// Hook for real-time coach profile updates
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

    const coachRef = doc(db, 'coaches', coachId);

    const unsubscribe = onSnapshot(
      coachRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setCoach({
              id: snapshot.id,
              ...data,
              createdAt: data.createdAt?.toDate().toISOString() || null,
              updatedAt: data.updatedAt?.toDate().toISOString() || null,
            } as CoachProfile);
          } else {
            setCoach(null);
            setError('Coach not found');
          }
          setLoading(false);
        } catch (err) {
          console.error('Error processing coach snapshot:', err);
          setError('Failed to load coach profile');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to coach:', err);
        setError('Failed to connect to coach profile');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [coachId]);

  return { coach, loading, error };
} 