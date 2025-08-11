export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
          <p className="text-gray-600 mb-6">
            Have questions about SubtitleAI? We're here to help! Reach out to us using 
            the information below or send us a message.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">General Support</h3>
              <p className="text-gray-600">
                <a href="mailto:support@subtitleai.com" className="text-blue-600 hover:underline">
                  support@subtitleai.com
                </a>
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Technical Issues</h3>
              <p className="text-gray-600">
                <a href="mailto:tech@subtitleai.com" className="text-blue-600 hover:underline">
                  tech@subtitleai.com
                </a>
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Billing & Subscriptions</h3>
              <p className="text-gray-600">
                <a href="mailto:billing@subtitleai.com" className="text-blue-600 hover:underline">
                  billing@subtitleai.com
                </a>
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Business Inquiries</h3>
              <p className="text-gray-600">
                <a href="mailto:business@subtitleai.com" className="text-blue-600 hover:underline">
                  business@subtitleai.com
                </a>
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">How accurate are the translations?</h3>
              <p className="text-gray-600 text-sm">
                Translation accuracy depends on the AI service used. Premium Context AI 
                provides the highest accuracy by understanding context and cultural nuances.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">What file formats are supported?</h3>
              <p className="text-gray-600 text-sm">
                We currently support SRT subtitle files. More formats coming soon!
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">How long are files stored?</h3>
              <p className="text-gray-600 text-sm">
                Files are automatically deleted after 30 days for security and privacy.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Can I cancel my subscription?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can cancel anytime from your dashboard. Your subscription 
                remains active until the end of the billing period.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Response Time</h2>
        <p className="text-gray-600">
          We typically respond to support requests within 24 hours during business days. 
          Premium subscribers receive priority support with faster response times.
        </p>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Contact Us - SubtitleAI',
  description: 'Contact SubtitleAI for support, technical issues, or business inquiries',
}
