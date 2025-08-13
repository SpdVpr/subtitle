'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SUPPORTED_LANGUAGES, LanguageOption } from '@/types/subtitle'

interface LanguageSelectorProps {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  disabled?: boolean
  excludeLanguage?: string
}

export function LanguageSelector({ 
  value, 
  onValueChange, 
  placeholder, 
  disabled,
  excludeLanguage 
}: LanguageSelectorProps) {
  const availableLanguages = SUPPORTED_LANGUAGES.filter(
    lang => lang.code !== excludeLanguage
  )

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {availableLanguages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center space-x-2">
              <span>{language.name}</span>
              <span className="text-gray-500 text-sm">({language.nativeName})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
