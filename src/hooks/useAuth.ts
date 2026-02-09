'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth'
import { AuthContextType } from '@/types/auth'
import { UserService } from '@/lib/database'
import { UserProfile } from '@/types/database'
import { analytics } from '@/lib/analytics'

import { doc, getDoc } from 'firebase/firestore'

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
        const { auth, db, isFirebaseConfigured, googleProvider } = await import('@/lib/firebase')
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
                const existingUser = await UserService.getUser(firebaseUser.uid)
                if (!existingUser) {
                  console.log('👤 Creating new user profile')
                  await UserService.createUser(
                    firebaseUser.uid,
                    firebaseUser.email!,
                    firebaseUser.displayName || undefined
                  )
                } else {
                  // Ensure welcome credits for legacy accounts without creditsBalance
                  if ((existingUser as any).creditsBalance == null) {
                    console.log('💰 Adding welcome credits to legacy user')
                    try {
                      await UserService.updateUser(firebaseUser.uid, {
                        creditsBalance: 200,
                        creditsTotalPurchased: ((existingUser as any).creditsTotalPurchased || 0) + 200,
                        updatedAt: new Date() as any
                      } as any)
                    } catch (e) {
                      console.warn('Failed to set welcome credits for legacy user:', e)
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
    console.log('🔑 SignIn attempt:', { email, password: password.substring(0, 3) + '...' })

    // Demo login for testing - Admin account only
    if (email === 'premium@test.com' && password === 'yIk5i4mdFinuxPz') {
      console.log('🔑 Demo login initiated for admin user')
      setLoading(true)

      // Create mock Admin user (Premium account with admin privileges)
      const mockAdminUser = {
        uid: 'premium-user-demo',
        email: 'premium@test.com',
        displayName: 'Admin User',
        emailVerified: true,
        photoURL: null,
        phoneNumber: null,
        providerId: 'password',
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        }
      } as any

      // Small delay to show loading state, then set user
      setTimeout(() => {
        console.log('✅ Demo admin user authenticated:', mockAdminUser)
        setUser(mockAdminUser)
        localStorage.setItem('demoUser', JSON.stringify(mockAdminUser))
        setLoading(false)
        console.log('✅ Demo user set in state and localStorage')
      }, 500) // 500ms delay for better UX
      return
    }

    if (!firebaseServices?.isConfigured || !firebaseServices.auth) {
      throw new Error('Firebase is not configured. Please set up your environment variables.')
    }

    setLoading(true)
    try {
      await signInWithEmailAndPassword(firebaseServices.auth, email, password)
      // Track user login
      analytics.userLoggedIn('email')
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    if (!firebaseServices?.isConfigured || !firebaseServices.auth || !firebaseServices.db) {
      throw new Error('Firebase is not configured. Please set up your environment variables.')
    }

    setLoading(true)
    try {
      // Generate browser fingerprint for anti-abuse tracking
      const { getOrGenerateFingerprint } = await import('@/lib/browser-fingerprint')
      const browserFingerprint = await getOrGenerateFingerprint()

      // Check registration with anti-abuse system
      const checkResponse = await fetch('/api/registration/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ browserFingerprint })
      })

      let creditsToAward = 100 // Default
      let suspiciousScore = 0
      let duplicateDetected = false

      if (checkResponse.ok) {
        const checkResult = await checkResponse.json()
        creditsToAward = checkResult.creditsToAward
        suspiciousScore = checkResult.suspiciousScore
        duplicateDetected = checkResult.duplicateIpCount > 0 || checkResult.duplicateFingerprintCount > 0

        console.log('🔍 Registration check:', {
          suspiciousScore,
          creditsToAward,
          reasons: checkResult.reasons
        })
      }

      const { user: firebaseUser } = await createUserWithEmailAndPassword(firebaseServices.auth, email, password)

      // Send email verification with custom settings
      await sendEmailVerification(firebaseUser, {
        url: `${window.location.origin}/dashboard`,
        handleCodeInApp: false
      })

      // Create user profile in Firestore with tracking data
      await UserService.createUser(
        firebaseUser.uid,
        firebaseUser.email!,
        firebaseUser.displayName || undefined,
        {
          creditsBalance: creditsToAward,
          registrationTracking: {
            browserFingerprint,
            userAgent: navigator.userAgent,
            suspiciousScore,
            duplicateDetected,
            registrationMethod: 'email'
          }
        }
      )

      // Record registration in tracking system
      try {
        const recordResponse = await fetch('/api/registration/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: firebaseUser.uid,
            email: firebaseUser.email,
            browserFingerprint,
            registrationMethod: 'email',
            creditsAwarded: creditsToAward,
            suspiciousScore
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
    await sendPasswordResetEmail(firebaseServices.auth, email)
  }

  const sendVerificationEmail = async () => {
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

    await sendEmailVerification(currentUser, {
      url: `${window.location.origin}/dashboard`,
      handleCodeInApp: false
    })
  }

  const signInWithGoogle = async () => {
    if (!firebaseServices?.isConfigured || !firebaseServices.auth) {
      throw new Error('Firebase is not configured. Please set up your environment variables.')
    }

    setLoading(true)
    try {
      const { googleProvider } = await import('@/lib/firebase')
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
            body: JSON.stringify({ browserFingerprint })
          })

          let creditsToAward = 100 // Default
          let suspiciousScore = 0
          let duplicateDetected = false

          if (checkResponse.ok) {
            const checkResult = await checkResponse.json()
            creditsToAward = checkResult.creditsToAward
            suspiciousScore = checkResult.suspiciousScore
            duplicateDetected = checkResult.duplicateIpCount > 0 || checkResult.duplicateFingerprintCount > 0

            console.log('🔍 Google registration check:', {
              suspiciousScore,
              creditsToAward,
              reasons: checkResult.reasons
            })
          }

          // Create new user with full profile and adjusted credits
          console.log(`👤 Creating new Google user in Firestore with ${creditsToAward} welcome credits`)
          await UserService.createUser(
            result.user.uid,
            result.user.email!,
            result.user.displayName || undefined,
            {
              creditsBalance: creditsToAward,
              registrationTracking: {
                browserFingerprint,
                userAgent: navigator.userAgent,
                suspiciousScore,
                duplicateDetected,
                registrationMethod: 'google'
              }
            }
          )

          // Record registration in tracking system
          try {
            const recordResponse = await fetch('/api/registration/record', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: result.user.uid,
                email: result.user.email,
                browserFingerprint,
                registrationMethod: 'google',
                creditsAwarded: creditsToAward,
                suspiciousScore
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
    } catch (error) {
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
    const { db } = await import('@/lib/firebase')
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
