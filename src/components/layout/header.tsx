"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { isAdmin } from "@/lib/admin-auth"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"
import { CreditsDisplay } from "@/components/ui/credits-display"

export function Header() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  // Enhanced navigation function with fallback
  const navigateTo = (path: string, linkName: string) => {
    console.log(`${linkName} clicked - attempting navigation to:`, path)
    console.log('Current URL before navigation:', window.location.href)

    try {
      router.push(path)
      console.log('router.push() called successfully')

      // Check if navigation worked after a short delay
      setTimeout(() => {
        console.log('URL after router.push():', window.location.href)
        if (window.location.pathname !== path) {
          console.log('router.push() failed, using window.location.href as fallback')
          window.location.href = path
        }
      }, 100)
    } catch (error) {
      console.error('router.push() failed with error:', error)
      console.log('Using window.location.href as fallback')
      window.location.href = path
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-blue-600">SubtitleAI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              onClick={(e) => {
                e.preventDefault()
                navigateTo('/', 'Home link')
              }}
            >
              Home
            </Link>
            <Link
              href="/translate"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              onClick={(e) => {
                e.preventDefault()
                navigateTo('/translate', 'Translate link')
              }}
            >
              Translate
            </Link>
            <Link
              href="/subtitles-search"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              onClick={(e) => {
                e.preventDefault()
                navigateTo('/subtitles-search', 'Find Subtitles link')
              }}
            >
              Find Subtitles
            </Link>
            {user && (
              <Link
                href="/batch"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                onClick={(e) => {
                  e.preventDefault()
                  navigateTo('/batch', 'Batch link')
                }}
              >
                Batch
              </Link>
            )}
            {user && isAdmin(user) && (
              <Link
                href="/admin"
                className="text-red-600 hover:text-red-700 transition-colors font-medium flex items-center space-x-1"
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
            <Link
              href="/buy-credits"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Buy Credits
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <CreditsDisplay showBuyButton={false} className="hidden sm:flex" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={(e) => {
                    navigateTo('/dashboard', 'Dashboard button')
                  }}
                >
                  Dashboard
                </Button>
                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden lg:inline-flex"
                    onClick={(e) => {
                      navigateTo('/analytics', 'Analytics button')
                    }}
                  >
                    Analytics
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    navigateTo('/login', 'Sign In button')
                  }}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    navigateTo('/register', 'Get Started button')
                  }}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
