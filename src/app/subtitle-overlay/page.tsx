import { Metadata } from 'next'
import { SubtitleOverlayContainer } from '@/components/overlay/subtitle-overlay-container'

export const metadata: Metadata = {
  title: 'Subtitle Overlay - SubtitleBot',
  description: 'Display subtitles over any video content with customizable styling, positioning, and synchronization. Perfect for streaming services and video players.',
  keywords: 'subtitle overlay, video subtitles, streaming subtitles, subtitle display, video accessibility',
  openGraph: {
    title: 'Subtitle Overlay - SubtitleBot',
    description: 'Display subtitles over any video content with full customization',
    type: 'website',
  },
}

export default function SubtitleOverlayPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <SubtitleOverlayContainer />
    </div>
  )
}
