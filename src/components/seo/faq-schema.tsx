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
      answer: "Yes! New users get 200 free credits upon registration. After that, you can buy credits as needed - no monthly subscriptions, credits never expire."
    },
    {
      question: "How accurate are the translations?",
      answer: "Our AI achieves 95% accuracy rate by combining advanced language models with contextual understanding. The system analyzes character relationships, cultural context, and maintains proper timing."
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
      answer: "Ano! Noví uživatelé získají 200 kreditů zdarma při registraci. Poté můžete kupovat kredity podle potřeby - žádné měsíční předplatné, kredity nikdy nevyprší."
    },
    {
      question: "Jak přesné jsou překlady?",
      answer: "Naše AI dosahuje 95% míry přesnosti kombinací pokročilých jazykových modelů s kontextovým porozuměním. Systém analyzuje vztahy postav, kulturní kontext a udržuje správné časování."
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
