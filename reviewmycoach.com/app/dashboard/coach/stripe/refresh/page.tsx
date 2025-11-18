'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StripeRefreshPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect back to the Stripe setup page after a brief delay
    setTimeout(() => {
      router.push('/dashboard/coach/stripe');
    }, 2000);
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting you back to account setup...</p>
        </div>
      </div>
    </div>
  );
} 