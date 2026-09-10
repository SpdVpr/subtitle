import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  locale: 'cs',
  path: '/pricing',
  title: 'Ceník: kredity na AI překlad titulků bez předplatného',
  description:
    'První kompletní soubor titulků přeložíme zdarma. Potom platíte jen za to, co přeložíte, pomocí kreditových balíčků. Bez předplatného, kredity nikdy nevyprší.',
  keywords: ['ceník překladu titulků', 'cena překladu titulků', 'kredity SubtitleBot'],
})

export default function CzechPricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
