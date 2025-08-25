# 🔗 Stripe Webhook Setup - Kompletní průvodce

## 🚀 **Rychlé řešení pro lokální testování**

### Možnost A: Použití ngrok (Doporučeno)

1. **Stáhněte ngrok**: https://ngrok.com/download
2. **Spusťte ngrok**:
   ```bash
   ngrok http 3002
   ```
3. **Zkopírujte HTTPS URL** (např. `https://abc123.ngrok.io`)
4. **Použijte tuto URL** pro webhook v Stripe Dashboard

### Možnost B: Dočasné řešení - Simulace webhook

Pro okamžité testování můžeme simulovat webhook ručně.

## 📋 **Krok za krokem - Stripe Dashboard**

### 1. **Otevřete Stripe Dashboard**
- Jděte na: https://dashboard.stripe.com/webhooks
- Klikněte **"Add endpoint"**

### 2. **Nastavte webhook endpoint**

#### Pro ngrok (Možnost A):
- **Endpoint URL**: `https://your-ngrok-url.ngrok.io/api/stripe/payment-links-webhook`
- **Description**: `SubtitleAI Payment Links Webhook`

#### Pro produkci:
- **Endpoint URL**: `https://yourdomain.com/api/stripe/payment-links-webhook`

### 3. **Vyberte events**
Zaškrtněte tyto eventy:
- ✅ `checkout.session.completed`
- ✅ `payment_intent.succeeded` (optional)

### 4. **Zkopírujte Webhook Secret**
- Po vytvoření webhook klikněte na něj
- Najděte **"Signing secret"**
- Klikněte **"Reveal"** a zkopírujte

### 5. **Aktualizujte .env.local**
```env
STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

## 🧪 **Testování webhook**

### Test 1: Ověření endpoint
```bash
curl -X GET http://localhost:3002/api/test-webhook
```

### Test 2: Simulace webhook (dočasné řešení)
```bash
curl -X POST http://localhost:3002/api/stripe/payment-links-webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'
```

## 🔧 **Oprava Payment Links**

V Stripe Dashboard → Payment Links, pro každý link nastavte:

### 100 Credits Test:
- **Success URL**: `http://localhost:3002/success?success=true&credits=100&amount={CHECKOUT_SESSION_TOTAL_AMOUNT}`
- **Cancel URL**: `http://localhost:3002/buy-credits`

### 500 Credits:
- **Success URL**: `http://localhost:3002/success?success=true&credits=500&amount={CHECKOUT_SESSION_TOTAL_AMOUNT}`
- **Cancel URL**: `http://localhost:3002/buy-credits`

### 1200 Credits:
- **Success URL**: `http://localhost:3002/success?success=true&credits=1200&amount={CHECKOUT_SESSION_TOTAL_AMOUNT}`
- **Cancel URL**: `http://localhost:3002/buy-credits`

### 2500 Credits:
- **Success URL**: `http://localhost:3002/success?success=true&credits=2500&amount={CHECKOUT_SESSION_TOTAL_AMOUNT}`
- **Cancel URL**: `http://localhost:3002/buy-credits`

## 🚨 **Dočasné řešení - Manuální přidání kreditů**

Pokud webhook stále nefunguje, můžete přidat kredity ručně:

1. **Přihlaste se** do aplikace
2. **Zkopírujte User ID** z konzole (F12)
3. **Zavolejte API**:
   ```bash
   curl -X POST http://localhost:3002/api/debug/add-test-credits \
     -H "Content-Type: application/json" \
     -d '{"userId": "your-user-id", "credits": 100}'
   ```

## 📊 **Debug informace**

### Zkontrolujte platby:
- http://localhost:3002/api/debug/stripe-events

### Zkontrolujte Stripe Dashboard:
- https://dashboard.stripe.com/events
- https://dashboard.stripe.com/payments

## ⚡ **Rychlé řešení HNED TERAZ**

1. **Opravte Payment Links** (Success URL)
2. **Použijte ngrok** pro webhook
3. **Nebo použijte manuální přidání kreditů** jako dočasné řešení

## 🎯 **Po opravě**

1. Zkuste znovu testovací platbu $1
2. Mělo by vás přesměrovat na success stránku
3. Kredity by se měly přičíst automaticky
4. Zkontrolujte webhook logy v Stripe Dashboard
