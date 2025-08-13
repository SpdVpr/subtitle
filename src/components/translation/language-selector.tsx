'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SUPPORTED_LANGUAGES, LanguageOption } from '@/types/subtitle'

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
  const availableLanguages = (SUPPORTED_LANGUAGES || []).filter(
    lang => lang?.code && lang.code !== excludeLanguage
  )

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAutoDetect && (
          <SelectItem value="auto">
            <div className="flex items-center space-x-2">
              <span>Auto-detect</span>
              <span className="text-gray-500 text-sm">(automatic)</span>
            </div>
          </SelectItem>
        )}
        {availableLanguages.map((language) => (
          <SelectItem key={String(language?.code || '')} value={String(language?.code || '')}>
            <div className="flex items-center space-x-2">
              <span>{String(language?.name || '')}</span>
              <span className="text-gray-500 text-sm">({String(language?.nativeName || '')})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
