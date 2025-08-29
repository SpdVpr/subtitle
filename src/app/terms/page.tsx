import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, Shield, Users, CreditCard, Globe, AlertTriangle } from "lucide-react"

export default function TermsPage() {
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
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Terms of Service</h1>
            </div>
            <p className="text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        {/* Terms Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                1. Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using SubtitleAI ("Service", "Platform", "we", "us", or "our"), you ("User", "you", or "your") accept and agree to be bound by the terms and provisions of this agreement ("Terms of Service" or "Terms").
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you do not agree to abide by the above, please do not use this service. These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                2. Description of Service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                SubtitleAI is an AI-powered platform that provides subtitle translation, timing adjustment, and related services. Our Service includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Automated subtitle translation using AI technology</li>
                <li>Subtitle timing synchronization and adjustment</li>
                <li>Batch processing capabilities for multiple files</li>
                <li>Video player with subtitle overlay functionality</li>
                <li>Subtitle search and discovery features</li>
                <li>Analytics and usage tracking</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                3. User Accounts and Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                To access certain features of our Service, you must register for an account. When you create an account, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept all risks of unauthorized access to your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for all activities that occur under your account, whether or not you authorized such activities.
              </p>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                4. Acceptable Use Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Upload, post, or transmit any content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
                <li>Infringe upon the intellectual property rights of others</li>
                <li>Transmit any material that contains viruses, malware, or other harmful computer code</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Use the Service for any commercial purpose without our express written consent</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                <li>Use automated scripts, bots, or other automated means to access the Service</li>
                <li>Violate any applicable local, state, national, or international law</li>
              </ul>
            </CardContent>
          </Card>

          {/* Credits and Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                5. Credits System and Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">5.1 Credits System</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Our Service operates on a credit-based system. Credits are consumed when you use translation and processing features. Credit packages are available for purchase through our platform.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">5.2 Payment Terms</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>All payments are processed securely through Stripe</li>
                  <li>Prices are subject to change with 30 days notice</li>
                  <li>Credits are non-refundable once purchased</li>
                  <li>Credits do not expire unless otherwise specified</li>
                  <li>We reserve the right to modify credit pricing and packages</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">5.3 Refund Policy</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Refunds may be considered on a case-by-case basis for unused credits within 30 days of purchase, subject to our discretion and applicable laws.
                </p>
              </div>
            </CardContent>
          </Card>
          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                6. Intellectual Property Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">6.1 Our Content</h4>
                <p className="text-muted-foreground leading-relaxed">
                  The Service and its original content, features, and functionality are and will remain the exclusive property of SubtitleAI and its licensors. The Service is protected by copyright, trademark, and other laws.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">6.2 User Content</h4>
                <p className="text-muted-foreground leading-relaxed">
                  You retain ownership of any content you upload to our Service. By uploading content, you grant us a non-exclusive, worldwide, royalty-free license to use, modify, and process your content solely for the purpose of providing our services.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">6.3 Copyright Compliance</h4>
                <p className="text-muted-foreground leading-relaxed">
                  You are responsible for ensuring that any content you upload does not infringe upon the intellectual property rights of others. We reserve the right to remove content that violates copyright laws.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy and Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                7. Privacy and Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <div>
                <h4 className="font-semibold text-foreground mb-2">7.1 Data Processing</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>We process your data in accordance with GDPR and other applicable privacy laws</li>
                  <li>Subtitle files are processed temporarily and deleted after processing</li>
                  <li>We use cookies and similar technologies as described in our Cookie Policy</li>
                  <li>You have the right to access, modify, or delete your personal data</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                8. Disclaimers and Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">8.1 Service Availability</h4>
                <p className="text-muted-foreground leading-relaxed">
                  We strive to maintain high service availability but cannot guarantee uninterrupted access. The Service is provided "as is" and "as available" without warranties of any kind.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">8.2 Translation Accuracy</h4>
                <p className="text-muted-foreground leading-relaxed">
                  While we use advanced AI technology, we cannot guarantee the accuracy of translations. Users should review and verify all translated content before use.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">8.3 Limitation of Liability</h4>
                <p className="text-muted-foreground leading-relaxed">
                  To the maximum extent permitted by law, SubtitleAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                9. Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including but not limited to breach of these Terms.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You may terminate your account at any time by contacting us. Upon termination, your right to use the Service will cease immediately, but these Terms will remain in effect.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                10. Governing Law and Dispute Resolution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the European Union and the Czech Republic, without regard to conflict of law provisions.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Any disputes arising from these Terms or your use of the Service will be resolved through binding arbitration, except where prohibited by law.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                11. Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by email or through the Service. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                12. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Email: admin@subtitlebot.com</li>
                <li>Contact Form: <Link href="/contact" className="text-primary hover:underline">Contact Us</Link></li>
                <li>Address: SubtitleBot, Prague, Czech Republic</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">
                Return to Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/privacy">
                Privacy Policy
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            By using SubtitleAI, you acknowledge that you have read and understood these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  )
}
