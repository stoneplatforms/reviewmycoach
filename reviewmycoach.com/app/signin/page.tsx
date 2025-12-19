'use client';

import { useState, useEffect, Suspense } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../lib/hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import Link from 'next/link';
import { setAuthToken } from '../lib/auth-cookie';

function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      // Always redirect to dashboard first, let dashboard handle onboarding check
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user) {
        throw new Error('Sign in failed');
      }

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }

      // Get ID token
      const token = await userCredential.user.getIdToken();
      await setAuthToken(token);

      // Middleware will handle redirect based on role and onboarding status
      const redirect = searchParams?.get('redirect') || '/dashboard';
      router.push(redirect);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(error.message || 'An error occurred during sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (!result.user) throw new Error('Google sign in failed');

      // Get ID token
      const token = await result.user.getIdToken();
      await setAuthToken(token);
      
      // Redirect
      const redirectTo = searchParams?.get('redirect') || '/dashboard';
      router.push(redirectTo);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign in cancelled');
      } else {
        setError(error.message || 'An error occurred during Google sign in');
      }
      setLoading(false);
    }
  };

  // Show loading state during auth check to prevent hydration mismatch
  if (authLoading || user) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-neutral-900/60 backdrop-blur rounded-2xl border border-neutral-800 p-8 space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-neutral-900 ring-1 ring-neutral-800">
              <svg className="h-8 w-8 text-neutral-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="mt-6 text-center text-3xl font-semibold tracking-tight text-neutral-100">
              Sign in
            </h1>
            <p className="mt-3 text-center text-sm text-neutral-400">
              New here?{' '}
              <Link href="/signup" className="font-medium text-neutral-200 underline hover:text-white">
                Create an account
              </Link>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleEmailSignIn}>
            {error && (
              <div className="rounded-xl bg-red-900/30 border border-red-800/50 p-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-300">
                      Authentication Error
                    </h3>
                    <div className="mt-1 text-sm text-red-200">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-neutral-100 focus:ring-0 border-neutral-700 bg-neutral-900 rounded mt-1"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm text-neutral-400">
                  Keep me logged in
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-neutral-200 underline hover:text-white">
                  Forgot password?
                </a>
              </div>
            </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 rounded-full text-sm font-medium text-neutral-900 bg-neutral-100 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </div>

            <div>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-800" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 py-1 bg-neutral-950 text-neutral-400 text-xs rounded-full border border-neutral-800">
                    Or sign in with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-neutral-800 rounded-full bg-neutral-900 text-neutral-100 hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
        </form>

          {/* Footer */}
          <div className="text-center pt-6">
            <Link href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <SignInForm />
    </Suspense>
  );
} 

// Metadata cannot be exported from a client component; handled at a parent layout/route.