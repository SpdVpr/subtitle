import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>

          <div className="text-sm text-gray-500">
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
            {' • '}
            <Link href="/pricing" className="text-blue-600 hover:underline">
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
