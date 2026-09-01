'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import type { User as FirebaseUser } from 'firebase/auth'
import { AuthContextType } from '@/types/auth'
import type { UserProfile } from '@/types/database'
import { analytics } from '@/lib/analytics'
import { safeInternalRedirect } from '@/lib/safe-redirect'
import { authFetch } from '@/lib/auth-fetch'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [firebaseServices, setFirebaseServices] = useState<{
    auth: any
    db: any
    isConfigured: boolean
  } | null>(null)

  useEffect(() => {
    console.log('🔥 useAuth useEffect triggered')
    // Initialize Firebase only on client side
    const initFirebase = async () => {
      try {
        console.log('🔥 Importing Firebase services...')
        const [{ auth, db, isFirebaseConfigured }, { onAuthStateChanged }] = await Promise.all([
          import('@/lib/firebase'),
          import('firebase/auth'),
        ])
        console.log('🔥 Firebase configured:', isFirebaseConfigured, 'Auth available:', !!auth)
        setFirebaseServices({ auth, db, isConfigured: isFirebaseConfigured })

        if (!isFirebaseConfigured || !auth) {
          console.log('🔥 Firebase not configured, stopping initialization')
          setLoading(false)
          return
        }

        // Check for persistent demo user first
        console.log('🔍 Checking for persistent demo user...')
        const persistentDemoUser = localStorage.getItem('demoUser')
        console.log('🔍 Demo user in localStorage:', !!persistentDemoUser)
        if (persistentDemoUser) {
          try {
            const demoUser = JSON.parse(persistentDemoUser)
            console.log('✅ Found persistent demo user:', demoUser.email)
            setUser(demoUser)
            setLoading(false)
            return
          } catch (error) {
            console.error('❌ Failed to parse persistent demo user:', error)
            localStorage.removeItem('demoUser')
          }
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          console.log('🔥 Auth state changed:', !!firebaseUser)

          if (firebaseUser) {
            // Set user immediately to prevent loading screen hang
            setUser(firebaseUser)
            setLoading(false)

            // Handle user profile asynchronously (don't block UI)
            const handleUserProfile = async () => {
              try {
                if (sessionStorage.getItem('subtitlebot_registration_in_progress') === '1') return
                const { UserService } = await import('@/lib/database')
                const existingUser = await UserService.getUser(firebaseUser.uid)
                if (!existingUser) {
                  console.log('👤 Creating new user profile')
                  await UserService.createUser(
                    firebaseUser.uid,
                    firebaseUser.email!,
                    firebaseUser.displayName || undefined
                  )
                } else {
                  // Initialize legacy wallets without granting confusing welcome credits.
                  if ((existingUser as any).creditsBalance == null) {
                    console.log('💰 Initializing legacy credit wallet')
                    try {
                      await UserService.updateUser(firebaseUser.uid, {
                        creditsBalance: 0,
                        creditsTotalPurchased: (existingUser as any).creditsTotalPurchased || 0,
                        updatedAt: new Date() as any
                      } as any)
                    } catch (e) {
                      console.warn('Failed to initialize legacy wallet:', e)
                    }
                  } else {
                    // Update last login time
                    await UserService.updateUser(firebaseUser.uid, {
                      updatedAt: new Date() as any
                    })
                  }
                }
              } catch (error) {
                console.warn('Failed to update user profile:', error)
              }
            }

            // Run profile handling in background
            handleUserProfile()
          } else {
            setUser(null)
            setLoading(false)
          }
        })

        // Safety timeout: prevent stuck loading states if onAuthStateChanged is delayed
        setTimeout(() => {
          console.log('⏰ Auth safety timeout triggered - forcing loading to false')
          setLoading(false)
        }, 3000) // Reduced from 4s to 3s

        return unsubscribe
      } catch (error) {
        console.error('Failed to initialize Firebase:', error)
        setLoading(false)
      }
    }

    initFirebase()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('🔑 SignIn attempt:', { email })

    if (!firebaseServices?.isConfigured || !firebaseServices.auth) {
      throw new Error('Firebase is not configured. Please set up your environment variables.')
    }

    setLoading(true)
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      await signInWithEmailAndPassword(firebaseServices.auth, email, password)
      // Track user login
      analytics.userLoggedIn('email')
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, continueUrl = '/translate') => {
    if (!firebaseServices?.isConfigured || !firebaseServices.auth || !firebaseServices.db) {
      throw new Error('Firebase is not configured. Please set up your environment variables.')
    }

    setLoading(true)
    try {
      const [{ createUserWithEmailAndPassword, sendEmailVerification }, { UserService }] = await Promise.all([
        import('firebase/auth'),
        import('@/lib/database'),
      ])
      // Generate browser fingerprint for anti-abuse tracking
      const { getOrGenerateFingerprint } = await import('@/lib/browser-fingerprint')
      const browserFingerprint = await getOrGenerateFingerprint()

      // Check registration with anti-abuse system
      const checkResponse = await fetch('/api/registration/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ browserFingerprint, email })
      })

      let isAllowed = false
      let suspiciousScore = 0
      let duplicateDetected = false

      if (checkResponse.ok) {
        const checkResult = await checkResponse.json()
        isAllowed = Boolean(checkResult.isAllowed)
        suspiciousScore = checkResult.suspiciousScore
        duplicateDetected = checkResult.duplicateIpCount > 0 || checkResult.duplicateFingerprintCount > 0

        console.log('🔍 Registration check:', {
          suspiciousScore,
          isAllowed,
          reasons: checkResult.reasons
        })
      } else {
        throw new Error('Registration protection is temporarily unavailable. Please try again.')
      }

      if (!isAllowed) {
        throw new Error('Registration could not be completed. Please use a permanent email address or contact support.')
      }

      sessionStorage.setItem('subtitlebot_registration_in_progress', '1')
      const { user: firebaseUser } = await createUserWithEmailAndPassword(firebaseServices.auth, email, password)

      // Send email verification with custom settings
      await sendEmailVerification(firebaseUser, {
        url: `${window.location.origin}${safeInternalRedirect(continueUrl, '/translate')}`,
        handleCodeInApp: false
      })

      // Create user profile in Firestore with tracking data
      await UserService.createUser(
        firebaseUser.uid,
        firebaseUser.email!,
        firebaseUser.displayName || undefined,
        {
          creditsBalance: 0,
          registrationTracking: {
            browserFingerprint,
            userAgent: navigator.userAgent,
            suspiciousScore,
            duplicateDetected,
            registrationMethod: 'email'
          }
        }
      )
      sessionStorage.removeItem('subtitlebot_registration_in_progress')

      // Record registration in tracking system
      try {
        const recordResponse = await authFetch('/api/registration/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: firebaseUser.uid,
            email: firebaseUser.email,
            browserFingerprint,
            registrationMethod: 'email',
            acquisition: localStorage.getItem('subtitlebot_attribution') || undefined
          })
        })

        if (recordResponse.ok) {
          const recordResult = await recordResponse.json()
          console.log('✅ Registration recorded:', recordResult)
        } else {
          const errorData = await recordResponse.json()
          console.error('❌ Failed to record registration:', errorData)
        }
      } catch (recordError) {
        console.error('❌ Error recording registration:', recordError)
        // Don't throw - registration should succeed even if tracking fails
      }

      // Track user registration
      analytics.userRegistered('email')

      // Don't set loading to false here - let onAuthStateChanged handle it
      // This ensures proper redirect flow
    } catch (error) {
      sessionStorage.removeItem('subtitlebot_registration_in_progress')
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    // Clear demo user from localStorage
    localStorage.removeItem('demoUser')
    setUser(null)
    setLoading(false)

    if (firebaseServices?.isConfigured && firebaseServices.auth) {
      const { signOut: firebaseSignOut } = await import('firebase/auth')
      await firebaseSignOut(firebaseServices.auth)
    }

    // Force redirect to homepage after sign out
    // Use window.location for a clean state reset
    window.location.href = '/'
  }

  const resetPassword = async (email: string) => {
    if (!firebaseServices?.isConfigured || !firebaseServices.auth) {
      throw new Error('Firebase is not configured. Please set up your environment variables.')
    }
    const { sendPasswordResetEmail } = await import('firebase/auth')
    await sendPasswordResetEmail(firebaseServices.auth, email)
  }

  const sendVerificationEmail = async (continueUrl = '/translate') => {
    if (!firebaseServices?.isConfigured || !firebaseServices.auth) {
      throw new Error('Firebase is not configured. Please set up your environment variables.')
    }

    const currentUser = firebaseServices.auth.currentUser
    if (!currentUser) {
      throw new Error('No user is currently signed in.')
    }

    if (currentUser.emailVerified) {
      throw new Error('Email is already verified.')
    }

    const { sendEmailVerification } = await import('firebase/auth')
    await sendEmailVerification(currentUser, {
      url: `${window.location.origin}${safeInternalRedirect(continueUrl, '/translate')}`,
      handleCodeInApp: false
    })
  }

  const signInWithGoogle = async () => {
    if (!firebaseServices?.isConfigured || !firebaseServices.auth) {
      throw new Error('Firebase is not configured. Please set up your environment variables.')
    }

    setLoading(true)
    try {
      sessionStorage.setItem('subtitlebot_registration_in_progress', '1')
      const [{ googleProvider }, { signInWithPopup }, { UserService }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth'),
        import('@/lib/database'),
      ])
      const result = await signInWithPopup(firebaseServices.auth, googleProvider)

      // Create or update user profile in Firestore
      if (result.user && firebaseServices.db) {
        console.log('🔥 Creating/updating Google user profile:', result.user.uid, result.user.email)

        // Check if user already exists
        const existingUser = await UserService.getUser(result.user.uid)

        if (!existingUser) {
          // Generate browser fingerprint for anti-abuse tracking
          const { getOrGenerateFingerprint } = await import('@/lib/browser-fingerprint')
          const browserFingerprint = await getOrGenerateFingerprint()

          // Check registration with anti-abuse system
          const checkResponse = await fetch('/api/registration/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ browserFingerprint, email: result.user.email })
          })

          let isAllowed = false
          let suspiciousScore = 0
          let duplicateDetected = false

          if (checkResponse.ok) {
            const checkResult = await checkResponse.json()
            isAllowed = Boolean(checkResult.isAllowed)
            suspiciousScore = checkResult.suspiciousScore
            duplicateDetected = checkResult.duplicateIpCount > 0 || checkResult.duplicateFingerprintCount > 0

            console.log('🔍 Google registration check:', {
              suspiciousScore,
              isAllowed,
              reasons: checkResult.reasons
            })
          } else {
            throw new Error('Registration protection is temporarily unavailable. Please try again.')
          }

          if (!isAllowed) {
            await result.user.delete()
            throw new Error('Registration could not be completed. Please use a permanent email address or contact support.')
          }

          // Create a new user with one free Standard translation instead of welcome credits.
          console.log('👤 Creating new Google user with a free first translation')
          await UserService.createUser(
            result.user.uid,
            result.user.email!,
            result.user.displayName || undefined,
            {
              creditsBalance: 0,
              registrationTracking: {
                browserFingerprint,
                userAgent: navigator.userAgent,
                suspiciousScore,
                duplicateDetected,
                registrationMethod: 'google'
              }
            }
          )
          await UserService.updateUser(result.user.uid, { emailVerified: true } as any)

          // Record registration in tracking system
          try {
            const recordResponse = await authFetch('/api/registration/record', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: result.user.uid,
                email: result.user.email,
                browserFingerprint,
                registrationMethod: 'google',
                acquisition: localStorage.getItem('subtitlebot_attribution') || undefined
              })
            })

            if (recordResponse.ok) {
              const recordResult = await recordResponse.json()
              console.log('✅ Registration recorded:', recordResult)
            } else {
              const errorData = await recordResponse.json()
              console.error('❌ Failed to record registration:', errorData)
            }
          } catch (recordError) {
            console.error('❌ Error recording registration:', recordError)
            // Don't throw - registration should succeed even if tracking fails
          }

          // Track new user registration
          analytics.userRegistered('google')
        } else {
          // Update existing user
          console.log('🔄 Updating existing Google user')
          await UserService.updateUser(result.user.uid, {
            displayName: result.user.displayName || existingUser.displayName,
            photoURL: result.user.photoURL || existingUser.photoURL,
            emailVerified: result.user.emailVerified,
            updatedAt: new Date() as any
          })
          // Track user login
          analytics.userLoggedIn('google')
        }
      }

      // Set loading to false to let onAuthStateChanged + React re-render handle the flow
      setLoading(false)
      sessionStorage.removeItem('subtitlebot_registration_in_progress')
    } catch (error) {
      sessionStorage.removeItem('subtitlebot_registration_in_progress')
      setLoading(false)
      throw error
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGoogle,
    sendVerificationEmail,
  }
}



// Helper function to get user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const [{ db }, { doc, getDoc }] = await Promise.all([
      import('@/lib/firebase'),
      import('firebase/firestore'),
    ])
    if (!db) return null

    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return { uid, ...userSnap.data() } as UserProfile
    }

    return null
  } catch (error) {
    console.error('Failed to get user profile:', error)
    return null
  }
}

export { AuthContext }
