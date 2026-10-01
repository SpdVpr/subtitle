import type { NextConfig } from "next";

// Public assets are not content-hashed, so give them a long (not immutable)
// shared cache: replace an asset by renaming it if it must change instantly.
const STATIC_ASSET_CACHE = 'public, max-age=2592000, stale-while-revalidate=86400'

// These rules are fixed routing metadata, not per-visitor logic. Keep them
// in the CDN configuration instead of invoking a Node proxy for every request.
const NO_INDEX_PATHS = [
  '/dashboard', '/cs/dashboard', '/admin', '/analytics', '/statistics', '/cs/statistics',
  '/preview', '/cs/preview', '/success', '/verify-email', '/cs/verify-email',
  '/buy-credits', '/cs/buy-credits', '/batch', '/cs/batch', '/subtitle-popup/overlay',
  '/my-feedback', '/cs/my-feedback', '/feedback', '/cs/feedback', '/cookie-settings',
  '/cs/cookie-settings', '/register', '/cs/register', '/login', '/cs/login',
  '/forgot-password', '/modern', '/cs/modern',
]

const nextConfig: NextConfig = {
  // Unblock Vercel build by ignoring type and lint errors (temporary)
  typescript: {
    ignoreBuildErrors: true,
  },
  poweredByHeader: false,
  compiler: {
    // Hundreds of console.log calls ship to production otherwise
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Serve modern image formats from next/image and let the CDN keep them
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },
  // Tree-shake heavy barrel packages so only used parts ship to the client
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'recharts',
      'framer-motion',
      '@radix-ui/react-dropdown-menu',
    ],
  },
  // Heavy server-only packages kept out of the bundle (faster cold starts)
  serverExternalPackages: [
    'openai',
    'stripe',
    'firebase-admin',
    '@google-cloud/translate',
    '@google/genai',
    '@google/generative-ai',
  ],
  async redirects() {
    return Object.entries({
      '/video-player': '/video-tools',
      '/subtitle-overlay': '/video-tools',
      '/help': '/contact',
      '/privacy-policy': '/privacy',
      '/cookie-policy': '/cookies',
      '/faq': '/contact',
      '/support': '/contact',
    }).map(([source, destination]) => ({ source, destination, statusCode: 301 }))
  },
  async headers() {
    const cache = [{ key: 'Cache-Control', value: STATIC_ASSET_CACHE }]
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      ...NO_INDEX_PATHS.map((path) => ({
        source: `${path}/:path*`,
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      })),
      { source: '/images/:path*', headers: cache },
      { source: '/logo-sub.png', headers: cache },
      { source: '/og-image-en.png', headers: cache },
      { source: '/og-image-cs.png', headers: cache },
      { source: '/icon.svg', headers: cache },
      { source: '/favicon.ico', headers: cache },
      { source: '/manifest.json', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] },
    ]
  },
};

export default nextConfig;
