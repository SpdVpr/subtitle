'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Star, Heart, ArrowRight } from 'lucide-react'

interface FeedbackWidgetProps {
  locale?: 'en' | 'cs'
}

export function FeedbackWidget({ locale = 'en' }: FeedbackWidgetProps) {
  const isCzech = locale === 'cs'
  const langPrefix = isCzech ? '/cs' : ''

  const content = isCzech ? {
    title: 'Pomožte nám se zlepšovat!',
    description: 'Vaše zpětná vazba je pro nás neocenitelná. Sdílejte své nápady, návrhy nebo nahlaste problémy.',
    buttonText: 'Sdílet Zpětnou Vazbu',
    features: [
      '💡 Navrhněte nové funkce',
      '🐛 Nahlaste chyby',
      '⭐ Ohodnoťte naši službu',
      '🚀 Pomozte nám růst'
    ]
  } : {
    title: 'Help Us Improve!',
    description: 'Your feedback is invaluable to us. Share your ideas, suggestions, or report any issues.',
    buttonText: 'Share Feedback',
    features: [
      '💡 Suggest new features',
      '🐛 Report bugs',
      '⭐ Rate our service',
      '🚀 Help us grow'
    ]
  }

  return (
    <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50 hover:border-blue-300 transition-all duration-300 dark:border-blue-800 dark:from-blue-950/30 dark:to-purple-950/30 dark:hover:border-blue-700">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full flex items-center justify-center">
              <Heart className="h-2 w-2 text-white" />
            </div>
          </div>
        </div>
        <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {content.title}
        </CardTitle>
        <CardDescription className="text-center">
          {content.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {content.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-1 text-muted-foreground">
              <span>{feature}</span>
            </div>
          ))}
        </div>
        
        <Button 
          asChild 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Link href={`${langPrefix}/feedback`} className="flex items-center justify-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {content.buttonText}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-current" />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {isCzech ? 'Anonymní • Rychlé • Důležité pro nás' : 'Anonymous • Quick • Important to us'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
