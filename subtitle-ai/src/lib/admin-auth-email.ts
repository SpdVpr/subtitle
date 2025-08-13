const ADMIN_EMAILS = [
  'admin@subtitle-ai.com',
  'ceo@subtitle-ai.com',
  'manager@subtitle-ai.com',
  'premium@test.com',
  'pro@test.com'
]

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

