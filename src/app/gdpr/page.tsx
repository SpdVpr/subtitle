import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, Eye, Download, Trash2, Edit, CheckCircle, Globe } from "lucide-react"

export default function GDPRPage() {
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
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">GDPR Compliance</h1>
            </div>
            <p className="text-muted-foreground">
              Your data protection rights under the General Data Protection Regulation
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Our Commitment to GDPR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              SubtitleAI is committed to protecting your personal data and respecting your privacy rights 
              under the General Data Protection Regulation (GDPR). This page explains your rights and 
              how we comply with GDPR requirements.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              As a data controller, we ensure that all personal data processing is lawful, fair, 
              transparent, and respects your fundamental rights and freedoms.
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-foreground">Your Data Protection Rights</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Right to Access
              </CardTitle>
              <CardDescription>
                You have the right to know what personal data we hold about you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                You can request a copy of all personal data we have about you, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Account information and profile data</li>
                <li>Usage history and analytics data</li>
                <li>Communication records</li>
                <li>Payment and billing information</li>
              </ul>
              <Button variant="outline" size="sm">
                Request My Data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" />
                Right to Rectification
              </CardTitle>
              <CardDescription>
                You have the right to correct inaccurate or incomplete data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                If any of your personal data is inaccurate or incomplete, you can request that we 
                correct or complete it. You can update most information directly in your account settings.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">
                    Update Account
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/contact">
                    Request Correction
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-primary" />
                Right to Erasure ("Right to be Forgotten")
              </CardTitle>
              <CardDescription>
                You have the right to request deletion of your personal data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                You can request that we delete your personal data in certain circumstances, such as:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>The data is no longer necessary for the original purpose</li>
                <li>You withdraw consent and there's no other legal basis</li>
                <li>The data has been unlawfully processed</li>
                <li>You object to processing and there are no overriding legitimate grounds</li>
              </ul>
              <Button variant="outline" size="sm">
                Request Data Deletion
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Right to Data Portability
              </CardTitle>
              <CardDescription>
                You have the right to receive your data in a portable format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                You can request to receive your personal data in a structured, commonly used, 
                and machine-readable format, and have it transmitted to another service provider.
              </p>
              <Button variant="outline" size="sm">
                Export My Data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Right to Restrict Processing
              </CardTitle>
              <CardDescription>
                You have the right to limit how we process your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                You can request that we restrict the processing of your personal data in certain situations, 
                such as when you contest the accuracy of the data or object to processing.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/contact">
                  Request Processing Restriction
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Right to Object
              </CardTitle>
              <CardDescription>
                You have the right to object to certain types of processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                You can object to processing based on legitimate interests, direct marketing, 
                or processing for scientific/historical research purposes.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/contact">
                  Object to Processing
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Legal Basis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Legal Basis for Processing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              We process your personal data based on the following legal grounds:
            </p>
            <div className="space-y-3">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-foreground">Contract Performance</h4>
                <p className="text-sm text-muted-foreground">
                  Processing necessary to provide our subtitle translation services
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-foreground">Consent</h4>
                <p className="text-sm text-muted-foreground">
                  Marketing communications and optional features (you can withdraw consent anytime)
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-foreground">Legitimate Interest</h4>
                <p className="text-sm text-muted-foreground">
                  Service improvement, fraud prevention, and security measures
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-foreground">Legal Obligation</h4>
                <p className="text-sm text-muted-foreground">
                  Compliance with tax, accounting, and other legal requirements
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection Officer */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Protection Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about your data protection rights or wish to exercise any of them, 
              please contact us:
            </p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Email:</strong> privacy@subtitle-ai.com<br />
                <strong>Subject:</strong> GDPR Request - [Your Request Type]<br />
                <strong>Response Time:</strong> Within 30 days
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              You also have the right to lodge a complaint with your local data protection authority 
              if you believe we have not handled your personal data in accordance with GDPR.
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Take Action</CardTitle>
            <CardDescription>
              Exercise your data protection rights or learn more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button asChild>
                <Link href="/contact">
                  Contact Privacy Team
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/privacy">
                  Privacy Policy
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/cookies">
                  Cookie Policy
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  Account Settings
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
  title: 'GDPR Compliance - SubtitleAI',
  description: 'Learn about your data protection rights under GDPR and how SubtitleAI ensures compliance with data protection regulations.',
}
