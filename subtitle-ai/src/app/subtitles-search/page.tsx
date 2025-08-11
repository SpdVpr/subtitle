import { Metadata } from 'next'
import { HierarchicalSubtitleSearch } from '@/components/subtitles/hierarchical-subtitle-search'
import { AnimeSubtitleSearch } from '@/components/subtitles/anime-subtitle-search'
import { Separator } from '@/components/ui/separator'
import { Film, Tv, BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Vyhledat titulky - SubtitleAI',
  description: 'Vyhledejte titulky v databázi OpenSubtitles a Jimaku pro filmy, seriály, anime a mangu',
}

export default function SubtitlesSearchPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Vyhledat titulky</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Najděte titulky k vašemu oblíbenému obsahu ve dvou největších databázích titulků
            a poté je nechte přeložit pomocí našeho AI překladače
          </p>
        </div>

        {/* OpenSubtitles Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 text-2xl font-semibold">
              <Film className="h-6 w-6 text-blue-600" />
              <Tv className="h-6 w-6 text-green-600" />
              <span>Filmy & Seriály</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border border-blue-100">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">OpenSubtitles Database</h2>
              <p className="text-gray-600">
                Největší databáze titulků pro filmy a seriály s miliony souborů ve všech jazycích
              </p>
            </div>
            <HierarchicalSubtitleSearch />
          </div>
        </div>

        {/* Separator */}
        <div className="relative mb-16">
          <Separator className="bg-gray-200" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white px-4 text-sm text-gray-500 font-medium">
              NEBO
            </div>
          </div>
        </div>

        {/* Jimaku Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 text-2xl font-semibold">
              <BookOpen className="h-6 w-6 text-purple-600" />
              <span>Anime & Manga</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Jimaku Database</h2>
              <p className="text-gray-600">
                Specializovaná databáze japonských titulků pro anime a mangu s propojením na AniList
              </p>
            </div>
            <AnimeSubtitleSearch />
          </div>
        </div>
      </div>
    </div>
  )
}