# Performance Audit & Optimization Plan - 2025

## 📊 Current Performance Metrics

### Core Web Vitals (FAILING)
- **LCP (Largest Contentful Paint)**: 3.8s ❌ (Target: < 2.5s)
- **INP (Interaction to Next Paint)**: 140ms ⚠️ (Target: < 200ms, Good: < 100ms)
- **CLS (Cumulative Layout Shift)**: 0.07 ✅ (Target: < 0.1)

### Additional Metrics
- **FCP (First Contentful Paint)**: 2.0s ⚠️ (Target: < 1.8s)
- **TTFB (Time to First Byte)**: 0.7s ⚠️ (Target: < 0.6s)

### SEO Score
- **Current**: 69/100 ❌
- **Target**: 90+/100

## 🔍 Root Cause Analysis

### 1. LCP Issues (3.8s - CRITICAL)

#### Problem: Large Images Without Optimization
- `gladiator.webp`, `SouthPark.webp`, `solo-leveling.jpeg` loaded without:
  - Priority hints
  - Proper sizing
  - Lazy loading for below-fold images
  - Modern format optimization

#### Problem: Client-Side Rendering
- Entire homepage is `'use client'`
- No Server-Side Rendering (SSR) benefits
- Large JavaScript bundle blocks rendering
- Auth check (`useAuth`) delays initial render

#### Problem: No Image Optimization
- Images not using Next.js `<Image>` component
- No automatic WebP conversion
- No responsive images
- No blur placeholders

### 2. TTFB Issues (0.7s)

#### Problem: Dynamic Rendering
```typescript
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
```
- Forces every request to be dynamic
- No caching benefits
- No static generation

#### Problem: Firebase Auth Check
- `useAuth()` hook runs on every page load
- Adds latency to initial render
- Blocks content display

### 3. INP Issues (140ms)

#### Problem: Heavy Client-Side JavaScript
- Large component tree
- Multiple animations (animate-pulse, animate-bounce)
- No code splitting
- All features loaded upfront

### 4. SEO Issues (69/100)

#### Missing Optimizations:
- ❌ No `<Image>` component with alt text
- ❌ Images missing width/height attributes
- ❌ No lazy loading strategy
- ❌ Missing structured data on some pages
- ❌ No sitemap optimization
- ❌ Missing canonical URLs on some pages

## 🎯 Optimization Strategy

### Phase 1: Critical LCP Fixes (Target: < 2.5s)

#### 1.1 Image Optimization
```typescript
// Replace all <img> with Next.js <Image>
import Image from 'next/image'

<Image
  src="/images/gladiator.webp"
  alt="Gladiator movie scene"
  width={1920}
  height={1080}
  priority // For above-fold images
  placeholder="blur"
  blurDataURL="data:image/..."
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

#### 1.2 Hybrid Rendering Strategy
```typescript
// Convert homepage to Server Component
// Move client-only features to separate components

// page.tsx (Server Component)
export default async function Home() {
  return (
    <>
      <HeroSection /> {/* Server Component */}
      <ClientFeatures /> {/* Client Component */}
    </>
  )
}

// Remove force-dynamic
// export const dynamic = 'force-static'
// export const revalidate = 3600 // 1 hour
```

#### 1.3 Preload Critical Resources
```typescript
// In layout.tsx
<link rel="preload" as="image" href="/images/gladiator.webp" />
<link rel="preload" as="image" href="/logo-sub.png" />
```

### Phase 2: TTFB Optimization (Target: < 0.6s)

#### 2.1 Enable Static Generation
```typescript
// Remove dynamic forcing
// export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour
```

#### 2.2 Optimize Auth Check
```typescript
// Move auth check to client component
// Don't block initial render

export default function Home() {
  return (
    <>
      <StaticContent /> {/* Renders immediately */}
      <AuthDependentContent /> {/* Loads after */}
    </>
  )
}
```

#### 2.3 Add Edge Caching
```typescript
// In next.config.ts
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable SWC minification
  swcMinify: true,
  // Compress responses
  compress: true,
}
```

### Phase 3: INP Optimization (Target: < 100ms)

#### 3.1 Code Splitting
```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic'

const TranslationDemo = dynamic(() => import('@/components/translation-demo'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

#### 3.2 Reduce Animation Overhead
```typescript
// Use CSS transforms instead of layout-triggering properties
// Prefer will-change for animated elements
.animate-pulse {
  will-change: opacity;
}
```

#### 3.3 Optimize Event Handlers
```typescript
// Debounce/throttle expensive operations
import { useDebouncedCallback } from 'use-debounce'

const handleSearch = useDebouncedCallback((value) => {
  // Expensive operation
}, 300)
```

### Phase 4: SEO Enhancements (Target: 90+/100)

#### 4.1 Image SEO
```typescript
// All images must have:
- alt text (descriptive)
- width/height attributes
- loading="lazy" for below-fold
- priority for above-fold
```

#### 4.2 Structured Data Enhancement
```typescript
// Add more schema types
- BreadcrumbList
- FAQPage
- HowTo
- VideoObject (for demo videos)
```

#### 4.3 Meta Tags Optimization
```typescript
// Add missing meta tags
<meta name="theme-color" content="#3b82f6" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
```

## 📋 Implementation Checklist

### Immediate (High Priority)
- [ ] Convert homepage to Server Component
- [ ] Replace all `<img>` with `<Image>`
- [ ] Add priority to hero image
- [ ] Remove `force-dynamic` from layout
- [ ] Add image dimensions
- [ ] Optimize largest images

### Short Term (Medium Priority)
- [ ] Implement code splitting
- [ ] Add lazy loading for below-fold content
- [ ] Optimize animations
- [ ] Add blur placeholders
- [ ] Implement ISR (Incremental Static Regeneration)
- [ ] Add resource hints (preload, prefetch)

### Long Term (Low Priority)
- [ ] Implement service worker for caching
- [ ] Add progressive image loading
- [ ] Optimize font loading
- [ ] Implement route prefetching
- [ ] Add performance monitoring

## 🎯 Expected Results

### After Phase 1 (Image Optimization)
- LCP: 3.8s → 2.2s ✅
- SEO: 69 → 78

### After Phase 2 (TTFB Optimization)
- TTFB: 0.7s → 0.4s ✅
- FCP: 2.0s → 1.2s ✅

### After Phase 3 (INP Optimization)
- INP: 140ms → 80ms ✅

### After Phase 4 (SEO Enhancement)
- SEO: 78 → 92 ✅

### Final Target Metrics
- **LCP**: < 2.0s ✅
- **INP**: < 80ms ✅
- **CLS**: < 0.05 ✅
- **FCP**: < 1.2s ✅
- **TTFB**: < 0.4s ✅
- **SEO**: 92+/100 ✅

## 🔧 Tools for Monitoring

1. **Google PageSpeed Insights**
   - https://pagespeed.web.dev/

2. **Chrome DevTools**
   - Lighthouse
   - Performance tab
   - Network tab

3. **WebPageTest**
   - https://www.webpagetest.org/

4. **Google Search Console**
   - Core Web Vitals report
   - Page Experience report

## 📝 Notes

- All optimizations should be tested on production-like environment
- Monitor real user metrics (RUM) after deployment
- A/B test major changes
- Keep bundle size under 200KB (gzipped)
- Aim for Time to Interactive (TTI) < 3.5s

---

**Created**: 2025-10-07
**Status**: Ready for Implementation
**Priority**: CRITICAL

