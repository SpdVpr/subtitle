import { SubscriptionProvider } from '@/components/providers/subscription-provider'

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <SubscriptionProvider>{children}</SubscriptionProvider>
}
