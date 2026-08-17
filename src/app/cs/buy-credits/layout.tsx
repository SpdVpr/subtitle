import { CreditsProvider } from '@/contexts/credits-context'

export default function CzechBuyCreditsLayout({ children }: { children: React.ReactNode }) {
  return <CreditsProvider>{children}</CreditsProvider>
}
