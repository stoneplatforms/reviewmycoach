/**
 * Reviews Data Connect Helper
 * 
 * Server-side helper for fetching reviews from Firebase Data Connect
 */

import { initializeApp, getApps } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import {
  getCoachReviews,
  getCoachReviewsPaginated,
  getRecentReviews,
  createReview,
  updateCoachRatingStats,
  type GetCoachReviewsVariables,
  type GetCoachReviewsPaginatedVariables,
  type GetRecentReviewsVariables,
  type CreateReviewVariables,
  type UpdateCoachRatingStatsVariables,
} from './dataconnect';

// Initialize Firebase Client App for Data Connect
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

// Get Data Connect instance
const dataConnect = getDataConnect(clientApp, {
  connector: 'reviewmycoach',
  location: 'us-east4',
  service: 'review-my-coach-service'
});

/**
 * Fetch reviews for a specific coach
 */
export async function fetchCoachReviews(coachId: string, limit: number = 50) {
  try {
    const variables: GetCoachReviewsVariables = { coachId, limit };
    const result = await getCoachReviews(dataConnect, variables);
    return result.data.reviews || [];
  } catch (error) {
    console.error('Error fetching coach reviews from Data Connect:', error);
    throw error;
  }
}

/**
 * Fetch reviews with pagination
 */
export async function fetchCoachReviewsPaginated(coachId: string, page: number = 1, limit: number = 20) {
  try {
    const offset = (page - 1) * limit;
    const variables: GetCoachReviewsPaginatedVariables = { coachId, offset, limit };
    const result = await getCoachReviewsPaginated(dataConnect, variables);
    return result.data.reviews || [];
  } catch (error) {
    console.error('Error fetching paginated reviews from Data Connect:', error);
    throw error;
  }
}

/**
 * Fetch recent reviews across all coaches
 */
export async function fetchRecentReviews(limit: number = 10) {
  try {
    const variables: GetRecentReviewsVariables = { limit };
    const result = await getRecentReviews(dataConnect, variables);
    return result.data.reviews || [];
  } catch (error) {
    console.error('Error fetching recent reviews from Data Connect:', error);
    throw error;
  }
}

/**
 * Create a new review
 */
export async function addReview(reviewData: {
  id: string;
  coachId: string;
  coachUsername: string;
  userId?: string;
  email?: string;
  studentName: string;
  rating: number;
  reviewText: string;
  sport: string;
}) {
  try {
    const variables: CreateReviewVariables = {
      id: reviewData.id,
      coachId: reviewData.coachId,
      coachUsername: reviewData.coachUsername,
      userId: reviewData.userId,
      email: reviewData.email,
      studentName: reviewData.studentName,
      rating: reviewData.rating,
      reviewText: reviewData.reviewText,
      sport: reviewData.sport,
    };
    
    const result = await createReview(dataConnect, variables);
    return result.data;
  } catch (error) {
    console.error('Error creating review in Data Connect:', error);
    throw error;
  }
}

/**
 * Update coach rating statistics
 */
export async function updateCoachStats(coachId: string, averageRating: number, totalReviews: number) {
  try {
    const variables: UpdateCoachRatingStatsVariables = {
      coachId,
      averageRating,
      totalReviews,
    };
    
    const result = await updateCoachRatingStats(dataConnect, variables);
    return result.data;
  } catch (error) {
    console.error('Error updating coach stats in Data Connect:', error);
    throw error;
  }
}

/**
 * Calculate rating statistics from reviews
 */
export function calculateRatingStats(reviews: any[]) {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const totalReviews = reviews.length;
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRating = 0;

  reviews.forEach(review => {
    totalRating += review.rating;
    const ratingKey = Math.floor(review.rating) as keyof typeof ratingDistribution;
    if (ratingKey >= 1 && ratingKey <= 5) {
      ratingDistribution[ratingKey]++;
    }
  });

  const averageRating = totalRating / totalReviews;

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
    ratingDistribution
  };
}

