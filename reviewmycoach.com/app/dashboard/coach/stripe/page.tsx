'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../../../lib/firebase-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface StripeAccount {
  accountId: string;
  status: string;
  email: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export default function StripeConnectPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stripeAccount, setStripeAccount] = useState<StripeAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingAccount, setFetchingAccount] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        await fetchStripeAccount(user);
      } else {
        router.push('/signin');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchStripeAccount = async (user: User, isRetry: boolean = false) => {
    if (isRetry) {
      setRetrying(true);
      setError(null);
    } else {
      setFetchingAccount(true);
    }

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/stripe/connect?idToken=${idToken}`);
      
      if (response.ok) {
        const data = await response.json();
        setStripeAccount(data);
        setError(null);
      } else if (response.status === 404) {
        // No Stripe account found, which is fine
        setStripeAccount(null);
        setError(null);
      } else {
        setError('Failed to load Stripe account information');
      }
    } catch (error) {
      console.error('Error fetching Stripe account:', error);
      setError('Failed to load Stripe account information');
    } finally {
      setFetchingAccount(false);
      setRetrying(false);
    }
  };

  const handleConnectStripe = async () => {
    if (!user) return;
    
    setConnecting(true);
    setError(null);
    
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          email: user.email,
          country: 'US',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe onboarding
        window.location.href = data.onboardingUrl;
      } else {
        const errorData = await response.json();
        console.error('Stripe Connect Error:', errorData);
        
        // Show more detailed error information
        let displayError = errorData.error || 'Failed to connect Stripe account';
        if (errorData.details) {
          displayError += ` (${errorData.details})`;
        }
        
        setError(displayError);
      }
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      setError('Failed to connect Stripe account');
    } finally {
      setConnecting(false);
    }
  };

  const handleRetry = () => {
    if (user) {
      fetchStripeAccount(user, true);
    }
  };

  const continueOnboarding = async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/stripe/connect', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      const data = await res.json();
      if (res.ok && data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      } else {
        setError(data.error || 'Failed to continue onboarding');
      }
    } catch (e) {
      setError('Failed to continue onboarding');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'requires_action':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-800 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active - Ready to receive payments';
      case 'pending':
        return 'Pending - Setup in progress';
      case 'requires_action':
        return 'Requires Action - Additional information needed';
      default:
        return 'Unknown Status';
    }
  };

  // Skeleton loading component
  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 bg-neutral-700 rounded w-32"></div>
          <div className="h-4 bg-neutral-700 rounded w-48"></div>
        </div>
        <div className="h-8 bg-neutral-700 rounded w-32"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-neutral-700 rounded w-16"></div>
            <div className="h-4 bg-neutral-700 rounded w-24"></div>
          </div>
        ))}
      </div>
      
      <div className="h-10 bg-neutral-700 rounded w-48"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-neutral-700 rounded w-48 animate-pulse"></div>
              <div className="h-5 bg-neutral-700 rounded w-96 animate-pulse"></div>
            </div>
            <div className="h-10 bg-neutral-700 rounded w-40 animate-pulse"></div>
          </div>
        </div>
        
        <div className="bg-neutral-900/60 backdrop-blur rounded-2xl border border-neutral-800">
          <div className="px-6 py-4 border-b border-neutral-800">
            <div className="h-6 bg-neutral-700 rounded w-40 animate-pulse"></div>
          </div>
          <div className="p-6">
            <SkeletonLoader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-neutral-100 tracking-tight">Payment setup</h1>
            <p className="mt-2 text-neutral-400">
              Connect your Stripe account to receive payments for your coaching services
            </p>
          </div>
          <Link
            href="/dashboard/coach"
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-neutral-100 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-950/40 border border-red-900/40 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-200">{error}</span>
            </div>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-red-900 bg-red-100 hover:bg-red-200 disabled:opacity-50"
            >
              {retrying ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                  Retrying...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="bg-neutral-900/60 backdrop-blur rounded-2xl border border-neutral-800">
        <div className="px-6 py-4 border-b border-neutral-800">
          <h2 className="text-xl font-semibold text-neutral-100">Stripe Connect status</h2>
        </div>
        
        <div className="p-6">
          {fetchingAccount ? (
            <SkeletonLoader />
          ) : stripeAccount ? (
            <div className="space-y-6">
              {/* Account Status */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-neutral-100">Account status</h3>
                  <p className="text-sm text-neutral-400">Your Stripe account connection status</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(stripeAccount.status)}`}>
                  {getStatusText(stripeAccount.status)}
                </span>
              </div>

              {/* Account Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Email
                  </label>
                  <p className="text-sm text-neutral-100">{stripeAccount.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Country
                  </label>
                  <p className="text-sm text-neutral-100">{stripeAccount.country}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Account ID
                  </label>
                  <p className="text-sm text-neutral-100 font-mono">{stripeAccount.accountId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Connected Since
                  </label>
                  <p className="text-sm text-neutral-100">
                    {new Date(stripeAccount.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                {stripeAccount.status === 'active' && (
                  <Link
                    href="/dashboard/coach/services"
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-neutral-900 bg-neutral-100 hover:bg-white"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Your First Service
                  </Link>
                )}
                
                {stripeAccount.status === 'requires_action' && (
                  <button
                    onClick={continueOnboarding}
                    disabled={connecting}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-neutral-900 bg-neutral-100 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    {connecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Complete Setup
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-neutral-100">No payment account connected</h3>
              <p className="mt-2 text-sm text-neutral-400">
                Connect your Stripe account to start receiving payments for your coaching services.
              </p>
              <div className="mt-6">
                <button
                  onClick={continueOnboarding}
                  disabled={connecting}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-neutral-900 bg-neutral-100 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {connecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Connect Stripe Account
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Information Section */}
      <div className="mt-8 bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-lg font-medium text-neutral-100 mb-4">Why connect Stripe?</h3>
        <ul className="space-y-2 text-sm text-neutral-300">
          <li className="flex items-start">
            <svg className="w-4 h-4 text-neutral-200 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Accept payments from students for your coaching services
          </li>
          <li className="flex items-start">
            <svg className="w-4 h-4 text-neutral-200 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Secure payment processing with automatic transfers
          </li>
          <li className="flex items-start">
            <svg className="w-4 h-4 text-neutral-200 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Get paid only when you complete the coaching session
          </li>
          <li className="flex items-start">
            <svg className="w-4 h-4 text-neutral-200 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Platform fee of 5% helps maintain and improve the service
          </li>
        </ul>
      </div>
    </div>
  );
} 