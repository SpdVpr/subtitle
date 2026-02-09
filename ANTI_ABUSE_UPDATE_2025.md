# Anti-Abuse System Update - January 2025

## 🎯 Důvod změny

Po několika dnech používání Anti-Abuse systému jsme identifikovali zneužívání:
- Uživatelé si zakládají nové účty jen kvůli 20 kreditům
- Používají dočasné emaily (mailshan.com, laoia.com, toaik.com, atd.)
- Mají velmi vysoké suspicious score (80-100)
- Opakovaně se registrují ze stejných IP adres a prohlížečů

### Příklady zneužívání:

| Email | Score | IP Dupes | Browser Dupes | Kredity (před) |
|-------|-------|----------|---------------|----------------|
| starling46018@mailshan.com | 100 | 8 | 4 | 20 |
| gcp06234@laoia.com | 100 | 4 | 2 | 20 |
| 8cfpgc9vok@zudpck.com | 100 | 2 | 2 | 20 |
| deidreoverwhelming@tiffincrane.com | 100 | 7 | 3 | 20 |
| iguana32166@aminating.com | 100 | 3 | 3 | 20 |
| yeled64269@aiwanlab.com | 100 | 6 | 2 | 20 |
| oqt16321@laoia.com | 100 | 9 | 6 | 20 |
| njy69087@laoia.com | 100 | 7 | 4 | 20 |
| jys95916@toaik.com | 100 | 6 | 3 | 20 |

**Problém:** I když systém detekoval podezřelé registrace, stále dostávali 20 kreditů, což bylo dostatečné pro zneužití.

---

## ✅ Implementovaná změna

### Nová logika přidělování kreditů:

| Suspicious Score | Kredity (před) | Kredity (po) | Popis |
|-----------------|----------------|--------------|-------|
| **0-49** | 100 | 100 | Normální registrace |
| **50-79** | 20 | 20 | Podezřelá registrace |
| **80-100** | 20 | **0** | Velmi podezřelá registrace |

### Změny v kódu:

#### 1. **Konfigurace** (`src/lib/registration-tracking.ts`)

```typescript
export const TRACKING_CONFIG = {
  // Credits
  DEFAULT_CREDITS: 100,
  SUSPICIOUS_CREDITS: 20,                  // Pro score 50-79
  VERY_HIGH_SUSPICIOUS_CREDITS: 0,         // Pro score 80+ (NOVÉ)
  
  // Thresholds
  SUSPICIOUS_THRESHOLD: 50,                // Práh pro snížení na 20
  VERY_HIGH_THRESHOLD: 80,                 // Práh pro snížení na 0 (NOVÉ)
  BLOCK_THRESHOLD: 100,                    // Práh pro blokování
}
```

#### 2. **Logika přidělování** (`src/lib/registration-tracking.ts`)

```typescript
// Determine credits to award
let creditsToAward = TRACKING_CONFIG.DEFAULT_CREDITS

if (suspiciousScore >= TRACKING_CONFIG.VERY_HIGH_THRESHOLD) {
  // NOVÉ: Very High score = 0 kreditů
  creditsToAward = TRACKING_CONFIG.VERY_HIGH_SUSPICIOUS_CREDITS
  reasons.push(`Credits reduced to ${creditsToAward} due to very high suspicious activity (score: ${suspiciousScore})`)
} else if (suspiciousScore >= TRACKING_CONFIG.SUSPICIOUS_THRESHOLD) {
  // High score = 20 kreditů (beze změny)
  creditsToAward = TRACKING_CONFIG.SUSPICIOUS_CREDITS
  reasons.push(`Credits reduced to ${creditsToAward} due to suspicious activity (score: ${suspiciousScore})`)
}
```

#### 3. **API Endpoint** (`src/app/api/registration/check/route.ts`)

Stejná logika implementována v API endpointu pro konzistenci.

#### 4. **Admin Dashboard** (`src/components/admin/registration-monitoring.tsx`)

Aktualizován info text:
```
Kredity: Normální (100) • Podezřelé 50-79 (20) • Velmi podezřelé 80+ (0)
```

---

## 📊 Očekávané výsledky

### Před změnou:
- Uživatel s score 100 dostane 20 kreditů
- Může přeložit několik titulků
- Vytvoří další účet a dostane dalších 20 kreditů
- **Zneužívání pokračuje**

### Po změně:
- Uživatel s score 100 dostane 0 kreditů
- Nemůže přeložit žádné titulky
- Vytvoření dalšího účtu je zbytečné
- **Zneužívání je zastaveno**

---

## 🔍 Jak systém funguje

### Výpočet Suspicious Score:

```
Score = 0

// Duplicitní IP adresy
Score += min(40, duplicateIpCount * 15)

// Duplicitní browser fingerprints
Score += min(50, duplicateFingerprintCount * 25)

// Shoda IP + fingerprint
if (duplicateIpCount > 0 && duplicateFingerprintCount > 0) {
  Score += 20
}

// Maximum
Score = min(100, Score)
```

### Příklad výpočtu:

**Uživatel: starling46018@mailshan.com**
- IP Dupes: 8 → 8 × 15 = 120 → min(40, 120) = **40 bodů**
- Browser Dupes: 4 → 4 × 25 = 100 → min(50, 100) = **50 bodů**
- Shoda IP + Browser → **+20 bodů**
- **Celkem: 40 + 50 + 20 = 110 → min(100, 110) = 100 bodů**
- **Kredity: 0** (Very High score)

---

## 🚀 Nasazení

### Soubory změněné:

1. ✅ `src/lib/registration-tracking.ts` - Konfigurace a logika
2. ✅ `src/app/api/registration/check/route.ts` - API endpoint
3. ✅ `src/components/admin/registration-monitoring.tsx` - Admin UI
4. ✅ `REGISTRATION_ANTI_ABUSE.md` - Dokumentace
5. ✅ `ANTI_ABUSE_QUICKSTART.md` - Quick start guide

### Kroky nasazení:

```bash
# 1. Commit změn
git add .
git commit -m "feat: Update anti-abuse system - 0 credits for Very High score (80+)"

# 2. Push na GitHub
git push origin main

# 3. Vercel automaticky nasadí změny
```

### Po nasazení:

1. ✅ Nové registrace s score 80+ dostanou 0 kreditů
2. ✅ Existující uživatelé si ponechají své kredity (žádné retroaktivní změny)
3. ✅ Admin dashboard zobrazí aktualizované informace
4. ✅ Zneužívání by mělo výrazně klesnout

---

## 📈 Monitoring

### Co sledovat v Admin Dashboardu:

1. **Počet Very High registrací** (score 80+)
   - Měl by zůstat podobný
   - Ale uživatelé dostanou 0 kreditů

2. **Ušetřené kredity**
   - Před: 9 uživatelů × (100 - 20) = 720 kreditů ušetřeno
   - Po: 9 uživatelů × (100 - 0) = 900 kreditů ušetřeno
   - **Rozdíl: +180 kreditů navíc ušetřeno**

3. **Opakované pokusy**
   - Sledujte, jestli se stejné IP/fingerprinty pokouší registrovat opakovaně
   - Pokud ano, systém funguje správně (nedostávají kredity)

4. **False positives**
   - Sledujte legitimní uživatele s vysokým score
   - Pokud najdete false positive, můžete manuálně přidat kredity

---

## 🔧 Možné budoucí úpravy

### 1. **Whitelist pro důvěryhodné IP**
Pokud máte legitimní uživatele z VPN/proxy, můžete přidat whitelist:

```typescript
const TRUSTED_IPS = [
  '123.456.789.0',  // Firemní VPN
  '98.765.432.1',   // Škola
]

if (TRUSTED_IPS.includes(ipAddress)) {
  suspiciousScore = 0
}
```

### 2. **Email domain blacklist**
Blokovat známé dočasné email služby:

```typescript
const TEMP_EMAIL_DOMAINS = [
  'mailshan.com',
  'laoia.com',
  'toaik.com',
  'zudpck.com',
  'tiffincrane.com',
  'aminating.com',
  'aiwanlab.com',
]

const emailDomain = email.split('@')[1]
if (TEMP_EMAIL_DOMAINS.includes(emailDomain)) {
  suspiciousScore += 30
}
```

### 3. **Captcha pro podezřelé registrace**
Pokud score >= 50, zobrazit CAPTCHA před registrací.

### 4. **Rate limiting na úrovni fingerprintu**
Omezit počet registrací z jednoho fingerprintu za den.

---

## 📞 Kontakt a podpora

Pokud máte otázky nebo narazíte na problémy:
1. Zkontrolujte Admin Dashboard
2. Podívejte se do logů (Vercel nebo Firebase)
3. Kontaktujte vývojáře

---

## 📝 Changelog

### [2025-01-XX] - Anti-Abuse Update

**Added:**
- `VERY_HIGH_SUSPICIOUS_CREDITS: 0` - Nová konfigurace pro velmi podezřelé registrace
- `VERY_HIGH_THRESHOLD: 80` - Nový práh pro velmi podezřelé registrace
- Logika pro přidělování 0 kreditů při score 80+

**Changed:**
- `BLOCK_THRESHOLD: 80 → 100` - Zvýšen práh pro blokování
- Admin dashboard info text - Aktualizován popis kreditů
- Dokumentace - Aktualizovány všechny dokumenty

**Fixed:**
- Zneužívání systému uživateli s Very High score
- Uživatelé s score 80+ již nedostanou žádné kredity

---

**Datum implementace:** 2025-01-XX  
**Status:** ✅ Implementováno a otestováno  
**Nasazení:** Čeká na push na GitHub

