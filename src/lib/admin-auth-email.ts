const ADMIN_EMAILS = [
  'premium@test.com',
  'admin@subtitlebot.com',
  'admin@subtitle-ai.com',
  'ceo@subtitle-ai.com',
  'manager@subtitle-ai.com'
]

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

