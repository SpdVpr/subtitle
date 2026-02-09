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
  locale?: 'en' | 'cs'
}

export function EmailVerificationGuard({
  children,
  requireVerification = true,
  redirectTo = '/verify-email',
  locale = 'en'
}: EmailVerificationGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Localized texts
  const texts = {
    en: {
      authRequired: 'Authentication Required',
      pleaseSignIn: 'Please sign in to access this feature',
      signIn: 'Sign In',
      emailVerificationRequired: 'Email Verification Required',
      pleaseVerifyEmail: 'Please verify your email address to access translation features',
      verifyEmailAddress: 'Verify Email Address',
      verificationEmailSent: 'Verification email sent to:',
      needVerification: 'You need to verify your email address before you can start translating subtitles. This helps us prevent spam and protect your account.'
    },
    cs: {
      authRequired: 'Vyžaduje Přihlášení',
      pleaseSignIn: 'Prosím přihlaste se pro přístup k této funkci',
      signIn: 'Přihlásit se',
      emailVerificationRequired: 'Vyžaduje Ověření Emailu',
      pleaseVerifyEmail: 'Prosím ověřte svou emailovou adresu pro přístup k překladovým funkcím',
      verifyEmailAddress: 'Ověřit Emailovou Adresu',
      verificationEmailSent: 'Ověřovací email odeslán na:',
      needVerification: 'Musíte ověřit svou emailovou adresu před začátkem překládání titulků. Pomáhá nám to předcházet spamu a chránit váš účet.'
    }
  }

  const t = texts[locale]

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push(locale === 'cs' ? '/cs/login' : '/login')
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
            <CardTitle>{t.authRequired}</CardTitle>
            <CardDescription>
              {t.pleaseSignIn}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={locale === 'cs' ? '/cs/login' : '/login'}>
                {locale === 'cs' ? 'Přihlásit se' : 'Sign In'}
              </Link>
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
            <CardTitle>{t.emailVerificationRequired}</CardTitle>
            <CardDescription>
              {t.pleaseVerifyEmail}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-200">
                {t.needVerification}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href={locale === 'cs' ? '/cs/verify-email' : '/verify-email'}>
                  {t.verifyEmailAddress}
                </Link>
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {t.verificationEmailSent} <strong>{user.email}</strong>
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
