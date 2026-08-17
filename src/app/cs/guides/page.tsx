import type { Metadata } from 'next'
import { GuideHub } from '@/components/guides/guide-hub'

export const metadata: Metadata = {
  title: 'Návody pro titulky: hledání, synchronizace a překlad',
  description: 'Praktické návody pro výběr release, opravu synchronizace a FPS, volbu formátu a bezpečný překlad titulků.',
  alternates: { canonical: '/cs/guides', languages: { en: '/guides', cs: '/cs/guides', 'x-default': '/guides' } },
  openGraph: { title: 'Návody pro titulky | SubtitleBot', description: 'Praktická pomoc s hledáním, opravou, převodem a překladem titulků.', url: '/cs/guides', images: ['/og-image-cs.png'] },
}

export default function CzechGuidesPage() { return <GuideHub locale="cs" /> }
