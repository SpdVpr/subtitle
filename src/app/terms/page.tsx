export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-gray max-w-none">
        <p className="text-lg text-gray-600 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using SubtitleAI, you accept and agree to be bound by the terms 
            and provision of this agreement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
          <p className="mb-4">
            SubtitleAI provides AI-powered subtitle translation services. We offer various 
            translation engines including Google Translate, OpenAI, and our Premium Context AI.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>You are responsible for the content of files you upload</li>
            <li>You must not upload copyrighted content without permission</li>
            <li>You must not use the service for illegal or harmful purposes</li>
            <li>You are responsible for maintaining the security of your account</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Subscription Plans</h2>
          <p className="mb-4">
            We offer Free, Pro, and Premium subscription plans with different features and limits. 
            Subscription fees are billed monthly and are non-refundable except as required by law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
          <p className="mb-4">
            You retain ownership of your original content. We retain ownership of our service, 
            software, and technology. Translated content is provided as-is for your use.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p className="mb-4">
            SubtitleAI is provided "as is" without warranties. We are not liable for any 
            damages arising from your use of the service, including translation accuracy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account at any time for violation of these terms. 
            You may cancel your subscription at any time through your account settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="mb-4">
            For questions about these Terms of Service, contact us at{' '}
            <a href="mailto:legal@subtitleai.com" className="text-blue-600 hover:underline">
              legal@subtitleai.com
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Terms of Service - SubtitleAI',
  description: 'Terms of service for SubtitleAI subtitle translation service',
}
