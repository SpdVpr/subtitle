import { MetadataRoute } from 'next'

const blockedPaths = [
  '/api/',
  '/dashboard',
  '/cs/dashboard',
  '/admin',
  '/debug',
  '/test',
  '/analytics',
  '/preview',
  '/cs/preview',
  '/success',
  '/verify-email',
  '/cs/verify-email',
  '/my-feedback',
  '/cs/my-feedback',
  '/subtitle-popup/overlay',
]

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.subtitlebot.com').replace(/\/$/, '')
  const publicSearchBots = [
    'OAI-SearchBot',
    'ChatGPT-User',
    'Claude-SearchBot',
    'Claude-User',
    'PerplexityBot',
    'Perplexity-User',
  ]

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: blockedPaths },
      ...publicSearchBots.map((userAgent) => ({ userAgent, allow: '/', disallow: blockedPaths })),
      { userAgent: 'GPTBot', allow: '/', disallow: blockedPaths },
      { userAgent: 'ClaudeBot', allow: '/', disallow: blockedPaths },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
