'use client';

import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase-client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import GlobalSearchBar from './GlobalSearchBar';
import { useAuth } from '../lib/hooks/useAuth';

export default function Navbar() {
  const { user, loading, isCoach, hasCoachPro } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 relative z-[100]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center" onClick={closeMenu}>
              <Image
                src="/logos/reviewmycoachlogo.png"
                alt="ReviewMyCoach Logo"
                width={48}
                height={48}
                className="h-10 md:h-12 w-auto"
              />
            </Link>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <GlobalSearchBar placeholder="Search coaches, sports, or locations..." />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/" className="text-black px-3 py-2 rounded-full text-base font-bold transition-colors hover:bg-gray-100">
              Home
            </Link>
            <Link href="/search" className="text-black px-3 py-2 rounded-full text-base font-bold transition-colors hover:bg-gray-100">
              Find Coaches
            </Link>
            <Link href="/about" className="text-black px-3 py-2 rounded-full text-base font-bold transition-colors hover:bg-gray-100">
              About
            </Link>
            <Link href="/classes" className="text-black px-3 py-2 rounded-full text-base font-bold transition-colors hover:bg-gray-100">
              Classes
            </Link>
            {hasCoachPro && (
              <Link href="/coach/jobs" className="text-black px-3 py-2 rounded-full text-base font-bold transition-colors hover:bg-gray-100">
                Jobs
              </Link>
            )}
            {user && (
              <Link href="/dashboard" className="text-black px-3 py-2 rounded-full text-base font-bold transition-colors hover:bg-gray-100">
                Dashboard
              </Link>
            )}

            {/* Authentication Buttons */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-20 bg-slate-700 rounded"></div>
                </div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  {/* User Profile Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-black px-3 py-2 rounded-full text-base font-bold transition-colors hover:bg-gray-100">
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center ring-1 ring-gray-200">
                        {user.photoURL ? (
                          <Image
                            src={user.photoURL}
                            alt="Profile"
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <span className="text-black font-bold">
                            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                      <span className="hidden lg:block font-bold">
                        {user.displayName || user.email?.split('@')[0] || 'User'}
                      </span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-[110] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 font-bold">
                        Your Profile
                      </Link>
                      {isCoach && (
                        <Link href="/dashboard/coach/reviews" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 font-bold">
                          Reviews
                        </Link>
                      )}
                      
                      {isCoach && (
                        <Link href="/subscription" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 font-bold">
                          Subscription
                        </Link>
                      )}
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 font-bold"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/signin"
                    className="text-black px-3 py-2 rounded-full text-base font-bold transition-colors hover:bg-gray-100"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 rounded-full text-base font-bold btn-brand"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-300 hover:text-white hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-neutral-700 transition-all"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden relative z-[110]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-neutral-950/90 backdrop-blur border-t border-neutral-900">
            {/* Mobile Search Bar */}
            <div className="px-3 py-2">
              <GlobalSearchBar placeholder="Search coaches..." showSuggestions={false} />
            </div>
            
            <Link
              href="/"
              onClick={closeMenu}
              className="text-neutral-200 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all hover:bg-neutral-900"
            >
              Home
            </Link>
            <Link
              href="/search"
              onClick={closeMenu}
              className="text-neutral-200 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all hover:bg-neutral-900"
            >
              Find Coaches
            </Link>
            <Link
              href="/about"
              onClick={closeMenu}
              className="text-neutral-200 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all hover:bg-neutral-900"
            >
              About
            </Link>
            <Link
              href="/classes"
              onClick={closeMenu}
              className="text-neutral-200 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all hover:bg-neutral-900"
            >
              Classes
            </Link>
            {hasCoachPro && (
              <Link
                href="/coach/jobs"
                onClick={closeMenu}
                className="text-neutral-200 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all hover:bg-neutral-900"
              >
                Jobs
              </Link>
            )}
            {user && (
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="text-neutral-200 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all hover:bg-neutral-900"
              >
                Dashboard
              </Link>
            )}

            {/* Mobile Authentication */}
            <div className="pt-4 pb-3 border-t border-gray-800">
              {loading ? (
                <div className="animate-pulse px-3 py-2">
                  <div className="h-8 w-24 bg-slate-700 rounded"></div>
                </div>
              ) : user ? (
                <div className="space-y-1">
                  <div className="flex items-center px-3 py-2">
                    <div className="h-10 w-10 bg-neutral-900 rounded-full flex items-center justify-center ring-1 ring-neutral-700">
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-neutral-100">
                        {user.displayName || 'User'}
                      </div>
                      <div className="text-sm text-neutral-400">{user.email}</div>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-base font-medium text-neutral-200 hover:text-white transition-all hover:bg-neutral-900"
                  >
                    Your Profile
                  </Link>
                  {isCoach && (
                    <Link
                      href="/dashboard/coach/reviews"
                      onClick={closeMenu}
                      className="block px-3 py-2 text-base font-medium text-neutral-200 hover:text-white transition-all hover:bg-neutral-900"
                    >
                      Reviews
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-base font-medium text-neutral-200 hover:text-white transition-all hover:bg-neutral-900"
                  >
                    Settings
                  </Link>
                  {isCoach && (
                    <Link
                      href="/subscription"
                      onClick={closeMenu}
                      className="block px-3 py-2 text-base font-medium text-neutral-200 hover:text-white transition-all hover:bg-neutral-900"
                    >
                      Subscription
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:text-red-300 transition-all hover:bg-neutral-900"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    href="/signin"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-base font-medium text-neutral-200 hover:text-white transition-all hover:bg-neutral-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-base font-medium rounded-full mx-3 btn-brand text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 