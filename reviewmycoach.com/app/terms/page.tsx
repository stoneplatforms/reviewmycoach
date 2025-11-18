export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-100 mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Effective date: October 14, 2025</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing or using ReviewMyCoach, you agree to be bound by these Terms of
              Service. If you do not agree, you may not use the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">2. Eligibility and Accounts</h2>
            <p>
              You must be at least 13 years old to use the service. You are responsible for
              safeguarding your account credentials and all activity under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">3. Content and Reviews</h2>
            <p>
              You are responsible for the content you post, including reviews and messages. Do not
              post unlawful, defamatory, discriminatory, harassing, or infringing content. We may
              remove or moderate content that violates these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">4. Payments and Subscriptions</h2>
            <p>
              Paid offerings (such as Coach Pro) may be billed on a recurring basis. Billing terms,
              cancellation, and refunds are governed by the plan details shown at purchase and any
              applicable law. Third-party processors (e.g., Stripe) may handle payments.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">5. Prohibited Conduct</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Attempting to scrape, reverse engineer, or disrupt the service;</li>
              <li>Impersonating others or misrepresenting affiliations;</li>
              <li>Uploading malware or harmful code.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">6. Intellectual Property</h2>
            <p>
              All trademarks, logos, and content on the site are owned by ReviewMyCoach or its
              licensors. You may not use them without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">7. Disclaimers</h2>
            <p>
              The service is provided “as is” and “as available” without warranties of any kind. We
              do not guarantee the accuracy of listings, reviews, or user-generated content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, ReviewMyCoach will not be liable for any
              indirect, incidental, special, consequential, or punitive damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">9. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Your continued use constitutes
              acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">10. Contact</h2>
            <p>
              Questions about these Terms? Contact us at support@reviewmycoach.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Terms of Service | ReviewMyCoach',
  description: 'ReviewMyCoach Terms of Service governing access, content, payments, and usage of the platform.',
  alternates: { canonical: '/terms' },
};


