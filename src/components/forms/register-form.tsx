'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { Chrome, Loader2, AlertCircle, Mail } from 'lucide-react'

const createRegisterSchema = (locale: 'en' | 'cs' = 'en') => {
  const messages = {
    en: {
      invalidEmail: 'Invalid email address',
      passwordMin: 'Password must be at least 6 characters',
      passwordsDontMatch: "Passwords don't match"
    },
    cs: {
      invalidEmail: 'Neplatná emailová adresa',
      passwordMin: 'Heslo musí mít alespoň 6 znaků',
      passwordsDontMatch: 'Hesla se neshodují'
    }
  }

  const m = messages[locale]

  return z.object({
    email: z.string().email(m.invalidEmail),
    password: z.string().min(6, m.passwordMin),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: m.passwordsDontMatch,
    path: ["confirmPassword"],
  })
}

type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>

interface RegisterFormProps {
  locale?: 'en' | 'cs'
}

export function RegisterForm({ locale = 'en' }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { signUp, signInWithGoogle, user } = useAuth()
  const router = useRouter()

  // Localized texts
  const texts = {
    en: {
      title: 'Create Account',
      description: 'Get started with your free account and 200 welcome credits',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      createAccount: 'Create Account',
      signUpWithGoogle: 'Sign up with Google',
      alreadyHaveAccount: 'Already have an account?',
      signIn: 'Sign in',
      accountCreated: 'Account Created!',
      accountCreatedDesc: 'Your account has been created successfully. Please check your email to verify your account before you can start translating.',
      verificationSent: 'Verification email sent!',
      checkInbox: 'Please check your inbox and click the verification link.',
      invalidEmail: 'Invalid email address',
      passwordMin: 'Password must be at least 6 characters',
      passwordsDontMatch: "Passwords don't match"
    },
    cs: {
      title: 'Vytvořit Účet',
      description: 'Začněte se svým zdarma účtem a 200 uvítacími kredity',
      email: 'Email',
      password: 'Heslo',
      confirmPassword: 'Potvrdit Heslo',
      createAccount: 'Vytvořit Účet',
      signUpWithGoogle: 'Registrovat se přes Google',
      alreadyHaveAccount: 'Už máte účet?',
      signIn: 'Přihlásit se',
      accountCreated: 'Účet Vytvořen!',
      accountCreatedDesc: 'Váš účet byl úspěšně vytvořen. Prosím zkontrolujte svůj email a ověřte účet před začátkem překládání.',
      verificationSent: 'Ověřovací email odeslán!',
      checkInbox: 'Prosím zkontrolujte svou schránku a klikněte na ověřovací odkaz.',
      invalidEmail: 'Neplatná emailová adresa',
      passwordMin: 'Heslo musí mít alespoň 6 znaků',
      passwordsDontMatch: 'Hesla se neshodují'
    }
  }

  const t = texts[locale]

  // Redirect to dashboard if already logged in and reset loading state
  useEffect(() => {
    if (user) {
      setIsLoading(false) // Reset loading state when user is authenticated
      router.push(locale === 'cs' ? '/cs/dashboard' : '/dashboard')
    }
  }, [user, router, locale])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(createRegisterSchema(locale)),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await signUp(data.email, data.password)
      setSuccess(true)
      // Redirect to email verification page after successful registration
      setTimeout(() => router.push('/verify-email'), 2000)
    } catch (error: any) {
      console.error('Registration error:', error)

      // Handle specific Firebase auth errors
      let errorMessage = 'Failed to create account'
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead or use a different email.'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.'
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await signInWithGoogle()
      // Don't redirect immediately - let the auth state change handle the redirect
      // The useAuth hook will properly manage the loading state and redirect
    } catch (error: any) {
      setError(error.message || 'Failed to sign up with Google')
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{t.accountCreated}</CardTitle>
          <CardDescription>
            {t.accountCreatedDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  {t.verificationSent}
                </p>
                <p className="mt-1 text-sm text-blue-700">
                  {t.checkInbox}
                </p>
              </div>
            </div>
          </div>
          <Button asChild className="w-full">
            <Link href="/verify-email">Continue to Email Verification</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>
          {t.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Google Sign-up Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Chrome className="h-4 w-4 mr-2" />
          )}
          {t.signUpWithGoogle}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-background px-2 text-gray-500 dark:text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <div className="text-sm">
              {error}
              {error.includes('already registered') && (
                <div className="mt-2">
                  <Link href="/login" className="text-blue-600 hover:underline font-medium">
                    Go to Sign In →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t.email}
            </label>
            <Input
              id="email"
              type="email"
              placeholder={locale === 'cs' ? 'Zadejte váš email' : 'Enter your email'}
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t.password}
            </label>
            <Input
              id="password"
              type="password"
              placeholder={locale === 'cs' ? 'Vytvořte heslo' : 'Create a password'}
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              {t.confirmPassword}
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={locale === 'cs' ? 'Potvrďte heslo' : 'Confirm your password'}
              {...register('confirmPassword')}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? (locale === 'cs' ? 'Vytvářím účet...' : 'Creating account...')
              : t.createAccount
            }
          </Button>

          <p className="text-center text-sm text-gray-600">
            {t.alreadyHaveAccount}{' '}
            <Link href={locale === 'cs' ? '/cs/login' : '/login'} className="text-blue-600 hover:underline">
              {t.signIn}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
