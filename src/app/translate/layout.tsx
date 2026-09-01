import type { Metadata } from "next";
import { BatchProvider } from '@/components/providers/batch-provider'

export const metadata: Metadata = {
  title: 'Translate Subtitles',
  description: 'Translate subtitle files with context-aware AI while preserving timing. Your first complete subtitle file is free with no card required.',
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
    description: 'Translate your first complete subtitle file free. 100+ language pairs with context-aware AI.',
    url: '/translate',
    images: [
      {
        url: '/og-image-en.png',
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
    images: ['/og-image-en.png'],
  },
  alternates: {
    canonical: '/translate',
    languages: {
      'en': '/translate',
      'cs': '/cs/translate',
      'x-default': '/translate',
    },
  },
}

export default function TranslateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <BatchProvider>{children}</BatchProvider>
}
