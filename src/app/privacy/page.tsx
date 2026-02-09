export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto bg-white/10 dark:bg-card/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-border/20">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Privacy Policy</h1>
        
        <div className="space-y-6 text-white">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="text-gray-300 dark:text-muted-foreground leading-relaxed">
              We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="text-gray-300 dark:text-muted-foreground leading-relaxed">
              We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
            <p className="text-gray-300 dark:text-muted-foreground leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="text-gray-300 dark:text-muted-foreground leading-relaxed">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">File Processing</h2>
            <p className="text-gray-300 dark:text-muted-foreground leading-relaxed">
              Subtitle files you upload are processed for translation purposes only and are not stored permanently on our servers. Files are automatically deleted after processing.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-300 dark:text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at support@subtitle-ai.com.
            </p>
          </section>
        </div>
        
        <div className="mt-8 text-center">
          <a 
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
