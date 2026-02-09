# Stripe Payment Links + API Setup Guide

## 🔄 **Hybrid Approach: Payment Links + API**

Tato implementace kombinuje jednoduchost Stripe Payment Links s flexibilitou API pro nejlepší uživatelský zážitek.

### ✅ **Výhody tohoto přístupu:**
- **Jednoduché nastavení** - Payment Links jsou rychle vytvořené v Stripe Dashboard
- **Bezpečné platby** - Stripe hostuje celý checkout proces
- **Automatické zpracování** - Webhooks automaticky přidávají kredity
- **Flexibilita** - API jako záloha pro pokročilé funkce
- **Údržba** - Snadné změny cen přímo v Stripe Dashboard

## 🛠️ **Nastavení v Stripe Dashboard**

### 1. **Vytvoření Payment Links**
1. Přihlaste se do [Stripe Dashboard](https://dashboard.stripe.com)
2. Jděte na **Products** → **Payment Links**
3. Klikněte **Create payment link**
4. ✅ **Vaše funkční Payment Links:**
   - **100 Credits (Test)** - $1.00 - `https://buy.stripe.com/aFacN58737HPbYe2Tr6sw03`
   - **500 Credits Package** - $5.00 - `https://buy.stripe.com/bJe00jcnj6DL2nE1Pn6sw00`
   - **1200 Credits Package** - $10.00 - `https://buy.stripe.com/dRmaEX2MJ9PXbYe2Tr6sw01`
   - **2500 Credits Package** - $20.00 - `https://buy.stripe.com/4gM6oH72Z2nv2nE65D6sw02`
   - **Success URL**: `https://yourdomain.com/success?success=true&credits={CREDITS}&amount={CHECKOUT_SESSION_TOTAL_AMOUNT}`
   - **Cancel URL**: `https://yourdomain.com/buy-credits`

### 2. **Nastavení Webhooks**
1. V Stripe Dashboard jděte na **Developers** → **Webhooks**
2. Klikněte **Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/stripe/payment-links-webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `payment_intent.succeeded` (optional)
5. Zkopírujte **Signing secret** do `.env.local`

### 3. **Environment Variables**
```env
# Stripe Configuration (LIVE KEYS - Replace with your actual keys)
STRIPE_SECRET_KEY=sk_live_your_actual_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Payment Links (Replace with your actual Payment Link URLs)
STRIPE_500_CREDITS_LINK=https://buy.stripe.com/your_payment_link_here
```

## 🔗 **Aktualizace Payment Links**

V souboru `src/lib/stripe-payment-links.ts` aktualizujte odkazy:

```typescript
export const STRIPE_PAYMENT_LINKS: PaymentLinkConfig[] = [
  {
    credits: 100,
    price: 1,
    currency: 'USD',
    link: 'https://buy.stripe.com/aFacN58737HPbYe2Tr6sw03', // ✅ Test balíček
    description: '🧪 Test package - for testing only',
  },
  {
    credits: 500,
    price: 5,
    currency: 'USD',
    link: 'https://buy.stripe.com/bJe00jcnj6DL2nE1Pn6sw00', // ✅ Funkční
    description: 'Perfect for trying out our service',
  },
  {
    credits: 1200,
    price: 10,
    currency: 'USD',
    link: 'https://buy.stripe.com/dRmaEX2MJ9PXbYe2Tr6sw01', // ✅ Funkční
    description: 'Great value for regular users',
    popular: true,
  },
  {
    credits: 2500,
    price: 20,
    currency: 'USD',
    link: 'https://buy.stripe.com/4gM6oH72Z2nv2nE65D6sw02', // ✅ Funkční
    description: 'Best for power users',
  },
]
```

## 🔄 **Jak to funguje**

### 1. **Uživatel klikne na "Buy Credits"**
- Aplikace vytvoří URL s `client_reference_id` (user ID)
- Přesměruje na Stripe Payment Link
- Stripe zpracuje platbu

### 2. **Po úspěšné platbě**
- Stripe pošle webhook na `/api/stripe/payment-links-webhook`
- Webhook ověří platbu a přidá kredity do Firebase
- Uživatel je přesměrován na success stránku

### 3. **Automatické přidání kreditů**
```typescript
// Webhook automaticky:
// 1. Ověří platbu
// 2. Přidá kredity do user.credits
// 3. Vytvoří transaction record
// 4. Uloží payment record pro admin
```

## 🧪 **Testování**

### 1. **Live Test Balíček**
- ✅ **100 kreditů za $1** - `https://buy.stripe.com/aFacN58737HPbYe2Tr6sw03`
- Tento balíček je pouze pro testování funkcionality
- Po ověření funkčnosti bude odstraněn
- Používá live platby, ale s minimální částkou

### 2. **Test Mode**
- Použijte test klíče pro vývoj
- Vytvořte test Payment Links
- Použijte test karty: `4242 4242 4242 4242`

### 2. **Webhook Testing**
```bash
# Nainstalujte Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/payment-links-webhook

# Test webhook
stripe trigger checkout.session.completed
```

## 🚀 **Deployment**

### 1. **Environment Variables**
- Nastavte všechny env variables v produkci
- **NIKDY** necommitujte live klíče do gitu

### 2. **Webhook URL**
- Aktualizujte webhook URL na produkční doménu
- Ověřte, že webhook endpoint je dostupný

### 3. **Success/Cancel URLs**
- Aktualizujte URLs v Payment Links na produkční domény

## 🔒 **Bezpečnost**

### ✅ **Co je implementováno:**
- Webhook signature verification
- User ID validation
- Transaction logging
- Error handling

### ⚠️ **Důležité:**
- Nikdy neexponujte secret klíče
- Vždy ověřujte webhook signatures
- Logujte všechny transakce pro audit

## 📊 **Monitoring**

### **Stripe Dashboard**
- Sledujte platby v real-time
- Analyzujte conversion rates
- Spravujte refunds

### **Firebase Console**
- Sledujte credit transactions
- Monitorujte user balances
- Analyzujte usage patterns

## 🆘 **Troubleshooting**

### **Webhook se nespouští**
1. Zkontrolujte webhook URL
2. Ověřte signing secret
3. Zkontrolujte logy v Stripe Dashboard

### **Kredity se nepřidávají**
1. Zkontrolujte Firebase permissions
2. Ověřte user ID v session
3. Zkontrolujte metadata v platbě

### **Payment Link nefunguje**
1. Ověřte, že link je aktivní
2. Zkontrolujte success/cancel URLs
3. Ověřte, že produkt existuje
