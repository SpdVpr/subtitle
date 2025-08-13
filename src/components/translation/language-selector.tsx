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
            {`Auto-detect (automatic)`}
          </SelectItem>
        )}
        {availableLanguages.map((language) => (
          <SelectItem key={String(language?.code || '')} value={String(language?.code || '')}>
            {`${String(language?.name || '')} (${String(language?.nativeName || '')})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
