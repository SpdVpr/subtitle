'use client'

import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Crown, AlertCircle } from 'lucide-react'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const { subscription, canPerformAction } = useSubscription()

  // Check if user can access analytics (Pro feature)
  // const analyticsCheck = canPerformAction('analytics' as any)

  if (!user) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
          <p className="text-gray-600 mb-8">
            Please log in to access your analytics dashboard
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Log In
          </Button>
        </div>
      </div>
    )
  }

  // Allow all logged-in users to access analytics
  const hasAnalyticsAccess = true

  if (!hasAnalyticsAccess) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Get detailed insights into your translation usage and performance
            </p>
          </div>

          <Card className="border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-950/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span>Analytics - Premium Feature</span>
              </CardTitle>
              <CardDescription>
                Advanced analytics and insights are available for Premium and Pro subscribers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400 mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Upgrade to Premium or Pro to unlock analytics</span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">What you&apos;ll get with Premium:</h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-foreground">
                      <li>• Translation usage statistics</li>
                      <li>• Language breakdown charts</li>
                      <li>• Processing time analytics</li>
                      <li>• Success rate tracking</li>
                      <li>• Recent activity timeline</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Pro features include:</h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-foreground">
                      <li>• Advanced performance metrics</li>
                      <li>• Custom date range analysis</li>
                      <li>• Export analytics reports</li>
                      <li>• API usage statistics</li>
                      <li>• Detailed error analysis</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={() => window.location.href = '/pricing'}>
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview of what analytics would look like */}
          <div className="mt-8 space-y-6 opacity-50 pointer-events-none">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { title: 'Total Translations', value: '247', icon: '🌐' },
                { title: 'Files Processed', value: '156', icon: '📁' },
                { title: 'Avg. Processing Time', value: '2.3s', icon: '⏱️' },
                { title: 'Success Rate', value: '98.5%', icon: '✅' },
              ].map((metric, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                      </div>
                      <span className="text-2xl">{metric.icon}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Translation Activity</CardTitle>
                <CardDescription>Your translation history and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 dark:bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 dark:text-muted-foreground mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-muted-foreground">Interactive charts and graphs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <AnalyticsDashboard />
    </div>
  )
}
