'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth'
import { AuthContextType } from '@/types/auth'
import { UserService } from '@/lib/database'
import { UserProfile } from '@/types/database'

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
    // Initialize Firebase only on client side
    const initFirebase = async () => {
      try {
        const { auth, db, isFirebaseConfigured, googleProvider } = await import('@/lib/firebase')
        setFirebaseServices({ auth, db, isConfigured: isFirebaseConfigured })

        if (!isFirebaseConfigured || !auth) {
          setLoading(false)
          return
        }

        // Check for persistent demo user first
        const persistentDemoUser = localStorage.getItem('demoUser')
        if (persistentDemoUser) {
          try {
            const demoUser = JSON.parse(persistentDemoUser)
            setUser(demoUser)
            setLoading(false)
            return
          } catch (error) {
            localStorage.removeItem('demoUser')
          }
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            // Update last login time
            try {
              await UserService.updateUser(firebaseUser.uid, {
                updatedAt: new Date() as any
              })
            } catch (error) {
              console.warn('Failed to update user profile:', error)
            }
            setUser(firebaseUser)
          } else {
            setUser(null)
          }
          setLoading(false)
        })

        return unsubscribe
      } catch (error) {
        console.error('Failed to initialize Firebase:', error)
        setLoading(false)
      }
    }

    initFirebase()
  }, [])

  const signIn = async (email: string, password: string) => {
    // Demo login for testing - check for special test accounts
    if (email === 'pro@test.com' && password === 'test123') {
      setLoading(true)
      // Create mock Pro user
      const mockProUser = {
        uid: 'pro-user-demo',
        email: 'pro@test.com',
        displayName: 'Pro Test User',
        emailVerified: true,
        photoURL: null,
        phoneNumber: null,
        providerId: 'password',
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        }
      } as any

      setUser(mockProUser)
      localStorage.setItem('demoUser', JSON.stringify(mockProUser))
      setLoading(false)
      return
    }

    if (email === 'premium@test.com' && password === 'test123') {
      setLoading(true)
      // Create mock Premium user
      const mockPremiumUser = {
        uid: 'premium-user-demo',
        email: 'premium@test.com',
        displayName: 'Premium Test User',
        emailVerified: true,
        photoURL: null,
        phoneNumber: null,
        providerId: 'password',
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        }
      } as any

      setUser(mockPremiumUser)
      localStorage.setItem('demoUser', JSON.stringify(mockPremiumUser))
      setLoading(false)
      return
    }

    if (email === 'free@test.com' && password === 'test123') {
      setLoading(true)
      // Create mock Free user
      const mockFreeUser = {
        uid: 'free-user-demo',
        email: 'free@test.com',
        displayName: 'Free Test User',
        emailVerified: true,
        photoURL: null,
        phoneNumber: null,
        providerId: 'password',
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        }
      } as any

      setUser(mockFreeUser)
      localStorage.setItem('demoUser', JSON.stringify(mockFreeUser))
      setLoading(false)
      return
    }

    if (!firebaseServices?.isConfigured || !firebaseServices.auth) {
      throw new Error('Firebase is not configured. Please set up your environment variables.')
    }

    setLoading(true)
    try {
      await signInWithEmailAndPassword(firebaseServices.auth, email, password)
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
      const { user: firebaseUser } = await createUserWithEmailAndPassword(firebaseServices.auth, email, password)

      // Create user profile in Firestore
      await UserService.createUser(
        firebaseUser.uid,
        firebaseUser.email!,
        firebaseUser.displayName || undefined
      )
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    // Clear demo user from localStorage
    localStorage.removeItem('demoUser')
    setUser(null)

    if (!firebaseServices?.isConfigured || !firebaseServices.auth) {
      return
    }
    await firebaseSignOut(firebaseServices.auth)
  }

  const resetPassword = async (email: string) => {
    if (!firebaseServices?.isConfigured || !firebaseServices.auth) {
      throw new Error('Firebase is not configured. Please set up your environment variables.')
    }
    await sendPasswordResetEmail(firebaseServices.auth, email)
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
        const userProfile: Partial<UserProfile> = {
          email: result.user.email || '',
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || '',
          emailVerified: result.user.emailVerified,
          subscriptionPlan: 'free',
          subscriptionStatus: 'active',
          createdAt: new Date() as any,
          usage: {
            translationsUsed: 0,
            translationsLimit: 10,
            storageUsed: 0,
            storageLimit: 100 * 1024 * 1024, // 100MB
            batchJobsUsed: 0,
            batchJobsLimit: 0,
            resetDate: new Date() as any
          }
        }

        await UserService.createOrUpdateUser(result.user.uid, userProfile)
      }
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
