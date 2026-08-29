import { NextRequest, NextResponse } from 'next/server'
import { getAdminApp } from '@/lib/firebase-admin'
import { getAuth } from 'firebase-admin/auth'
import { verifyAdmin } from '@/lib/admin-auth-server'

export type UserContext = { uid: string; email: string | null }

/**
 * Verifies the caller's Firebase ID token (Authorization: Bearer <token>) and
 * returns the authenticated user. Returns null if missing/invalid.
 * Use the returned uid as the source of truth — never trust a client-supplied
 * userId query/body param (that was the IDOR).
 */
export async function verifyUser(request: NextRequest): Promise<UserContext | null> {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : null
  if (!token) return null
  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token)
    return { uid: decoded.uid, email: decoded.email || null }
  } catch {
    return null
  }
}

/**
 * Guard for endpoints that still take a ?userId= (or body) parameter, e.g.
 * because an admin has to be able to look at another account:
 *
 *   const auth = await requireUserOrAdmin(req, searchParams.get('userId'))
 *   if ('response' in auth) return auth.response
 *   const { uid } = auth
 *
 * The caller must present a valid ID token, and the requested userId must be
 * their own unless they are on the admin allowlist. Prefer plain verifyUser()
 * and the token's uid where no admin override is needed -- a parameter that is
 * merely *checked* is still a parameter someone can try to walk.
 */
export async function requireUserOrAdmin(
  request: NextRequest,
  requestedUserId: string | null | undefined
): Promise<{ uid: string } | { response: NextResponse }> {
  const authUser = await verifyUser(request)
  if (!authUser) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  // No userId asked for, or the caller asked for their own data.
  if (!requestedUserId || requestedUserId === authUser.uid) {
    return { uid: authUser.uid }
  }

  // Reading somebody else's data is admin-only. verifyAdmin re-checks the same
  // token against the allowlist (and the email_verified / pinned-UID rules).
  const admin = await verifyAdmin(request)
  if (admin) {
    return { uid: requestedUserId }
  }

  return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
}
