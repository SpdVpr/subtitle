export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-gray max-w-none">
        <p className="text-lg text-gray-600 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="mb-4">
            We collect information you provide directly to us, such as when you create an account, 
            upload subtitle files, or contact us for support.
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Account information (email, name)</li>
            <li>Subtitle files you upload for translation</li>
            <li>Usage data and analytics</li>
            <li>Payment information (processed securely by Stripe)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide and improve our translation services</li>
            <li>Process your subtitle translations</li>
            <li>Send you service-related communications</li>
            <li>Analyze usage patterns to improve our service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="mb-4">
            We implement appropriate security measures to protect your personal information 
            against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">File Retention</h2>
          <p className="mb-4">
            Uploaded subtitle files are automatically deleted after 30 days. 
            You can download your translated files at any time before deletion.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@subtitleai.com" className="text-blue-600 hover:underline">
              privacy@subtitleai.com
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Privacy Policy - SubtitleAI',
  description: 'Privacy policy for SubtitleAI subtitle translation service',
}
