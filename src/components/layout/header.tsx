"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { isAdmin } from "@/lib/admin-auth"
import { Badge } from "@/components/ui/badge"
import { Shield, Menu, X } from "lucide-react"
import { CreditsDisplay } from "@/components/ui/credits-display"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"

export function Header() {
  const { user, signOut, loading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Detect if we're on Czech pages
  const isCzech = pathname.startsWith('/cs')
  const langPrefix = isCzech ? '/cs' : ''

  // Get navigation labels based on language
  const navLabels = isCzech ? {
    translate: 'Překlad',
    findSubtitles: 'Hledat Titulky',
    videoTools: 'Video Nástroje',
    subtitleEditor: 'Editor Titulků',
    batch: 'Hromadný Překlad',
    buyCredits: 'Koupit Kredity',
    dashboard: 'Dashboard',
    signOut: 'Odhlásit se',
    signIn: 'Přihlásit se',
    getStarted: 'Začít'
  } : {
    translate: 'Translate',
    findSubtitles: 'Find Subtitles',
    videoTools: 'Video Tools',
    subtitleEditor: 'Subtitle Editor',
    batch: 'Batch',
    buyCredits: 'Buy Credits',
    dashboard: 'Dashboard',
    signOut: 'Sign Out',
    signIn: 'Sign In',
    getStarted: 'Get Started'
  }


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={langPrefix || "/"} className="flex items-center space-x-2">
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
          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              href={`${langPrefix}/translate`}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {navLabels.translate}
            </Link>
            {user && (
              <Link
                href={`${langPrefix}/batch`}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {navLabels.batch}
              </Link>
            )}
            <Link
              href={`${langPrefix}/subtitles-search`}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {navLabels.findSubtitles}
            </Link>
            <Link
              href={`${langPrefix}/video-tools`}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {navLabels.videoTools}
            </Link>
            <Link
              href={`${langPrefix}/subtitle-editor`}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {navLabels.subtitleEditor}
            </Link>
            <Link
              href={`${langPrefix}/buy-credits`}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {navLabels.buyCredits}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Language Switcher and Theme Toggle - always visible */}
            <LanguageSwitcher />
            <ThemeToggle />

            {loading ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            ) : user ? (
              <div className="flex items-center space-x-1">
                <CreditsDisplay showBuyButton={false} className="hidden 2xl:flex" />
                <Button variant="ghost" size="sm" asChild className="hidden 2xl:inline-flex px-2">
                  <Link href="/dashboard">{navLabels.dashboard}</Link>
                </Button>
                {user && isAdmin(user) && (
                  <Button variant="ghost" size="sm" asChild className="text-destructive hover:text-destructive/80 px-2">
                    <Link href="/admin" className="flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span className="hidden 2xl:inline">Admin</span>
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => signOut()} className="px-3">
                  <span className="hidden xl:inline">{navLabels.signOut}</span>
                  <span className="xl:hidden">↗</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">{navLabels.signIn}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">{navLabels.getStarted}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur">
            <div className="px-4 py-4 space-y-4">
              {/* Navigation Links */}
              <nav className="space-y-3">
                <Link
                  href={`${langPrefix}/translate`}
                  className="block text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {navLabels.translate}
                </Link>
                {user && (
                  <Link
                    href={`${langPrefix}/batch`}
                    className="block text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {navLabels.batch}
                  </Link>
                )}
                <Link
                  href={`${langPrefix}/subtitles-search`}
                  className="block text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {navLabels.findSubtitles}
                </Link>
                <Link
                  href={`${langPrefix}/video-tools`}
                  className="block text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {navLabels.videoTools}
                </Link>
                <Link
                  href={`${langPrefix}/subtitle-editor`}
                  className="block text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {navLabels.subtitleEditor}
                </Link>
                {user && isAdmin(user) && (
                  <Link
                    href="/admin"
                    className="block text-destructive hover:text-destructive/80 transition-colors font-medium py-2 flex items-center space-x-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <Link
                  href={`${langPrefix}/buy-credits`}
                  className="block text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {navLabels.buyCredits}
                </Link>
              </nav>

              {/* User Actions */}
              <div className="pt-4 border-t border-border space-y-3">
                {loading ? (
                  <div className="h-8 bg-muted animate-pulse rounded" />
                ) : user ? (
                  <div className="space-y-3">
                    <CreditsDisplay showBuyButton={false} className="justify-start" />
                    <div className="flex flex-col space-y-2">
                      <Button variant="ghost" size="sm" asChild className="justify-start">
                        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                          {navLabels.dashboard}
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          signOut()
                          setIsMobileMenuOpen(false)
                        }}
                        className="justify-start"
                      >
                        {navLabels.signOut}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button variant="ghost" size="sm" asChild className="justify-start">
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        {navLabels.signIn}
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="justify-start">
                      <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                        {navLabels.getStarted}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
