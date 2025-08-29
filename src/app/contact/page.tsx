import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactForm } from "@/components/forms/contact-form"
import { ArrowLeft, Mail, Clock, MapPin, Phone, MessageCircle, Headphones } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
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
              <MessageCircle className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Contact Us</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have a question, need support, or want to share feedback? We're here to help!
              Send us a message and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-primary" />
                  Quick Contact
                </CardTitle>
                <CardDescription>
                  Need immediate assistance? Here are the fastest ways to reach us.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground">Email Support</h4>
                    <p className="text-sm text-muted-foreground">admin@subtitlebot.com</p>
                    <p className="text-xs text-muted-foreground mt-1">Best for detailed questions</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground">Response Time</h4>
                    <p className="text-sm text-muted-foreground">Within 24 hours</p>
                    <p className="text-xs text-muted-foreground mt-1">Usually much faster!</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground">Business Hours</h4>
                    <p className="text-sm text-muted-foreground">Monday - Friday</p>
                    <p className="text-sm text-muted-foreground">9:00 AM - 6:00 PM (UTC)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked</CardTitle>
                <CardDescription>
                  Common questions and quick answers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-1">How do credits work?</h4>
                  <p className="text-sm text-muted-foreground">
                    Credits are consumed when you translate subtitles. Different features use different amounts.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-1">Can I get a refund?</h4>
                  <p className="text-sm text-muted-foreground">
                    Unused credits can be refunded within 30 days of purchase on a case-by-case basis.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-1">Is my data secure?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! We process files temporarily and delete them after translation. See our Privacy Policy.
                  </p>
                </div>

                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/faq">
                    View All FAQs
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Other Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Other Resources</CardTitle>
                <CardDescription>
                  Additional ways to get help
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                  <Link href="/dashboard">
                    📊 Dashboard
                  </Link>
                </Button>

                <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                  <Link href="/translate">
                    🔄 Translate Subtitles
                  </Link>
                </Button>

                <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                  <Link href="/buy-credits">
                    💳 Buy Credits
                  </Link>
                </Button>

                <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                  <Link href="/analytics">
                    📈 Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
