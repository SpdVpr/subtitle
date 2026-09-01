import Script from 'next/script'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSchemaProps {
  faqs: FAQItem[]
  locale?: 'en' | 'cs'
}

export function FAQSchema({ faqs, locale = 'en' }: FAQSchemaProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqSchema)
      }}
    />
  )
}

// Predefined FAQ data
export const defaultFAQs = {
  en: [
    {
      question: "How does AI subtitle translation work?",
      answer: "Our AI engine combines Google Gemini models with contextual research for accurate translations. It analyzes movie/show context, character relationships, and cultural nuances for the best possible translation quality."
    },
    {
      question: "What subtitle formats do you support?",
      answer: "We support 7 major formats: SRT, VTT, ASS, SSA, SUB, SBV, and TXT. We automatically detect the format and encoding of your files."
    },
    {
      question: "How many languages do you support?",
      answer: "We support 100+ language pairs including all major world languages and dialects. Our AI engine understands cultural nuances of each language."
    },
    {
      question: "Is the service free?",
      answer: "Yes. Your first complete subtitle file is free in either quality and requires no card. Continuing translations use pay-as-you-go credits that never expire."
    },
    {
      question: "How accurate are the translations?",
      answer: "Quality varies by language pair and source material. SubtitleBot uses contextual AI, preserves timing, and lets you review and edit the result before publishing."
    },
    {
      question: "Can I translate multiple files at once?",
      answer: "Yes! Our batch translation feature allows you to upload and translate multiple subtitle files simultaneously, saving you time and effort."
    },
    {
      question: "Do you preserve subtitle timing?",
      answer: "Absolutely! Our system maintains perfect timing synchronization while translating the text content. You can also make manual adjustments if needed."
    },
    {
      question: "What makes your AI translation better?",
      answer: "Unlike basic translators, our AI performs contextual research about the movie/show, understands character dynamics, and adapts translations for cultural relevance while maintaining natural flow."
    }
  ],
  cs: [
    {
      question: "Jak funguje AI překlad titulků?",
      answer: "Náš AI engine kombinuje Google Gemini modely s kontextovým výzkumem pro přesné překlady. Analyzuje kontext filmu/seriálu, vztahy mezi postavami a kulturní nuance pro nejlepší možnou kvalitu překladu."
    },
    {
      question: "Jaké formáty titulků podporujete?",
      answer: "Podporujeme 7 hlavních formátů: SRT, VTT, ASS, SSA, SUB, SBV a TXT. Automaticky detekujeme formát a kódování vašich souborů."
    },
    {
      question: "Kolik jazyků podporujete?",
      answer: "Podporujeme více než 100 jazykových párů včetně všech hlavních světových jazyků a dialektů. Náš AI engine rozumí kulturním nuancím každého jazyka."
    },
    {
      question: "Je služba zdarma?",
      answer: "Ano. První kompletní soubor titulků je zdarma ve Standard nebo Premium kvalitě a bez platební karty. Další překlady používají kredity, které nevyprší."
    },
    {
      question: "Jak přesné jsou překlady?",
      answer: "Kvalita závisí na jazykovém páru a zdrojovém textu. SubtitleBot používá kontextovou AI, zachová časování a výsledek můžete před publikováním zkontrolovat a upravit."
    },
    {
      question: "Mohu překládat více souborů najednou?",
      answer: "Ano! Naše funkce dávkového překladu vám umožňuje nahrát a přeložit více souborů s titulky současně, což vám ušetří čas a úsilí."
    },
    {
      question: "Zachováváte časování titulků?",
      answer: "Absolutně! Náš systém udržuje perfektní synchronizaci časování při překladu textového obsahu. V případě potřeby můžete také provést ruční úpravy."
    },
    {
      question: "Čím je váš AI překlad lepší?",
      answer: "Na rozdíl od základních překladačů náš AI provádí kontextový výzkum o filmu/seriálu, rozumí dynamice postav a přizpůsobuje překlady pro kulturní relevanci při zachování přirozeného toku."
    }
  ]
}
