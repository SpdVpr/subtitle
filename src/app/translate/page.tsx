// import { TranslationInterface } from '@/components/translation/translation-interface'

export default function TranslatePage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Subtitle Translation</h1>
          <p className="text-gray-600">
            Upload your SRT subtitle file and translate it to any language using AI
          </p>
        </div>

        <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-4">Translation Interface Temporarily Disabled</h2>
          <p className="text-gray-600 mb-4">Testing navigation without TranslationInterface component</p>
          <p className="text-sm text-gray-500">
            If navigation works now, the problem is in TranslationInterface component
          </p>
        </div>

        {/* <TranslationInterface /> */}
      </div>
    </div>
  )
}

// Note: metadata moved to layout.tsx since this is now a client component
