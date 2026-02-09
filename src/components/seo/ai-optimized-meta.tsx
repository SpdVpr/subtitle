import Head from 'next/head'

interface AIOptimizedMetaProps {
  page: 'home' | 'translate' | 'search' | 'editor' | 'video-tools' | 'pricing' | 'about'
  locale?: 'en' | 'cs'
  customTitle?: string
  customDescription?: string
}

export function AIOptimizedMeta({ 
  page, 
  locale = 'en', 
  customTitle, 
  customDescription 
}: AIOptimizedMetaProps) {
  const isCs = locale === 'cs'
  
  // AI-optimized content for different pages and locales
  const content = {
    en: {
      home: {
        title: "SubtitleBot - AI Subtitle Translation | 100+ Languages | Free Credits",
        description: "Professional AI subtitle translator supporting 100+ languages. Fast, accurate, context-aware translations for movies, TV shows, videos. Free 200 credits. No subscription required. Try now!",
        keywords: "AI subtitle translation, SRT translator, video subtitles, OpenAI translation, multilingual subtitles, subtitle converter, free subtitle translation, professional subtitle service"
      },
      translate: {
        title: "AI Subtitle Translation Tool | Translate SRT, VTT Files | SubtitleBot",
        description: "Translate subtitle files instantly with AI. Support for SRT, VTT, ASS formats. 100+ languages, contextual translation, perfect timing preservation. Start translating for free!",
        keywords: "translate subtitles, SRT translation, VTT translator, AI subtitle converter, batch subtitle translation, video localization, subtitle timing"
      },
      search: {
        title: "Search & Download Subtitles | OpenSubtitles & Jimaku Database | SubtitleBot",
        description: "Search and download subtitles from OpenSubtitles and Jimaku databases. Find subtitles for movies, TV shows, anime in multiple languages. Free subtitle downloads.",
        keywords: "subtitle search, download subtitles, OpenSubtitles, Jimaku subtitles, movie subtitles, TV show subtitles, anime subtitles, free subtitles"
      },
      editor: {
        title: "Online Subtitle Editor | Edit SRT, VTT Files | Floating Subtitles | SubtitleBot",
        description: "Professional online subtitle editor with floating subtitle overlay. Edit timing, text, and sync subtitles with any video. Works with Netflix, YouTube, and all video players.",
        keywords: "subtitle editor, floating subtitles, subtitle overlay, edit subtitles, subtitle timing, video subtitle editor, online SRT editor"
      },
      'video-tools': {
        title: "Video Tools | Floating Subtitles & Video Player | SubtitleBot",
        description: "Advanced video tools with floating subtitle overlay and integrated video player. Perfect for Netflix, YouTube, and any video content. No installation required.",
        keywords: "video tools, floating subtitles, video player, subtitle overlay, Netflix subtitles, YouTube subtitles, video subtitle tools"
      },
      pricing: {
        title: "Pricing | AI Subtitle Translation Credits | No Subscription | SubtitleBot",
        description: "Simple credit-based pricing for AI subtitle translation. No monthly subscriptions, credits never expire. Start with 200 free credits. Pay only for what you use.",
        keywords: "subtitle translation pricing, AI translation credits, no subscription, pay per use, free credits, subtitle translation cost"
      },
      about: {
        title: "About SubtitleBot | AI-Powered Subtitle Translation Service",
        description: "Learn about SubtitleBot's AI-powered subtitle translation technology. Our mission to make video content accessible worldwide through advanced AI translation.",
        keywords: "about SubtitleBot, AI subtitle translation, video accessibility, subtitle technology, AI translation service"
      }
    },
    cs: {
      home: {
        title: "SubtitleBot - AI Překlad Titulků | 100+ Jazyků | Zdarma Kredity",
        description: "Profesionální AI překladač titulků s podporou 100+ jazyků. Rychlé, přesné, kontextové překlady pro filmy, seriály, videa. 200 kreditů zdarma. Bez předplatného. Vyzkoušejte nyní!",
        keywords: "AI překlad titulků, SRT překladač, video titulky, OpenAI překlad, vícejazyčné titulky, konvertor titulků, zdarma překlad titulků, profesionální služba titulků"
      },
      translate: {
        title: "AI Nástroj pro Překlad Titulků | Přeložte SRT, VTT Soubory | SubtitleBot",
        description: "Překládejte soubory titulků okamžitě pomocí AI. Podpora SRT, VTT, ASS formátů. 100+ jazyků, kontextový překlad, perfektní zachování časování. Začněte překládat zdarma!",
        keywords: "přeložit titulky, SRT překlad, VTT překladač, AI konvertor titulků, dávkový překlad titulků, lokalizace videa, časování titulků"
      },
      search: {
        title: "Hledat a Stáhnout Titulky | OpenSubtitles & Jimaku Databáze | SubtitleBot",
        description: "Vyhledávejte a stahujte titulky z databází OpenSubtitles a Jimaku. Najděte titulky pro filmy, TV seriály, anime ve více jazycích. Zdarma stahování titulků.",
        keywords: "hledání titulků, stahování titulků, OpenSubtitles, Jimaku titulky, filmové titulky, TV seriálové titulky, anime titulky, zdarma titulky"
      },
      editor: {
        title: "Online Editor Titulků | Editace SRT, VTT Souborů | Plovoucí Titulky | SubtitleBot",
        description: "Profesionální online editor titulků s plovoucím overlay titulků. Upravujte časování, text a synchronizujte titulky s jakýmkoli videem. Funguje s Netflix, YouTube a všemi video přehrávači.",
        keywords: "editor titulků, plovoucí titulky, overlay titulků, upravit titulky, časování titulků, video editor titulků, online SRT editor"
      },
      'video-tools': {
        title: "Video Nástroje | Plovoucí Titulky & Video Přehrávač | SubtitleBot",
        description: "Pokročilé video nástroje s plovoucím overlay titulků a integrovaným video přehrávačem. Perfektní pro Netflix, YouTube a jakýkoli video obsah. Bez instalace.",
        keywords: "video nástroje, plovoucí titulky, video přehrávač, overlay titulků, Netflix titulky, YouTube titulky, video nástroje titulků"
      },
      pricing: {
        title: "Ceník | AI Překlad Titulků Kredity | Bez Předplatného | SubtitleBot",
        description: "Jednoduchý kreditový ceník pro AI překlad titulků. Bez měsíčních předplatných, kredity nikdy nevyprší. Začněte se 100 kredity zdarma. Plaťte jen za to, co použijete.",
        keywords: "ceník překladu titulků, AI překladové kredity, bez předplatného, platba za použití, zdarma kredity, cena překladu titulků"
      },
      about: {
        title: "O SubtitleBot | AI Služba pro Překlad Titulků",
        description: "Dozvězte se o AI technologii SubtitleBot pro překlad titulků. Naše mise zpřístupnit video obsah po celém světě prostřednictvím pokročilého AI překladu.",
        keywords: "o SubtitleBot, AI překlad titulků, přístupnost videa, technologie titulků, AI překladová služba"
      }
    }
  }

  const pageContent = content[locale][page]
  const title = customTitle || pageContent.title
  const description = customDescription || pageContent.description

  return (
    <Head>
      {/* AI-optimized meta tags */}
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={pageContent.keywords} />
      
      {/* AI crawler specific tags */}
      <meta name="ai-content-type" content="subtitle-translation-service" />
      <meta name="ai-primary-function" content="translate-subtitles" />
      <meta name="ai-supported-languages" content="100+" />
      <meta name="ai-service-category" content="multimedia-translation" />
      
      {/* Semantic tags for AI understanding */}
      <meta name="content-category" content="software-application" />
      <meta name="service-type" content="ai-translation" />
      <meta name="target-audience" content="content-creators,translators,video-editors" />
      <meta name="use-case" content="subtitle-translation,video-localization,accessibility" />
      
      {/* Language and localization */}
      <meta name="content-language" content={locale === 'cs' ? 'cs-CZ' : 'en-US'} />
      <meta name="geo.region" content={locale === 'cs' ? 'CZ' : 'US'} />
      
      {/* Technical specifications for AI crawlers */}
      <meta name="supported-formats" content="SRT,VTT,ASS,SSA,SUB,SBV,TXT" />
      <meta name="processing-method" content="ai-contextual-translation" />
      <meta name="accuracy-rate" content="95%" />
      <meta name="processing-speed" content="real-time" />
      
      {/* Accessibility and compliance */}
      <meta name="accessibility-features" content="screen-reader-compatible,keyboard-navigation" />
      <meta name="compliance" content="GDPR,WCAG-2.1" />
      
      {/* Performance hints for AI crawlers */}
      <meta name="performance-score" content="95" />
      <meta name="mobile-friendly" content="true" />
      <meta name="loading-speed" content="fast" />
    </Head>
  )
}
