'use client'

import { useState } from 'react'
import { TranslationInterface } from '@/components/translation/translation-interface'
import { BatchTranslationInterfaceCS } from '@/components/batch/batch-translation-interface-cs'
import { EmailVerificationGuard } from '@/components/auth/email-verification-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Files, Zap, Clock, Users, ArrowRight, Archive, Download } from 'lucide-react'

export default function CzechTranslatePage() {
  const [mode, setMode] = useState<'select' | 'single' | 'batch'>('select')

  if (mode === 'single') {
    return (
      <EmailVerificationGuard locale="cs">
        <div className="py-4 sm:py-6 md:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="mb-6 sm:mb-8">
              <Button
                variant="ghost"
                onClick={() => setMode('select')}
                className="mb-4"
              >
                ← Zpět na Výběr Režimu
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Jednotlivý Překlad</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-muted-foreground">
                Nahrajte jeden SRT soubor s titulky a přeložte ho do jakéhokoli jazyka pomocí AI
              </p>
            </div>
            <TranslationInterface locale="cs" />
          </div>
        </div>
      </EmailVerificationGuard>
    )
  }

  if (mode === 'batch') {
    return (
      <EmailVerificationGuard locale="cs">
        <div className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => setMode('select')}
              className="mb-6"
            >
              ← Zpět na Výběr Režimu
            </Button>

            {/* Header */}
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold">Hromadný Překlad</h1>
              </div>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Nahrajte více souborů s titulky nebo ZIP archivy a přeložte je všechny najednou pomocí AI
              </p>
            </div>

          {/* Features Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-card rounded-lg p-6 border border-gray-200 dark:border-border shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <FileText className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                <h3 className="font-semibold">Více Souborů & ZIP</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                Nahrajte jednotlivé SRT soubory nebo ZIP archivy obsahující více souborů titulků
              </p>
            </div>

            <div className="bg-white dark:bg-card rounded-lg p-6 border border-gray-200 dark:border-border shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <Archive className="h-8 w-8 text-green-500 dark:text-green-400" />
                <h3 className="font-semibold">Chytré Zpracování</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                Automatické rozbalení souborů ze ZIP a inteligentní odhad nákladů
              </p>
            </div>

            <div className="bg-white dark:bg-card rounded-lg p-6 border border-gray-200 dark:border-border shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <Download className="h-8 w-8 text-purple-500 dark:text-purple-400" />
                <h3 className="font-semibold">Hromadné Stažení</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                Stáhněte jednotlivé soubory nebo získejte všechny překlady v jednom ZIP
              </p>
            </div>
          </div>

          {/* Main Content */}
          <BatchTranslationInterfaceCS />

          {/* Help Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Jak Hromadný Překlad Funguje</CardTitle>
              <CardDescription>
                Krok za krokem průvodce hromadným zpracováním
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 dark:text-primary font-bold">1</span>
                  </div>
                  <h4 className="font-medium mb-2">Nahrajte Soubory</h4>
                  <p className="text-sm text-gray-600">
                    Nahrajte SRT soubory jednotlivě nebo jako ZIP archivy
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 dark:text-primary font-bold">2</span>
                  </div>
                  <h4 className="font-medium mb-2">Nastavte</h4>
                  <p className="text-sm text-gray-600">
                    Vyberte cílový jazyk a zkontrolujte odhad nákladů
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 dark:text-primary font-bold">3</span>
                  </div>
                  <h4 className="font-medium mb-2">Zpracujte</h4>
                  <p className="text-sm text-gray-600">
                    AI přeloží všechny soubory s inteligentním přizpůsobením časování
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-orange-600 dark:text-orange-400 font-bold">4</span>
                  </div>
                  <h4 className="font-medium mb-2">Stáhněte</h4>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">
                    Získejte všechny přeložené soubory v jednom ZIP ke stažení
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </EmailVerificationGuard>
    )
  }

  // Mode selection
  return (
    <div className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">AI Překlad Titulků</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Vyberte si způsob překladu podle vašich potřeb - jednotlivý soubor nebo hromadné zpracování více souborů najednou.
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Single Translation */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 dark:hover:border-blue-800">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl">Jednotlivý Překlad</CardTitle>
              <CardDescription className="text-base">
                Ideální pro jeden soubor s titulky
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Rychlé zpracování</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Jeden soubor najednou</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  <span>Okamžitý náhled a editace</span>
                </div>
              </div>
              <Button
                onClick={() => setMode('single')}
                className="w-full"
                size="lg"
              >
                Vybrat Jednotlivý Překlad
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Batch Translation */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-200 dark:hover:border-purple-800">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Files className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-2xl">Hromadný Překlad</CardTitle>
              <CardDescription className="text-base">
                Pro více souborů nebo ZIP archivy
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Files className="h-4 w-4" />
                  <span>Více souborů najednou</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Paralelní zpracování</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Úspora času</span>
                </div>
              </div>
              <Button
                onClick={() => setMode('batch')}
                variant="outline"
                className="w-full border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950"
                size="lg"
              >
                Vybrat Hromadný Překlad
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Info */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 text-sm text-muted-foreground bg-muted/50 rounded-full px-6 py-3">
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">SRT</Badge>
              <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">VTT</Badge>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">ASS</Badge>
              <Badge variant="secondary" className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300">SSA</Badge>
              <Badge variant="secondary" className="bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300">SUB</Badge>
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">SBV</Badge>
              <Badge variant="secondary" className="bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300">TXT</Badge>
            </div>
            <span>•</span>
            <span>50+ podporovaných jazyků</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Note: metadata moved to layout.tsx since this is now a client component
