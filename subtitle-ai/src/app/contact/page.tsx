export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">Contact Us</h1>
        
        <div className="space-y-6 text-white">
          <div>
            <h2 className="text-xl font-semibold mb-2">Get in Touch</h2>
            <p className="text-gray-300">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Email</h3>
            <p className="text-blue-300">support@subtitle-ai.com</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Business Hours</h3>
            <p className="text-gray-300">Monday - Friday: 9:00 AM - 6:00 PM (UTC)</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Response Time</h3>
            <p className="text-gray-300">We typically respond within 24 hours</p>
          </div>
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
