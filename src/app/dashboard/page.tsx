'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  FileText,
  Zap,
  Calendar,
  CreditCard,
  Settings,
  TrendingUp,
  Download,
  CheckCircle,
  X
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/stripe'

export default function DashboardPage() {
  const { user } = useAuth()
  const { subscription, usage, createPortalSession } = useSubscription()
  const [loading, setLoading] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const success = searchParams.get('success')
    const plan = searchParams.get('plan')

    if (success && plan) {
      setShowSuccessAlert(true)
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowSuccessAlert(false)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

  const handleManageSubscription = async () => {
    try {
      setLoading(true)
      const { url } = await createPortalSession()
      window.location.href = url
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h1>
          <Button onClick={() => window.location.href = '/login'}>
            Log In
          </Button>
        </div>
      </div>
    )
  }

  const currentPlan = subscription ? SUBSCRIPTION_PLANS[subscription.plan] : SUBSCRIPTION_PLANS.free
  const usagePercentage = currentPlan.limits.translationsPerMonth === -1 
    ? 0 
    : ((usage?.translationsUsed || 0) / currentPlan.limits.translationsPerMonth) * 100

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Success Alert */}
        {showSuccessAlert && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-green-800">
                🎉 Subscription activated successfully! You now have access to {searchParams.get('plan')} features.
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuccessAlert(false)}
                className="h-auto p-1 text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user.email}! Here's your account overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Translations Used</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usage?.translationsUsed || 0}</div>
              <p className="text-xs text-muted-foreground">
                {currentPlan.limits.translationsPerMonth === -1 
                  ? 'Unlimited' 
                  : `of ${currentPlan.limits.translationsPerMonth} this month`
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentPlan.name}</div>
              <p className="text-xs text-muted-foreground">
                {currentPlan.price === 0 ? 'Free' : `${formatPrice(currentPlan.price)}/month`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((usage?.storageUsed || 0) / 1024 / 1024).toFixed(1)} MB
              </div>
              <p className="text-xs text-muted-foreground">
                of {(currentPlan.limits.maxFileSize / 1024 / 1024).toFixed(0)} MB limit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscription?.currentPeriodEnd 
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : 'N/A'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {subscription?.cancelAtPeriodEnd ? 'Canceling' : 'Renewing'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Progress */}
        {currentPlan.limits.translationsPerMonth !== -1 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Monthly Usage</CardTitle>
              <CardDescription>
                Your translation usage for this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Translations</span>
                  <span>{usage?.translationsUsed || 0} / {currentPlan.limits.translationsPerMonth}</span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
                {usagePercentage > 80 && (
                  <p className="text-sm text-orange-600">
                    You're approaching your monthly limit. Consider upgrading to continue using our service.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => window.location.href = '/translate'}
              >
                <FileText className="h-4 w-4 mr-2" />
                Translate New Subtitle
              </Button>

              {subscription && subscription.plan !== 'free' && (
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => window.location.href = '/batch'}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Batch Processing
                </Button>
              )}

              {subscription && (subscription.plan === 'premium' || subscription.plan === 'pro') && (
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => window.location.href = '/analytics'}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              )}

              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => window.location.href = '/pricing'}
              >
                <Zap className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleManageSubscription}
                disabled={loading}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {loading ? 'Loading...' : 'Manage Billing'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan Features</CardTitle>
              <CardDescription>
                What's included in your {currentPlan.name} plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {currentPlan.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              {currentPlan.features.length > 4 && (
                <p className="text-sm text-gray-500 mt-2">
                  +{currentPlan.features.length - 4} more features
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subscription Status */}
        {subscription && subscription.plan !== 'free' && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                      {subscription.status}
                    </Badge>
                    <span className="font-medium">{currentPlan.name} Plan</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {subscription.cancelAtPeriodEnd 
                      ? `Cancels on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                      : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    }
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleManageSubscription}
                  disabled={loading}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


