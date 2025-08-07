"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useSubscription } from "@/hooks/useSubscription"
import { isAdmin } from "@/lib/admin-auth"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"

export function Header() {
  const { user, signOut, loading } = useAuth()
  const { subscription } = useSubscription()

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
            >
              Home
            </Link>
            <Link
              href="/translate"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Translate
            </Link>
            {user && subscription && subscription.plan !== 'free' && (
              <Link
                href="/batch"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
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
              href="/pricing"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Pricing
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                {subscription && (
                  <Badge
                    variant={subscription.plan === 'pro' ? 'default' : subscription.plan === 'premium' ? 'secondary' : 'outline'}
                    className="capitalize hidden sm:inline-flex"
                  >
                    {subscription.plan}
                  </Badge>
                )}
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                {subscription && (subscription.plan === 'premium' || subscription.plan === 'pro') && (
                  <Button variant="ghost" size="sm" asChild className="hidden lg:inline-flex">
                    <Link href="/analytics">Analytics</Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
