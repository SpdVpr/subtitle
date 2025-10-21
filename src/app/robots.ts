import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://subtitle-ai.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/cs/dashboard/',
          '/admin/',
          '/(auth)/',
          '/(dashboard)/',
          '/debug',
          '/test',
          '/preview/',
          '/cs/preview/',
          '/success/',
          '/verify-email/',
          '/cs/verify-email/',
          '/buy-credits/',
          '/cs/buy-credits/',
          '/batch/',
          '/cs/batch/',
          '/subtitle-popup/',
          '/cs/subtitle-popup/',
          '/my-feedback/',
          '/cs/my-feedback/',
          '/feedback/',
          '/cs/feedback/',
          '/cookie-settings/',
          '/cs/cookie-settings/',
          '/register/',
          '/cs/register/',
          '/login/',
          '/cs/login/',
        ],
      },
      // Special rules for AI crawlers
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/debug',
          '/test',
        ],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/debug',
          '/test',
        ],
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/debug',
          '/test',
        ],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/debug',
          '/test',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
