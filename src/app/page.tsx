﻿'use client'

import Link from "next/link";
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
  Gift,
  CheckCircle,
  ArrowRight,
  ArrowDown,
  Languages,
  Star
} from "lucide-react";

export default function Home() {
  const { loading } = useAuth()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-card dark:to-background">
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

            <p className="text-xl md:text-2xl text-gray-600 dark:text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Translate your subtitles with our <span className="font-semibold text-blue-600 dark:text-primary">proprietary AI engine</span> that combines
              <span className="font-semibold text-purple-600 dark:text-primary"> OpenAI + Context Research</span> for maximum translation quality.
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

            {/* Live Translation Demo */}
            <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-6 mb-10 max-w-4xl mx-auto shadow-xl dark:bg-card/80 dark:border-border dark:backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Languages className="h-5 w-5 text-blue-600 dark:text-primary" />
                <span className="font-semibold text-gray-800 dark:text-card-foreground">See Translation in Action</span>
              </div>

              {/* Translation Demo */}
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Original English */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">EN</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Original English</span>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-red-500">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:15,340 → 00:02:18,720</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200">This algorithm looks impossible to solve.</div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-red-500">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:19,180 → 00:02:22,560</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200">It's a piece of cake for David.</div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-red-500">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:23,890 → 00:02:26,450</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200">He's been coding since he was twelve.</div>
                    </div>
                  </div>
                </div>

                {/* Arrow - Desktop */}
                <div className="hidden lg:flex items-center justify-center px-4">
                  <div className="flex flex-col items-center">
                    <ArrowRight className="h-8 w-8 text-blue-500 dark:text-primary animate-pulse" />
                    <span className="text-xs text-blue-600 dark:text-primary font-medium mt-1">AI Translation</span>
                  </div>
                </div>

                {/* Arrow - Mobile/Tablet */}
                <div className="lg:hidden flex items-center justify-center py-4 w-full">
                  <div className="flex items-center">
                    <ArrowDown className="h-6 w-6 text-blue-500 dark:text-primary animate-bounce" />
                    <span className="text-xs text-blue-600 dark:text-primary font-medium ml-2">AI Translation</span>
                  </div>
                </div>

                {/* Translated Czech */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">CZ</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Translated Czech</span>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border-l-4 border-blue-600">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:15,340 → 00:02:18,720</div>
                      <div className="text-sm text-gray-800 dark:text-blue-200">Tento algoritmus vypadá neřešitelně.</div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border-l-4 border-blue-600">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:19,180 → 00:02:22,560</div>
                      <div className="text-sm text-gray-800 dark:text-blue-200">Pro Davida je to hračka.</div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border-l-4 border-blue-600">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:23,890 → 00:02:26,450</div>
                      <div className="text-sm text-gray-800 dark:text-blue-200">Programuje už od dvanácti let.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-center text-sm text-gray-600 dark:text-muted-foreground">
                  <span className="font-medium text-blue-600 dark:text-primary">Perfect timing preserved</span> •
                  <span className="font-medium text-green-600 dark:text-green-400"> Natural translations</span> •
                  <span className="font-medium text-purple-600 dark:text-purple-400"> 40+ languages supported</span>
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg" asChild>
                <Link href="/translate" className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Start Translating FREE
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/pricing" className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  View Credit Packages
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-600 dark:text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm">Premium AI Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                <span className="text-sm">Instant Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm">Global Language Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Engine Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-secondary dark:to-card">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 dark:bg-accent text-purple-700 dark:text-primary border-purple-200 dark:border-border">
              <Brain className="h-4 w-4 mr-2" />
              Proprietary AI Technology
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent" style={{ lineHeight: '1.4' }}>
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
                <div className="bg-blue-100 dark:bg-accent p-3 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-600 dark:text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">OpenAI Integration</h3>
                  <p className="text-gray-600 dark:text-muted-foreground">
                    Leverages GPT models for natural, human-like translations that capture the original meaning and tone.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-100 dark:bg-accent p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Context Research</h3>
                  <p className="text-gray-600 dark:text-muted-foreground">
                    Analyzes subtitle context, character relationships, and scene dynamics for more accurate translations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 dark:bg-accent p-3 rounded-lg">
                  <Zap className="h-6 w-6 text-green-600 dark:text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Real-time Processing</h3>
                  <p className="text-gray-600 dark:text-muted-foreground">
                    Lightning-fast translation with intelligent timing adjustment for perfect subtitle synchronization.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-2xl border">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-primary to-primary/80 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Translation Quality</h3>
                <p className="text-muted-foreground">See the difference our AI makes</p>
              </div>

              <div className="space-y-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive font-medium mb-1">Basic Translation:</p>
                  <p className="text-sm text-muted-foreground">"I am very happy to see you"</p>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-primary font-medium mb-1">Our AI Translation:</p>
                  <p className="text-sm text-muted-foreground">"I'm absolutely thrilled to see you!"</p>
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
      <section className="container px-4 py-20 mx-auto bg-background dark:bg-background">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose SubtitleAI?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need for professional subtitle translation, powered by cutting-edge AI technology.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Lightning Fast</CardTitle>
              <CardDescription className="text-base">
                Translate entire subtitle files in under 30 seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Our optimized AI processes your subtitles quickly while maintaining perfect timing and context.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="bg-purple-100 dark:bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-purple-600 dark:text-primary" />
              </div>
              <CardTitle className="text-xl">Context-Aware AI</CardTitle>
              <CardDescription className="text-base">
                AI understands movie context for better translations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Advanced AI models consider dialogue flow, character emotions, and cultural nuances.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Pay Per Use</CardTitle>
              <CardDescription className="text-base">
                Simple credit system - no subscriptions needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Buy credits once, use them forever. Only pay for what you translate with transparent pricing.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Powerful Features Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-muted dark:to-accent">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">🚀 Powerful Features</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Everything you need for professional subtitle translation
          </p>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📁</span>
              </div>
              <h3 className="font-semibold mb-2">Batch Processing</h3>
              <p className="text-sm text-muted-foreground">
                Upload multiple files and translate them all at once
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📺</span>
              </div>
              <h3 className="font-semibold mb-2">Subtitle Overlay</h3>
              <p className="text-sm text-muted-foreground">
                Display subtitles over any video with full customization
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="font-semibold mb-2">100+ Languages</h3>
              <p className="text-sm text-muted-foreground">
                Support for all major world languages and dialects
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">Instant Translation</h3>
              <p className="text-sm text-muted-foreground">
                Fast AI-powered translation with context awareness
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/subtitles-search">Try Subtitle Search</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/subtitle-editor">Try Subtitle Editor</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/video-tools">Try Picture-in-Picture</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/video-tools">Try Video Player</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Subtitle Overlay Feature Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-background dark:via-card dark:to-background">
        <div className="container px-4 mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white">
                <span className="text-2xl mr-2">📺</span>
                NEW FEATURE
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent" style={{ lineHeight: '1.4' }}>
                Subtitle Overlay
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Display subtitles over any video content with full customization. Perfect for streaming services,
                video players, and online content where external subtitle loading isn't available.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-indigo-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">🎨</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Full Customization</h3>
                      <p className="text-muted-foreground">
                        Customize font, size, colors, background, shadows, and positioning.
                        Make subtitles look exactly how you want them.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-cyan-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Drag & Drop Positioning</h3>
                      <p className="text-muted-foreground">
                        Simply drag the overlay anywhere on your screen. Smart snapping to edges
                        and center alignment for perfect positioning.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">⏱️</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Perfect Synchronization</h3>
                      <p className="text-muted-foreground">
                        Fine-tune timing with offset controls and speed multipliers.
                        Get perfect sync with any video content.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">🌐</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Universal Compatibility</h3>
                      <p className="text-muted-foreground">
                        Works with any video player, streaming service, or online content.
                        No need for special software or plugins.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white" asChild>
                    <Link href="/subtitle-editor" className="flex items-center gap-2">
                      <span className="text-xl">📺</span>
                      Try Subtitle Editor Now
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-2xl">
                  <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-4 relative overflow-hidden">
                    <img
                      src="/images/gladiator.webp"
                      alt="Gladiator movie scene - Russell Crowe as Maximus"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>

                    {/* Simulated subtitle overlay */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded text-sm font-medium">
                      Perfect subtitle positioning anywhere on screen
                    </div>
                  </div>

                  <div className="text-white/60 text-xs text-center">
                    Overlay works with any video player or streaming service
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credits System */}
      <section className="bg-muted/50 dark:bg-card py-16">
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
                <div className="text-3xl font-bold text-primary">200 Credits</div>
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
                <div className="text-3xl font-bold">~0.7</div>
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

      {/* Popup Window Feature Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-background dark:via-card dark:to-background">
        <div className="container px-4 mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <span className="text-2xl mr-2">🪟</span>
                NO INSTALLATION NEEDED
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent" style={{ lineHeight: '1.4' }}>
                Popup Window Solution
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Open a subtitle window that stays on top of any video. No browser extensions,
                no installations - just click and use instantly!
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Instant Setup</h3>
                      <p className="text-muted-foreground">
                        No browser extensions or software to install. Works immediately
                        in any modern web browser.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-emerald-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Always On Top</h3>
                      <p className="text-muted-foreground">
                        The subtitle window stays above all other windows, perfect for
                        Netflix, YouTube, or any video player.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-teal-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">🎨</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Transparent Background</h3>
                      <p className="text-muted-foreground">
                        Clean, transparent overlay that doesn't interfere with your video.
                        Customize colors, fonts, and positioning.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-cyan-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">🖱️</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Easy Positioning</h3>
                      <p className="text-muted-foreground">
                        Drag the window anywhere on your screen. Position remembers
                        your preference for next time.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white" asChild>
                    <Link href="/video-tools" className="flex items-center gap-2">
                      <span className="text-xl">🪟</span>
                      Try Picture-in-Picture Now
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-2xl">
                  {/* Main browser window mockup */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg mb-4">
                    <div className="flex items-center space-x-2 p-3 border-b border-gray-200 dark:border-gray-600">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-600 rounded px-3 py-1 text-xs text-gray-600 dark:text-gray-300">
                        netflix.com/watch/movie
                      </div>
                    </div>
                    <div className="aspect-video bg-black rounded-b-lg flex items-center justify-center relative overflow-hidden">
                      <img
                        src="/images/SouthPark.webp"
                        alt="South Park episode scene"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Popup window mockup */}
                  <div className="absolute -top-4 -right-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 shadow-2xl border-2 border-green-400">
                    <div className="text-white text-center text-sm font-medium">
                      Perfect subtitle positioning
                    </div>
                    <div className="text-xs text-green-400 mt-1 text-center">
                      ↑ Popup Window
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Player Feature Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-background dark:via-card dark:to-background">
        <div className="container px-4 mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <span className="text-2xl mr-2">🎬</span>
                ALL-IN-ONE SOLUTION
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ lineHeight: '1.4' }}>
                Integrated Video Player
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Watch any video with custom subtitles in one place. Perfect synchronization,
                full customization, and support for all major video platforms.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">🔗</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Universal Video Support</h3>
                      <p className="text-muted-foreground">
                        Works with YouTube, Vimeo, direct video links, and any embeddable
                        video content. Just paste the URL and start watching.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-pink-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Perfect Synchronization</h3>
                      <p className="text-muted-foreground">
                        Subtitles are perfectly synced with video playback. Automatic timing
                        with manual fine-tuning controls for perfect alignment.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-indigo-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">🎨</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Complete Customization</h3>
                      <p className="text-muted-foreground">
                        Full control over subtitle appearance - fonts, colors, positioning,
                        opacity, and effects. Make it look exactly how you want.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-cyan-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">All-in-One Interface</h3>
                      <p className="text-muted-foreground">
                        Everything in one place - video player, subtitle controls, and
                        customization options. No need to juggle multiple windows.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white" asChild>
                    <Link href="/video-tools" className="flex items-center gap-2">
                      <span className="text-xl">🎬</span>
                      Try Video Player Now
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl p-6 shadow-2xl">
                  {/* Video player mockup */}
                  <div className="bg-black rounded-lg aspect-video mb-4 relative overflow-hidden">
                    <img
                      src="/images/solo-leveling.jpeg"
                      alt="Solo Leveling anime scene"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30"></div>

                    {/* Subtitle overlay mockup */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded text-sm font-medium">
                      Perfect subtitle integration
                    </div>
                  </div>

                  {/* Controls mockup */}
                  <div className="bg-gray-800 rounded p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs">▶</span>
                      </div>
                      <div className="flex-1 bg-gray-700 rounded h-1">
                        <div className="bg-purple-500 h-1 rounded w-1/3"></div>
                      </div>
                      <div className="text-white text-xs">2:34</div>
                    </div>
                    <div className="text-gray-400 text-xs text-center">
                      Integrated video controls + subtitle customization
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}