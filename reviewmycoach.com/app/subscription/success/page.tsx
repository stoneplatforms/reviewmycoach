'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../components/LoadingSpinner';
import Link from 'next/link';

function SubscriptionSuccessContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  const verifySubscription = useCallback(async () => {
    if (!user || !sessionId) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/subscription/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: sessionId,
          idToken: idToken
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSubscriptionDetails(data);
      } else {
        setError(data.error || 'Failed to verify subscription');
      }
    } catch (error) {
      console.error('Error verifying subscription:', error);
      setError('Error verifying subscription');
    } finally {
      setLoading(false);
    }
  }, [user, sessionId]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/signin');
      return;
    }

    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    verifySubscription();
  }, [user, authLoading, sessionId, router, verifySubscription]);

  if (authLoading || loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Subscription Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/subscription"
            className="btn-brand px-6 py-3 rounded-lg transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-gray-200">
                ReviewMyCoach
              </Link>
              <span className="text-gray-600">|</span>
              <h1 className="text-xl font-semibold text-gray-100">Coach Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-gray-200">
                Dashboard
              </Link>
              <button
                onClick={() => router.push('/profile')}
                className="text-gray-400 hover:text-gray-200"
              >
                Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-100 mb-4">
            Welcome to Coach Pro! 🎉
          </h1>
          <p className="text-lg text-gray-400 mb-8">
            Your subscription has been successfully activated. You now have access to all Coach Pro features.
          </p>

          {subscriptionDetails && (
            <div className="rounded-lg border border-gray-800 p-8 mb-8 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Subscription Details</h2>
              <div className="space-y-3 text-left text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan:</span>
                  <span className="font-medium text-gray-100">
                    Coach Pro {subscriptionDetails.plan === 'yearly' ? 'Yearly' : 'Monthly'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-800/60">
                    Active
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Next Billing:</span>
                  <span className="font-medium text-gray-100">
                    {new Date(subscriptionDetails.nextBilling).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-neutral-900 rounded-lg p-6 mb-8 border border-gray-800">
            <h2 className="text-lg font-semibold text-gray-100 mb-3">
              What's Next?
            </h2>
            <ul className="text-left space-y-2 text-gray-300">
              <li className="flex items-center">
                <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Explore your enhanced dashboard with new Pro features
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Start applying to unlimited job listings
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Set up your custom profile theme
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Check out your advanced analytics
              </li>
            </ul>
          </div>

          <div className="flex justify-center space-x-4">
            <Link
              href="/dashboard"
              className="btn-brand px-8 py-3 rounded-lg transition-colors font-medium"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/subscription"
              className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              View Subscription
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Need help getting started? Check out our{' '}
              <a href="#" className="underline hover:text-gray-200">
                Coach Pro Guide
              </a>
              {' '}or{' '}
              <a href="#" className="underline hover:text-gray-200">
                contact support
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SubscriptionSuccessContent />
    </Suspense>
  );
} 

// Metadata cannot be exported from a client component; handled at a parent layout/route.