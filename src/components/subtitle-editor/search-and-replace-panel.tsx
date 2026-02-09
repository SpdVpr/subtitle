'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SubtitleEntry } from '@/types/preview'
import { toast } from 'sonner'
import {
  Search,
  Replace,
  ReplaceAll,
  Eye,
  Check,
  X,
  AlertCircle,
  Zap
} from 'lucide-react'

interface SearchAndReplacePanelProps {
  entries: SubtitleEntry[]
  onEntriesChange: (entries: SubtitleEntry[]) => void
}

interface SearchMatch {
  entryIndex: number
  matchIndex: number
  matchText: string
  beforeText: string
  afterText: string
}

export function SearchAndReplacePanel({
  entries,
  onEntriesChange
}: SearchAndReplacePanelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWords, setWholeWords] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [previewMode, setPreviewMode] = useState(true)

  // Find all matches
  const matches = useMemo(() => {
    if (!searchTerm) return []

    const results: SearchMatch[] = []
    
    entries.forEach((entry, entryIndex) => {
      let searchPattern: RegExp
      
      try {
        if (useRegex) {
          searchPattern = new RegExp(searchTerm, caseSensitive ? 'g' : 'gi')
        } else {
          let pattern = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
          if (wholeWords) {
            pattern = `\\b${pattern}\\b`
          }
          searchPattern = new RegExp(pattern, caseSensitive ? 'g' : 'gi')
        }

        let match
        let matchIndex = 0
        while ((match = searchPattern.exec(entry.text)) !== null) {
          const beforeText = entry.text.substring(0, match.index)
          const afterText = entry.text.substring(match.index + match[0].length)
          
          results.push({
            entryIndex,
            matchIndex,
            matchText: match[0],
            beforeText,
            afterText
          })
          
          matchIndex++
          
          // Prevent infinite loop with zero-width matches
          if (match.index === searchPattern.lastIndex) {
            searchPattern.lastIndex++
          }
        }
      } catch (error) {
        // Invalid regex - ignore
      }
    })

    return results
  }, [entries, searchTerm, caseSensitive, wholeWords, useRegex])

  // Replace single match
  const replaceSingle = (match: SearchMatch) => {
    const newEntries = [...entries]
    const entry = newEntries[match.entryIndex]
    
    try {
      let searchPattern: RegExp
      
      if (useRegex) {
        searchPattern = new RegExp(searchTerm, caseSensitive ? 'g' : 'gi')
      } else {
        let pattern = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        if (wholeWords) {
          pattern = `\\b${pattern}\\b`
        }
        searchPattern = new RegExp(pattern, caseSensitive ? 'g' : 'gi')
      }

      const newText = entry.text.replace(searchPattern, replaceTerm)
      
      newEntries[match.entryIndex] = {
        ...entry,
        text: newText,
        isEdited: true
      }

      onEntriesChange(newEntries)
      toast.success('Text replaced')
    } catch (error) {
      toast.error('Invalid search pattern')
    }
  }

  // Replace all matches
  const replaceAll = () => {
    if (matches.length === 0) {
      toast.error('No matches found')
      return
    }

    const newEntries = [...entries]
    const affectedEntries = new Set<number>()

    try {
      let searchPattern: RegExp
      
      if (useRegex) {
        searchPattern = new RegExp(searchTerm, caseSensitive ? 'g' : 'gi')
      } else {
        let pattern = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        if (wholeWords) {
          pattern = `\\b${pattern}\\b`
        }
        searchPattern = new RegExp(pattern, caseSensitive ? 'g' : 'gi')
      }

      matches.forEach(match => {
        const entry = newEntries[match.entryIndex]
        if (!affectedEntries.has(match.entryIndex)) {
          const newText = entry.text.replace(searchPattern, replaceTerm)
          newEntries[match.entryIndex] = {
            ...entry,
            text: newText,
            isEdited: true
          }
          affectedEntries.add(match.entryIndex)
        }
      })

      onEntriesChange(newEntries)
      toast.success(`Replaced ${matches.length} matches in ${affectedEntries.size} entries`)
    } catch (error) {
      toast.error('Invalid search pattern')
    }
  }

  // Common search terms for quick access
  const commonSearchTerms = [
    { term: 'Mr.', replace: 'Mr' },
    { term: 'Mrs.', replace: 'Mrs' },
    { term: 'Dr.', replace: 'Dr' },
    { term: '  ', replace: ' ' }, // Double spaces
    { term: '...', replace: '…' }, // Ellipsis
    { term: '--', replace: '—' }, // Em dash
  ]

  return (
    <div className="space-y-6">
      {/* Search and Replace Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Find & Replace</span>
          </CardTitle>
          <CardDescription>
            Search and replace text across all subtitle entries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Search for</Label>
              <Input
                placeholder="Enter search term..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Replace with</Label>
              <Input
                placeholder="Enter replacement..."
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="case-sensitive"
                checked={caseSensitive}
                onCheckedChange={setCaseSensitive}
              />
              <Label htmlFor="case-sensitive" className="text-sm">Case sensitive</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="whole-words"
                checked={wholeWords}
                onCheckedChange={setWholeWords}
              />
              <Label htmlFor="whole-words" className="text-sm">Whole words only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-regex"
                checked={useRegex}
                onCheckedChange={setUseRegex}
              />
              <Label htmlFor="use-regex" className="text-sm">Regular expressions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="preview-mode"
                checked={previewMode}
                onCheckedChange={setPreviewMode}
              />
              <Label htmlFor="preview-mode" className="text-sm">Preview mode</Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={replaceAll}
              disabled={matches.length === 0 || !replaceTerm}
              className="flex items-center space-x-2"
            >
              <ReplaceAll className="h-4 w-4" />
              <span>Replace All ({matches.length})</span>
            </Button>
            
            {matches.length > 0 && (
              <Badge variant="secondary">
                {matches.length} matches found
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Replace Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Quick Fixes</span>
          </CardTitle>
          <CardDescription>
            Common text corrections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {commonSearchTerms.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm(item.term)
                  setReplaceTerm(item.replace)
                }}
                className="justify-start text-left"
              >
                <span className="font-mono text-xs">
                  "{item.term}" → "{item.replace}"
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Search Results</span>
              <Badge variant="secondary">{matches.length} matches</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {matches.map((match, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-muted-foreground mb-1">
                        Entry #{match.entryIndex + 1}
                      </div>
                      <div className="font-mono text-sm break-all">
                        {match.beforeText}
                        <span className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
                          {match.matchText}
                        </span>
                        {match.afterText}
                      </div>
                      {previewMode && replaceTerm && (
                        <div className="font-mono text-sm text-green-600 dark:text-green-400 mt-1">
                          Preview: {match.beforeText}
                          <span className="bg-green-200 dark:bg-green-800 px-1 rounded">
                            {replaceTerm}
                          </span>
                          {match.afterText}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => replaceSingle(match)}
                      disabled={!replaceTerm}
                      className="ml-2"
                    >
                      <Replace className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
