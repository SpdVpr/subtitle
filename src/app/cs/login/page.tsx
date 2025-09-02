import { LoginForm } from '@/components/forms/login-form'

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8 px-4">
      <LoginForm locale="cs" />
    </div>
  )
}

export const metadata = {
  title: 'Přihlášení - SubtitleBot',
  description: 'Přihlaste se do svého SubtitleBot účtu a pokračujte v překládání titulků',
  keywords: [
    'přihlášení',
    'login',
    'SubtitleBot',
    'účet',
    'překlad titulků',
    'AI překlad'
  ],
  openGraph: {
    title: 'Přihlášení - SubtitleBot',
    description: 'Přihlaste se do svého SubtitleBot účtu a pokračujte v překládání titulků',
    url: '/cs/login',
    siteName: 'SubtitleBot',
    locale: 'cs_CZ',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Přihlášení - SubtitleBot',
    description: 'Přihlaste se do svého SubtitleBot účtu a pokračujte v překládání titulků',
  },
}
