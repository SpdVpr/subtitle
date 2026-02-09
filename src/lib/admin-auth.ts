import { User } from 'firebase/auth'

// Admin email addresses - only these users can access admin dashboard
const ADMIN_EMAILS = [
  'admin@subtitlebot.com',
  'premium@test.com', // Temporary - for testing
  'admin@subtitle-ai.com',
  'ceo@subtitle-ai.com',
  'manager@subtitle-ai.com',
  // Add your admin emails here
]

export function isAdmin(user: User | null): boolean {
  if (!user || !user.email) {
    return false
  }

  const userEmail = user.email.toLowerCase()
  const isAdminUser = ADMIN_EMAILS.includes(userEmail)

  return isAdminUser
}

export function requireAdmin(user: User | null): void {
  if (!isAdmin(user)) {
    throw new Error('Admin access required')
  }
}
