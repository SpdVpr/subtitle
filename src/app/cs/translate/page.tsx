import { TranslationInterface } from '@/components/translation/translation-interface'

export default function CzechTranslatePage() {
  return (
    <div className="py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">AI Překlad Titulků</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-muted-foreground">
            Nahrajte svůj SRT soubor s titulky a přeložte ho do jakéhokoli jazyka pomocí AI
          </p>
        </div>

        <TranslationInterface />

      </div>
    </div>
  )
}

// Note: metadata moved to layout.tsx since this is now a client component
