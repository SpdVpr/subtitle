'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Head from 'next/head'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { EmailVerificationService } from '@/lib/email-verification'
import { 
  CheckCircle, 
  XCircle, 
  Mail, 
  Loader2,
  ArrowLeft
} from 'lucide-react'

export default function VerifyEmailPage() {
  const { user, sendVerificationEmail } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading')
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const actionCode = searchParams.get('oobCode')
    const continueUrl = searchParams.get('continueUrl')

    if (actionCode) {
      // Verify email with action code
      verifyEmailWithCode(actionCode, continueUrl)
    } else {
      // Just show verification status
      setStatus('pending')
      setMessage('Check your email for a verification link')
    }
  }, [searchParams])

  const verifyEmailWithCode = async (actionCode: string, continueUrl: string | null) => {
    try {
      await EmailVerificationService.verifyEmail(actionCode)
      setStatus('success')
      setMessage('Your email has been verified successfully!')

      // Redirect after 2 seconds with better UX
      setTimeout(() => {
        const redirectUrl = continueUrl || '/dashboard'
        console.log('Redirecting to:', redirectUrl)

        // Try multiple redirect methods for better compatibility
        if (window.opener) {
          // If opened in popup, close and redirect parent
          window.opener.location.href = redirectUrl
          window.close()
        } else {
          // Normal redirect
          window.location.href = redirectUrl
        }
      }, 2000)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Failed to verify email')
    }
  }

  const handleResendVerification = async () => {
    if (!user) return

    setIsResending(true)
    try {
      await sendVerificationEmail()
      setMessage('Verification email sent! Check your inbox.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to send verification email')
    } finally {
      setIsResending(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />
      case 'error':
        return <XCircle className="h-12 w-12 text-red-500" />
      case 'pending':
        return <Mail className="h-12 w-12 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400'
      case 'error':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-muted-foreground'
    }
  }

  return (
    <>
      {status === 'success' && (
        <Head>
          <meta httpEquiv="refresh" content="3;url=/dashboard" />
        </Head>
      )}
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl">
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
              {status === 'loading' && 'Verifying Email...'}
              {status === 'pending' && 'Verify Your Email'}
            </CardTitle>
            <CardDescription className={getStatusColor()}>
              {message}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {status === 'pending' && user && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
                    We sent a verification link to:
                  </p>
                  <p className="font-medium text-gray-900 dark:text-foreground">{user.email}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
                    Didn't receive the email? Check your spam folder or request a new one.
                  </p>
                  
                  <Button 
                    onClick={handleResendVerification}
                    disabled={isResending}
                    variant="outline"
                    className="w-full"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
                  Redirecting to dashboard in 2 seconds...
                </p>
                <Button
                  onClick={() => {
                    const redirectUrl = '/dashboard'
                    if (window.opener) {
                      window.opener.location.href = redirectUrl
                      window.close()
                    } else {
                      window.location.href = redirectUrl
                    }
                  }}
                  className="w-full"
                >
                  Go to Dashboard Now
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
                    The verification link may be expired or invalid.
                  </p>
                </div>
                
                {user && (
                  <Button 
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send New Verification Email
                      </>
                    )}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            )}

            {!user && status === 'pending' && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Please log in to verify your email address.
                </p>
                <Button onClick={() => router.push('/login')} className="w-full">
                  Log In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  )
}
