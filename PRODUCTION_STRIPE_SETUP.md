# 🚀 Production Stripe Setup Guide

## 📋 **Checklist pro produkci**

### ✅ **1. Kód je připraven**
- [x] Testovací balíček odstraněn z `stripe-payment-links.ts`
- [x] TestTube ikony a badges odstraněny
- [x] Localhost URL nahrazeny produkčními
- [x] Webhook handler je production-ready

### 🔧 **2. Stripe Dashboard konfigurace**

#### **A) Payment Links - Aktualizujte Success/Cancel URL:**

Jděte na: https://dashboard.stripe.com/payment-links

**100 Credits** - `https://buy.stripe.com/aFacN58737HPbYe2Tr6sw03`:
- **Success URL**: `https://www.subtitlebot.com/success?success=true&credits=100&amount={CHECKOUT_SESSION_TOTAL_AMOUNT}`
- **Cancel URL**: `https://www.subtitlebot.com/buy-credits`

**500 Credits** - `https://buy.stripe.com/bJe00jcnj6DL2nE1Pn6sw00`:
- **Success URL**: `https://www.subtitlebot.com/success?success=true&credits=500&amount={CHECKOUT_SESSION_TOTAL_AMOUNT}`
- **Cancel URL**: `https://www.subtitlebot.com/buy-credits`

**1200 Credits** - `https://buy.stripe.com/dRmaEX2MJ9PXbYe2Tr6sw01`:
- **Success URL**: `https://www.subtitlebot.com/success?success=true&credits=1200&amount={CHECKOUT_SESSION_TOTAL_AMOUNT}`
- **Cancel URL**: `https://www.subtitlebot.com/buy-credits`

**2500 Credits** - `https://buy.stripe.com/4gM6oH72Z2nv2nE65D6sw02`:
- **Success URL**: `https://www.subtitlebot.com/success?success=true&credits=2500&amount={CHECKOUT_SESSION_TOTAL_AMOUNT}`
- **Cancel URL**: `https://www.subtitlebot.com/buy-credits`

#### **B) Webhook konfigurace:**

Jděte na: https://dashboard.stripe.com/webhooks

1. **Vytvořte nový webhook** (nebo aktualizujte existující):
   - **Endpoint URL**: `https://www.subtitlebot.com/api/stripe/payment-links-webhook`
   - **Description**: `SubtitleAI Production Payment Links Webhook`
   - **Events to send**: `checkout.session.completed`

2. **Zkopírujte Webhook Secret**:
   - Klikněte na webhook
   - Najděte "Signing secret"
   - Klikněte "Reveal" a zkopírujte

#### **C) Aktivujte všechny Payment Links:**
- Ověřte, že všechny 4 Payment Links jsou aktivní
- Zkontrolujte správné Success/Cancel URL u všech

### 🔑 **3. Vercel Environment Variables**

V Vercel Dashboard → Settings → Environment Variables přidejte:

```bash
# Stripe Production Keys
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_FROM_STEP_2B
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY

# Firebase Production
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"

# AI Services
OPENAI_API_KEY=sk-your_openai_api_key
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://www.subtitlebot.com
```

### 🧪 **4. Testování v produkci**

#### **Test 1: Webhook endpoint**
```bash
curl -X GET https://www.subtitlebot.com/api/stripe/payment-links-webhook
```
**Očekávaný výsledek**: JSON response s timestamp

#### **Test 2: Credits API**
```bash
curl "https://www.subtitlebot.com/api/user/credits?userId=test"
```
**Očekávaný výsledek**: `{"error":"Missing userId parameter"}` nebo user data

#### **Test 3: Skutečná platba**
1. Jděte na: https://www.subtitlebot.com/buy-credits
2. Vyberte balíček (doporučujeme 500 credits za $5)
3. Dokončete platbu
4. Měli byste být přesměrováni na success stránku
5. Kredity by se měly přičíst automaticky

### 🔍 **5. Monitoring a debugging**

#### **Stripe Dashboard monitoring:**
- **Events**: https://dashboard.stripe.com/events
- **Payments**: https://dashboard.stripe.com/payments
- **Webhooks**: https://dashboard.stripe.com/webhooks

#### **Vercel Function Logs:**
- Jděte do Vercel Dashboard → Functions
- Sledujte logy webhook handleru

### 🚨 **6. Troubleshooting**

#### **Webhook nefunguje:**
1. Zkontrolujte Vercel Function Logs
2. Ověřte webhook secret v environment variables
3. Zkontrolujte Stripe Events Dashboard

#### **Kredity se nepřičítají:**
1. Zkontrolujte Firebase Console → Firestore
2. Ověřte, že user existuje v `users` collection
3. Zkontrolujte `creditTransactions` collection

#### **Payment Links nefungují:**
1. Ověřte, že Success/Cancel URL jsou správně nastavené
2. Zkontrolujte, že Payment Links jsou aktivní
3. Ověřte metadata v Stripe Dashboard

## ✅ **Po dokončení setup:**

1. **Otestujte celý flow** s malou platbou
2. **Zkontrolujte logy** v Stripe a Vercel
3. **Ověřte přičítání kreditů** v aplikaci
4. **Archivujte testovací dokumenty**

## 🎯 **Výsledek:**

- ✅ Produkční Payment Links (100, 500, 1200, 2500 credits)
- ✅ Správné produkční URL pro Success/Cancel
- ✅ Funkční webhook pro automatické přičítání kreditů
- ✅ Žádné testovací prvky v UI
- ✅ Kompletní monitoring a debugging
