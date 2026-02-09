import { LoginForm } from '@/components/forms/login-form'

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8 px-4">
      <LoginForm />
    </div>
  )
}

export const metadata = {
  title: 'Sign In - SubtitleBot',
  description: 'Sign in to your SubtitleBot account',
}
