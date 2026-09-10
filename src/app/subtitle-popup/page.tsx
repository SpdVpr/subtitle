import { pageMetadata } from '@/lib/seo'
import { SubtitlePopupController } from '@/components/popup/subtitle-popup-controller'


export const metadata = pageMetadata({
  locale: "en",
  path: "/subtitle-popup",
  title: "Subtitle Popup Window: Subtitles Over Any Video",
  description: "Open an always-on-top subtitle window and play your subtitle file over any video player or streaming site. No extension or installation needed."
})
export default function SubtitlePopupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-background dark:to-card">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent px-2">
              Subtitle Popup Overlay
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Open a subtitle window that stays on top of any video. Perfect for Netflix, YouTube, and other streaming services.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-card border border-blue-200 dark:border-border rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-blue-900 dark:text-blue-300">
              📺 How to use:
            </h2>
            <ol className="space-y-2 text-blue-800 dark:text-blue-200 text-sm sm:text-base">
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
