export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-gray-100 mb-4">About ReviewMyCoach</h1>
          <p className="text-lg text-gray-400 max-w-3xl">
            ReviewMyCoach helps athletes and families find the right coach through honest ratings,
            meaningful reviews, and transparent profiles across sports and levels.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start mb-14">
          <div className="lg:col-span-2 space-y-6 text-gray-300 leading-relaxed">
            <p>
              We believe great coaching changes lives. But finding the right coach can be hard:
              the best fit depends on sport, experience, communication style, budget, and goals.
              ReviewMyCoach brings all of this into one place so you can make confident decisions.
            </p>
            <p>
              Our platform features verified profiles, structured reviews, and tools for coaches to
              showcase credentials, availability, services, and testimonials. Whether you’re new to a
              sport or preparing for the next level, we give you the context you need.
            </p>
            <p>
              Think of it as "Rate My Professors"—but for coaches. Simple, transparent, and designed
              for athletes.
            </p>
          </div>
          <aside className="rounded-2xl border border-gray-800 p-6 bg-black">
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">Our Mission</h2>
            <p className="text-gray-300">
              Make high-quality coaching accessible by building trust and visibility in the
              coaching community.
            </p>
          </aside>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Meet the Founder: Henry Kang</h2>
            <div className="space-y-6 text-gray-300 leading-relaxed">
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
                ReviewMyCoach is Henry’s ongoing effort to bring clarity, fairness, and opportunity to
                the coaching world, elevating both athletes and the coaches who help them grow.
              </p>
            </div>
          </div>
          <aside className="rounded-2xl border border-gray-800 p-6 bg-black">
            <h3 className="text-xl font-semibold text-gray-100 mb-3">Why It Matters</h3>
            <ul className="list-disc pl-5 text-gray-300 space-y-2">
              <li>Discover qualified coaches faster</li>
              <li>Read real reviews that highlight fit and style</li>
              <li>Give great coaches the spotlight they deserve</li>
            </ul>
          </aside>
        </section>
      </div>
    </div>
  );
}


