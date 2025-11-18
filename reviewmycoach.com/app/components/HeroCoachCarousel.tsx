'use client';

import { useEffect, useState } from 'react';
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

export default function HeroCoachCarousel() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomCoaches = async () => {
      try {
        const response = await fetch('/api/coaches?limit=20');
        if (response.ok) {
          const data = await response.json();
          // Shuffle and take first 10 coaches
          const shuffled = data.coaches.sort(() => 0.5 - Math.random());
          setCoaches(shuffled.slice(0, 10));
        }
      } catch (error) {
        console.error('Error fetching coaches:', error);
        // Set some fallback demo coaches
        setCoaches([
          {
            id: '1',
            displayName: 'Sarah Johnson',
            bio: 'Professional basketball coach with 8 years of experience training athletes at all levels.',
            sports: ['Basketball', 'Fitness'],
            experience: 8,
            hourlyRate: 75,
            location: 'Los Angeles, CA',
            averageRating: 4.9,
            totalReviews: 127,
            isVerified: true,
            hasActiveServices: true
          },
          {
            id: '2',
            displayName: 'Mike Rodriguez',
            bio: 'Former Olympic swimmer turned coach, specializing in competitive swimming techniques.',
            sports: ['Swimming', 'Water Polo'],
            experience: 12,
            hourlyRate: 90,
            location: 'Miami, FL',
            averageRating: 4.8,
            totalReviews: 89,
            isVerified: true,
            hasActiveServices: true
          },
          {
            id: '3',
            displayName: 'Emma Thompson',
            bio: 'Tennis professional with expertise in junior development and advanced techniques.',
            sports: ['Tennis'],
            experience: 6,
            hourlyRate: 65,
            location: 'New York, NY',
            averageRating: 4.7,
            totalReviews: 156,
            isVerified: false,
            hasActiveServices: true
          },
          // Add more demo coaches...
          {
            id: '4',
            displayName: 'David Kim',
            bio: 'Soccer coach specializing in youth development and tactical training.',
            sports: ['Soccer', 'Fitness'],
            experience: 10,
            hourlyRate: 80,
            location: 'Seattle, WA',
            averageRating: 4.9,
            totalReviews: 203,
            isVerified: true,
            hasActiveServices: true
          },
          {
            id: '5',
            displayName: 'Lisa Martinez',
            bio: 'Yoga and wellness coach helping athletes improve flexibility and mental focus.',
            sports: ['Yoga', 'Pilates'],
            experience: 7,
            hourlyRate: 55,
            location: 'Austin, TX',
            averageRating: 4.8,
            totalReviews: 92,
            isVerified: true,
            hasActiveServices: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomCoaches();
  }, []);

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-3 h-3 ${
              star <= rating ? 'text-yellow-400' : 'text-neutral-700'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ))}
        <span className="ml-1 text-xs text-gray-400">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="relative h-48 overflow-hidden">
        <div className="flex animate-pulse space-x-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-80 h-40 bg-neutral-900 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Duplicate coaches array for seamless infinite scroll
  const duplicatedCoaches = [...coaches, ...coaches, ...coaches];

  return (
    <div className="relative h-48 overflow-hidden">
      {/* Fade overlays (light inner shadows) */}
      <div className="absolute left-0 top-0 z-10 w-20 h-full bg-gradient-to-r from-black to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 z-10 w-20 h-full bg-gradient-to-l from-black to-transparent pointer-events-none"></div>
      
      {/* Scrolling container */}
      <div className="flex space-x-4 animate-scroll-left px-4">
        {duplicatedCoaches.map((coach, index) => {
          const profileUrl = coach.username ? `/coach/${coach.username}` : `/coach/${coach.id}`;
          
          return (
            <Link
              key={`${coach.id}-${index}`}
              href={profileUrl}
              className="flex-shrink-0 w-80 h-40 bg-black/90 border border-gray-800 rounded-2xl p-4 hover:bg-black shadow-sm hover:shadow-xl hover:border-gray-700 transition-all duration-300 group"
            >
              <div className="flex items-start space-x-3 h-full">
                {/* Profile Image */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden ring-1 ring-gray-200">
                    {coach.profileImage ? (
                      <Image
                        src={coach.profileImage}
                        alt={coach.displayName}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {coach.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-[var(--brand-red)] text-white rounded-full p-0.5 ring-1 ring-white">
                      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l3-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Coach Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-gray-700 transition-colors">
                      {coach.displayName}
                    </h3>
                    {coach.isVerified && (
                      <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[10px] font-bold bg-[var(--brand-red)]/10 text-[var(--brand-red)] ring-1 ring-[var(--brand-red)]/30">
                        Verified
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {coach.location}
                  </div>

                  {renderStarRating(coach.averageRating)}

                  <p className="text-gray-600 text-xs mt-2 line-clamp-2">
                    {coach.bio}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-wrap gap-1">
                      {coach.sports.slice(0, 2).map((sport) => (
                        <span
                          key={sport}
                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 ring-1 ring-gray-200"
                        >
                          {sport}
                        </span>
                      ))}
                    </div>

                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}