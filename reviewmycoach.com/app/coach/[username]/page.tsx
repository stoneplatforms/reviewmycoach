import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import CoachProfileClient from './CoachProfileClient';
import { initializeApp, getApps } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import { getCoachByUsername as getCoachByUsernameQuery, getCoachReviews as getCoachReviewsQuery } from '../../lib/dataconnect';

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
  school?: string;
  role?: string;
  gender?: string;
  ageGroup?: string[];
  sourceUrl?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  activeCardImageUrl?: string;
  // XP calculation fields
  subscriptionTier?: number;
  longevityPlatformYears?: number;
  careerYears?: number;
  coursesCreated?: number;
  jobsCompleted?: number;
  consistencyMultiplier?: number;
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

// Initialize Firebase client for Data Connect
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

const dataConnect = getDataConnect(clientApp, {
  connector: 'reviewmycoach',
  location: 'us-east4',
  service: 'review-my-coach-service'
});

async function getCoachByUsername(username: string): Promise<CoachProfile | null> {
  try {
    // Query from Firebase Data Connect
    // Try multiple case variations since usernames in DB are mixed case

    // Generate different case variations
    const variations = [
      username.toLowerCase(), // aarika.hughes
      username, // Original case from URL
      username.charAt(0).toUpperCase() + username.slice(1).toLowerCase(), // Aarika.hughes
    ];

    // For usernames with periods, also try capitalizing after periods
    if (username.includes('.')) {
      const parts = username.toLowerCase().split('.');
      const capitalizedParts = parts.map(part =>
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join('.');
      variations.push(capitalizedParts); // Aarika.Hughes
    }

    // Try each variation
    let coach = null;
    for (const variant of variations) {
      const result = await getCoachByUsernameQuery(dataConnect, {
        username: variant
      });
      coach = result.data.coaches?.[0];
      if (coach) {
        console.log(`✅ Found coach with username variant: ${variant}`);
        break;
      }
    }

    if (!coach) {
      console.log(`❌ Coach not found with username: ${username} (tried ${variations.length} variations)`);
      return null;
    }
    
    // Map the Data Connect response to CoachProfile
    return {
      id: coach.id,
      userId: coach.userId || '',
      username: coach.username || '',
      displayName: coach.displayName || '',
      email: coach.email || undefined,
      bio: coach.bio || '',
      sports: Array.isArray(coach.sports) ? coach.sports : [],
      experience: coach.experience || 0,
      certifications: Array.isArray(coach.certifications) ? coach.certifications : [],
      hourlyRate: coach.hourlyRate || 0,
      location: coach.location || '',
      availability: Array.isArray(coach.availability) ? coach.availability : [],
      specialties: Array.isArray(coach.specialties) ? coach.specialties : [],
      languages: Array.isArray(coach.languages) ? coach.languages : [],
      averageRating: coach.averageRating || 0,
      totalReviews: coach.totalReviews || 0,
      profileImage: coach.profileImage || undefined,
      phoneNumber: coach.phoneNumber || undefined,
      website: coach.website || undefined,
      isVerified: coach.isVerified || false,
      organization: coach.organization || undefined,
      school: coach.school || undefined,
      role: coach.role || undefined,
      gender: coach.gender || undefined,
      ageGroup: Array.isArray(coach.ageGroup) ? coach.ageGroup : [],
      sourceUrl: coach.sourceUrl || undefined,
      socialMedia: coach.socialMedia || undefined,
      activeCardImageUrl: coach.activeCardImageUrl || undefined,
      // XP calculation fields from database
      subscriptionTier: coach.subscriptionTier || 0,
      longevityPlatformYears: coach.longevityPlatformYears || 0,
      careerYears: coach.careerYears || 0,
      coursesCreated: coach.coursesCreated || 0,
      jobsCompleted: coach.jobsCompleted || 0,
      consistencyMultiplier: coach.consistencyMultiplier || 1.0,
    };
  } catch (error) {
    console.error('Error fetching coach by username from Data Connect:', error);
    return null;
  }
}

async function getCoachReviews(coachId: string): Promise<Review[]> {
  try {
    // Fetch reviews from Data Connect
    const result = await getCoachReviewsQuery(dataConnect, {
      coachId,
      limit: 20
    });
    
    const reviews = result.data.reviews || [];
    
    return reviews.map(review => ({
      id: review.id,
      studentId: review.userId || '',
      studentName: review.studentName || 'Anonymous',
      rating: review.rating || 0,
      reviewText: review.reviewText || '',
      createdAt: review.createdAt || null,
      sport: review.sport || undefined,
    }));
  } catch (error) {
    console.error('Error fetching coach reviews from Data Connect:', error);
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