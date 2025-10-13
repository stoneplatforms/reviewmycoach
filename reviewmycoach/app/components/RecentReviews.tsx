'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Review {
  id: string;
  coachId: string;
  coachName: string;
  coachSport: string;
  studentName: string;
  rating: number;
  reviewText: string;
  sport?: string;
  createdAt: string;
}

// Fallback reviews in case API fails
const fallbackReviews: Review[] = [
  {
    id: 'fallback-1',
    coachId: 'sample-coach-1',
    coachName: 'Sarah Johnson',
    coachSport: 'Basketball',
    studentName: 'Marcus T.',
    rating: 5,
    reviewText: 'Amazing coach! Helped me improve my shooting technique significantly. Highly recommend for anyone looking to take their game to the next level.',
    sport: 'Basketball',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fallback-2',
    coachId: 'sample-coach-2',
    coachName: 'Mike Chen',
    coachSport: 'Soccer',
    studentName: 'Sofia R.',
    rating: 5,
    reviewText: 'Great coaching style and very patient. My footwork has improved dramatically since training with Mike.',
    sport: 'Soccer',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'fallback-3',
    coachId: 'sample-coach-3',
    coachName: 'Alex Rodriguez',
    coachSport: 'Tennis',
    studentName: 'David C.',
    rating: 4,
    reviewText: 'Excellent technical knowledge and great at explaining complex techniques in simple terms.',
    sport: 'Tennis',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export default function RecentReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        console.log('Fetching recent reviews...');
        const response = await fetch('/api/reviews/recent?limit=6');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response:', data);
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
          setUsingFallback(false);
        } else {
          // Use fallback if no reviews found
          console.log('No reviews found, using fallback data');
          setReviews(fallbackReviews);
          setUsingFallback(true);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(err instanceof Error ? err.message : 'Failed to load reviews');
        // Use fallback data when API fails
        setReviews(fallbackReviews);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      return `${Math.ceil(diffDays / 30)} months ago`;
    } catch {
      return 'Recently';
    }
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (loading) {
    return (
      <div className="bg-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Latest <span className="text-neutral-300">Reviews</span>
            </h2>
            <p className="text-xl text-neutral-400">See what athletes are saying about their coaches</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-neutral-800 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-neutral-800 rounded mb-2"></div>
                    <div className="h-3 bg-neutral-800 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-5 bg-neutral-800 rounded mr-1"></div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-neutral-800 rounded"></div>
                  <div className="h-3 bg-neutral-800 rounded"></div>
                  <div className="h-3 bg-neutral-800 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Latest <span className="text-neutral-300">Reviews</span>
          </h2>
          <p className="text-xl text-neutral-400">See what athletes are saying about their coaches</p>
          {usingFallback && (
            <p className="text-sm text-neutral-500 mt-2">
              {error ? 'Showing sample reviews due to connection issues' : 'Showing sample reviews'}
            </p>
          )}
        </div>
        
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Reviews Yet</h3>
            <p className="text-neutral-400">Be the first to leave a review for a coach!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 hover:shadow-2xl hover:shadow-black/30">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                    {review.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{review.studentName}</h4>
                    <p className="text-neutral-400 text-sm">
                      {review.sport || review.coachSport} • {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-neutral-700'} fill-current`} 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                
                <p className="text-neutral-300 mb-4 leading-relaxed">
                  &ldquo;{truncateText(review.reviewText)}&rdquo;
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-400">
                    Coach: <span className="font-medium text-neutral-200">{review.coachName}</span>
                  </div>
                  {!usingFallback ? (
                    <Link 
                      href={`/coach/${review.coachId}`}
                      className="text-neutral-300 hover:text-neutral-200 text-sm font-medium transition-colors underline"
                    >
                      View Coach →
                    </Link>
                  ) : (
                    <Link 
                      href="/coaches"
                      className="text-neutral-300 hover:text-neutral-200 text-sm font-medium transition-colors underline"
                    >
                      Find Coaches →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Link 
            href="/coaches" 
            className="inline-flex items-center px-6 py-3 btn-brand font-semibold rounded-lg"
          >
            Browse All Coaches
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
} 