export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-100 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Effective date: October 14, 2025</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">1. Overview</h2>
            <p>
              This Privacy Policy explains how ReviewMyCoach collects, uses, and shares information
              about you when you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Account information (email, display name, username);</li>
              <li>Profile and content you provide (reviews, messages, preferences);</li>
              <li>Usage data and device information (IP, browser, pages viewed);</li>
              <li>Payment information processed by third-party providers (e.g., Stripe).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">3. How We Use Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide, maintain, and improve the service;</li>
              <li>Personalize content and recommendations;</li>
              <li>Process transactions and prevent fraud;</li>
              <li>Communicate with you about updates and support.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">4. Sharing of Information</h2>
            <p>
              We may share information with service providers (e.g., hosting, analytics, payments),
              when required by law, or with your consent. We do not sell personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">5. Data Retention</h2>
            <p>
              We retain information for as long as necessary to provide the service and for
              legitimate business purposes, or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">6. Your Choices</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access, update, or delete your account information;</li>
              <li>Manage communications and notification preferences;</li>
              <li>Opt-out of certain analytics or cookies (where applicable).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">7. Security</h2>
            <p>
              We use reasonable safeguards designed to protect your information; however, no method
              of transmission or storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">8. Children</h2>
            <p>
              Our services are not directed to children under 13. If we learn we’ve collected
              personal information from a child, we will take steps to delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Your continued use of the
              service indicates acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">10. Contact</h2>
            <p>
              Questions about this Privacy Policy? Contact us at privacy@reviewmycoach.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}


