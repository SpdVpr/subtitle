import { NextRequest, NextResponse } from 'next/server'
import { getAdminApp } from '@/lib/firebase-admin'
import { getAuth } from 'firebase-admin/auth'

// Admin allowlist. Configure via ADMIN_EMAILS (comma-separated) in the
// environment; falls back to the known owner/admin addresses.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@subtitlebot.com,michalvesecky@gmail.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export type AdminContext = { uid: string; email: string }

/**
 * Verifies the caller is an admin by validating the Firebase ID token in the
 * Authorization: Bearer <token> header (signed by Firebase, NOT spoofable)
 * and checking the verified email against the allowlist.
 * Returns the admin context, or null if not authorized.
 */
export async function verifyAdmin(request: NextRequest): Promise<AdminContext | null> {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : null
  if (!token) return null

  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token)
    const email = (decoded.email || '').toLowerCase()
    if (!decoded.email_verified) return null
    if (!ADMIN_EMAILS.includes(email)) return null
    return { uid: decoded.uid, email }
  } catch {
    return null
  }
}

/**
 * Convenience guard for route handlers:
 *   const auth = await requireAdmin(req)
 *   if ('response' in auth) return auth.response
 *   const { email } = auth.ctx
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ ctx: AdminContext } | { response: NextResponse }> {
  const ctx = await verifyAdmin(request)
  if (!ctx) {
    return {
      response: NextResponse.json({ error: 'Admin access required' }, { status: 401 }),
    }
  }
  return { ctx }
}
