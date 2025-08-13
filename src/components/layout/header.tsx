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

  // Force navigation function to bypass any blocking
  const forceNavigate = (path: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    console.log('Force navigating to:', path)

    // Use the most aggressive navigation method that cannot be blocked
    setTimeout(() => {
      try {
        // Try router first
        router.push(path)
        console.log('Router.push attempted')

        // If router doesn't work within 100ms, force with window.location
        setTimeout(() => {
          if (window.location.pathname !== path) {
            console.log('Router.push failed, forcing with window.location.replace')
            window.location.replace(path)
          }
        }, 100)
      } catch (error) {
        console.error('All navigation methods failed:', error)
        // Last resort - immediate window.location
        window.location.replace(path)
      }
    }, 0)
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
            <button
              onClick={(e) => forceNavigate('/', e)}
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium bg-transparent border-none cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={(e) => forceNavigate('/translate', e)}
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium bg-transparent border-none cursor-pointer"
            >
              Translate
            </button>
            <button
              onClick={(e) => forceNavigate('/subtitles-search', e)}
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium bg-transparent border-none cursor-pointer"
            >
              Find Subtitles
            </button>
            {user && (
              <button
                onClick={(e) => forceNavigate('/batch', e)}
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium bg-transparent border-none cursor-pointer"
              >
                Batch
              </button>
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
                  onClick={(e) => forceNavigate('/dashboard', e)}
                >
                  Dashboard
                </Button>
                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden lg:inline-flex"
                    onClick={(e) => forceNavigate('/analytics', e)}
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
                  onClick={(e) => forceNavigate('/login', e)}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => forceNavigate('/register', e)}
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
