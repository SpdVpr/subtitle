import { User } from 'firebase/auth'

// Admin email addresses - only these users can access the admin dashboard.
// Keep in sync with src/lib/admin-auth-server.ts (server enforcement) and
// firestore.rules. Configure extra admins via the ADMIN_EMAILS env var.
// NOTE: 'premium@test.com' was removed — an attacker could self-register it.
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'admin@subtitlebot.com,michalvesecky@gmail.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

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
