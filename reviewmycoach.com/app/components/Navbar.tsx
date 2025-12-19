'use client';

import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase-client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import GlobalSearchBar from './GlobalSearchBar';
import { useAuth } from '../lib/hooks/useAuth';
import { clearAuthToken } from '../lib/auth-cookie';

export default function Navbar() {
  const { user, loading, isCoach, hasCoachPro } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    try {
      setIsMenuOpen(false);
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear the auth token cookie for middleware
      clearAuthToken();
      
      // Force a hard redirect to clear all state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, try to clear the cookie and redirect
      clearAuthToken();
      window.location.href = '/';
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-black/95 backdrop-blur-md border-b border-gray-800/50 fixed top-0 left-0 right-0 z-[100] w-full shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 group" onClick={closeMenu}>
              <div className="relative">
                <Image
                  src="/logos/reviewmycoachlogo.png"
                  alt="ReviewMyCoach Logo"
                  width={40}
                  height={40}
                  className="h-9 md:h-10 w-auto transition-transform group-hover:scale-105"
                />
              </div>
              <span className="hidden sm:block text-lg font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-racing)' }}>
                REVIEWMYCOACH
              </span>
            </Link>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-xl mx-4 hidden md:block relative z-[101]">
            <GlobalSearchBar placeholder="Search coaches, sports, or locations..." />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/" className="text-gray-300 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide transition-all hover:text-white hover:bg-gray-900/50 rounded-sm">
              Home
            </Link>
            <Link href="/search" className="text-gray-300 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide transition-all hover:text-white hover:bg-gray-900/50 rounded-sm">
              Find Coaches
            </Link>
            <Link href="/about" className="text-gray-300 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide transition-all hover:text-white hover:bg-gray-900/50 rounded-sm">
              About
            </Link>
            {/* <Link href="/classes" className="text-gray-300 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide transition-all hover:text-white hover:bg-gray-900/50 rounded-sm">
              Classes
            </Link> */}
            <Link href="/cards-marketplace" className="text-gray-300 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide transition-all hover:text-white hover:bg-gray-900/50 rounded-sm">
              Cards
            </Link>
            {hasCoachPro && (
              <Link href="/coach/jobs" className="text-gray-300 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide transition-all hover:text-white hover:bg-gray-900/50 rounded-sm">
                Jobs
              </Link>
            )}
            {user && (
              <Link href="/dashboard" className="text-gray-300 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide transition-all hover:text-white hover:bg-gray-900/50 rounded-sm">
                Dashboard
              </Link>
            )}

            {/* Authentication Buttons */}
            <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-gray-800">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-7 w-16 bg-gray-800 rounded"></div>
                </div>
              ) : user ? (
                <div className="flex items-center space-x-2">
                  {/* User Profile Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-gray-300 px-2 py-1.5 rounded-sm text-sm font-semibold transition-all hover:text-white hover:bg-gray-900/50">
                      <div className="h-7 w-7 bg-gradient-to-br from-gray-700 to-gray-800 rounded-sm flex items-center justify-center ring-1 ring-gray-700">
                        {user.photoURL ? (
                          <Image
                            src={user.photoURL}
                            alt="Profile"
                            width={28}
                            height={28}
                            className="h-7 w-7 rounded-sm"
                          />
                        ) : (
                          <span className="text-white text-xs font-bold">
                            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                      <span className="hidden lg:block text-xs uppercase tracking-wide">
                        {user.displayName || user.email?.split('@')[0] || 'User'}
                      </span>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                     <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-sm shadow-xl py-1 z-[110] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-800">
                      <Link href="/profile" className="block px-4 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white font-semibold uppercase tracking-wide transition-all">
                        Your Profile
                      </Link>
                      {isCoach && (
                        <Link href="/dashboard/coach/reviews" className="block px-4 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white font-semibold uppercase tracking-wide transition-all">
                          Reviews
                        </Link>
                      )}
                      
                      {isCoach && (
                        <Link href="/subscription" className="block px-4 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white font-semibold uppercase tracking-wide transition-all">
                          Subscription
                        </Link>
                      )}
                      <hr className="my-1 border-gray-800" />
                      <button
                        onClick={(e) => handleSignOut(e)}
                        type="button"
                        className="block w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-gray-800 hover:text-red-300 font-semibold uppercase tracking-wide transition-all"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/signin"
                    className="text-gray-300 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide transition-all hover:text-white hover:bg-gray-900/50 rounded-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-1.5 text-sm font-bold uppercase tracking-wide btn-brand rounded-sm"
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
              className="inline-flex items-center justify-center p-2 rounded-sm text-gray-300 hover:text-white hover:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-700 transition-all"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden relative z-[110]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/98 backdrop-blur-md border-t border-gray-800/50">
            {/* Mobile Search Bar */}
            <div className="px-3 py-2 relative z-[111]">
              <GlobalSearchBar placeholder="Search coaches..." showSuggestions={false} />
            </div>
            
            <Link
              href="/"
              onClick={closeMenu}
              className="text-gray-300 hover:text-white block px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all hover:bg-gray-900/50 rounded-sm"
            >
              Home
            </Link>
            <Link
              href="/search"
              onClick={closeMenu}
              className="text-gray-300 hover:text-white block px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all hover:bg-gray-900/50 rounded-sm"
            >
              Find Coaches
            </Link>
            <Link
              href="/about"
              onClick={closeMenu}
              className="text-gray-300 hover:text-white block px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all hover:bg-gray-900/50 rounded-sm"
            >
              About
            </Link>
            {/* <Link
              href="/classes"
              onClick={closeMenu}
              className="text-gray-300 hover:text-white block px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all hover:bg-gray-900/50 rounded-sm"
            >
              Classes
            </Link> */}
            <Link
              href="/cards-marketplace"
              onClick={closeMenu}
              className="text-gray-300 hover:text-white block px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all hover:bg-gray-900/50 rounded-sm"
            >
              Cards
            </Link>
            {hasCoachPro && (
              <Link
                href="/coach/jobs"
                onClick={closeMenu}
                className="text-gray-300 hover:text-white block px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all hover:bg-gray-900/50 rounded-sm"
              >
                Jobs
              </Link>
            )}
            {user && (
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="text-gray-300 hover:text-white block px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all hover:bg-gray-900/50 rounded-sm"
              >
                Dashboard
              </Link>
            )}

            {/* Mobile Authentication */}
            <div className="pt-4 pb-3 border-t border-gray-800">
              {loading ? (
                <div className="animate-pulse px-3 py-2">
                  <div className="h-8 w-24 bg-gray-800 rounded-sm"></div>
                </div>
              ) : user ? (
                <div className="space-y-1">
                  <div className="flex items-center px-3 py-2">
                    <div className="h-10 w-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-sm flex items-center justify-center ring-1 ring-gray-700">
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-sm"
                        />
                      ) : (
                        <span className="text-white text-sm font-bold">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-white uppercase tracking-wide">
                        {user.displayName || 'User'}
                      </div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white uppercase tracking-wide transition-all hover:bg-gray-900/50 rounded-sm"
                  >
                    Your Profile
                  </Link>
                  {isCoach && (
                    <Link
                      href="/dashboard/coach/reviews"
                      onClick={closeMenu}
                      className="block px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white uppercase tracking-wide transition-all hover:bg-gray-900/50 rounded-sm"
                    >
                      Reviews
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white uppercase tracking-wide transition-all hover:bg-gray-900/50 rounded-sm"
                  >
                    Settings
                  </Link>
                  {isCoach && (
                    <Link
                      href="/subscription"
                      onClick={closeMenu}
                      className="block px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white uppercase tracking-wide transition-all hover:bg-gray-900/50 rounded-sm"
                    >
                      Subscription
                    </Link>
                  )}
                  <button
                    onClick={(e) => handleSignOut(e)}
                    type="button"
                    className="block w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 uppercase tracking-wide transition-all hover:bg-gray-900/50 rounded-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    href="/signin"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-sm font-semibold text-gray-300 hover:text-white uppercase tracking-wide transition-all hover:bg-gray-900/50 rounded-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-sm font-bold uppercase tracking-wide mx-3 btn-brand text-center rounded-sm"
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