'use client';

import React, { useEffect, useRef, useState } from 'react';
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
}

export default function OurCoachesSection() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const response = await fetch('/api/coaches?limit=24');
        if (response.ok) {
          const data = await response.json();
          setCoaches(data.coaches || []);
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
            role: 'Head Assistant Coach'
          },
          {
            id: 'demo-2',
            displayName: 'Alex Kim',
            bio: 'Assistant coach in soccer.',
            averageRating: 5,
            totalReviews: 80,
            isVerified: false,
            role: 'Assistant Coach'
          }
        ]);
      }
    };
    fetchCoaches();
  }, []);

  // Dynamically choose how many cards to show based on container width
  useEffect(() => {
    const computeVisible = () => {
      const el = gridContainerRef.current;
      if (!el) return;
      const containerWidth = el.clientWidth;
      const minCardWidth = 280; // approximate min card width
      const gap = 24;            // Tailwind gap-6
      const arrowReserve = 56;   // space for the right arrow button
      const available = Math.max(0, containerWidth - arrowReserve);
      const count = Math.max(1, Math.floor((available + gap) / (minCardWidth + gap)));
      setVisibleCount(count);
    };

    computeVisible();
    window.addEventListener('resize', computeVisible);
    return () => window.removeEventListener('resize', computeVisible);
  }, []);

  const profileUrlFor = (c: Coach) => (c.username ? `/coach/${c.username}` : `/coach/${c.id}`);

  return (
    <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pb-20">
      <div className="mb-8 w-full text-left px-4 sm:px-6 lg:px-8">
        <h2 className="text-white text-2xl sm:text-3xl font-extrabold tracking-wide">our coaches</h2>
        <p className="mt-3 text-neutral-300 max-w-3xl">
          Our coaches, ranging from head to assistant, cover all sorts of different sports,
          depending on your needs.
        </p>
      </div>

      {/* Static row of top coaches (no scroll) */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div ref={gridContainerRef} className="relative mx-auto max-w-none w-full">
          <div className="grid gap-6 pr-16" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {coaches.slice(0, visibleCount).map((coach) => {
            const verifiedEnabled = !!(coach.isVerified && coach.isClaimed && coach.hasActiveServices);
            return (
              <Link key={coach.id} href={profileUrlFor(coach)} className="group">
                <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-white via-white/60 to-black/80">
                  <div className="relative rounded-2xl h-[380px] p-4 flex flex-col justify-end overflow-hidden bg-black/90">
                  {/* Rating badge */}
                  <div className="absolute top-3 right-3 text-white/90 text-sm font-semibold flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.034a1 1 0 00-1.176 0l-2.802 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z"/></svg>
                    {Number(coach.averageRating || 0).toFixed(1)}
                  </div>

                  {/* Portrait */}
                  <div className="absolute inset-0 flex items-end justify-center">
                    <div className="relative w-full h-full">
                      {coach.profileImage ? (
                        <Image
                          src={coach.profileImage}
                          alt={coach.displayName}
                          fill
                          className="object-contain object-bottom drop-shadow-[0_12px_40px_rgba(0,0,0,0.8)]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500">
                            No Photo
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inner bottom inset shadow overlay (above image, below text) */}
                  <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl" style={{ boxShadow: 'inset 0 -160px 180px -20px rgba(0,0,0,0.9)' }} />

                  {/* Info footer */}
                  <div className="relative z-20">
                    {coach.role && (
                      <div className="text-[11px] text-neutral-400 mb-1">{coach.role}</div>
                    )}
                    <div className="flex items-center gap-1 text-white font-semibold">
                      <span>{coach.displayName}</span>
                      {verifiedEnabled && (
                        <Image src="/icons/verified.svg" alt="verified" width={16} height={16} />
                      )}
                    </div>
                    <div className="text-xs text-neutral-400 mt-1 line-clamp-2">
                      {coach.bio || 'Experienced coach.'}
                    </div>
                  </div>
                  </div>
                </div>
              </Link>
            );
          })}
          </div>

          {/* Arrow to all coaches */}
          <Link
            href="/coaches"
            className="hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition"
            aria-label="See more coaches"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        <Link href="/coaches" className="inline-flex items-center text-white/90 hover:text-white text-sm gap-2">
          See all coaches
          <span className="block w-28 h-px bg-white/30 ml-2"></span>
        </Link>
      </div>
    </div>
  );
}


