import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // SEO-friendly redirects for old/incorrect URLs
  const redirects: Record<string, string> = {
    '/video-player': '/video-tools',
    '/subtitle-overlay': '/video-tools',
    '/help': '/contact',
    '/privacy-policy': '/privacy',
    '/cookie-policy': '/cookies',
    '/faq': '/contact',
    '/support': '/contact',
  }

  // Check if current path needs redirect
  if (redirects[pathname]) {
    const url = request.nextUrl.clone()
    url.pathname = redirects[pathname]
    return NextResponse.redirect(url, 301) // Permanent redirect
  }

  // Just add security headers - no locale routing
  const response = NextResponse.next()

  // Add basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
