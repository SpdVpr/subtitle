interface StructuredDataProps {
  locale?: 'en' | 'cs'
  page?: 'home' | 'translate' | 'search' | 'editor' | 'video-tools' | 'pricing' | 'about' | 'statistics'
}

const PAGE_PATHS = {
  home: '',
  translate: '/translate',
  search: '/subtitles-search',
  editor: '/subtitle-editor',
  'video-tools': '/video-tools',
  pricing: '/pricing',
  about: '/about',
  statistics: '/statistics',
} as const

export function StructuredData({ locale = 'en', page = 'home' }: StructuredDataProps) {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.subtitlebot.com').replace(/\/$/, '')
  const isCs = locale === 'cs'
  const prefix = isCs ? '/cs' : ''
  const pagePath = `${prefix}${PAGE_PATHS[page]}`
  const pageUrl = `${baseUrl}${pagePath || '/'}`
  const organizationId = `${baseUrl}/#organization`
  const websiteId = `${baseUrl}/#website`
  const softwareId = `${baseUrl}/#software`

  const pageNames: Record<NonNullable<StructuredDataProps['page']>, { en: string; cs: string }> = {
    home: { en: 'SubtitleBot AI Subtitle Tools', cs: 'SubtitleBot AI nástroje pro titulky' },
    translate: { en: 'AI Subtitle Translator', cs: 'AI překladač titulků' },
    search: { en: 'Subtitle Finder for Movies, TV Shows and Anime', cs: 'Vyhledávač titulků pro filmy, seriály a anime' },
    editor: { en: 'Online Subtitle Editor', cs: 'Online editor titulků' },
    'video-tools': { en: 'Online Video and Subtitle Tools', cs: 'Online nástroje pro video a titulky' },
    pricing: { en: 'SubtitleBot Pricing', cs: 'Ceník SubtitleBot' },
    about: { en: 'About SubtitleBot', cs: 'O SubtitleBot' },
    statistics: { en: 'SubtitleBot Statistics', cs: 'Statistiky SubtitleBot' },
  }

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: 'SubtitleBot',
      url: baseUrl,
      logo: { '@type': 'ImageObject', url: `${baseUrl}/logo-sub.png` },
      email: 'support@subtitlebot.com',
      address: { '@type': 'PostalAddress', addressLocality: 'Prague', addressCountry: 'CZ' },
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: baseUrl,
      name: 'SubtitleBot',
      publisher: { '@id': organizationId },
      inLanguage: ['en', 'cs'],
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${baseUrl}/subtitles-search?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': softwareId,
      name: 'SubtitleBot',
      url: baseUrl,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires a modern web browser with JavaScript enabled',
      description: isCs
        ? 'Webová aplikace pro vyhledávání, překlad, editaci a synchronizaci titulků.'
        : 'Web application for finding, translating, editing, and synchronizing subtitles.',
      featureList: [
        isCs ? 'Vyhledávání filmových, seriálových a anime titulků' : 'Movie, TV series, and anime subtitle search',
        isCs ? 'AI překlad titulků ve více než 100 jazykových párech' : 'AI subtitle translation across 100+ language pairs',
        isCs ? 'Podpora formátů SRT, VTT, ASS, SSA, SUB, SBV a TXT' : 'SRT, VTT, ASS, SSA, SUB, SBV, and TXT support',
        isCs ? 'Online editor a synchronizace titulků' : 'Online subtitle editing and synchronization',
      ],
      offers: {
        '@type': 'Offer',
        url: `${baseUrl}${prefix}/pricing`,
        price: '0',
        priceCurrency: 'USD',
        description: isCs ? '100 uvítacích kreditů zdarma' : '100 free welcome credits',
      },
      publisher: { '@id': organizationId },
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: pageNames[page][locale],
      isPartOf: { '@id': websiteId },
      about: { '@id': softwareId },
      inLanguage: isCs ? 'cs-CZ' : 'en-US',
    },
  ]

  if (page !== 'home') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: isCs ? 'Domů' : 'Home', item: `${baseUrl}${prefix || '/'}` },
        { '@type': 'ListItem', position: 2, name: pageNames[page][locale], item: pageUrl },
      ],
    })
  }

  if (page === 'search') {
    graph.push({
      '@type': 'WebApplication',
      '@id': `${pageUrl}#subtitle-finder`,
      name: pageNames.search[locale],
      url: pageUrl,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      isAccessibleForFree: true,
      description: isCs
        ? 'Bezplatný vyhledávač titulků podle názvu, roku, typu obsahu a jazyka.'
        : 'Free subtitle finder with title, year, content-type, and language filters.',
      featureList: [
        isCs ? 'Filmy a seriály přes OpenSubtitles' : 'Movies and TV shows via OpenSubtitles',
        isCs ? 'Anime titulky přes Jimaku' : 'Anime subtitles via Jimaku',
        isCs ? 'Filtry jazyka, roku a důvěryhodného zdroje' : 'Language, year, and trusted-source filters',
      ],
      provider: { '@id': organizationId },
    })
  }

  if (page === 'translate') {
    graph.push({
      '@type': 'Service',
      '@id': `${pageUrl}#service`,
      name: pageNames.translate[locale],
      url: pageUrl,
      serviceType: isCs ? 'AI překlad titulků' : 'AI subtitle translation',
      areaServed: 'Worldwide',
      provider: { '@id': organizationId },
    })
  }

  const schema = { '@context': 'https://schema.org', '@graph': graph }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  )
}
