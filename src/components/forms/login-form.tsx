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
import { Chrome, Loader2, AlertCircle } from 'lucide-react'

const createLoginSchema = (locale: 'en' | 'cs' = 'en') => {
  const messages = {
    en: {
      invalidEmail: 'Invalid email address',
      passwordMin: 'Password must be at least 6 characters'
    },
    cs: {
      invalidEmail: 'Neplatná emailová adresa',
      passwordMin: 'Heslo musí mít alespoň 6 znaků'
    }
  }

  const m = messages[locale]

  return z.object({
    email: z.string().email(m.invalidEmail),
    password: z.string().min(6, m.passwordMin),
  })
}

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>

interface LoginFormProps {
  locale?: 'en' | 'cs'
}

export function LoginForm({ locale = 'en' }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn, signInWithGoogle, user } = useAuth()
  const router = useRouter()

  // Localized texts
  const texts = {
    en: {
      title: 'Welcome Back',
      description: 'Sign in to your account to continue translating',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign In',
      signInWithGoogle: 'Continue with Google',
      dontHaveAccount: "Don't have an account?",
      signUp: 'Sign up',
      signingIn: 'Signing in...',
      forgotPassword: 'Forgot your password?',
      resetPassword: 'Reset password'
    },
    cs: {
      title: 'Vítejte zpět',
      description: 'Přihlaste se do svého účtu a pokračujte v překládání',
      email: 'Email',
      password: 'Heslo',
      signIn: 'Přihlásit se',
      signInWithGoogle: 'Pokračovat přes Google',
      dontHaveAccount: 'Nemáte účet?',
      signUp: 'Registrovat se',
      signingIn: 'Přihlašuji...',
      forgotPassword: 'Zapomněli jste heslo?',
      resetPassword: 'Obnovit heslo'
    }
  }

  const t = texts[locale]

  // Redirect to homepage if already logged in and reset loading state
  useEffect(() => {
    if (user) {
      setIsLoading(false) // Reset loading state when user is authenticated
      router.push(locale === 'cs' ? '/cs' : '/')
    }
  }, [user, router, locale])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema(locale)),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn(data.email, data.password)
      // Redirect to homepage after successful login
      router.push('/')
    } catch (error: any) {
      console.error('Login error:', error)

      // Handle specific Firebase auth errors
      let errorMessage = 'Failed to sign in'
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please register first.'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.'
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.'
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await signInWithGoogle()
      // Don't redirect immediately - let the auth state change handle the redirect
      // The useAuth hook will properly manage the loading state and redirect
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google')
      setIsLoading(false)
    }
  }

  const quickLogin = async (email: string, password: string) => {
    setValue('email', email)
    setValue('password', password)
    await onSubmit({ email, password })
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
        {/* Google Sign-in Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Chrome className="h-4 w-4 mr-2" />
          )}
{t.signInWithGoogle}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              {locale === 'cs' ? 'Nebo pokračujte s emailem' : 'Or continue with email'}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
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
              placeholder={locale === 'cs' ? 'Zadejte heslo' : 'Enter your password'}
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t.signingIn : t.signIn}
          </Button>

          <div className="text-center space-y-2">
            <Link
              href={locale === 'cs' ? '/cs/forgot-password' : '/forgot-password'}
              className="text-sm text-blue-600 hover:underline"
            >
              {t.forgotPassword}
            </Link>
            <p className="text-sm text-gray-600">
              {t.dontHaveAccount}{' '}
              <Link href={locale === 'cs' ? '/cs/register' : '/register'} className="text-blue-600 hover:underline">
                {t.signUp}
              </Link>
            </p>
          </div>
        </form>
      </CardContent>


    </Card>
  )
}
