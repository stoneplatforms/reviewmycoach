'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StripeReturnPage() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking the onboarding status
    const checkOnboardingStatus = async () => {
      try {
        // In a real implementation, you would verify the onboarding status here
        // For now, we'll assume it was successful
        setTimeout(() => {
          setSuccess(true);
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  const handleContinue = () => {
    router.push('/dashboard/coach/services');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying your account setup...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        {success ? (
          <div className="max-w-md mx-auto">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-6 text-3xl font-bold text-gray-900">Account Setup Complete!</h1>
            <p className="mt-4 text-gray-600">
              Your Stripe account has been successfully connected. You can now create services and start accepting payments.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleContinue}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700"
              >
                Create Your First Service
              </button>
              <Link
                href="/dashboard/coach"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="mt-6 text-3xl font-bold text-gray-900">Setup Not Complete</h1>
            <p className="mt-4 text-gray-600">
              There was an issue completing your account setup. Please try again.
            </p>
            <div className="mt-8">
              <Link
                href="/dashboard/coach/stripe"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700"
              >
                Try Again
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 