import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
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
            Translate and retime your subtitles with AI. Fast, accurate, and easy to use.
            Support for 50+ languages with premium quality translation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/translate">Start Translating</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/pricing">View Pricing</Link>
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
              <CardTitle>🌍 50+ Languages</CardTitle>
              <CardDescription>
                Support for major world languages and dialects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                From English to Japanese, Spanish to Arabic - we've got you covered.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="bg-muted/50 py-16">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground mb-8">
            Start free, upgrade when you need more
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Perfect for trying out</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold">$0</div>
              </CardContent>
              <CardContent className="space-y-2">
                <p>✓ 5 translations/month</p>
                <p>✓ Google Translate AI</p>
                <p>✓ Basic SRT export</p>
                <p>✓ 1MB file limit</p>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <CardDescription>For professionals</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold">$9.99<span className="text-sm font-normal">/month</span></div>
              </CardContent>
              <CardContent className="space-y-2">
                <p>✓ Unlimited translations</p>
                <p>✓ OpenAI GPT-4 AI</p>
                <p>✓ Advanced export options</p>
                <p>✓ 10MB file limit</p>
                <p>✓ Batch processing</p>
                <p>✓ Priority support</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/translate">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
