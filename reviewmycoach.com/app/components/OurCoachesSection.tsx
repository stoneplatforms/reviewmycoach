'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Coach {
  id: string;
  username?: string;
  displayName: string;
  bio: string;
  averageRating: number;
  totalReviews: number;
  profileImage?: string;
  isVerified: boolean;
  isClaimed?: boolean;
  hasActiveServices?: boolean;
  role?: string;
  userId?: string;
  activeProfileCardImageUrl?: string;
  xp?: number; // Total XP for sorting
}

export default function OurCoachesSection() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        // Fetch coaches sorted by XP (highest first) from Firebase Data Connect
        const response = await fetch('/api/coaches?sortByXP=true');
        if (response.ok) {
          const data = await response.json();
          
          // Debug: Log the response
          console.log('📊 Coaches API Response:', {
            total: data.coaches?.length,
            top3: data.coaches?.slice(0, 3).map((c: Coach) => ({
              username: c.username,
              displayName: c.displayName,
              xp: c.xp
            }))
          });
          
          // Fetch active cards for all coaches in parallel
          const coachesWithCards = await Promise.all(
            (data.coaches || []).map(async (coach: Coach) => {
              // XP is already included in the API response and sorted
              let coachWithCard = { ...coach };
              
              // Fetch active profile card for this coach
              // Only fetch if userId is a valid Firebase UID (not starting with "coach_")
              if (coach.userId && !coach.userId.startsWith('coach_')) {
                try {
                  const cardResponse = await fetch(`/api/cards/user?userId=${coach.userId}`);
                  if (cardResponse.ok) {
                    const cardData = await cardResponse.json();
                    if (cardData.activeCard && cardData.activeCard.card_details) {
                      coachWithCard.activeProfileCardImageUrl = cardData.activeCard.card_details.image_url || null;
                    }
                  }
                } catch (error) {
                  // Silently handle card fetch errors
                }
              }

              return coachWithCard;
            })
          );
          
          // Double-check sorting by XP (in case API didn't sort correctly)
          coachesWithCards.sort((a, b) => (b.xp || 0) - (a.xp || 0));
          
          console.log('✅ Final sorted coaches:', coachesWithCards.slice(0, 4).map(c => ({
            username: c.username,
            displayName: c.displayName,
            xp: c.xp
          })));
          
          setCoaches(coachesWithCards);
        } else {
          console.error('❌ Failed to fetch coaches:', response.status, response.statusText);
        }
      } catch (err) {
        // Fallback demo data
        setCoaches([
          {
            id: 'demo-1',
            displayName: 'Zack Walter',
            bio: 'Experienced coach in volleyball.',
            averageRating: 4.6,
            totalReviews: 120,
            isVerified: false,
            role: 'Head Assistant Coach',
            xp: 0
          },
          {
            id: 'demo-2',
            displayName: 'Alex Kim',
            bio: 'Assistant coach in soccer.',
            averageRating: 5,
            totalReviews: 80,
            isVerified: false,
            role: 'Assistant Coach',
            xp: 0
          }
        ]);
      }
    };
    fetchCoaches();
  }, []);

  const profileUrlFor = (c: Coach) => (c.username ? `/coach/${c.username.toLowerCase()}` : `/coach/${c.id}`);

  return (
    <div className="relative w-full pb-20 overflow-x-hidden">
      <div className="mb-8 w-full text-left px-4 sm:px-6 lg:px-8">
        <h2 className="text-white text-2xl sm:text-3xl font-extrabold tracking-wide">Our Coaches</h2>
        <p className="mt-3 text-neutral-300 max-w-3xl">
          Our coaches, ranging from head to assistant, cover all sorts of different sports,
          depending on your needs.
        </p>
      </div>

      {/* Static row of top coaches - one row on desktop, 3 cards on mobile */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-none w-full overflow-x-hidden">
          {/* Mobile: 3 cards vertically, Desktop: 4 cards in one row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {coaches.slice(0, isMobile ? 3 : 4).map((coach) => {
            const verifiedEnabled = !!(coach.isVerified && coach.isClaimed && coach.hasActiveServices);
            const hasCard = !!coach.activeProfileCardImageUrl;
            return (
              <Link key={coach.id} href={profileUrlFor(coach)} className="group w-full">
                <div className={`relative rounded-2xl w-full overflow-hidden ${hasCard ? '' : 'p-[2px] bg-gradient-to-br from-white via-white/60 to-black/80'}`}>
                  <div className={`relative rounded-2xl w-full ${hasCard ? 'bg-transparent' : 'bg-neutral-900'}`} style={{ aspectRatio: '4/5' }}>

                  {/* Profile Picture (Behind - fills entire container) */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden rounded-2xl">
                    {coach.profileImage ? (
                      <Image
                        src={coach.profileImage}
                        alt={coach.displayName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-neutral-700 border border-neutral-600 flex items-center justify-center text-neutral-500">
                          No Photo
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tier Card Frame (On Top - overlays profile picture, like profile page) */}
                  {hasCard ? (
                    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-2xl">
                      <Image
                        src={coach.activeProfileCardImageUrl}
                        alt={`${coach.displayName} tier card`}
                        fill
                        className="object-contain"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  ) : null}

                  {/* Inner bottom inset shadow overlay (above image, below text) - only show if no card */}
                  {!hasCard && (
                    <div className="pointer-events-none absolute inset-0 z-20 rounded-2xl" style={{ boxShadow: 'inset 0 -160px 180px -20px rgba(0,0,0,0.9)' }} />
                  )}

                  {/* Info footer - Must be above card image with solid dark background */}
                  <div className="absolute bottom-0 left-0 right-0 z-40">
                    {/* Solid dark backdrop that covers card image in footer area */}
                    <div className="h-32" style={{ background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.98) 30%, rgba(0,0,0,0.95) 60%, transparent 100%)' }}></div>
                    {/* Text content positioned above backdrop */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      {coach.role && (
                        <div className="text-[11px] mb-1" style={{ color: '#d1d5db' }}>{coach.role}</div>
                      )}
                      <div className="flex items-center gap-1 font-bold text-lg" style={{ color: '#ffffff' }}>
                        <span>{coach.displayName}</span>
                        {verifiedEnabled && (
                          <Image src="/icons/verified.svg" alt="verified" width={16} height={16} />
                        )}
                      </div>
                      <div className="text-sm mt-1 line-clamp-2" style={{ color: '#e5e7eb' }}>
                        {coach.bio || 'Experienced coach.'}
                      </div>
                      {/* Rating badge - moved below bio */}
                      <div className="flex items-center gap-1 mt-2 text-white text-sm font-semibold">
                        <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.034a1 1 0 00-1.176 0l-2.802 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z"/></svg>
                        <span>{Number(coach.averageRating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </Link>
            );
          })}
          </div>
        </div>
      </div>

      {/* See More Coaches Button */}
      <div className="mt-8 px-4 sm:px-6 lg:px-8 flex justify-center">
        <Link 
          href="/coaches" 
          className="inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-colors gap-2"
        >
          See More Coaches
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}


