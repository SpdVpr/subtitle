import { pageMetadata } from '@/lib/seo'
import { VideoPlayerWithSubtitles } from '@/components/video/video-player-with-subtitles'


export const metadata = pageMetadata({
  locale: "en",
  path: "/video-tools",
  title: "Video Player with Subtitles and Subtitle Overlay",
  description: "Watch local videos with your own subtitle file, or use the Picture-in-Picture subtitle overlay on top of streaming services such as Netflix or YouTube. Free, in the browser.",
  keywords: [
    "video player with subtitles",
    "subtitle overlay",
    "picture in picture subtitles",
    "streaming subtitles",
    "Netflix subtitles overlay"
  ]
})
export default function VideoPlayerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-background dark:to-card">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent px-2">
              🛠️ Video Tools
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Two powerful tools in one place: Video Player for direct viewing and Subtitle Tools for streaming services.
            </p>
          </div>

          {/* Instructions */}
          <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Video Player Instructions */}
            <div className="bg-blue-50 dark:bg-card border border-blue-200 dark:border-border rounded-lg p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-blue-900 dark:text-blue-300 flex items-center gap-2">
                🎬 Video Player
              </h2>
              <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm mb-3">
                Watch videos with custom subtitles directly on our website
              </p>
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 text-xs sm:text-sm">Supported Sources:</h3>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-xs">
                  <li>• YouTube, Vimeo, direct video links</li>
                  <li>• Upload subtitles and customize appearance</li>
                  <li>• Perfect sync and timing controls</li>
                </ul>
              </div>
            </div>

            {/* Subtitle Tools Instructions */}
            <div className="bg-green-50 dark:bg-card border border-green-200 dark:border-border rounded-lg p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-green-900 dark:text-green-300 flex items-center gap-2">
                📝 Subtitle Tools
              </h2>
              <p className="text-green-700 dark:text-green-300 text-xs sm:text-sm mb-3">
                Picture-in-Picture overlay that works with ANY video content
              </p>
              <div className="space-y-2">
                <h3 className="font-semibold text-green-800 dark:text-green-200 text-xs sm:text-sm">Works with:</h3>
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
