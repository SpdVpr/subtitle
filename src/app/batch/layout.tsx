import { BatchProvider } from '@/components/providers/batch-provider'

export default function BatchLayout({ children }: { children: React.ReactNode }) {
  return <BatchProvider>{children}</BatchProvider>
}
