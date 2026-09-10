import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  locale: 'cs',
  path: '/subtitle-editor',
  title: 'Online editor titulků: úprava, synchronizace a oprava SRT',
  description:
    'Bezplatný online editor titulků. Opravte časování, posuňte nebo roztáhněte titulky, upravte text, použijte hledání a nahrazení a exportujte SRT, VTT, ASS a další formáty bez instalace.',
  keywords: ['editor titulků', 'online editor titulků', 'úprava SRT online', 'synchronizace titulků', 'oprava časování titulků'],
})

export default function CzechSubtitleEditorLayout({ children }: { children: React.ReactNode }) {
  return children
}
