import type { Metadata } from 'next'
import { GuideHub } from '@/components/guides/guide-hub'

export const metadata: Metadata = {
  title: 'Subtitle Guides: Find, Sync, Convert and Translate',
  description: 'Practical subtitle guides for matching releases, fixing sync and FPS, choosing SRT, VTT or ASS, and translating subtitles safely.',
  alternates: { canonical: '/guides', languages: { en: '/guides', cs: '/cs/guides', 'x-default': '/guides' } },
  openGraph: { title: 'Subtitle Guides | SubtitleBot', description: 'Practical help for finding, synchronizing, converting and translating subtitles.', url: '/guides', images: ['/og-image-en.png'] },
}

export default function GuidesPage() { return <GuideHub locale="en" /> }
