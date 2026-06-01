import { NextRequest } from 'next/server'
import { getAdminApp } from '@/lib/firebase-admin'
import { getAuth } from 'firebase-admin/auth'

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
