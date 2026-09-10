import { BatchProvider } from '@/components/providers/batch-provider'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  locale: 'cs',
  path: '/translate',
  title: 'AI překlad titulků online',
  description:
    'Přeložte soubor titulků pomocí kontextové AI se zachováním časování. Podpora 100+ jazyků a formátů SRT, VTT, ASS. První kompletní soubor zdarma bez platební karty.',
  keywords: ['překlad titulků', 'AI překladač titulků', 'přeložit SRT', 'přeložit titulky do češtiny', 'online překlad titulků'],
})

export default function CzechTranslateLayout({ children }: { children: React.ReactNode }) {
  return <BatchProvider>{children}</BatchProvider>
}
