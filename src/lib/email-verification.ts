import { 
  sendEmailVerification as firebaseSendEmailVerification,
  applyActionCode,
  checkActionCode,
  User
} from 'firebase/auth'
import { auth } from './firebase'
import { UserService } from './database'

export class EmailVerificationService {
  /**
   * Send email verification to current user
   */
  static async sendVerificationEmail(user: User): Promise<void> {
    if (!auth) throw new Error('Firebase Auth not initialized')
    
    try {
      await firebaseSendEmailVerification(user, {
        url: `${window.location.origin}/verify-email?continueUrl=${encodeURIComponent(window.location.origin + '/dashboard')}`,
        handleCodeInApp: true
      })
      
      console.log('Verification email sent to:', user.email)
    } catch (error) {
      console.error('Error sending verification email:', error)
      throw new Error('Failed to send verification email')
    }
  }

  /**
   * Verify email with action code
   */
  static async verifyEmail(actionCode: string): Promise<void> {
    if (!auth) throw new Error('Firebase Auth not initialized')
    
    try {
      // Check if the action code is valid
      const info = await checkActionCode(auth, actionCode)
      
      // Apply the email verification
      await applyActionCode(auth, actionCode)
      
      // Update user profile in Firestore
      if (info.data.email && auth.currentUser) {
        await UserService.updateUser(auth.currentUser.uid, {
          emailVerified: true
        })
      }
      
      console.log('Email verified successfully')
    } catch (error) {
      console.error('Error verifying email:', error)
      throw new Error('Failed to verify email')
    }
  }

  /**
   * Check if current user's email is verified
   */
  static async isEmailVerified(): Promise<boolean> {
    if (!auth?.currentUser) return false
    
    // Reload user to get latest verification status
    await auth.currentUser.reload()
    return auth.currentUser.emailVerified
  }

  /**
   * Resend verification email with rate limiting
   */
  static async resendVerificationEmail(): Promise<void> {
    if (!auth?.currentUser) {
      throw new Error('No user logged in')
    }

    const user = auth.currentUser
    
    // Check if email is already verified
    await user.reload()
    if (user.emailVerified) {
      throw new Error('Email is already verified')
    }

    // Check rate limiting (store in localStorage for simplicity)
    const lastSentKey = `email_verification_last_sent_${user.uid}`
    const lastSent = localStorage.getItem(lastSentKey)
    
    if (lastSent) {
      const lastSentTime = new Date(lastSent)
      const now = new Date()
      const timeDiff = now.getTime() - lastSentTime.getTime()
      const minutesDiff = timeDiff / (1000 * 60)
      
      if (minutesDiff < 1) { // 1 minute rate limit
        throw new Error('Please wait before requesting another verification email')
      }
    }

    // Send verification email
    await this.sendVerificationEmail(user)
    
    // Update rate limiting
    localStorage.setItem(lastSentKey, new Date().toISOString())
  }

  /**
   * Get verification status for user
   */
  static async getVerificationStatus(userId: string): Promise<{
    emailVerified: boolean
    emailAddress: string | null
    verificationSent: boolean
  }> {
    try {
      const userProfile = await UserService.getUser(userId)
      
      return {
        emailVerified: userProfile?.emailVerified || false,
        emailAddress: userProfile?.email || null,
        verificationSent: false // Would need to track this separately
      }
    } catch (error) {
      console.error('Error getting verification status:', error)
      return {
        emailVerified: false,
        emailAddress: null,
        verificationSent: false
      }
    }
  }
}
