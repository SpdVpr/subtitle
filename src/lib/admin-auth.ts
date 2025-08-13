import { User } from 'firebase/auth'

// Admin email addresses - only these users can access admin dashboard
const ADMIN_EMAILS = [
  'admin@subtitle-ai.com',
  'ceo@subtitle-ai.com',
  'manager@subtitle-ai.com',
  'premium@test.com', // Demo admin account
  'pro@test.com', // Demo admin account
  // Add your admin emails here
]

export function isAdmin(user: User | null): boolean {
  if (!user || !user.email) {
    return false
  }
  
  return ADMIN_EMAILS.includes(user.email.toLowerCase())
}

export function requireAdmin(user: User | null): void {
  if (!isAdmin(user)) {
    throw new Error('Admin access required')
  }
}
