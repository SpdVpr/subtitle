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

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn, signInWithGoogle, user } = useAuth()
  const router = useRouter()

  // Redirect to homepage if already logged in and reset loading state
  useEffect(() => {
    if (user) {
      setIsLoading(false) // Reset loading state when user is authenticated
      router.push('/')
    }
  }, [user, router])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
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
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
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
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or continue with email</span>
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
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
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
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="text-center space-y-2">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot your password?
            </Link>
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </CardContent>

      {/* Demo Test Account - Below main form */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-muted rounded-lg border dark:border-border">
        <h4 className="font-medium text-gray-900 dark:text-foreground mb-3 text-center">Demo Test Account</h4>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between p-2 bg-white dark:bg-accent rounded border dark:border-border">
            <div>
              <strong>Admin:</strong> premium@test.com / test123
              <br />
              <span className="text-xs text-gray-500 dark:text-muted-foreground">🔧 Admin access, Premium AI, Unlimited credits</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => quickLogin('premium@test.com', 'test123')}
              disabled={isLoading}
              className="ml-2"
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
