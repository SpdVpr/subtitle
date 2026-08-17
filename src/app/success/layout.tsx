import { CreditsProvider } from '@/contexts/credits-context'

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return <CreditsProvider>{children}</CreditsProvider>
}
