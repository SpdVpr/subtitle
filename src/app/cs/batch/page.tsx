'use client'

import { BatchTranslationInterfaceCS } from '@/components/batch/batch-translation-interface-cs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import {
  Zap,
  FileText,
  Archive,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react'

export default function CzechBatchPage() {
  const { user } = useAuth()

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
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

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-primary" />
                ZIP Podpora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Nahrajte ZIP archiv s více soubory titulků (SRT, VTT, ASS, SSA) a my je všechny přeložíme najednou.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Více Souborů
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Vyberte více souborů titulků (SRT, VTT, ASS, SSA) najednou a zpracujte je v jedné dávce.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                ZIP Stažení
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Všechny přeložené soubory se automaticky zabalí do ZIP archivu ke stažení.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Batch Interface */}
        <BatchTranslationInterfaceCS />

        {/* How it Works */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Jak Dávkový Překlad Funguje</h2>
          <div className="grid md:grid-cols-4 gap-6">
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Archive className="h-8 w-8 text-blue-600 dark:text-primary" />
              </div>
              <h3 className="font-semibold mb-2">1. Nahrajte Soubory</h3>
              <p className="text-sm text-muted-foreground">
                Vyberte více souborů titulků nebo nahrajte ZIP archiv
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-green-600 dark:text-primary" />
              </div>
              <h3 className="font-semibold mb-2">2. Vyberte Jazyk</h3>
              <p className="text-sm text-muted-foreground">
                Zvolte cílový jazyk pro všechny soubory v dávce
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600 dark:text-primary" />
              </div>
              <h3 className="font-semibold mb-2">3. AI Zpracování</h3>
              <p className="text-sm text-muted-foreground">
                Naše AI přeloží všechny soubory paralelně pro rychlost
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-orange-600 dark:text-primary" />
              </div>
              <h3 className="font-semibold mb-2">4. Stáhněte ZIP</h3>
              <p className="text-sm text-muted-foreground">
                Získejte všechny přeložené soubory v jednom ZIP archivu
              </p>
            </div>

          </div>
        </div>

        {/* Benefits */}
        <div className="mt-12 bg-muted/50 rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-6 text-center">Výhody Dávkového Překladu</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Úspora Času</h4>
                <p className="text-sm text-muted-foreground">
                  Přeložte desítky souborů najednou místo jednoho po druhém
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Konzistentní Kvalita</h4>
                <p className="text-sm text-muted-foreground">
                  Všechny soubory jsou přeloženy se stejnou vysokou kvalitou AI
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Snadná Organizace</h4>
                <p className="text-sm text-muted-foreground">
                  Zachovává strukturu složek a názvy souborů z původního ZIP
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Efektivní Kredity</h4>
                <p className="text-sm text-muted-foreground">
                  Stejná spotřeba kreditů jako jednotlivé překlady
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Supported Formats */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold mb-4">Podporované Formáty</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300">.srt</span>
            <span className="bg-green-50 dark:bg-green-950 px-3 py-1 rounded-full text-sm font-medium text-green-700 dark:text-green-300">.vtt</span>
            <span className="bg-purple-50 dark:bg-purple-950 px-3 py-1 rounded-full text-sm font-medium text-purple-700 dark:text-purple-300">.ass</span>
            <span className="bg-orange-50 dark:bg-orange-950 px-3 py-1 rounded-full text-sm font-medium text-orange-700 dark:text-orange-300">.ssa</span>
            <span className="bg-gray-50 dark:bg-gray-950 px-3 py-1 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">.zip</span>
          </div>
        </div>
      </div>
    </div>
  )
}
