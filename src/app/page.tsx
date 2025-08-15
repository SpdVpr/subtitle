'use client'

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])
  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if user is authenticated (will redirect)
  if (user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="container px-4 py-24 mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            AI-Powered Subtitle
            <span className="text-blue-600"> Translation</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Translate your subtitles with premium AI. Pay only for what you use with our simple credit system.
            Support for 100+ language pairs with context-aware translation.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-8 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              <strong>Simple Pricing:</strong> 0.4 credits per 20 subtitles • No subscriptions • Credits never expire
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/translate">Start Translating</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/pricing">Buy Credits</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/batch">Batch Processing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-16 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose SubtitleAI?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our AI-powered platform makes subtitle translation faster and more accurate than ever before.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>🚀 Lightning Fast</CardTitle>
              <CardDescription>
                Translate entire subtitle files in under 30 seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our optimized AI processes your subtitles quickly while maintaining perfect timing and context.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Context-Aware</CardTitle>
              <CardDescription>
                AI understands movie context for better translations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced AI models consider dialogue flow, character emotions, and cultural nuances.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💰 Pay Per Use</CardTitle>
              <CardDescription>
                Simple credit system - no subscriptions needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Buy credits once, use them forever. Only pay for what you translate with transparent pricing.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">🚀 Powerful Features</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Everything you need for professional subtitle translation
          </p>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📁</span>
              </div>
              <h3 className="font-semibold mb-2">Batch Processing</h3>
              <p className="text-sm text-muted-foreground">
                Upload multiple files and translate them all at once
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Track your usage, credits, and translation history
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="font-semibold mb-2">100+ Languages</h3>
              <p className="text-sm text-muted-foreground">
                Support for all major world languages and dialects
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">Instant Translation</h3>
              <p className="text-sm text-muted-foreground">
                Fast AI-powered translation with context awareness
              </p>
            </div>
          </div>

          <Button size="lg" asChild>
            <Link href="/subtitles-search">Try Subtitle Search</Link>
          </Button>
        </div>
      </section>

      {/* Credits System */}
      <section className="bg-muted/50 py-16">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">💰 Pay-as-you-go Credits</h2>
          <p className="text-muted-foreground mb-8">
            No monthly subscriptions. Only pay for what you use.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2">
                  <span>🎁</span>
                  <span>Welcome Bonus</span>
                </CardTitle>
                <CardDescription>Get started for free</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-green-600">200 Credits</div>
                <div className="text-sm text-muted-foreground">Free on signup</div>
              </CardContent>
              <CardContent className="space-y-2">
                <p>✓ ~500 lines of translation</p>
                <p>✓ Premium AI translation</p>
                <p>✓ No time limit</p>
                <p>✓ Full feature access</p>
              </CardContent>
            </Card>

            <Card className="border-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2">
                  <span>🎬</span>
                  <span>Premium Translation</span>
                </CardTitle>
                <CardDescription>OpenAI GPT-4 with context research</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold">~0.4</div>
                <div className="text-sm text-muted-foreground">credits per 20 lines</div>
              </CardContent>
              <CardContent className="space-y-2">
                <p>✓ Context-aware translation</p>
                <p>✓ Show/movie research</p>
                <p>✓ Cultural adaptation</p>
                <p>✓ Professional quality</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 space-y-4">
            <div className="text-sm text-muted-foreground">
              💡 <strong>1 USD = 100 credits</strong> • Buy credits as needed • No expiration
            </div>
            <Button size="lg" asChild>
              <Link href="/register">Get 200 Free Credits</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
