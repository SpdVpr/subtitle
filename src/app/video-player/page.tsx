import { Metadata } from 'next'
import { VideoPlayerWithSubtitles } from '@/components/video/video-player-with-subtitles'

export const metadata: Metadata = {
  title: 'Video Player with Subtitles - SubtitleAI',
  description: 'Watch any video with custom subtitles. Support for YouTube, Vimeo, and direct video links with synchronized subtitle overlay.',
  keywords: 'video player, subtitles, YouTube subtitles, Vimeo subtitles, video overlay, streaming',
  openGraph: {
    title: 'Video Player with Subtitles - SubtitleAI',
    description: 'Watch videos with custom subtitles in one place',
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
              Video Player with Subtitles
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Watch any video with custom subtitles. Simply paste a video URL and load your subtitle file for the perfect viewing experience.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-card border border-blue-200 dark:border-border rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-300">
              🎬 How to use:
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Supported Video Sources:</h3>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                  <li>• <strong>YouTube:</strong> youtube.com/watch?v=...</li>
                  <li>• <strong>Vimeo:</strong> vimeo.com/...</li>
                  <li>• <strong>Direct links:</strong> .mp4, .webm, .ogg files</li>
                  <li>• <strong>Other embeddable:</strong> Most video platforms</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Steps:</h3>
                <ol className="space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                  <li><strong>1.</strong> Paste your video URL below</li>
                  <li><strong>2.</strong> Load your subtitle file (.srt)</li>
                  <li><strong>3.</strong> Customize subtitle appearance</li>
                  <li><strong>4.</strong> Enjoy synchronized playback!</li>
                </ol>
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
