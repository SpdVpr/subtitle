# 🗑️ Odstranění testovacího balíčku

Po úspěšném otestování plateb odstraňte testovací balíček následovně:

## 🔄 **Kroky pro odstranění:**

### 1. **Aktualizujte Payment Links**
V souboru `src/lib/stripe-payment-links.ts` odstraňte testovací balíček:

```typescript
export const STRIPE_PAYMENT_LINKS: PaymentLinkConfig[] = [
  // ❌ ODSTRAŇTE TENTO ŘÁDEK:
  // {
  //   credits: 100,
  //   price: 1,
  //   currency: 'USD',
  //   link: 'https://buy.stripe.com/aFacN58737HPbYe2Tr6sw03',
  //   description: '🧪 Test package - for testing only',
  // },
  
  // ✅ PONECHTE POUZE TYTO:
  {
    credits: 500,
    price: 5,
    currency: 'USD',
    link: 'https://buy.stripe.com/bJe00jcnj6DL2nE1Pn6sw00',
    description: 'Perfect for trying out our service',
  },
  {
    credits: 1200,
    price: 10,
    currency: 'USD',
    link: 'https://buy.stripe.com/dRmaEX2MJ9PXbYe2Tr6sw01',
    description: 'Great value for regular users',
    popular: true,
  },
  {
    credits: 2500,
    price: 20,
    currency: 'USD',
    link: 'https://buy.stripe.com/4gM6oH72Z2nv2nE65D6sw02',
    description: 'Best for power users',
  },
]
```

### 2. **Aktualizujte funkci getPackageName**
V souboru `src/app/buy-credits/page.tsx`:

```typescript
function getPackageName(credits: number): string {
  // ❌ ODSTRAŇTE TENTO ŘÁDEK:
  // if (credits <= 100) return 'Test Pack'
  
  // ✅ ZMĚŇTE NA:
  if (credits <= 500) return 'Starter Pack'
  if (credits <= 1200) return 'Popular Pack'
  if (credits <= 2500) return 'Professional Pack'
  return 'Enterprise Pack'
}
```

### 3. **Aktualizujte ikony**
V souboru `src/app/buy-credits/page.tsx`:

```typescript
// ❌ ODSTRAŇTE IMPORT:
// import { ..., TestTube } from 'lucide-react'

// ✅ ZMĚŇTE IKONY:
<div className="flex justify-center mb-2">
  {/* ❌ ODSTRAŇTE TENTO ŘÁDEK: */}
  {/* {pkg.credits <= 100 && <TestTube className="w-8 h-8 text-orange-500" />} */}
  
  {/* ✅ ZMĚŇTE NA: */}
  {pkg.credits <= 500 && <Coins className="w-8 h-8 text-primary" />}
  {pkg.credits > 500 && pkg.credits <= 1200 && <Zap className="w-8 h-8 text-primary" />}
  {pkg.credits > 1200 && <Crown className="w-8 h-8 text-primary" />}
</div>
```

### 4. **Odstraňte testovací styling**
V souboru `src/app/buy-credits/page.tsx`:

```typescript
// ❌ ODSTRAŇTE TESTOVACÍ STYLING:
className={`relative ${
  pkg.popular ? 'border-blue-500 shadow-lg scale-105' : 
  // pkg.credits <= 100 ? 'border-orange-300 bg-orange-50/50 dark:bg-orange-950/20' : '' // ODSTRAŇTE
  ''
}`}

// ❌ ODSTRAŇTE TESTOVACÍ BADGE:
// {pkg.credits <= 100 && (
//   <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white">
//     <TestTube className="w-3 h-3 mr-1" />
//     Test Only
//   </Badge>
// )}
```

### 5. **Deaktivujte Payment Link v Stripe**
1. Přihlaste se do [Stripe Dashboard](https://dashboard.stripe.com)
2. Jděte na **Products** → **Payment Links**
3. Najděte testovací link `https://buy.stripe.com/aFacN58737HPbYe2Tr6sw03`
4. Klikněte **Deactivate** nebo **Archive**

### 6. **Otestujte změny**
```bash
npm run build
npm run dev
```

### 7. **Aktualizujte dokumentaci**
Odstraňte odkazy na testovací balíček z `STRIPE_SETUP.md`.

## ✅ **Po odstranění budete mít:**
- 3 produkční balíčky (500, 1200, 2500 kreditů)
- Čistý kód bez testovacích prvků
- Deaktivovaný testovací Payment Link

## 🔒 **Bezpečnost:**
Testovací balíček používá live platby, takže jej odstraňte co nejdříve po otestování!
