import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Translate Subtitles',
  description: 'Translate your subtitle files using AI-powered translation services. Support for 60+ languages with context-aware translation and automatic timing adjustment.',
  keywords: [
    'subtitle translation',
    'AI subtitle translator',
    'SRT translation',
    'video subtitle converter',
    'multilingual subtitles',
    'Google Gemini AI translation',
    'premium AI translation',
    'subtitle localization'
  ],
  openGraph: {
    title: 'Translate Subtitles - SubtitleBot',
    description: 'Translate your subtitle files using AI-powered translation services. Support for 100+ languages with context-aware translation.',
    url: '/translate',
    images: [
      {
        url: '/og-translate.jpg',
        width: 1200,
        height: 630,
        alt: 'SubtitleBot Translate - AI Subtitle Translation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Translate Subtitles - SubtitleBot',
    description: 'Translate your subtitle files using AI-powered translation services.',
    images: ['/twitter-translate.jpg'],
  },
  alternates: {
    canonical: '/translate',
  },
}

export default function TranslateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
