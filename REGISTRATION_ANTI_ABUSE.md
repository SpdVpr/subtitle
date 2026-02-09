# Registration Anti-Abuse System

## 📋 Přehled

Systém pro detekci a prevenci zneužívání registračních kreditů. Kombinuje několik metod pro identifikaci podezřelých registrací a automaticky snižuje kredity pro duplicitní účty.

## 🎯 Cíle

- **Zabránit zneužívání**: Detekovat uživatele, kteří se registrují opakovaně pro získání dalších kreditů
- **Zachovat UX**: Neblokovat legitimní uživatele
- **Úspora kreditů**: Snížit kredity pro podezřelé registrace místo úplného zablokování
- **Monitoring**: Poskytnout adminům přehled o podezřelých registracích

## 🔍 Detekční metody

### 1. Browser Fingerprinting
- Vytváří unikátní otisk prohlížeče na základě:
  - User agent
  - Screen resolution
  - Timezone
  - Installed fonts
  - Canvas fingerprint
  - WebGL fingerprint
  - Hardware info (CPU cores, memory)
  - Plugins

### 2. IP Address Tracking
- Sleduje IP adresy při registraci
- Detekuje více registrací ze stejné IP
- Ukládá hash IP pro ochranu soukromí

### 3. Rate Limiting
- Omezuje počet registrací z jedné IP
- **Limit**: 3 registrace za hodinu

## ⚙️ Konfigurace

### Kredity
```typescript
DEFAULT_CREDITS: 100                    // Normální registrace
SUSPICIOUS_CREDITS: 20                  // Podezřelá registrace (score 50-79)
VERY_HIGH_SUSPICIOUS_CREDITS: 0         // Velmi podezřelá registrace (score 80+)
```

### Prahy pro detekci
```typescript
MAX_ACCOUNTS_PER_IP: 3              // Max účtů z jedné IP
MAX_ACCOUNTS_PER_FINGERPRINT: 2     // Max účtů s jedním fingerprintem
SUSPICIOUS_THRESHOLD: 50            // Skóre pro snížení kreditů na 20
VERY_HIGH_THRESHOLD: 80             // Skóre pro snížení kreditů na 0
BLOCK_THRESHOLD: 100                // Skóre pro blokování (zatím neaktivní)
```

### Časová okna
```typescript
IP_CHECK_WINDOW_DAYS: 30           // Kontrola IP za posledních 30 dní
FINGERPRINT_CHECK_WINDOW_DAYS: 90  // Kontrola fingerprintu za 90 dní
```

## 📊 Scoring systém

Suspicious score se počítá na základě:

| Faktor | Body |
|--------|------|
| Duplicitní IP (každý účet) | +15 bodů (max 40) |
| Duplicitní fingerprint (každý účet) | +25 bodů (max 50) |
| Shoda IP + fingerprint | +20 bodů |
| **Maximum** | **100 bodů** |

### Akce podle skóre:
- **0-49**: Plné kredity (100)
- **50-79**: Snížené kredity (20)
- **80-99**: Žádné kredity (0)
- **100**: Blokování (zatím neimplementováno)

## 🔄 Proces registrace

### Email registrace
1. Uživatel vyplní registrační formulář
2. Generuje se browser fingerprint
3. Volá se `/api/registration/check` s fingerprintem
4. API kontroluje duplicity (IP + fingerprint)
5. Vypočítá se suspicious score
6. Určí se počet kreditů k přidělení
7. Vytvoří se Firebase Auth účet
8. Vytvoří se Firestore profil s upraveným počtem kreditů
9. Zaznamená se registrace do `registration_tracking` kolekce

### Google registrace
- Stejný proces jako email registrace
- Automaticky ověřený email

## 📁 Struktura databáze

### Kolekce: `registration_tracking`
```typescript
{
  id: string
  userId: string
  email: string
  ipAddress: string                    // Hash pro soukromí
  browserFingerprint: string
  userAgent: string
  suspiciousScore: number              // 0-100
  duplicateIpCount: number
  duplicateFingerprintCount: number
  creditsAwarded: number               // Skutečně přidělené kredity
  creditsReduced: boolean              // Byly kredity sníženy?
  registrationMethod: 'email' | 'google'
  emailVerified: boolean
  createdAt: Timestamp
  flaggedByAdmin?: boolean
  adminNotes?: string
}
```

### UserProfile rozšíření
```typescript
registrationTracking?: {
  ipAddress?: string
  browserFingerprint?: string
  userAgent?: string
  suspiciousScore?: number
  duplicateDetected?: boolean
  registrationMethod?: 'email' | 'google'
}
```

## 🛠️ API Endpoints

### POST `/api/registration/check`
Kontroluje registraci před vytvořením účtu.

**Request:**
```json
{
  "browserFingerprint": "abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "isAllowed": true,
  "suspiciousScore": 45,
  "creditsToAward": 100,
  "duplicateIpCount": 1,
  "duplicateFingerprintCount": 0,
  "reasons": ["1 previous registration(s) from this IP"]
}
```

### POST `/api/registration/record`
Zaznamenává registraci do tracking systému.

**Request:**
```json
{
  "userId": "uid123",
  "email": "user@example.com",
  "browserFingerprint": "abc123...",
  "registrationMethod": "email",
  "creditsAwarded": 100,
  "suspiciousScore": 45
}
```

### GET `/api/admin/registration-monitoring`
Admin endpoint pro monitoring (vyžaduje admin práva).

**Response:**
```json
{
  "success": true,
  "registrations": [...],
  "stats": {
    "total": 150,
    "suspicious": 12,
    "creditsAwarded": 14240,
    "creditsSaved": 960,
    "averageSuspiciousScore": 18.5
  }
}
```

## 👨‍💼 Admin rozhraní

### URL: `/admin/registration-monitoring`

**Funkce:**
- Přehled všech podezřelých registrací (score ≥ 50)
- Statistiky:
  - Celkový počet registrací
  - Počet podezřelých registrací
  - Přidělené kredity
  - Ušetřené kredity
  - Průměrné suspicious score
- Tabulka s detaily:
  - Email
  - Metoda registrace
  - Suspicious score
  - Počet duplicit (IP, fingerprint)
  - Přidělené kredity
  - Datum registrace

**Přístup mají pouze:**
- admin@subtitlebot.com
- admin@subtitle-ai.com
- ceo@subtitle-ai.com
- manager@subtitle-ai.com

## 🔒 Bezpečnost

### Firestore Rules
```javascript
match /registration_tracking/{trackingId} {
  // Pouze admini mohou číst
  allow read: if request.auth != null &&
    request.auth.token.email in [adminEmails];
  // Pouze server může zapisovat
  allow write: if false;
}
```

### Rate Limiting
- **Registrace**: 3 pokusy za hodinu z jedné IP
- **Login**: 10 pokusů za 15 minut
- **API**: 100 requestů za minutu

## 📈 Monitoring a metriky

### Co sledovat:
1. **Suspicious rate**: Kolik % registrací je podezřelých
2. **Credits saved**: Kolik kreditů jsme ušetřili
3. **False positives**: Legitimní uživatelé s vysokým score
4. **Bypass attempts**: Pokusy o obejití systému

### Doporučené akce:
- Pravidelně kontrolovat admin dashboard
- Adjustovat prahy podle dat
- Sledovat feedback od uživatelů
- Analyzovat vzory podezřelých registrací

## 🚀 Nasazení

### 1. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 2. Testování
```bash
# Otestovat normální registraci
# Otestovat duplicitní registraci (stejná IP)
# Otestovat duplicitní registraci (stejný browser)
# Otestovat rate limiting
```

### 3. Monitoring
- Zkontrolovat admin dashboard
- Ověřit, že se data ukládají správně
- Sledovat logy pro chyby

## 🔧 Údržba

### Pravidelné úkoly:
1. **Týdně**: Zkontrolovat suspicious registrations
2. **Měsíčně**: Analyzovat statistiky a upravit prahy
3. **Kvartálně**: Vyčistit staré tracking záznamy

### Možná vylepšení:
- [ ] Email notifikace pro adminy při vysokém počtu podezřelých registrací
- [ ] Machine learning pro lepší detekci
- [ ] Integrace s externími anti-fraud službami
- [ ] Automatické blokování při velmi vysokém score
- [ ] Whitelist pro důvěryhodné IP adresy

## 📞 Podpora

Při problémech:
1. Zkontrolovat logy v konzoli
2. Ověřit Firestore rules
3. Zkontrolovat rate limiter
4. Kontaktovat vývojáře

## 📝 Changelog

### v1.0.0 (2025-09-30)
- ✅ Browser fingerprinting
- ✅ IP tracking
- ✅ Suspicious score calculation
- ✅ Automatic credit reduction
- ✅ Rate limiting
- ✅ Admin monitoring dashboard
- ✅ Firestore security rules

