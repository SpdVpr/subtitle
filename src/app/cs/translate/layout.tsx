import { BatchProvider } from '@/components/providers/batch-provider'

export default function CzechTranslateLayout({ children }: { children: React.ReactNode }) {
  return <BatchProvider>{children}</BatchProvider>
}
