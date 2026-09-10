import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  locale: 'en',
  path: '/pricing',
  title: 'Pricing: Pay-As-You-Go Subtitle Translation Credits',
  description:
    'Translate your first complete subtitle file free, then pay only for what you translate with credit packs. No subscription and purchased credits never expire.',
  keywords: ['subtitle translation pricing', 'subtitle translator cost', 'pay per use subtitle translation', 'SubtitleBot credits'],
})

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
