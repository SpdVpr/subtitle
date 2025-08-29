'use client'

import { useState, useEffect } from 'react'
import { analytics } from '@/lib/analytics'

const STORAGE_KEY = 'subtitle-favorite-languages'

export interface FavoriteLanguagesHook {
  favoriteLanguages: string[]
  addFavorite: (languageCode: string) => void
  removeFavorite: (languageCode: string) => void
  isFavorite: (languageCode: string) => boolean
  toggleFavorite: (languageCode: string) => void
  addCommonFavorites: () => void
  clearAllFavorites: () => void
}

export function useFavoriteLanguages(): FavoriteLanguagesHook {
  const [favoriteLanguages, setFavoriteLanguages] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setFavoriteLanguages(parsed)
        }
      }
      setIsLoaded(true)
    } catch (error) {
      console.warn('Failed to load favorite languages:', error)
      setIsLoaded(true)
    }
  }, [])

  // Save favorites to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (!isLoaded) return // Don't save during initial load

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteLanguages))
    } catch (error) {
      console.warn('Failed to save favorite languages:', error)
    }
  }, [favoriteLanguages, isLoaded])

  const addFavorite = (languageCode: string) => {
    setFavoriteLanguages(prev => {
      if (!prev.includes(languageCode)) {
        analytics.favoriteLanguageAdded(languageCode)
        return [...prev, languageCode]
      }
      return prev
    })
  }

  const removeFavorite = (languageCode: string) => {
    setFavoriteLanguages(prev => {
      if (prev.includes(languageCode)) {
        analytics.favoriteLanguageRemoved(languageCode)
      }
      return prev.filter(code => code !== languageCode)
    })
  }

  const isFavorite = (languageCode: string): boolean => {
    return favoriteLanguages.includes(languageCode)
  }

  const toggleFavorite = (languageCode: string) => {
    if (isFavorite(languageCode)) {
      removeFavorite(languageCode)
    } else {
      addFavorite(languageCode)
    }
  }

  const addCommonFavorites = () => {
    // Add most commonly used languages
    const commonLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh']
    setFavoriteLanguages(prev => {
      const newFavorites = [...prev]
      commonLanguages.forEach(lang => {
        if (!newFavorites.includes(lang)) {
          newFavorites.push(lang)
        }
      })
      return newFavorites
    })
  }

  const clearAllFavorites = () => {
    setFavoriteLanguages([])
  }

  return {
    favoriteLanguages,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    addCommonFavorites,
    clearAllFavorites
  }
}
