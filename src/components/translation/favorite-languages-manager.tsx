'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SUPPORTED_LANGUAGES } from '@/types/subtitle'
import { useFavoriteLanguages } from '@/hooks/use-favorite-languages'
import { Star, Plus, X } from 'lucide-react'

interface FavoriteLanguagesManagerProps {
  locale?: 'en' | 'cs'
}

export function FavoriteLanguagesManager({ locale = 'en' }: FavoriteLanguagesManagerProps) {
  const { favoriteLanguages, addFavorite, removeFavorite, isFavorite, toggleFavorite, addCommonFavorites, clearAllFavorites } = useFavoriteLanguages()
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')

  // Get available languages that are not already favorites
  const availableToAdd = SUPPORTED_LANGUAGES.filter(lang => 
    !favoriteLanguages.includes(lang.code)
  )

  // Get favorite language objects
  const favoriteLanguageObjects = SUPPORTED_LANGUAGES.filter(lang =>
    favoriteLanguages.includes(lang.code)
  )

  const handleAddFavorite = () => {
    if (selectedLanguage && !isFavorite(selectedLanguage)) {
      addFavorite(selectedLanguage)
      setSelectedLanguage('')
    }
  }

  const handleRemoveFavorite = (languageCode: string) => {
    removeFavorite(languageCode)
  }

  // Localized texts
  const texts = locale === 'cs' ? {
    title: 'Oblíbené jazyky',
    description: 'Spravujte své oblíbené jazyky pro rychlý přístup v rozbalovacích seznamech překladů. Oblíbené jazyky se zobrazí na začátku seznamu.',
    yourFavorites: 'Vaše oblíbené:',
    addFavorite: 'Přidat oblíbený:',
    selectPlaceholder: 'Vyberte jazyk pro přidání do oblíbených',
    addCommon: 'Přidat běžné jazyky',
    clearAll: 'Vymazat vše',
    tipTitle: '💡 Tip:',
    tipText: 'Můžete také kliknout na ikonu hvězdičky vedle jakéhokoli jazyka v rozbalovacích seznamech překladů pro rychlé přidání nebo odebrání z oblíbených.'
  } : {
    title: 'Favorite Languages',
    description: 'Manage your favorite languages for quick access in translation dropdowns. Favorite languages will appear at the top of the language selection list.',
    yourFavorites: 'Your Favorites:',
    addFavorite: 'Add Favorite:',
    selectPlaceholder: 'Select a language to add to favorites',
    addCommon: 'Add Common Languages',
    clearAll: 'Clear All',
    tipTitle: '💡 Tip:',
    tipText: 'You can also click the star icon next to any language in the translation dropdowns to quickly add or remove it from favorites.'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          {texts.title}
        </CardTitle>
        <CardDescription>
          {texts.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Favorites */}
        {favoriteLanguageObjects.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">{texts.yourFavorites}</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFavorites}
                className="text-xs h-7"
              >
                {texts.clearAll}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {favoriteLanguageObjects.map((language) => (
                <Badge
                  key={language.code}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{language.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveFavorite(language.code)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {favoriteLanguageObjects.length === 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">{texts.addFavorite}</h4>
            <Button
              variant="outline"
              onClick={addCommonFavorites}
              className="w-full mb-4"
            >
              <Star className="h-4 w-4 mr-2" />
              {texts.addCommon}
            </Button>
          </div>
        )}

        {/* Add New Favorite */}
        {availableToAdd.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">{texts.addFavorite}</h4>
            <div className="flex gap-2">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={texts.selectPlaceholder} />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {availableToAdd.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {`${language.name} (${language.nativeName})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAddFavorite}
                disabled={!selectedLanguage}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-medium mb-1">{texts.tipTitle}</p>
          <p>
            {texts.tipText}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
