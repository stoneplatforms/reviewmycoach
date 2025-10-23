'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Coach {
  id: string;
  username?: string;
  displayName: string;
  bio: string;
  sports: string[];
  experience: number;
  hourlyRate: number;
  location: string;
  averageRating: number;
  totalReviews: number;
  profileImage?: string;
  isVerified: boolean;
  specialties?: string[];
  hasActiveServices?: boolean;
  organization?: string;
  role?: string;
  gender?: string;
  ageGroup?: string[];
  sourceUrl?: string;
}

interface CoachCardProps {
  coach: Coach;
}

export default function CoachCard({ coach }: CoachCardProps) {
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400' : 'text-slate-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-400">
          {rating.toFixed(1)} ({coach.totalReviews})
        </span>
      </div>
    );
  };

  // Use username for URL if available, fallback to ID-based route for backward compatibility
  const profileUrl = coach.username ? `/coach/${coach.username}` : `/coach/${coach.id}`;

  return (
    <Link
      href={profileUrl}
      className="block bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden group h-full"
    >
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start space-x-4 mb-4">
          {/* Profile Image */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden rounded-md">
              {coach.profileImage ? (
                <Image
                  src={coach.profileImage}
                  alt={coach.displayName}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Photo</div>
              )}
            </div>
            {coach.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-white border border-red-200 p-1 rounded-full">
                <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Coach Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-medium text-gray-900 truncate transition-colors">
                {coach.displayName}
              </h3>
              {coach.isVerified && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-full">
                  Verified
                </span>
              )}
              {coach.hasActiveServices && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-full">
                  Hireable
                </span>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {coach.location}
              <span className="mx-2">•</span>
              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {coach.experience} years
            </div>
            {renderStarRating(coach.averageRating)}
          </div>
        </div>

        {/* Bio */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {coach.bio || "Professional coach ready to help you achieve your goals."}
        </p>

        {/* Sports Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {coach.sports.slice(0, 3).map((sport) => (
            <span
              key={sport}
              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 rounded-full"
            >
              {sport}
            </span>
          ))}
          {coach.sports.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200 rounded-full">
              +{coach.sports.length - 3} more
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm">
            {coach.hourlyRate > 0 ? (
              <span className="font-medium text-gray-900">
                ${coach.hourlyRate}/hour
              </span>
            ) : (
              <span className="text-gray-500">Price on request</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {coach.hasActiveServices && (
              <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 border border-green-200 rounded-full">
                Available
              </span>
            )}
            <div className="flex items-center text-gray-500 group-hover:text-gray-900 transition-colors">
              <span className="text-sm font-medium">View Profile</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 