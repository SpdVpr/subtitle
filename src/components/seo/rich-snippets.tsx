import Script from 'next/script'

interface RichSnippetsProps {
  type: 'product' | 'service' | 'article' | 'howto' | 'review' | 'organization'
  data: any
  locale?: 'en' | 'cs'
}

export function RichSnippets({ type, data, locale = 'en' }: RichSnippetsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://subtitle-ai.vercel.app'
  
  const generateSchema = () => {
    switch (type) {
      case 'product':
        return {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": data.name || "SubtitleBot",
          "description": data.description,
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": data.price || "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          "aggregateRating": data.rating ? {
            "@type": "AggregateRating",
            "ratingValue": data.rating.value,
            "ratingCount": data.rating.count,
            "bestRating": "5"
          } : undefined,
          "screenshot": `${baseUrl}/og-image-${locale}.png`
        }

      case 'service':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": data.name,
          "description": data.description,
          "provider": {
            "@type": "Organization",
            "name": "SubtitleBot"
          },
          "areaServed": "Worldwide",
          "availableLanguage": data.languages || ["en", "cs"],
          "serviceType": data.serviceType,
          "offers": {
            "@type": "Offer",
            "price": data.price || "0",
            "priceCurrency": "USD"
          }
        }

      case 'article':
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data.title,
          "description": data.description,
          "author": {
            "@type": "Organization",
            "name": "SubtitleBot Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "SubtitleBot",
            "logo": {
              "@type": "ImageObject",
              "url": `${baseUrl}/logo-sub.png`
            }
          },
          "datePublished": data.publishedDate,
          "dateModified": data.modifiedDate || data.publishedDate,
          "image": data.image ? `${baseUrl}${data.image}` : `${baseUrl}/og-image-${locale}.png`
        }

      case 'howto':
        return {
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": data.name,
          "description": data.description,
          "image": data.image ? `${baseUrl}${data.image}` : `${baseUrl}/og-image-${locale}.png`,
          "totalTime": data.totalTime,
          "estimatedCost": {
            "@type": "MonetaryAmount",
            "currency": "USD",
            "value": data.cost || "0"
          },
          "step": data.steps?.map((step: any, index: number) => ({
            "@type": "HowToStep",
            "position": index + 1,
            "name": step.name,
            "text": step.description,
            "image": step.image ? `${baseUrl}${step.image}` : undefined
          }))
        }

      case 'review':
        return {
          "@context": "https://schema.org",
          "@type": "Review",
          "itemReviewed": {
            "@type": "SoftwareApplication",
            "name": "SubtitleBot"
          },
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": data.rating,
            "bestRating": "5"
          },
          "author": {
            "@type": "Person",
            "name": data.author
          },
          "reviewBody": data.content,
          "datePublished": data.date
        }

      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "SubtitleBot",
          "url": baseUrl,
          "logo": `${baseUrl}/logo-sub.png`,
          "description": data.description,
          "foundingDate": "2024",
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "support@subtitle-ai.com",
            "availableLanguage": ["English", "Czech"]
          },
          "sameAs": data.socialLinks || []
        }

      default:
        return null
    }
  }

  const schema = generateSchema()
  
  if (!schema) return null

  return (
    <Script
      id={`rich-snippet-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  )
}

// Predefined rich snippet configurations
export const richSnippetConfigs = {
  subtitleTranslationService: {
    type: 'service' as const,
    data: {
      name: 'AI Subtitle Translation Service',
      description: 'Professional AI-powered subtitle translation supporting 100+ languages with contextual awareness.',
      serviceType: 'Translation Service',
      languages: ['en', 'cs', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
      price: '0'
    }
  },
  
  subtitleBotApp: {
    type: 'product' as const,
    data: {
      name: 'SubtitleBot',
      description: 'AI-powered subtitle translation application with support for 100+ languages and multiple file formats.',
      price: '0',
      rating: {
        value: '4.8',
        count: '1250'
      }
    }
  },

  howToTranslateSubtitles: {
    type: 'howto' as const,
    data: {
      name: 'How to Translate Subtitles with AI',
      description: 'Step-by-step guide to translating subtitle files using AI technology.',
      totalTime: 'PT5M',
      cost: '0',
      steps: [
        {
          name: 'Upload Subtitle File',
          description: 'Upload your SRT, VTT, or other subtitle file format to the platform.'
        },
        {
          name: 'Select Target Language',
          description: 'Choose from 100+ supported languages for translation.'
        },
        {
          name: 'AI Translation Process',
          description: 'Our AI analyzes context and translates with cultural awareness.'
        },
        {
          name: 'Download Translated File',
          description: 'Download your translated subtitle file with preserved timing.'
        }
      ]
    }
  }
}
