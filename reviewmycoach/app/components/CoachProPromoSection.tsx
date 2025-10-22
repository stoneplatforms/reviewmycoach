'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../lib/hooks/useAuth';

export default function CoachProPromoSection() {
  const { user, isCoach } = useAuth();

  const isSignedIn = !!user;
  const canSubscribe = isSignedIn && isCoach;

  return (
    <div className="w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] relative py-0 overflow-hidden min-h-[60vh] sm:min-h-[65vh] lg:min-h-[75vh]">
      {/* Full-bleed banner, no container */}
      <div className="relative grid grid-cols-12 rounded-none overflow-hidden border-t border-b border-white/10 min-h-[60vh] sm:min-h-[65vh] lg:min-h-[75vh]">
        {/* Sporty diagonal micro-stripes overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-15" style={{backgroundImage:'repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 16px)'}} />
        {/* Accent bars */}
        <div className="absolute left-0 right-0 top-0 h-1 bg-[var(--brand-red,#ef4444)]/70" />
        <div className="absolute left-0 right-0 bottom-0 h-1 bg-[var(--brand-red,#ef4444)]/70" />
          {/* Left vertical rail */}
          <div className="col-span-12 lg:col-span-1 bg-black/80 relative hidden lg:block">
            <div className="absolute inset-0 opacity-20" style={{backgroundImage:'repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 10px)'}} />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90">
              <span className="tracking-[0.35em] uppercase text-white/80 text-sm">Coach Pro</span>
            </div>
          </div>

          {/* Middle info panel */}
          <div className="col-span-12 lg:col-span-7 bg-black/90 p-8 sm:p-12 flex flex-col justify-center">
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
            <ul className="space-y-2 text-white/90 mb-7">
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

          {/* Right visual panel (slanted cut with players) */}
          <div className="col-span-12 lg:col-span-4 relative bg-neutral-900">
            {/* Slanted mask */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -left-24 top-0 bottom-0 right-0 origin-right -skew-x-6">
                <div className="absolute inset-0 skew-x-6">
                  <Image src="/hero/coach.png" alt="Coach" fill className="object-contain object-center opacity-95" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_55%)]" />
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}


