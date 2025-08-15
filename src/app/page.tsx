'use client'

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  Sparkles,
  Zap,
  Brain,
  Globe,
  FileText,
  BarChart3,
  Gift,
  CheckCircle,
  ArrowRight,
  Star
} from "lucide-react";

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
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container px-4 py-24 mx-auto text-center relative">
          <div className="max-w-5xl mx-auto">
            {/* Free Credits Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full mb-8 shadow-lg">
              <Gift className="h-5 w-5" />
              <span className="font-semibold">🎉 New users get 200 FREE credits to start!</span>
              <Sparkles className="h-5 w-5" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              AI-Powered Subtitle Translation
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Translate your subtitles with our <span className="font-semibold text-blue-600">proprietary AI engine</span> that combines
              <span className="font-semibold text-purple-600"> OpenAI + Context Research</span> for maximum translation quality.
            </p>

            {/* Key Features Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                100+ Language Pairs
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Context-Aware AI
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                No Subscriptions
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Credits Never Expire
              </Badge>
            </div>

            {/* Pricing Info Card */}
            <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-6 mb-10 max-w-lg mx-auto shadow-xl">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-800">Simple Pricing</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-2">0.4 credits per 20 subtitles</p>
              <p className="text-sm text-gray-600">
                Example: 100 subtitles = 2 credits • No hidden fees • Pay only for what you use
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" asChild>
                <Link href="/translate" className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Start Translating FREE
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50" asChild>
                <Link href="/pricing" className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  View Credit Packages
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-500">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-sm">Premium AI Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Instant Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Global Language Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Engine Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-800 border-purple-200">
              <Brain className="h-4 w-4 mr-2" />
              Proprietary AI Technology
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Advanced Translation Engine
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our custom-built AI combines the power of OpenAI with specialized context research
              to deliver translations that understand nuance, emotion, and cultural context.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">OpenAI Integration</h3>
                  <p className="text-gray-600">
                    Leverages GPT models for natural, human-like translations that capture the original meaning and tone.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Context Research</h3>
                  <p className="text-gray-600">
                    Analyzes subtitle context, character relationships, and scene dynamics for more accurate translations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Real-time Processing</h3>
                  <p className="text-gray-600">
                    Lightning-fast translation with intelligent timing adjustment for perfect subtitle synchronization.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Translation Quality</h3>
                <p className="text-gray-600">See the difference our AI makes</p>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-medium mb-1">Basic Translation:</p>
                  <p className="text-sm text-gray-700">"I am very happy to see you"</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 font-medium mb-1">Our AI Translation:</p>
                  <p className="text-sm text-gray-700">"I'm absolutely thrilled to see you!"</p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Star className="h-4 w-4 mr-1" />
                  95% Accuracy Rate
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-20 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose SubtitleAI?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need for professional subtitle translation, powered by cutting-edge AI technology.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Lightning Fast</CardTitle>
              <CardDescription className="text-base">
                Translate entire subtitle files in under 30 seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Our optimized AI processes your subtitles quickly while maintaining perfect timing and context.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Context-Aware AI</CardTitle>
              <CardDescription className="text-base">
                AI understands movie context for better translations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Advanced AI models consider dialogue flow, character emotions, and cultural nuances.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Pay Per Use</CardTitle>
              <CardDescription className="text-base">
                Simple credit system - no subscriptions needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
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
