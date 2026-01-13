'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../lib/hooks/useAuth';

export default function CoachProPromoSection() {
  const { user, isCoach } = useAuth();

  const isSignedIn = !!user;
  const canSubscribe = isSignedIn && isCoach;

  return (
    <div className="w-full relative overflow-hidden" style={{ backgroundColor: '#191919' }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-[80vh] border-t border-b border-white/10">
        {/* Left: information */}
        <div className="relative flex flex-col justify-center px-6 sm:px-10 py-14">
          <div className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase text-white/70 mb-3">
            <span className="w-2 h-2 rounded-full bg-white/80" />
            Built for elite coaches
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Elevate Your Coaching Brand
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
        <div className="relative min-h-[50vh] flex items-center justify-center p-8">
          <div className="relative w-full max-w-md">
            {/* Decorative background card - rotated */}
            <div className="absolute inset-0 bg-gray-700 rounded-2xl transform rotate-6 opacity-40"></div>
            <div className="absolute inset-0 bg-gray-600 rounded-2xl transform -rotate-3 opacity-30"></div>

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-12 border-4 border-white shadow-2xl">
              {/* PRO Badge */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-32 h-32 mb-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.034a1 1 0 00-1.176 0l-2.802 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
                  </svg>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-4xl font-black text-gray-900 mb-2">COACH PRO</h3>
                  <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
                </div>

                <div className="space-y-3 w-full">
                  <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                    <span className="text-sm font-semibold text-white">Premium Visibility</span>
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                    <span className="text-sm font-semibold text-white">Booking Tools</span>
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                    <span className="text-sm font-semibold text-white">Pro Analytics</span>
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


