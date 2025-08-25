import { Metadata } from 'next'
import { SubtitlePopupController } from '@/components/popup/subtitle-popup-controller'

export const metadata: Metadata = {
  title: 'Subtitle Popup - SubtitleBot',
  description: 'Open a subtitle overlay window that works over any video content. Perfect for streaming services and online videos.',
  keywords: 'subtitle popup, video overlay, streaming subtitles, external subtitles',
  openGraph: {
    title: 'Subtitle Popup - SubtitleBot',
    description: 'Subtitle overlay that works over any video content',
    type: 'website',
  },
}

export default function SubtitlePopupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-background dark:to-card">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Subtitle Popup Overlay
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Open a subtitle window that stays on top of any video. Perfect for Netflix, YouTube, and other streaming services.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-card border border-blue-200 dark:border-border rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-300">
              📺 How to use:
            </h2>
            <ol className="space-y-2 text-blue-800 dark:text-blue-200">
              <li><strong>1.</strong> Load your subtitle file (.srt) below</li>
              <li><strong>2.</strong> Customize the appearance and position</li>
              <li><strong>3.</strong> Click "Open Subtitle Window" to create the overlay</li>
              <li><strong>4.</strong> Position the subtitle window over your video</li>
              <li><strong>5.</strong> Start your video and enjoy perfectly synced subtitles!</li>
            </ol>
          </div>

          {/* Controller Component */}
          <SubtitlePopupController />
        </div>
      </div>
    </div>
  )
}
