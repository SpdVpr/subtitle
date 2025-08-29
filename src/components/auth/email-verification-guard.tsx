'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, AlertTriangle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface EmailVerificationGuardProps {
  children: React.ReactNode
  requireVerification?: boolean
  redirectTo?: string
}

export function EmailVerificationGuard({
  children,
  requireVerification = true,
  redirectTo = '/verify-email'
}: EmailVerificationGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push('/login')
      return
    }

    // Redirect to verification page if email not verified and verification is required
    if (!loading && user && requireVerification && !user.emailVerified) {
      router.push(redirectTo)
      return
    }
  }, [user, loading, requireVerification, redirectTo, router])

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login required message
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access this feature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show email verification required message
  if (requireVerification && !user.emailVerified) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle>Email Verification Required</CardTitle>
            <CardDescription>
              Please verify your email address to access translation features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-200">
                You need to verify your email address before you can start translating subtitles.
                This helps us prevent spam and protect your account.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/verify-email">Verify Email Address</Link>
              </Button>
              
              <p className="text-center text-sm text-muted-foreground">
                Verification email sent to: <strong>{user.email}</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User is authenticated and verified (or verification not required)
  return <>{children}</>
}

// Higher-order component version for easier use
export function withEmailVerification<P extends object>(
  Component: React.ComponentType<P>,
  requireVerification = true
) {
  return function WrappedComponent(props: P) {
    return (
      <EmailVerificationGuard requireVerification={requireVerification}>
        <Component {...props} />
      </EmailVerificationGuard>
    )
  }
}
