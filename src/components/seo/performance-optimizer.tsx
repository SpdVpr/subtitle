'use client'

import { useEffect } from 'react'
import Script from 'next/script'

interface PerformanceOptimizerProps {
  enablePreloading?: boolean
  enablePrefetching?: boolean
  enableServiceWorker?: boolean
  criticalResources?: string[]
}

export function PerformanceOptimizer({
  enablePreloading = true,
  enablePrefetching = true,
  enableServiceWorker = false,
  criticalResources = []
}: PerformanceOptimizerProps) {
  
  useEffect(() => {
    // Preload critical resources
    if (enablePreloading && criticalResources.length > 0) {
      criticalResources.forEach(resource => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = resource
        
        // Determine resource type
        if (resource.endsWith('.css')) {
          link.as = 'style'
        } else if (resource.endsWith('.js')) {
          link.as = 'script'
        } else if (resource.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
          link.as = 'image'
        } else if (resource.match(/\.(woff|woff2|ttf|otf)$/)) {
          link.as = 'font'
          link.crossOrigin = 'anonymous'
        }
        
        document.head.appendChild(link)
      })
    }

    // Prefetch next likely pages
    if (enablePrefetching) {
      const prefetchPages = [
        '/translate',
        '/cs/translate',
        '/subtitles-search',
        '/cs/subtitles-search',
        '/pricing',
        '/cs/pricing'
      ]
      
      // Delay prefetching to avoid blocking critical resources
      setTimeout(() => {
        prefetchPages.forEach(page => {
          const link = document.createElement('link')
          link.rel = 'prefetch'
          link.href = page
          document.head.appendChild(link)
        })
      }, 2000)
    }

    // Register service worker for caching
    if (enableServiceWorker && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(error => {
        console.log('Service Worker registration failed:', error)
      })
    }

    // Optimize images with Intersection Observer
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.removeAttribute('data-src')
            imageObserver.unobserve(img)
          }
        }
      })
    })

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img)
    })

    return () => {
      imageObserver.disconnect()
    }
  }, [enablePreloading, enablePrefetching, enableServiceWorker, criticalResources])

  return (
    <>
      {/* Critical CSS inlining hint */}
      <style jsx>{`
        /* Critical above-the-fold styles */
        .hero-section {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .loading-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        /* Optimize font loading */
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url('/fonts/inter-regular.woff2') format('woff2');
        }
      `}</style>

      {/* Performance monitoring */}
      <Script
        id="performance-monitor"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Monitor Core Web Vitals
            function sendToAnalytics(metric) {
              if (typeof gtag !== 'undefined') {
                gtag('event', metric.name, {
                  event_category: 'Web Vitals',
                  value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                  event_label: metric.id,
                  non_interaction: true,
                });
              }
            }

            // Load web-vitals library
            import('https://unpkg.com/web-vitals@3/dist/web-vitals.js').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
              getCLS(sendToAnalytics);
              getFID(sendToAnalytics);
              getFCP(sendToAnalytics);
              getLCP(sendToAnalytics);
              getTTFB(sendToAnalytics);
            }).catch(err => console.log('Web Vitals loading failed:', err));

            // Resource hints for better performance
            const resourceHints = [
              { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
              { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
              { rel: 'dns-prefetch', href: 'https://api.openai.com' },
              { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
              { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
            ];

            resourceHints.forEach(hint => {
              const link = document.createElement('link');
              Object.assign(link, hint);
              document.head.appendChild(link);
            });
          `
        }}
      />
    </>
  )
}

// Default critical resources for the application
export const defaultCriticalResources = [
  '/logo-sub.png',
  '/og-image-en.png',
  '/og-image-cs.png'
]
