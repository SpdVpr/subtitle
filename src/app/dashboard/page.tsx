'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  FileText,
  Zap,
  Calendar,
  TrendingUp,
  CheckCircle,
  X,
  Coins,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { CreditsCard } from '@/components/ui/credits-display'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const success = searchParams.get('success')
    const credits = searchParams.get('credits')

    if (success && credits) {
      setShowSuccessAlert(true)
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowSuccessAlert(false)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Success Alert */}
        {showSuccessAlert && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex items-center justify-between">
                <span>
                  🎉 Credits purchased successfully! You can now use premium translation features.
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuccessAlert(false)}
                  className="text-green-600 hover:text-green-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.displayName || user.email}!
          </h1>
          <p className="text-gray-600">
            Here's your account overview and translation activity.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Credits & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Credits Card */}
            <CreditsCard />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-between">
                  <Link href="/translate">
                    <span>Translate Subtitles</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-between">
                  <Link href="/subtitles-search">
                    <span>Find Subtitles</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-between">
                  <Link href="/batch">
                    <span>Batch Processing</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Usage Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span>Translations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    0
                  </div>
                  <p className="text-sm text-gray-600">
                    Files translated this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span>Credits Used</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    0.0
                  </div>
                  <p className="text-sm text-gray-600">
                    Credits spent this month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>
                  Your latest translation jobs and purchases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No activity yet</p>
                  <p className="text-sm">
                    Start by translating your first subtitle file!
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/translate">Get Started</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Getting Started Guide */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900">🚀 Getting Started</CardTitle>
                <CardDescription className="text-blue-700">
                  Make the most of your credits with these tips
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Upload your SRT file</p>
                    <p className="text-sm text-blue-700">Support for various subtitle formats</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Choose your AI service</p>
                    <p className="text-sm text-blue-700">Standard (~0.1 credits) or Premium (~0.2 credits) per 20 lines</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Download your translation</p>
                    <p className="text-sm text-blue-700">Get professional-quality results in seconds</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
