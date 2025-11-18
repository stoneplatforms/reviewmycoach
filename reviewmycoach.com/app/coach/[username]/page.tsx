import { Suspense } from 'react';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase-client';
import { notFound } from 'next/navigation';
import CoachProfileClient from './CoachProfileClient';

// =====================================
// TYPE DEFINITIONS
// =====================================

interface CoachProfile {
  id: string;
  userId: string;
  username: string;
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
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

interface Review {
  id: string;
  studentId: string;
  studentName: string;
  rating: number;
  reviewText: string;
  createdAt: string | null;
  sport?: string;
}

// =====================================
// DATA FETCHING FUNCTIONS
// =====================================

async function getCoachByUsername(username: string): Promise<CoachProfile | null> {
  try {
    // Query coaches by username (case-insensitive)
    const usernameQuery = query(
      collection(db, 'coaches'),
      where('username', '==', username.toLowerCase()),
      limit(1)
    );
    
    const usernameSnapshot = await getDocs(usernameQuery);
    
    if (usernameSnapshot.empty) {
      return null;
    }

    const coachDoc = usernameSnapshot.docs[0];
    const data = coachDoc.data();
    
    // Convert Firestore timestamps to ISO strings for serialization
    const serializedData = {
      ...data,
      createdAt: data.createdAt?.toDate().toISOString() || null,
      updatedAt: data.updatedAt?.toDate().toISOString() || null,
    };
    
    return { id: coachDoc.id, ...serializedData } as unknown as CoachProfile;
  } catch (error) {
    console.error('Error fetching coach by username:', error);
    return null;
  }
}

async function getCoachReviews(coachId: string): Promise<Review[]> {
  try {
    const reviewsRef = collection(db, 'coaches', coachId, 'reviews');
    const reviewsQuery = query(
      reviewsRef,
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const reviewsSnapshot = await getDocs(reviewsQuery);
    
    const reviews: Review[] = [];
    reviewsSnapshot.forEach((doc) => {
      const data = doc.data();
      reviews.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || null,
      } as Review);
    });
    
    return reviews;
  } catch (error) {
    console.error('Error fetching coach reviews:', error);
    return [];
  }
}

// =====================================
// SEO & METADATA GENERATION
// =====================================

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const coach = await getCoachByUsername(username);
  
  if (!coach) {
    return {
      title: 'Coach Not Found | ReviewMyCoach',
      description: 'The coach profile you are looking for could not be found.',
    };
  }
  
  return {
    title: `${coach.displayName} (@${coach.username}) - Professional Coach | ReviewMyCoach`,
    description: coach.bio || `${coach.displayName} - Professional coach specializing in ${coach.sports.join(', ')}. View reviews, ratings, and book sessions.`,
    openGraph: {
      title: `${coach.displayName} (@${coach.username}) - Professional Coach`,
      description: coach.bio || `Professional coach specializing in ${coach.sports.join(', ')}`,
      type: 'profile',
      url: `/coach/${coach.username}`,
      images: coach.profileImage ? [
        {
          url: coach.profileImage,
          width: 400,
          height: 400,
          alt: `${coach.displayName} - Professional Coach`,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${coach.displayName} (@${coach.username}) - Professional Coach`,
      description: coach.bio || `Professional coach specializing in ${coach.sports.join(', ')}`,
      images: coach.profileImage ? [coach.profileImage] : [],
    },
  };
}

// =====================================
// UI COMPONENTS
// =====================================

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white text-gray-900 min-h-screen">
      <div className="animate-pulse">
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================
// UTILITY FUNCTIONS
// =====================================

function isValidUsername(username: string): boolean {
  // Allow lowercase letters, digits, underscores, and periods
  return !!(username && username.length >= 3 && /^[a-z0-9_.]+$/.test(username));
}

// =====================================
// MAIN PAGE COMPONENT
// =====================================

export default async function CoachProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  // Validate username format
  if (!isValidUsername(username)) {
    notFound();
  }
  
  // Fetch coach data
  const coach = await getCoachByUsername(username);
  if (!coach) {
    notFound();
  }
  
  // Fetch reviews for this coach
  const reviews = await getCoachReviews(coach.id);

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CoachProfileClient coach={coach} reviews={reviews} />
    </Suspense>
  );
} 