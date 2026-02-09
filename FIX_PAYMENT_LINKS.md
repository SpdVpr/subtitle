# 🔧 URGENTNÍ OPRAVA: Payment Links Redirect

## ❌ **Problém:**
Po platbě se uživatel nepřesměrovává zpět na web a kredity se nepřičítají.

## 🔍 **Příčina:**
1. **Chybí Success URL** v Payment Links
2. **Možná chybí webhook** nebo není správně nastaven

## 🚀 **OKAMŽITÁ OPRAVA:**

### 1. **Opravte Payment Links v Stripe Dashboard**

Jděte na: https://dashboard.stripe.com/payment-links

Pro **KAŽDÝ** Payment Link:

#### A) **100 Credits** - `https://buy.stripe.com/aFacN58737HPbYe2Tr6sw03`
1. Klikněte **Edit**
2. **Success URL**: `https://www.subtitlebot.com/success?success=true&credits=100&amount={CHECKOUT_SESSION_TOTAL_AMOUNT}`
3. **Cancel URL**: `https://www.subtitlebot.com/buy-credits`
4. Klikněte **Save**

#### B) **500 Credits** - `https://buy.stripe.com/bJe00jcnj6DL2nE1Pn6sw00`
1. Klikněte **Edit**
2. **Success URL**: `https://www.subtitlebot.com/success?success=true&credits=500&amount={CHECKOUT_SESSION_TOTAL_AMOUNT}`
3. **Cancel URL**: `https://www.subtitlebot.com/buy-credits`
4. Klikněte **Save**

#### C) **1200 Credits** - `https://buy.stripe.com/dRmaEX2MJ9PXbYe2Tr6sw01`
1. Klikněte **Edit**
2. **Success URL**: `https://www.subtitlebot.com/success?success=true&credits=1200&amount={CHECKOUT_SESSION_TOTAL_AMOUNT}`
3. **Cancel URL**: `https://www.subtitlebot.com/buy-credits`
4. Klikněte **Save**

#### D) **2500 Credits** - `https://buy.stripe.com/4gM6oH72Z2nv2nE65D6sw02`
1. Klikněte **Edit**
2. **Success URL**: `https://www.subtitlebot.com/success?success=true&credits=2500&amount={CHECKOUT_SESSION_TOTAL_AMOUNT}`
3. **Cancel URL**: `https://www.subtitlebot.com/buy-credits`
4. Klikněte **Save**

### 2. **Zkontrolujte Webhook**

Jděte na: https://dashboard.stripe.com/webhooks

1. **Najděte webhook** pro `https://www.subtitlebot.com/api/stripe/payment-links-webhook`
2. **Pokud neexistuje, vytvořte ho:**
   - **Endpoint URL**: `https://www.subtitlebot.com/api/stripe/payment-links-webhook`
   - **Events**: `checkout.session.completed`
   - **Zkopírujte signing secret** do Vercel environment variables

### 3. **Produkční URL jsou nastavené:**
```
Success URL: https://www.subtitlebot.com/success?success=true&credits={CREDITS}&amount={CHECKOUT_SESSION_TOTAL_AMOUNT}
Cancel URL: https://www.subtitlebot.com/buy-credits
Webhook URL: https://www.subtitlebot.com/api/stripe/payment-links-webhook
```

## 🧪 **Test po opravě:**

1. **Zkuste znovu testovací platbu** $1
2. **Po platbě by vás mělo přesměrovat** na success stránku
3. **Kredity by se měly přičíst** automaticky
4. **Zkontrolujte webhook logy** v Stripe Dashboard

## 🔍 **Debug informace:**

Zkontrolujte: http://localhost:3002/api/debug/stripe-events
- Zobrazí nedávné platby a transakce
- Pomůže identifikovat, zda webhook funguje

## ⚠️ **Důležité:**
- **Localhost webhooks** nefungují z internetu
- Pro testování použijte **ngrok** nebo **Stripe CLI**
- Pro produkci použijte **https** domény

## 🚨 **Pokud stále nefunguje:**

1. **Zkontrolujte konzoli** v prohlížeči (F12)
2. **Zkontrolujte server logy** 
3. **Zkontrolujte Stripe Dashboard** → Events
4. **Použijte Stripe CLI** pro local testing:
   ```bash
   stripe listen --forward-to localhost:3002/api/stripe/payment-links-webhook
   ```
