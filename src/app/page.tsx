import { StructuredData } from "@/components/seo/structured-data";
import { HeroSectionEn } from "@/components/home/hero-section-en";
import { SubtitleOverlaySectionEn, PopupWindowSectionEn, VideoPlayerSectionEn } from "@/components/home/optimized-image-sections-en";
import { ClientWrapper } from "@/components/home/client-wrapper";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Zap,
  Brain,
  Globe,
  FileText,
  CheckCircle,
  ArrowRight,
  MessageSquare
} from "lucide-react";

export default function Home() {
  return (
    <ClientWrapper loadingText="Loading...">
      <StructuredData locale="en" page="home" />
      <div className="flex flex-col min-h-screen">
        <HeroSectionEn />
        <SubtitleOverlaySectionEn />
        <PopupWindowSectionEn />
        <VideoPlayerSectionEn />

        {/* AI Engine Section */}
        <section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-secondary dark:to-card">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-purple-100 dark:bg-accent text-purple-700 dark:text-primary border-purple-200 dark:border-border">
                <Brain className="h-4 w-4 mr-2" />
                PROPRIETARY AI ENGINE
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                How Our AI Engine Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We combine the best of both worlds - the power of OpenAI with contextual research for unbeatable translation quality.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="border-2 border-purple-200 dark:border-border hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-purple-600 dark:text-primary" />
                  </div>
                  <CardTitle>1. Context Analysis</CardTitle>
                  <CardDescription>
                    Our AI analyzes the entire subtitle file to understand context, characters, and plot.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 border-blue-200 dark:border-border hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-blue-600 dark:text-primary" />
                  </div>
                  <CardTitle>2. AI Translation</CardTitle>
                  <CardDescription>
                    OpenAI GPT-4 translates with full understanding of context and language nuances.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 border-green-200 dark:border-border hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-primary" />
                  </div>
                  <CardTitle>3. Quality Check</CardTitle>
                  <CardDescription>
                    Automatic verification of consistency, grammar, and translation naturalness.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:from-background dark:to-card">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose SubtitleBot?</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The most advanced AI subtitle translator on the market with features you won't find anywhere else.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-blue-600 dark:text-primary" />
                  </div>
                  <CardTitle>Context-Aware AI</CardTitle>
                  <CardDescription>
                    Our AI understands the context of the entire movie or series, not just individual sentences.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-purple-600 dark:text-primary" />
                  </div>
                  <CardTitle>Lightning Fast</CardTitle>
                  <CardDescription>
                    Translate an entire movie in minutes. No waiting, instant results.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-green-600 dark:text-primary" />
                  </div>
                  <CardTitle>100+ Languages</CardTitle>
                  <CardDescription>
                    We support all major world languages including less common ones.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-yellow-600 dark:text-primary" />
                  </div>
                  <CardTitle>No Subscriptions</CardTitle>
                  <CardDescription>
                    Pay only for what you use. Credits never expire.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-red-600 dark:text-primary" />
                  </div>
                  <CardTitle>SRT Format</CardTitle>
                  <CardDescription>
                    Full SRT format support with timing and formatting preservation.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-primary" />
                  </div>
                  <CardTitle>Natural Translations</CardTitle>
                  <CardDescription>
                    AI creates translations that sound natural, not robotic.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
          <div className="container px-4 mx-auto text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Get 100 FREE credits when you sign up. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/translate" className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Start Translating FREE
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white" asChild>
                  <Link href="/pricing">
                    View Pricing
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50 dark:from-background dark:to-card">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Have questions? We have answers.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>How does the credit system work?</CardTitle>
                  <CardDescription>
                    Each subtitle line costs 1 credit. For example, a movie with 500 subtitle lines will cost 500 credits.
                    Credits never expire and you can use them anytime.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What languages do you support?</CardTitle>
                  <CardDescription>
                    We support over 100 languages including English, Spanish, French, German, Japanese, Korean, Chinese, and many more.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How good are the translations?</CardTitle>
                  <CardDescription>
                    Our AI combines OpenAI GPT-4 with contextual research for maximum quality. Translations are
                    natural, contextually correct, and preserve the original meaning.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Can I edit the translated subtitles?</CardTitle>
                  <CardDescription>
                    Yes! Our subtitle editor allows you to edit any translation before downloading. You can also
                    synchronize timing and customize formatting.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Do I need a subscription?</CardTitle>
                  <CardDescription>
                    No! We operate on a credit system. You buy credits once and use them whenever you want.
                    No monthly fees, no commitments.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </ClientWrapper>
  );
}
