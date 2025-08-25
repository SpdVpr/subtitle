"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { isAdmin } from "@/lib/admin-auth"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"
import { CreditsDisplay } from "@/components/ui/credits-display"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function Header() {
  const { user, signOut, loading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo-sub.png"
                alt="SubtitleBot"
                width={40}
                height={40}
                className="h-10 w-auto"
                priority
              />
              <span className="text-xl font-bold text-primary hidden sm:inline">SubtitleBot</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/translate"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Translate
            </Link>
            <Link
              href="/subtitles-search"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Find Subtitles
            </Link>
            <Link
              href="/video-tools"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Video Tools
            </Link>
            {user && (
              <Link
                href="/batch"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Batch
              </Link>
            )}
            {user && isAdmin(user) && (
              <Link
                href="/admin"
                className="text-destructive hover:text-destructive/80 transition-colors font-medium flex items-center space-x-1"
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
            <Link
              href="/buy-credits"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Buy Credits
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle - always visible */}
            <ThemeToggle />

            {loading ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <CreditsDisplay showBuyButton={false} className="hidden sm:flex" />
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                {user && (
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
