import Link from "next/link";
import Image from "next/image";
import GlobalSearchBar from "./components/GlobalSearchBar";
import HeroCoachCarousel from "./components/HeroCoachCarousel";
import OurCoachesSection from "./components/OurCoachesSection";
import CoachProPromoSection from "./components/CoachProPromoSection";
// DynamicSportsMosaic removed

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Photo backdrop with centered card/bubbles */}
      <div className="relative text-neutral-200 w-full">
        {/* Background image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/hero/bg.png"
            alt="Campus walkway background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black/80" />
        </div>

        {/* Title */}
        <div className="pt-20 sm:pt-28 text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-wide text-white">
            Review Your Coach, Anonymously.
          </h1>
          <p className="mt-3 text-base sm:text-lg text-neutral-300">
            Leave a review, show how you did.
          </p>
        </div>

        {/* Center card with coach image and rating */}
        <div className="relative mx-auto mt-4 sm:mt-6 max-w-sm sm:max-w-md md:max-w-lg px-4 z-10">
          {/* Gradient 2px border wrapper */}
          <div className="relative mx-auto rounded-3xl p-[2px] bg-gradient-to-br from-white to-black shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div className="relative h-[480px] sm:h-[580px] rounded-3xl bg-black backdrop-blur-md flex items-end justify-center pb-4" style={{ boxShadow: 'inset 0 -220px 200px -40px rgba(0,0,0,0.95)' }}>
            {/* Coach image - use profileImage from bubbles when available in the future; keep decorative image for hero */}
            <img
              src="/hero/coach.png"
              alt="Coach portrait"
              className="hero-coach-image w-auto object-contain drop-shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
            />
            {/* Rating badge */}
            <div className="absolute top-4 right-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.034a1 1 0 00-1.176 0l-2.802 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z"/></svg>
              <span className="text-white text-xl font-semibold">4.9</span>
            </div>

            {/* Inner bottom inset shadow overlay (above image) */}
            <div className="pointer-events-none absolute inset-0 z-50 rounded-3xl" style={{ boxShadow: 'inset 0 -260px 260px 0 rgba(0,0,0,0.98)' }} />
            </div>
            {/* Message bubbles INSIDE the card wrapper, positioned with transforms */}
            <div className="pointer-events-none absolute left-0 top-0 z-20 hidden sm:block" style={{ transform: 'translate3d(-9rem, 6rem, 0)', willChange: 'transform' }}>
              <Image src="/hero/msg-left.png" alt="message bubble" width={280} height={120} className="w-56 sm:w-72 h-auto opacity-90 max-w-none" />
            </div>
            <div className="pointer-events-none absolute right-0 bottom-0 z-20 hidden sm:block" style={{ transform: 'translate3d(8.5rem, -11rem, 0)', willChange: 'transform' }}>
              <Image src="/hero/msg-right.png" alt="message bubble" width={300} height={120} className="w-60 sm:w-72 h-auto opacity-90 max-w-none" />
            </div>
          </div>
        </div>

        {/* Search input overlapping bottom of card to create rising effect */}
        <div className="relative -mt-8 sm:-mt-10 pb-20 px-4 z-30">
          <div className="max-w-2xl mx-auto">
            <GlobalSearchBar placeholder="Enter your school to start" inputClassName="py-4 text-lg" />
          </div>
        </div>
      </div>

        {/* Our Coaches rail (new design) */}
        <OurCoachesSection />

      {/* Sports Icons Grid removed per request */}

      {/* Coach Pro Subscription Section removed per request */}

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

      {/* About Henry Kang Section */}
      <section className="relative w-full min-h-[900px]">
        {/* Black background base */}
        <div className="absolute inset-0 bg-black"></div>
        
        {/* Blue diagonal section */}
        <div 
          className="absolute inset-0 bg-blue-600"
          style={{
            clipPath: 'polygon(0 50%, 100% 0, 100% 100%, 0 100%)'
          }}
        />

        {/* Content container */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-20 pb-32 min-h-[900px] flex items-end justify-center">
          <div className="flex flex-col lg:flex-row lg:items-end w-full max-w-7xl lg:gap-0">
            {/* Left side - Text content */}
            <div className="relative z-20 max-w-2xl lg:mr-8 mx-auto lg:mx-0">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8">About Henry Kang</h2>
              <div className="space-y-5 text-white/90 leading-relaxed text-lg">
                <p>
                  Henry Kang created ReviewMyCoach after seeing how difficult it was for athletes and
                  parents to evaluate coaching options. Information was scattered, reviews were hard to
                  trust, and great coaches were often hidden.
                </p>
                <p>
                  Inspired by the simplicity of platforms like Rate My Professors, Henry set out to build
                  a space where coaches could be discovered for their expertise and where athletes could
                  share real experiences—good or bad—to help others.
                </p>
                <p>
                  ReviewMyCoach is Henry's ongoing effort to bring clarity, fairness, and opportunity to
                  the coaching world, elevating both athletes and the coaches who help them grow.
                </p>
              </div>
            </div>

            {/* Right side - Profile image */}
            <div className="relative flex items-center justify-center lg:justify-end lg:ml-0 mt-8 lg:mt-0">
              <div className="relative w-full max-w-xl lg:max-w-2xl xl:max-w-3xl">
                <div className="bg-gray-200 rounded-xl flex flex-col items-center justify-center p-24 lg:p-28 xl:p-32 border-4 border-white shadow-2xl">
                  <svg className="w-56 h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 mb-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-gray-900 font-semibold text-2xl lg:text-3xl xl:text-4xl">Henry Kang</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coach Pro Promo */}
      <CoachProPromoSection />

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