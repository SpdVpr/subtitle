import Script from 'next/script'

interface StructuredDataProps {
  locale?: 'en' | 'cs'
  page?: 'home' | 'translate' | 'search' | 'editor' | 'video-tools' | 'pricing' | 'about'
}

export function StructuredData({ locale = 'en', page = 'home' }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://subtitle-ai.vercel.app'
  const isCs = locale === 'cs'
  const urlPrefix = isCs ? '/cs' : ''

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SubtitleBot",
    "alternateName": "SubtitleAI",
    "url": baseUrl,
    "logo": `${baseUrl}/logo-sub.png`,
    "description": isCs 
      ? "Pokročilý AI překladač titulků s podporou 100+ jazyků. Rychlé, přesné a kontextové překlady pro filmy, seriály a video obsah."
      : "Advanced AI subtitle translator supporting 100+ languages. Fast, accurate, and context-aware translations for movies, TV shows, and video content.",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@subtitle-ai.com",
      "availableLanguage": ["English", "Czech"]
    },
    "sameAs": [
      "https://twitter.com/SubtitleBot",
      "https://github.com/subtitle-ai"
    ]
  }

  // Website Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": isCs ? "SubtitleBot - AI Překlad Titulků" : "SubtitleBot - AI Subtitle Translation",
    "url": `${baseUrl}${urlPrefix}`,
    "description": isCs
      ? "Překládejte titulky pomocí pokročilé AI technologie. Podpora SRT, VTT a dalších formátů s kontextovým překladem."
      : "Translate subtitles using advanced AI technology. Support for SRT, VTT and other formats with contextual translation.",
    "inLanguage": isCs ? "cs-CZ" : "en-US",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}${urlPrefix}/subtitles-search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  // Software Application Schema
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SubtitleBot",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web Browser",
    "description": isCs
      ? "AI-poháněný překladač titulků s podporou více než 100 jazyků. Rychlé, přesné překlady s kontextovým povědomím pro profesionální kvalitu."
      : "AI-powered subtitle translator supporting 100+ languages. Fast, accurate translations with contextual awareness for professional quality.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": isCs ? "Zdarma s prémiovou možností" : "Free with premium option"
    },
    "featureList": [
      isCs ? "AI překlad titulků" : "AI subtitle translation",
      isCs ? "Podpora 100+ jazyků" : "100+ language support", 
      isCs ? "Kontextový překlad" : "Contextual translation",
      isCs ? "Více formátů souborů" : "Multiple file formats",
      isCs ? "Dávkové zpracování" : "Batch processing",
      isCs ? "Editor titulků" : "Subtitle editor",
      isCs ? "Video přehrávač" : "Video player",
      isCs ? "Plovoucí titulky" : "Floating subtitles"
    ],
    "screenshot": `${baseUrl}/og-image-${locale}.png`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
      "bestRating": "5"
    }
  }

  // FAQ Schema for home page
  const faqSchema = page === 'home' ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": isCs ? [
      {
        "@type": "Question",
        "name": "Jak funguje AI překlad titulků?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Náš AI engine kombinuje OpenAI GPT modely s kontextovým výzkumem pro přesné překlady. Analyzuje kontext filmu/seriálu, vztahy mezi postavami a kulturní nuance pro nejlepší možnou kvalitu překladu."
        }
      },
      {
        "@type": "Question", 
        "name": "Jaké formáty titulků podporujete?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Podporujeme 7 hlavních formátů: SRT, VTT, ASS, SSA, SUB, SBV a TXT. Automaticky detekujeme formát a kódování vašich souborů."
        }
      },
      {
        "@type": "Question",
        "name": "Kolik jazyků podporujete?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Podporujeme více než 100 jazykových párů včetně všech hlavních světových jazyků a dialektů. Náš AI engine rozumí kulturním nuancím každého jazyka."
        }
      },
      {
        "@type": "Question",
        "name": "Je služba zdarma?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ano! Noví uživatelé získají 200 kreditů zdarma při registraci. Poté můžete kupovat kredity podle potřeby - žádné měsíční předplatné, kredity nikdy nevyprší."
        }
      }
    ] : [
      {
        "@type": "Question",
        "name": "How does AI subtitle translation work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our AI engine combines OpenAI GPT models with contextual research for accurate translations. It analyzes movie/show context, character relationships, and cultural nuances for the best possible translation quality."
        }
      },
      {
        "@type": "Question",
        "name": "What subtitle formats do you support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We support 7 major formats: SRT, VTT, ASS, SSA, SUB, SBV, and TXT. We automatically detect the format and encoding of your files."
        }
      },
      {
        "@type": "Question",
        "name": "How many languages do you support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We support 100+ language pairs including all major world languages and dialects. Our AI engine understands cultural nuances of each language."
        }
      },
      {
        "@type": "Question",
        "name": "Is the service free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! New users get 200 free credits upon registration. After that, you can buy credits as needed - no monthly subscriptions, credits never expire."
        }
      }
    ]
  } : null

  // Service Schema for specific pages
  const serviceSchema = page === 'translate' ? {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": isCs ? "AI Překlad Titulků" : "AI Subtitle Translation",
    "description": isCs
      ? "Profesionální překlad titulků pomocí pokročilé AI technologie s kontextovým povědomím."
      : "Professional subtitle translation using advanced AI technology with contextual awareness.",
    "provider": {
      "@type": "Organization",
      "name": "SubtitleBot"
    },
    "areaServed": "Worldwide",
    "availableLanguage": ["en", "cs", "de", "fr", "es", "it", "pt", "ru", "ja", "ko", "zh"],
    "serviceType": isCs ? "Překlad titulků" : "Subtitle Translation"
  } : null

  const schemas = [organizationSchema, websiteSchema, softwareSchema]
  if (faqSchema) schemas.push(faqSchema)
  if (serviceSchema) schemas.push(serviceSchema)

  return (
    <>
      {schemas.map((schema, index) => (
        <Script
          key={index}
          id={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
      ))}
    </>
  )
}
