import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Zap, Globe, Users, Target, Heart, Award, Lightbulb } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">About SubtitleAI</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Empowering creators worldwide with AI-powered subtitle translation and timing tools.
            </p>
          </div>
        </div>

        {/* Mission */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              At SubtitleAI, we believe that language should never be a barrier to sharing great content. 
              Our mission is to make subtitle translation fast, accurate, and accessible to creators worldwide, 
              enabling them to reach global audiences with ease.
            </p>
          </CardContent>
        </Card>

        {/* Story */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Our Story
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              SubtitleAI was born from a simple frustration: the time-consuming and expensive process of 
              translating subtitles for video content. As content creators ourselves, we experienced firsthand 
              the challenges of reaching international audiences.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We saw an opportunity to leverage cutting-edge AI technology to solve this problem. By combining 
              advanced machine learning with intuitive design, we created a platform that makes subtitle 
              translation not just possible, but enjoyable.
            </p>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Global Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We're committed to breaking down language barriers and making content accessible to everyone, 
                regardless of their native language.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Quality First
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We use state-of-the-art AI models and continuously improve our algorithms to deliver 
                the highest quality translations possible.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Creator-Focused
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Every feature we build is designed with creators in mind. We listen to feedback and 
                continuously evolve to meet your needs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your content is precious. We process files securely and delete them immediately after 
                translation, ensuring your privacy is always protected.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Technology */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Our Technology
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              SubtitleBot leverages the latest advances in artificial intelligence and natural language processing:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Advanced neural machine translation models for accurate translations</li>
              <li>Context-aware processing that understands subtitle timing and formatting</li>
              <li>Multi-language support with specialized models for different language pairs</li>
              <li>Real-time processing with optimized infrastructure for fast results</li>
              <li>Continuous learning from user feedback to improve translation quality</li>
            </ul>
          </CardContent>
        </Card>

        {/* Team */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Our Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              We're a passionate team of developers, linguists, and content creators based in Prague, Czech Republic. 
              Our diverse backgrounds in AI, software engineering, and media production give us unique insights 
              into the challenges creators face and the solutions they need.
            </p>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
            <CardDescription>
              Have questions or want to learn more about SubtitleAI?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/translate">
                  Try SubtitleAI
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/buy-credits">
                  Get Credits
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'About Us - SubtitleAI',
  description: 'Learn about SubtitleAI\'s mission to make subtitle translation accessible to creators worldwide through AI technology.',
}
