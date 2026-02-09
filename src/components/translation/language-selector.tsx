'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SUPPORTED_LANGUAGES, LanguageOption } from '@/types/subtitle'
import { useFavoriteLanguages } from '@/hooks/use-favorite-languages'
import { Star, StarOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LanguageSelectorProps {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  disabled?: boolean
  excludeLanguage?: string
  includeAutoDetect?: boolean
}

export function LanguageSelector({
  value,
  onValueChange,
  placeholder,
  disabled,
  excludeLanguage,
  includeAutoDetect = false
}: LanguageSelectorProps) {
  const { favoriteLanguages, isFavorite, toggleFavorite } = useFavoriteLanguages()

  const availableLanguages = (SUPPORTED_LANGUAGES || []).filter(
    lang => lang?.code && lang.code !== excludeLanguage
  )

  // Separate favorite and non-favorite languages
  const favoriteLanguagesList = availableLanguages.filter(lang =>
    favoriteLanguages.includes(lang.code)
  )
  const regularLanguagesList = availableLanguages.filter(lang =>
    !favoriteLanguages.includes(lang.code)
  )

  const handleFavoriteToggle = (languageCode: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    toggleFavorite(languageCode)
  }

  const renderLanguageItem = (language: LanguageOption, showFavoriteIcon: boolean = true) => (
    <SelectItem
      key={String(language?.code || '')}
      value={String(language?.code || '')}
      className="group relative"
    >
      <div className="flex items-center justify-between w-full pr-6">
        <span className="flex-1">
          {isFavorite(language.code) && <Star className="inline h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />}
          {`${String(language?.name || '')} (${String(language?.nativeName || '')})`}
        </span>
      </div>
      {showFavoriteIcon && (
        <button
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted rounded"
          onClick={(e) => handleFavoriteToggle(language.code, e)}
          type="button"
        >
          {isFavorite(language.code) ? (
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          ) : (
            <StarOff className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
      )}
    </SelectItem>
  )

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {includeAutoDetect && (
          <SelectItem value="auto">
            {`Auto-detect (automatic)`}
          </SelectItem>
        )}

        {/* Favorite Languages Section */}
        {favoriteLanguagesList.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-xs font-medium text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 border-b">
              ⭐ Favorite Languages
            </div>
            {favoriteLanguagesList.map((language) => renderLanguageItem(language, true))}

            {regularLanguagesList.length > 0 && (
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50 border-t">
                🌍 All Languages
              </div>
            )}
          </>
        )}

        {/* Regular Languages Section */}
        {regularLanguagesList.map((language) => renderLanguageItem(language, true))}
      </SelectContent>
    </Select>
  )
}
