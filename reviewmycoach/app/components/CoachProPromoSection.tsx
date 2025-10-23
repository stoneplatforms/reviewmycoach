'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../lib/hooks/useAuth';

export default function CoachProPromoSection() {
  const { user, isCoach } = useAuth();

  const isSignedIn = !!user;
  const canSubscribe = isSignedIn && isCoach;

  return (
    <div className="w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] relative overflow-hidden bg-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-[80vh] border-t border-b border-white/10">
        {/* Left: information */}
        <div className="relative flex flex-col justify-center px-6 sm:px-10 py-14">
          <div className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase text-white/70 mb-3">
            <span className="w-2 h-2 rounded-full bg-white/80" />
            Built for elite coaches
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Elevate your coaching brand
          </h2>
          <p className="text-white/80 text-base sm:text-lg mb-6 max-w-xl">
            Get premium placement, enable bookings, and access pro analytics to grow faster.
          </p>
          <ul className="space-y-2 text-white/90 mb-8">
            {['Premium visibility in search', 'Services and booking tools', 'Detailed performance insights'].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-[var(--brand-red,white)]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4A1 1 0 014.293 9.293L8 13l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                {item}
              </li>
            ))}
          </ul>

          {isSignedIn ? (
            isCoach ? (
              <Link href="/subscription" className="group inline-flex items-center w-max px-6 py-3 rounded-xl font-semibold btn-brand">
                <span>Upgrade to Coach Pro</span>
                <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <div className="px-6 py-3 rounded-xl font-semibold text-center bg-white/8 text-white/70 border border-white/10 w-max">
                You are not a coach
              </div>
            )
          ) : (
            <Link href="/signin" className="inline-flex items-center w-max px-6 py-3 rounded-xl font-semibold bg-white text-gray-900 hover:bg-gray-100">
              Sign in to continue
            </Link>
          )}
        </div>

        {/* Right: image */}
        <div className="relative min-h-[50vh]">
          <Image src="/coachpro/coachpro.png" alt="Coach Pro" fill className="object-cover object-center" priority />
          <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:'repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px, transparent 2px, transparent 16px)'}} />
        </div>
      </div>
    </div>
  );
}


