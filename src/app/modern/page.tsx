'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Zap,
  Brain,
  Globe,
  FileText,
  Gift,
  CheckCircle,
  ArrowRight,
  Languages,
  Star,
  Clock,
  Shield,
  Layers,
  Video,
  Download,
  Upload
} from "lucide-react";

export default function EnglishHomeModern() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-white dark:bg-black">

      {/* Hero Section - Minimalist Black/White + Orange */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        {/* Subtle animated background */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="container px-4 py-20 mx-auto relative z-10">
          <div className="max-w-7xl mx-auto">

            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Left Column - Content */}
              <div className="space-y-10 animate-fade-in-up">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  <Gift className="h-4 w-4" />
                  100 Free Credits
                </div>

                {/* Clean Title */}
                <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-black dark:text-white">
                  AI Subtitle
                  <br />
                  Translation
                </h1>

                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
                  Professional subtitle translation powered by AI.
                  <span className="text-black dark:text-white font-semibold"> Fast, accurate, and context-aware.</span>
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-8 pt-4">
                  <div>
                    <div className="text-4xl font-black text-black dark:text-white">100+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Languages</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-black dark:text-white">&lt;30s</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Processing</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-black dark:text-white">95%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Accuracy</div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    size="lg"
                    className="text-lg px-10 py-7 bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-none font-bold group"
                    asChild
                  >
                    <Link href="/translate" className="flex items-center gap-3">
                      Start Free
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-10 py-7 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 rounded-none font-bold"
                    asChild
                  >
                    <Link href="/pricing">
                      View Pricing
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right Column - Demo */}
              <div className="relative animate-fade-in-up animation-delay-300">

                {/* Minimalist Demo Card */}
                <div className="relative bg-white dark:bg-black border-2 border-black dark:border-white p-8 shadow-2xl">

                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="font-bold text-sm text-black dark:text-white uppercase tracking-wider">Live Demo</span>
                    </div>
                    <Languages className="h-5 w-5 text-gray-400" />
                  </div>

                  {/* Translation Example */}
                  <div className="space-y-6">
                    {/* Original */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-bold">
                          EN
                        </div>
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Original</span>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-4 py-3">
                        <div className="text-xs text-gray-400 font-mono mb-2">00:02:15 → 00:02:18</div>
                        <div className="text-lg font-medium text-black dark:text-white">This algorithm looks impossible to solve.</div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center">
                      <ArrowRight className="h-6 w-6 text-orange-500 rotate-90" />
                    </div>

                    {/* Translated */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 bg-orange-500 text-white text-xs font-bold">
                          ES
                        </div>
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Translated</span>
                      </div>
                      <div className="border-l-4 border-black dark:border-white pl-4 py-3 bg-gray-50 dark:bg-gray-900">
                        <div className="text-xs text-gray-400 font-mono mb-2">00:02:15 → 00:02:18</div>
                        <div className="text-lg font-medium text-black dark:text-white">Este algoritmo parece imposible de resolver.</div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Info */}
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-600 dark:text-gray-400">✓ Perfect timing preserved</span>
                      <span className="text-gray-600 dark:text-gray-400">✓ Context-aware</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Minimalist Grid */}
      <section className="py-32 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container px-4 mx-auto">
          <div className="max-w-7xl mx-auto">

            {/* Section Header */}
            <div className="mb-20">
              <h2 className="text-5xl md:text-7xl font-black text-black dark:text-white mb-6">
                Why SubtitleBot?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
                Professional-grade AI translation with features that matter.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Lightning Fast",
                  description: "Translate entire subtitle files in under 30 seconds",
                  detail: "Optimized AI processing with perfect timing preservation"
                },
                {
                  icon: Brain,
                  title: "Context-Aware AI",
                  description: "Understands movie context and dialogue flow",
                  detail: "Considers character relationships and scene dynamics"
                },
                {
                  icon: Globe,
                  title: "100+ Languages",
                  description: "Support for all major language pairs",
                  detail: "From English to Japanese, Spanish to Korean"
                },
                {
                  icon: FileText,
                  title: "7 File Formats",
                  description: "All major subtitle formats supported",
                  detail: "SRT, VTT, ASS, SSA, SUB, SBV, TXT"
                },
                {
                  icon: Shield,
                  title: "No Subscription",
                  description: "Simple credit-based system",
                  detail: "Buy once, use forever. Credits never expire"
                },
                {
                  icon: Clock,
                  title: "Perfect Timing",
                  description: "Maintains original subtitle timing",
                  detail: "Automatic sync adjustment when needed"
                }
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-orange-500 dark:hover:border-orange-500 transition-all duration-300 bg-white dark:bg-black rounded-none shadow-none hover:shadow-2xl"
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-black dark:bg-white flex items-center justify-center mb-4 group-hover:bg-orange-500 dark:group-hover:bg-orange-500 transition-colors duration-300">
                      <feature.icon className="h-6 w-6 text-white dark:text-black group-hover:text-white dark:group-hover:text-white" />
                    </div>
                    <CardTitle className="text-2xl font-black text-black dark:text-white mb-2">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base text-gray-600 dark:text-gray-400 font-semibold">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {feature.detail}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="container px-4 mx-auto">
          <div className="max-w-7xl mx-auto">

            <div className="mb-20">
              <h2 className="text-5xl md:text-7xl font-black text-black dark:text-white mb-6">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
                Three simple steps to professional subtitle translation.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
              {[
                {
                  number: "01",
                  icon: Upload,
                  title: "Upload Subtitles",
                  description: "Drop your subtitle file or paste the text directly. We support all major formats."
                },
                {
                  number: "02",
                  icon: Languages,
                  title: "Select Languages",
                  description: "Choose source and target languages from 100+ options. AI detects context automatically."
                },
                {
                  number: "03",
                  icon: Download,
                  title: "Download Result",
                  description: "Get your professionally translated subtitles in seconds. Perfect timing guaranteed."
                }
              ].map((step, index) => (
                <div key={index} className="relative">
                  {/* Connector Line */}
                  {index < 2 && (
                    <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gray-200 dark:bg-gray-800 -z-10"></div>
                  )}

                  <div className="space-y-6">
                    <div className="flex items-start gap-6">
                      <div className="text-8xl font-black text-gray-100 dark:text-gray-900 leading-none">
                        {step.number}
                      </div>
                      <div className="w-16 h-16 bg-orange-500 flex items-center justify-center mt-4">
                        <step.icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-black dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container px-4 mx-auto">
          <div className="max-w-7xl mx-auto">

            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-7xl font-black text-black dark:text-white mb-6">
                Simple Pricing
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Pay only for what you use. No subscriptions, no hidden fees.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

              {/* Free Credits */}
              <Card className="relative overflow-hidden border-2 border-orange-500 bg-white dark:bg-black rounded-none shadow-2xl">
                <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 text-xs font-bold">
                  POPULAR
                </div>
                <CardHeader className="pt-12">
                  <div className="text-6xl font-black text-black dark:text-white mb-4">100</div>
                  <CardTitle className="text-3xl font-black text-black dark:text-white">
                    Free Credits
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                    Start translating immediately
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pb-12">
                  <ul className="space-y-4">
                    {[
                      "~250 lines of translation",
                      "Premium AI translation",
                      "All features included",
                      "No time limit",
                      "No credit card required"
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 rounded-none text-lg" asChild>
                    <Link href="/register">Get Free Credits</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Premium Translation */}
              <Card className="relative overflow-hidden border-2 border-black dark:border-white bg-white dark:bg-black rounded-none shadow-2xl">
                <CardHeader className="pt-12">
                  <div className="text-6xl font-black text-black dark:text-white mb-4">0.8-2.0</div>
                  <CardTitle className="text-3xl font-black text-black dark:text-white">
                    Credits per 20 lines
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                    Standard (0.8) or Premium (2.0) quality
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pb-12">
                  <ul className="space-y-4">
                    {[
                      "Context-aware translation",
                      "Movie/series research",
                      "Cultural adaptation",
                      "Professional quality",
                      "Credits never expire"
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <CheckCircle className="h-5 w-5 text-black dark:text-white flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold py-6 rounded-none text-lg" asChild>
                    <Link href="/pricing">View All Packages</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                <strong className="text-black dark:text-white">1 USD = 100 credits</strong> • Buy as needed • No expiration
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-black dark:bg-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-20 right-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center space-y-12">
              <h2 className="text-6xl md:text-8xl font-black text-white dark:text-black leading-[0.9]">
                Ready to
                <br />
                Get Started?
              </h2>

              <p className="text-2xl text-white/80 dark:text-black/80 max-w-2xl mx-auto">
                Join thousands of content creators using SubtitleBot for professional subtitle translation.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <Button
                  size="lg"
                  className="text-xl px-12 py-8 bg-orange-500 hover:bg-orange-600 text-white shadow-2xl font-black rounded-none group"
                  asChild
                >
                  <Link href="/register" className="flex items-center gap-3">
                    Start Free
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="text-xl px-12 py-8 border-2 border-white dark:border-black text-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white shadow-2xl font-black rounded-none"
                  asChild
                >
                  <Link href="/translate">
                    Try Demo
                  </Link>
                </Button>
              </div>

              <div className="pt-12 flex flex-wrap justify-center items-center gap-8 text-white/60 dark:text-black/60 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>100 free credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Instant access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

