'use client'

import { TranslationStatisticsComponent } from '@/components/statistics/translation-statistics'
import { StructuredData } from '@/components/seo/structured-data'

export default function StatisticsPage() {
  return (
    <>
      <StructuredData locale="cs" page="statistics" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-card dark:to-background">
        <div className="container mx-auto px-4 py-8">
          <TranslationStatisticsComponent />
        </div>
      </div>
    </>
  )
}
