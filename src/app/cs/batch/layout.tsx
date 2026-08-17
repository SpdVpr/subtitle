import { BatchProvider } from '@/components/providers/batch-provider'

export default function CzechBatchLayout({ children }: { children: React.ReactNode }) {
  return <BatchProvider>{children}</BatchProvider>
}
