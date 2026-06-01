import { auth } from '@/lib/firebase'

/**
 * fetch() wrapper for authenticated user API calls. Attaches the current user's
 * Firebase ID token as a Bearer credential so the server can derive the userId
 * from the verified token instead of trusting a spoofable ?userId= param.
 */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  let token = ''
  try {
    const user = auth?.currentUser
    if (user) token = await user.getIdToken()
  } catch {
    // fall through with empty token -> server returns 401
  }
  const headers = new Headers(init.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(input, { ...init, headers })
}
