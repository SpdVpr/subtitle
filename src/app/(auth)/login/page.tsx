import { LoginForm } from '@/components/forms/login-form'

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
      <LoginForm />
    </div>
  )
}

export const metadata = {
  title: 'Sign In - SubtitleAI',
  description: 'Sign in to your SubtitleAI account',
}
