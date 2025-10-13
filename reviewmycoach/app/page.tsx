import Link from "next/link";
import GlobalSearchBar from "./components/GlobalSearchBar";
import HeroCoachCarousel from "./components/HeroCoachCarousel";
import SportsIconGrid from "./components/SportsIconGrid";
// DynamicSportsMosaic removed

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Dynamic Gradient with Floating Elements */}
      <div className="relative text-neutral-200 overflow-hidden">
        {/* Floating geometric shapes */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gray-100 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-gray-100 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gray-100 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold mb-6 tracking-tight text-gray-900">
              Find Your Perfect <span className="text-[#ff0002]">Coach</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Connect with expert coaches in your sport. From basketball to swimming, find the perfect mentor to elevate your game.
            </p>
            
            <div className="max-w-3xl mx-auto mb-8">
              <GlobalSearchBar />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                <span>2,500+ Active Coaches</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                <span>15+ Sports Available</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                <span>Real Reviews</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Featured Coaches Carousel */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Meet Our Top Coaches
            </h2>
            <p className="text-gray-600">
              Discover amazing coaches ready to help you reach your goals
            </p>
          </div>
          <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
            <HeroCoachCarousel />
          </div>
          
          {/* Trending Sports Pills */}
          <div className="flex flex-wrap justify-center gap-3 text-sm mt-12">
            <span className="text-gray-900 mr-2">Trending:</span>
            <Link href="/search?q=basketball" className="bg-white text-gray-900 px-4 py-2 rounded-full transition-all hover:scale-110 hover:shadow-lg border border-gray-700">
              🏀 Basketball
            </Link>
            <Link href="/search?q=soccer" className="bg-white text-gray-900 px-4 py-2 rounded-full transition-all hover:scale-110 hover:shadow-lg border border-gray-700">
              ⚽ Soccer
            </Link>
            <Link href="/search?q=tennis" className="bg-white text-gray-900 px-4 py-2 rounded-full transition-all hover:scale-110 hover:shadow-lg border border-gray-700">
              🎾 Tennis
            </Link>
            <Link href="/search?q=swimming" className="bg-white text-gray-900 px-4 py-2 rounded-full transition-all hover:scale-110 hover:shadow-lg border border-gray-700">
              🏊 Swimming
            </Link>
          </div>
        </div>
      </div>

      {/* Sports Icons Grid */}
      <SportsIconGrid />

      {/* Coach Pro Subscription Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gray-100 border border-gray-200 text-gray-700 rounded-full text-sm font-medium mb-8">Exclusive for Coaches</div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Supercharge Your
              <br />
              <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                Coaching Business
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Join ReviewMyCoach Pro and unlock premium features to grow your coaching business, connect with more athletes, and maximize your impact.
            </p>
          </div>
          
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                  </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Priority Placement</h3>
              <p className="text-gray-600 mb-6">Get featured in search results and increase your visibility to potential clients by up to 300%.</p>
              <div className="flex items-center text-gray-600 text-sm font-medium">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                3x More Visibility
                </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
                  </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Advanced Analytics</h3>
              <p className="text-gray-600 mb-6">Track your performance with detailed insights on profile views, bookings, and client engagement.</p>
              <div className="flex items-center text-gray-600 text-sm font-medium">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                Deep Insights
                  </div>
                </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Direct Payments</h3>
              <p className="text-gray-600 mb-6">Accept payments directly through the platform with integrated Stripe processing and automated invoicing.</p>
              <div className="flex items-center text-gray-600 text-sm font-medium">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                Seamless Transactions
              </div>
                    </div>
                </div>

          <div className="text-center">
            <Link 
              href="/subscription"
              className="inline-flex items-center px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-sm btn-brand"
                >
              Upgrade to Pro
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
                </Link>
            <p className="text-gray-500 mt-4 text-sm">
              Start your 14-day free trial • No commitment required
                </p>
              </div>
            </div>
          </div>

      {/* How It Works Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting started with ReviewMyCoach is simple. Find, connect, and train with the best coaches in just a few steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-black border border-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-gray-800">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Search & Discover</h3>
              <p className="text-gray-600">
                Browse through our extensive database of verified coaches. Filter by sport, location, experience, and reviews to find your perfect match.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-black border border-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-gray-800">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Connect & Book</h3>
              <p className="text-gray-600">
                View detailed profiles, read reviews, and book sessions directly. Message coaches to discuss your goals and training needs.
              </p>
              </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-black border border-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-gray-800">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Train & Improve</h3>
              <p className="text-gray-600">
                Start your training journey with expert guidance. Track progress, receive feedback, and achieve your athletic goals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Level Up Your Game?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands of athletes who have found their perfect coach on ReviewMyCoach.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 btn-brand"
            >
              Find a Coach
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-700 text-gray-200 rounded-xl font-bold text-lg hover:bg-gray-800 hover:text-gray-200 transition-all duration-300"
            >
              Join as Coach
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}