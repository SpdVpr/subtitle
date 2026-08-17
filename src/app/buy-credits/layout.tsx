import { CreditsProvider } from '@/contexts/credits-context'

export default function BuyCreditsLayout({ children }: { children: React.ReactNode }) {
  return <CreditsProvider>{children}</CreditsProvider>
}
