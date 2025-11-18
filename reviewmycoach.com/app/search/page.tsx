import { Suspense } from 'react';
import SearchPageClient from './SearchPageClient';

export const metadata = {
  title: 'Search Coaches | ReviewMyCoach',
  description: 'Find the perfect coach for your sport. Search and filter by location, sport, gender, and organization.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/search' },
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<SearchPageSkeleton />}>
        <SearchPageClient />
      </Suspense>
    </div>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8 border-b border-gray-200 pb-8">
          <div className="h-8 bg-gray-100 animate-pulse mb-4"></div>
          <div className="h-4 bg-gray-100 animate-pulse w-2/3"></div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="mb-8">
          <div className="h-12 bg-gray-100 border border-gray-200 rounded-full animate-pulse"></div>
        </div>

        {/* Filters Skeleton */}
        <div className="mb-8 bg-white border border-gray-200 p-6 rounded-2xl">
          <div className="h-6 bg-gray-100 animate-pulse mb-4 w-32"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Results Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 border border-gray-200 rounded-2xl overflow-hidden">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white border-r border-b border-gray-200 p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-100"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 mb-2"></div>
                  <div className="h-3 bg-gray-100 w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100"></div>
                <div className="h-3 bg-gray-100 w-5/6"></div>
                <div className="h-3 bg-gray-100 w-4/6"></div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="h-4 bg-gray-100 w-20"></div>
                <div className="h-8 bg-gray-100 w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 