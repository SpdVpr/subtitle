import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Cookie, Shield, Settings, BarChart3, Globe } from "lucide-react"

export default function CookiePolicyPage() {
  const lastUpdated = "December 25, 2024"

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
              <Cookie className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Cookie Policy</h1>
            </div>
            <p className="text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What Are Cookies?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and 
              understanding how you use our service.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This Cookie Policy explains what cookies we use, why we use them, and how you can 
              control them.
            </p>
          </CardContent>
        </Card>

        {/* Types of Cookies */}
        <div className="space-y-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Essential Cookies
              </CardTitle>
              <CardDescription>
                Required for the website to function properly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                These cookies are necessary for our website to work correctly. They enable core 
                functionality such as security, network management, and accessibility.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Examples:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Authentication cookies to keep you logged in</li>
                  <li>Security cookies to prevent fraud</li>
                  <li>Load balancing cookies for optimal performance</li>
                  <li>Session cookies for form submissions</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Can be disabled:</strong> No - these are essential for the website to function
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Analytics Cookies
              </CardTitle>
              <CardDescription>
                Help us understand how visitors use our website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                These cookies collect information about how you use our website, such as which 
                pages you visit and how long you spend on each page. This helps us improve 
                our service.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Examples:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Google Analytics cookies</li>
                  <li>Page view tracking</li>
                  <li>User journey analysis</li>
                  <li>Performance monitoring</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Can be disabled:</strong> Yes - through your browser settings or our cookie preferences
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Functional Cookies
              </CardTitle>
              <CardDescription>
                Remember your preferences and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                These cookies remember choices you make to improve your experience, such as 
                your preferred language or theme settings.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Examples:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Theme preference (light/dark mode)</li>
                  <li>Language selection</li>
                  <li>Recently used features</li>
                  <li>User interface preferences</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Can be disabled:</strong> Yes - but some features may not work as expected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Third-Party Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Third-Party Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              We use some third-party services that may set their own cookies:
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-foreground">Google Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  Helps us understand website usage and improve our service.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-foreground">Stripe</h4>
                <p className="text-sm text-muted-foreground">
                  Processes payments securely and prevents fraud.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-foreground">Firebase</h4>
                <p className="text-sm text-muted-foreground">
                  Provides authentication and database services.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Managing Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Managing Your Cookie Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              You have several options for managing cookies:
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Browser Settings</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Most browsers allow you to control cookies through their settings:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Block all cookies</li>
                  <li>Block third-party cookies only</li>
                  <li>Delete cookies when you close your browser</li>
                  <li>Get notified when cookies are set</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Our Cookie Preferences</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  You can manage your cookie preferences for our website specifically:
                </p>
                <Button variant="outline" size="sm">
                  Manage Cookie Preferences
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Questions About Cookies?</CardTitle>
            <CardDescription>
              If you have any questions about our use of cookies, please contact us.
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
                <Link href="/privacy">
                  Privacy Policy
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
  title: 'Cookie Policy - SubtitleAI',
  description: 'Learn about how SubtitleAI uses cookies to improve your experience and how you can manage your cookie preferences.',
}
