import { User as FirebaseUser } from 'firebase/auth'

export interface User extends FirebaseUser {
  // Additional user properties can be added here
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  sendVerificationEmail: () => Promise<void>
}
