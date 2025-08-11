# 🎬 AI Subtitle Translator - Webová aplikace
## Podrobný vývojový plán

---

## 📋 **1. PŘEHLED PROJEKTU**

### Název projektu
**SubtitleAI** - Inteligentní překladač a přečasovač titulků

### Hlavní funkce
Webová aplikace umožňující automatický překlad a přečasování SRT titulků pomocí AI, s rozdělením na Free a Premium tarify.

### Technologický stack
- **Frontend:** Next.js 14+ (App Router)
- **Backend:** Next.js API Routes + Firebase Functions
- **Databáze:** Firebase Firestore
- **Autentizace:** Firebase Auth
- **Úložiště:** Firebase Storage
- **Hosting:** Vercel (frontend) + Firebase (backend services)
- **Platby:** Stripe
- **AI služby:** Google Translate (Free) + OpenAI GPT-4 (Premium)

---

## 💰 **2. BUSINESS MODEL**

### Free tarif
- **Limit:** 5 překladů/měsíc
- **AI:** Google Translate
- **Maximální velikost souboru:** 1MB
- **Podporované jazyky:** 20 hlavních jazyků
- **Export:** Základní SRT

### Premium tarif
- **Cena:** $9.99/měsíc nebo $99/rok
- **Limit:** Neomezené překlady
- **AI:** OpenAI GPT-4 (nejlepší kvalita)
- **Maximální velikost souboru:** 10MB
- **Podporované jazyky:** 50+ jazyků
- **Export:** SRT + pokročilé možnosti
- **Prioritní podpora**
- **Batch processing** (více souborů najednou)

---

## 🏗️ **3. SYSTÉMOVÁ ARCHITEKTURA**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   NEXT.JS APP   │    │   FIREBASE       │    │   AI SERVICES   │
│                 │    │                  │    │                 │
│ • UI/UX         │◄──►│ • Auth           │◄──►│ • Google Trans  │
│ • File Upload   │    │ • Firestore      │    │ • OpenAI GPT-4  │
│ • Processing    │    │ • Storage        │    │ • Rate Limiting │
│ • Download      │    │ • Functions      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│     STRIPE      │    │     VERCEL       │
│                 │    │                 │
│ • Subscriptions │    │ • Hosting        │
│ • Payments      │    │ • CDN            │
│ • Webhooks      │    │ • Analytics      │
└─────────────────┘    └──────────────────┘
```

---

## 📁 **4. STRUKTURA PROJEKTU**

```
subtitle-ai/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── 📁 (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── history/page.tsx
│   │   ├── settings/page.tsx
│   │   └── billing/page.tsx
│   ├── 📁 api/
│   │   ├── auth/
│   │   ├── translate/
│   │   ├── upload/
│   │   ├── download/
│   │   ├── stripe/
│   │   └── user/
│   ├── 📁 translate/
│   │   └── page.tsx                 # Hlavní stránka překladu
│   ├── layout.tsx
│   ├── page.tsx                     # Landing page
│   └── globals.css
├── 📁 components/
│   ├── 📁 ui/                       # Shadcn/ui komponenty
│   ├── 📁 forms/
│   ├── 📁 layout/
│   ├── FileUpload.tsx
│   ├── TranslationProgress.tsx
│   ├── LanguageSelector.tsx
│   ├── PricingCard.tsx
│   └── SubtitlePreview.tsx
├── 📁 lib/
│   ├── firebase.ts                  # Firebase konfigurace
│   ├── stripe.ts                    # Stripe konfigurace
│   ├── subtitle-processor.ts        # Core logika překladu
│   ├── ai-translator.ts             # AI služby wrapper
│   ├── utils.ts
│   └── validations.ts
├── 📁 hooks/
│   ├── useAuth.ts
│   ├── useSubscription.ts
│   ├── useTranslation.ts
│   └── useUpload.ts
├── 📁 types/
│   ├── auth.ts
│   ├── subtitle.ts
│   ├── subscription.ts
│   └── api.ts
├── 📁 firebase/                     # Firebase Functions
│   ├── functions/
│   │   ├── src/
│   │   │   ├── translate.ts
│   │   │   ├── stripe-webhooks.ts
│   │   │   └── cleanup.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── firestore.rules
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

---

## 🔧 **5. IMPLEMENTAČNÍ PLÁN**

### **Fáze 1: Základní infrastruktura (Týden 1-2)**

#### 1.1 Projekt setup
```bash
# Vytvořit Next.js projekt
npx create-next-app@latest subtitle-ai --typescript --tailwind --eslint --app

# Nainstalovat závislosti
npm install firebase @stripe/stripe-js openai @google-cloud/translate
npm install @shadcn/ui lucide-react react-hook-form zod
npm install @headlessui/react framer-motion
```

#### 1.2 Firebase konfigurace
```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  // Vaše Firebase konfigurace
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)
```

#### 1.3 Základní komponenty UI
- Layout komponenty
- Navigace
- Footer
- Loading states
- Error boundaries

### **Fáze 2: Autentizace a uživatelské účty (Týden 2-3)**

#### 2.1 Autentizace
```typescript
// hooks/useAuth.ts
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'

export function useAuth() {
  const [user, loading, error] = useAuthState(auth)
  
  return {
    user,
    loading,
    error,
    signIn: (email: string, password: string) => { /* */ },
    signUp: (email: string, password: string) => { /* */ },
    signOut: () => auth.signOut()
  }
}
```

#### 2.2 User management
- Registrace/Přihlášení
- Profil uživatele
- Reset hesla
- Email verifikace

#### 2.3 Firestore schéma
```typescript
// types/firestore.ts
interface User {
  uid: string
  email: string
  displayName?: string
  subscriptionTier: 'free' | 'premium'
  subscriptionId?: string
  translationsUsed: number
  translationsLimit: number
  createdAt: Timestamp
  lastLoginAt: Timestamp
}

interface Translation {
  id: string
  userId: string
  originalFileName: string
  targetLanguage: string
  status: 'processing' | 'completed' | 'failed'
  aiService: 'google' | 'openai'
  originalFileSize: number
  translatedFileUrl?: string
  createdAt: Timestamp
  processingTime?: number
}
```

### **Fáze 3: Core funkcionalita - Upload a překlad (Týden 3-5)**

#### 3.1 File Upload komponenta
```typescript
// components/FileUpload.tsx
'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadSubtitleFile } from '@/lib/upload'

export function FileUpload() {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.name.endsWith('.srt')) {
      await uploadSubtitleFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.srt']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  return (
    <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8">
      <input {...getInputProps()} />
      {/* UI pro drag & drop */}
    </div>
  )
}
```

#### 3.2 Subtitle processor (core logika)
```typescript
// lib/subtitle-processor.ts
export class SubtitleProcessor {
  private aiService: 'google' | 'openai'
  private targetLanguage: string
  
  constructor(aiService: 'google' | 'openai', targetLanguage: string) {
    this.aiService = aiService
    this.targetLanguage = targetLanguage
  }

  async processSubtitle(fileContent: string): Promise<string> {
    // 1. Parse SRT
    const entries = this.parseSRT(fileContent)
    
    // 2. Translate
    const translatedEntries = await this.translateEntries(entries)
    
    // 3. Retime
    const retimedEntries = this.retimeEntries(translatedEntries)
    
    // 4. Generate new SRT
    return this.generateSRT(retimedEntries)
  }

  private parseSRT(content: string): SubtitleEntry[] { /* */ }
  private async translateEntries(entries: SubtitleEntry[]): Promise<SubtitleEntry[]> { /* */ }
  private retimeEntries(entries: SubtitleEntry[]): SubtitleEntry[] { /* */ }
  private generateSRT(entries: SubtitleEntry[]): string { /* */ }
}
```

#### 3.3 AI Translation služby
```typescript
// lib/ai-translator.ts
export class AITranslator {
  async translateWithGoogle(text: string, targetLang: string): Promise<string> {
    // Google Translate implementace
  }

  async translateWithOpenAI(text: string, targetLang: string): Promise<string> {
    // OpenAI GPT-4 implementace s context pro titulky
  }
}
```

#### 3.4 API Routes
```typescript
// app/api/translate/route.ts
export async function POST(request: Request) {
  const { fileContent, targetLanguage, aiService } = await request.json()
  
  // 1. Validate user subscription
  // 2. Check rate limits
  // 3. Process subtitle
  // 4. Return result
}
```

### **Fáze 4: Subscription system (Týden 5-6)**

#### 4.1 Stripe integrace
```typescript
// lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const createCheckoutSession = async (userId: string, priceId: string) => {
  return await stripe.checkout.sessions.create({
    customer_email: userEmail,
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
  })
}
```

#### 4.2 Webhook handling
```typescript
// app/api/stripe/webhook/route.ts
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!
  const body = await req.text()
  
  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  
  switch (event.type) {
    case 'customer.subscription.created':
      // Upgrade user to premium
      break
    case 'customer.subscription.deleted':
      // Downgrade user to free
      break
  }
}
```

#### 4.3 Subscription komponenty
- Pricing page
- Billing dashboard
- Subscription management
- Usage tracking

### **Fáze 5: UI/UX optimalizace (Týden 6-7)**

#### 5.1 Dashboard
- Přehled použitých překladů
- Historie překladů
- Quick actions
- Usage statistics

#### 5.2 Translation interface
- Drag & drop upload
- Language selector
- Progress tracking
- Preview přeložených titulků
- Download možnosti

#### 5.3 Responsive design
- Mobile-first approach
- Tablet optimalizace
- Desktop enhancement

### **Fáze 6: Advanced features (Týden 7-8)**

#### 6.1 Batch processing (Premium)
```typescript
// Umožní nahrát více souborů najednou
export function BatchUpload() {
  // Multiple file selection
  // Queue management
  // Progress tracking per file
}
```

#### 6.2 Preview a editing
- Subtitle preview s video sync
- Manuální úpravy překladů
- Export možnosti (SRT, VTT, ASS)

#### 6.3 Analytics a reporting
- User usage statistics
- Translation accuracy tracking
- Performance metrics

---

## 🗃️ **6. DATABÁZOVÉ SCHÉMA**

### Firestore Collections

#### **users**
```json
{
  "uid": "user123",
  "email": "user@example.com",
  "displayName": "Jan Novák",
  "subscriptionTier": "premium",
  "stripeCustomerId": "cus_xxxxx",
  "subscriptionId": "sub_xxxxx",
  "translationsUsed": 15,
  "translationsLimit": -1,
  "createdAt": "2024-01-01T00:00:00Z",
  "lastActive": "2024-01-15T10:30:00Z"
}
```

#### **translations**
```json
{
  "id": "trans_123",
  "userId": "user123",
  "originalFileName": "movie_en.srt",
  "targetLanguage": "cs",
  "sourceLanguage": "en",
  "aiService": "openai",
  "status": "completed",
  "originalFileSize": 15420,
  "originalFileUrl": "gs://bucket/originals/file.srt",
  "translatedFileUrl": "gs://bucket/translated/file_cs.srt",
  "processingTimeMs": 45000,
  "subtitleCount": 1250,
  "createdAt": "2024-01-15T10:00:00Z",
  "completedAt": "2024-01-15T10:00:45Z",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.1"
  }
}
```

#### **subscriptions**
```json
{
  "userId": "user123",
  "stripeSubscriptionId": "sub_xxxxx",
  "status": "active",
  "currentPeriodStart": "2024-01-01T00:00:00Z",
  "currentPeriodEnd": "2024-02-01T00:00:00Z",
  "planId": "premium_monthly",
  "priceId": "price_xxxxx"
}
```

---

## 🔐 **7. BEZPEČNOST A PERMISSIONS**

### Firebase Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users mohou číst/psát jen svá data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Translations - jen vlastník může přistupovat
    match /translations/{translationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Subscriptions - read-only pro users
    match /subscriptions/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Rate Limiting
```typescript
// lib/rate-limit.ts
export async function checkRateLimit(userId: string, tier: 'free' | 'premium') {
  const limits = {
    free: { monthly: 5, daily: 2 },
    premium: { monthly: -1, daily: 100 }
  }
  
  // Implementace rate limiting logiky
}
```

---

## 🧪 **8. TESTOVÁNÍ**

### Unit Tests
```typescript
// __tests__/subtitle-processor.test.ts
import { SubtitleProcessor } from '@/lib/subtitle-processor'

describe('SubtitleProcessor', () => {
  test('should parse SRT correctly', () => {
    const processor = new SubtitleProcessor('google', 'cs')
    const srtContent = `1\n00:00:01,000 --> 00:00:03,000\nHello world`
    const entries = processor.parseSRT(srtContent)
    expect(entries).toHaveLength(1)
  })
})
```

### Integration Tests
- API endpoints testing
- Firebase functions testing
- Stripe webhook testing

### E2E Tests (Playwright/Cypress)
- User registration flow
- Subscription flow
- Translation process
- File upload/download

---

## 🚀 **9. DEPLOYMENT PLÁN**

### Development Environment
```bash
# Local development
npm run dev

# Firebase emulators
firebase emulators:start
```

### Staging Environment
- Vercel preview deployments
- Firebase staging projekt
- Stripe test mode

### Production Deployment
```bash
# Frontend (Vercel)
vercel --prod

# Firebase Functions
firebase deploy --only functions

# Firestore rules
firebase deploy --only firestore:rules
```

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

OPENAI_API_KEY=
GOOGLE_TRANSLATE_API_KEY=
```

---

## 📊 **10. MONITORING A ANALYTICS**

### Application Monitoring
- Vercel Analytics
- Firebase Performance Monitoring
- Error tracking (Sentry)

### Business Metrics
```typescript
// Tracking klíčových metrik
export const trackEvent = (eventName: string, properties: object) => {
  // Google Analytics 4
  gtag('event', eventName, properties)
  
  // Custom analytics do Firestore
  addDoc(collection(db, 'analytics'), {
    event: eventName,
    properties,
    timestamp: serverTimestamp()
  })
}
```

### Key Metrics
- **DAU/MAU** (Daily/Monthly Active Users)
- **Conversion rate** (Free → Premium)
- **Churn rate**
- **Translation success rate**
- **Average processing time**
- **Revenue per user**

---

## 💡 **11. BUDOUCÍ VYLEPŠENÍ**

### Fáze 2 features
- **Video upload** s automatickou extrakcí titulků
- **Realtime collaboration** - více lidí může editovat titulky
- **AI voice generation** - generování audio stopy z titulků
- **Subtitle synchronization** s videem
- **Mobile app** (React Native)

### Integrace
- **YouTube integrace** - přímý import/export
- **Netflix/Prime Video** browser extension
- **Slack/Discord boty** pro týmové použití
- **API pro třetí strany**

### Advanced AI features
- **Context-aware translation** - AI rozumí filmu/seriálu
- **Character voice adaptation** - různý styl pro různé postavy
- **Sentiment preservation** - zachovává emoce
- **Cultural localization** - adaptace kulturních referencí

---

## 📋 **12. TASK BREAKDOWN PRO TÝM**

### Frontend Developer (2-3 devs)
**Týden 1-2:**
- [ ] Next.js projekt setup
- [ ] UI komponenty (Shadcn/ui)
- [ ] Layout a navigace
- [ ] Responsive design system

**Týden 3-4:**
- [ ] File upload interface
- [ ] Translation progress UI
- [ ] Language selector
- [ ] Subtitle preview

**Týden 5-6:**
- [ ] Dashboard komponenty
- [ ] Subscription UI
- [ ] Billing management
- [ ] User settings

**Týden 7-8:**
- [ ] Polish a optimalizace
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Accessibility improvements

### Backend Developer (2 devs)
**Týden 1-2:**
- [ ] Firebase projekt setup
- [ ] API routes struktura
- [ ] Autentizační systém
- [ ] Database schema

**Týden 3-4:**
- [ ] Core subtitle processing logika
- [ ] AI translation integrace
- [ ] File storage systém
- [ ] Rate limiting

**Týden 5-6:**
- [ ] Stripe integrace
- [ ] Webhook handling
- [ ] Subscription management
- [ ] Usage tracking

**Týden 7-8:**
- [ ] Performance optimization
- [ ] Error handling
- [ ] Security hardening
- [ ] API dokumentace

### DevOps Engineer (1 dev)
**Týden 1-8:**
- [ ] CI/CD pipeline setup
- [ ] Environment konfigurace
- [ ] Monitoring setup
- [ ] Security scanning
- [ ] Performance monitoring
- [ ] Backup strategie
- [ ] SSL certifikáty
- [ ] Domain setup

### QA Engineer (1 dev)
**Týden 3-8:**
- [ ] Test plán vytvoření
- [ ] Unit tests implementace
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance testing
- [ ] Security testing
- [ ] User acceptance testing
- [ ] Bug reporting a tracking

---

## 💰 **13. ODHAD NÁKLADŮ**

### Development Costs (8 týdnů)
- **Frontend Developers (2):** 200 000 Kč/týden × 8 = 1 600 000 Kč
- **Backend Developers (2):** 200 000 Kč/týden × 8 = 1 600 000 Kč  
- **DevOps Engineer (1):** 100 000 Kč/týden × 8 = 800 000 Kč
- **QA Engineer (1):** 75 000 Kč/týden × 8 = 600 000 Kč
- **Project Manager:** 50 000 Kč/týden × 8 = 400 000 Kč
- **Celkem Development:** **5 000 000 Kč**

### Měsíční provozní náklady
- **Vercel Pro:** 500 Kč/měsíc
- **Firebase (Pay-as-you-go):** 1 250-12 500 Kč/měsíc (závisí na používání)
- **OpenAI API:** 2 500-25 000 Kč/měsíc (závisí na překladech)
- **Stripe:** 2.9% + 7.50 Kč za transakci
- **Doména + SSL:** 500 Kč/rok
- **Monitoring nástroje:** 1 250 Kč/měsíc
- **Celkem měsíčně:** **5 500-39 250 Kč/měsíc**

### Break-even analýza
- **Premium cena:** 250 Kč/měsíc
- **Odhadovaný conversion rate:** 5-10%
- **Break-even bod:** ~500-1000 aktivních uživatelů

---

## 🎯 **14. METRIKY ÚSPĚCHU**

### Technické KPI
- **Uptime:** >99.9%
- **Translation accuracy:** >90% spokojenost uživatelů
- **Processing time:** <30s na subtitle soubor
- **API response time:** <2s

### Business KPI
- **User growth:** 20% MoM
- **Conversion rate:** >5% (Free → Premium)
- **Churn rate:** <5% měsíčně
- **Revenue:** 250 000 Kč MRR do 6. měsíce

---

## 📝 **15. LAUNCH STRATEGIE**

### Soft Launch (Měsíc 1)
- **Omezená beta:** 100 uživatelů
- **Sběr zpětné vazby**
- **Oprava kritických chyb**
- **Performance optimalizace**

### Veřejný Launch (Měsíc 2)
- **Product Hunt launch**
- **Kampaň na sociálních sítích**
- **Partnerství s influencery**
- **Content marketing**

### Růstová fáze (Měsíc 3-6)
- **SEO optimalizace**
- **Referral program**
- **Partnerství s YouTube tvůrci**
- **Mezinárodní expanze**

---

**Tento plán poskytuje kompletní roadmap pre vytvoření úspěšné AI subtitle translation aplikace. Každá fáze má jasné milníky a dodávky, což umožňuje efektivní řízení projektu a sledování pokroku.**