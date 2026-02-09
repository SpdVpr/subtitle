interface HreflangTagsProps {
  currentPath: string
}

export function HreflangTags({ currentPath }: HreflangTagsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://subtitle-ai.vercel.app'
  
  // Remove /cs prefix if present to get the base path
  const basePath = currentPath.startsWith('/cs') ? currentPath.replace('/cs', '') : currentPath
  
  // Ensure basePath starts with /
  const normalizedBasePath = basePath.startsWith('/') ? basePath : `/${basePath}`
  
  // Generate URLs for both languages
  const enUrl = `${baseUrl}${normalizedBasePath === '/' ? '' : normalizedBasePath}`
  const csUrl = `${baseUrl}/cs${normalizedBasePath === '/' ? '' : normalizedBasePath}`
  
  return (
    <>
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="cs" href={csUrl} />
      <link rel="alternate" hrefLang="x-default" href={enUrl} />
    </>
  )
}

// Helper function to generate hreflang metadata for Next.js
export function generateHreflangMetadata(currentPath: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://subtitle-ai.vercel.app'
  
  // Remove /cs prefix if present to get the base path
  const basePath = currentPath.startsWith('/cs') ? currentPath.replace('/cs', '') : currentPath
  
  // Ensure basePath starts with /
  const normalizedBasePath = basePath.startsWith('/') ? basePath : `/${basePath}`
  
  return {
    alternates: {
      canonical: currentPath.startsWith('/cs') 
        ? `${baseUrl}/cs${normalizedBasePath === '/' ? '' : normalizedBasePath}`
        : `${baseUrl}${normalizedBasePath === '/' ? '' : normalizedBasePath}`,
      languages: {
        'en': `${baseUrl}${normalizedBasePath === '/' ? '' : normalizedBasePath}`,
        'cs': `${baseUrl}/cs${normalizedBasePath === '/' ? '' : normalizedBasePath}`,
        'x-default': `${baseUrl}${normalizedBasePath === '/' ? '' : normalizedBasePath}`,
      },
    },
  }
}
