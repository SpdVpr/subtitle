export function safeInternalRedirect(value: string | null | undefined, fallback = '/dashboard'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  try {
    const url = new URL(value, 'https://www.subtitlebot.com')
    if (url.origin !== 'https://www.subtitlebot.com') return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}

export function currentRedirect(fallback = '/dashboard'): string {
  if (typeof window === 'undefined') return fallback
  return safeInternalRedirect(new URLSearchParams(window.location.search).get('redirect'), fallback)
}
