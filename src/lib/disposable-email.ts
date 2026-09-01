const DISPOSABLE_DOMAIN_FRAGMENTS = [
  '10minutemail',
  '1maill',
  '5secmail',
  'dispostable',
  'guerrillamail',
  'maildrop',
  'mailinator',
  'mailshan',
  'mailtm',
  'moakt',
  'sharklasers',
  'tempmail',
  'throwawaymail',
  'yopmail',
]

export function isDisposableEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split('@')[1] || ''
  return Boolean(domain) && DISPOSABLE_DOMAIN_FRAGMENTS.some((fragment) => domain.includes(fragment))
}
