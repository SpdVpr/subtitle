import { Metadata } from 'next'
import { VideoPlayerWithSubtitles } from '@/components/video/video-player-with-subtitles'

export const metadata: Metadata = {
  title: 'Video Tools - SubtitleBot',
  description: 'Video Player and Subtitle Tools. Watch videos with custom subtitles or use Picture-in-Picture overlay for streaming services.',
  keywords: 'video tools, video player, subtitle overlay, Picture-in-Picture, streaming subtitles, YouTube subtitles',
  openGraph: {
    title: 'Video Tools - SubtitleBot',
    description: 'Video Player and Subtitle Tools for any video content',
    type: 'website',
  },
}

export default function VideoPlayerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-background dark:to-card">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🛠️ Video Tools
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Two powerful tools in one place: Video Player for direct viewing and Subtitle Tools for streaming services.
            </p>
          </div>

          {/* Instructions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Video Player Instructions */}
            <div className="bg-blue-50 dark:bg-card border border-blue-200 dark:border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-300 flex items-center gap-2">
                🎬 Video Player
              </h2>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                Watch videos with custom subtitles directly on our website
              </p>
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 text-sm">Supported Sources:</h3>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-xs">
                  <li>• YouTube, Vimeo, direct video links</li>
                  <li>• Upload subtitles and customize appearance</li>
                  <li>• Perfect sync and timing controls</li>
                </ul>
              </div>
            </div>

            {/* Subtitle Tools Instructions */}
            <div className="bg-green-50 dark:bg-card border border-green-200 dark:border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-green-900 dark:text-green-300 flex items-center gap-2">
                📝 Subtitle Tools
              </h2>
              <p className="text-green-700 dark:text-green-300 text-sm mb-3">
                Picture-in-Picture overlay that works with ANY video content
              </p>
              <div className="space-y-2">
                <h3 className="font-semibold text-green-800 dark:text-green-200 text-sm">Works with:</h3>
                <ul className="space-y-1 text-green-700 dark:text-green-300 text-xs">
                  <li>• Netflix, Disney+, Amazon Prime, etc.</li>
                  <li>• Local video files on your computer</li>
                  <li>• Any video playing in your browser</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Video Player Component */}
          <VideoPlayerWithSubtitles />
        </div>
      </div>
    </div>
  )
}
