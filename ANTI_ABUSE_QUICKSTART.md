# Anti-Abuse System - Quick Start Guide

## 🚀 Rychlý start

Systém je **automaticky aktivní** při každé registraci. Není potřeba nic nastavovat!

## ✅ Co systém dělá automaticky

### Při každé registraci:
1. ✅ Vytvoří browser fingerprint
2. ✅ Zkontroluje duplicitní IP adresy
3. ✅ Zkontroluje duplicitní browser fingerprints
4. ✅ Vypočítá suspicious score (0-100)
5. ✅ Upraví počet kreditů podle skóre:
   - **Normální (0-49)**: 100 kreditů
   - **Podezřelé (50-79)**: 20 kreditů
   - **Velmi podezřelé (80+)**: 0 kreditů
6. ✅ Zaznamená vše do databáze

## 📊 Jak to funguje

### Příklad 1: První registrace
```
Uživatel: jan@example.com
IP: 192.168.1.1 (nová)
Browser: Chrome (nový fingerprint)
→ Suspicious Score: 0
→ Kredity: 100 ✅
```

### Příklad 2: Druhá registrace ze stejné IP
```
Uživatel: petr@example.com
IP: 192.168.1.1 (už použitá!)
Browser: Chrome (nový fingerprint)
→ Suspicious Score: 15
→ Kredity: 100 ✅ (ještě pod prahem)
```

### Příklad 3: Třetí registrace - stejná IP + browser
```
Uživatel: marie@example.com
IP: 192.168.1.1 (už 2x použitá!)
Browser: Chrome (už použitý fingerprint!)
→ Suspicious Score: 65 ⚠️
→ Kredity: 20 (sníženo!)
```

## 👨‍💼 Admin monitoring

### Přístup k dashboardu:
```
URL: https://your-domain.com/admin/registration-monitoring
```

### Co uvidíte:
- 📊 **Statistiky**: Celkem registrací, podezřelé, ušetřené kredity
- 📋 **Tabulka**: Seznam všech podezřelých registrací
- 🔍 **Detaily**: Email, score, duplicity, přidělené kredity

### Kdo má přístup:
- admin@subtitlebot.com
- admin@subtitle-ai.com
- ceo@subtitle-ai.com
- manager@subtitle-ai.com

## ⚙️ Nastavení (volitelné)

Pokud chcete upravit prahy, editujte `src/lib/registration-tracking.ts`:

```typescript
export const TRACKING_CONFIG = {
  DEFAULT_CREDITS: 100,                    // Normální kredity
  SUSPICIOUS_CREDITS: 20,                  // Snížené kredity (score 50-79)
  VERY_HIGH_SUSPICIOUS_CREDITS: 0,         // Žádné kredity (score 80+)

  MAX_ACCOUNTS_PER_IP: 3,                  // Max účtů z jedné IP
  MAX_ACCOUNTS_PER_FINGERPRINT: 2,

  SUSPICIOUS_THRESHOLD: 50,                // Práh pro snížení kreditů na 20
  VERY_HIGH_THRESHOLD: 80,                 // Práh pro snížení kreditů na 0
  BLOCK_THRESHOLD: 100,                    // Práh pro blokování (neaktivní)
}
```

## 🔒 Rate Limiting

Automaticky aktivní:
- **3 registrace za hodinu** z jedné IP
- Po překročení: HTTP 429 (Too Many Requests)

## 📈 Doporučené workflow

### 1. Týdně zkontrolujte dashboard
```
→ Kolik podezřelých registrací?
→ Jsou to skutečně duplicity?
→ Kolik kreditů jsme ušetřili?
```

### 2. Měsíčně analyzujte data
```
→ Je suspicious rate přiměřený? (doporučeno: 5-15%)
→ Máme false positives? (legitimní uživatelé s vysokým score)
→ Potřebujeme upravit prahy?
```

### 3. Reagujte na vzory
```
→ Vidíte opakované pokusy ze stejné IP?
→ Jsou to VPN/proxy servery?
→ Potřebujeme whitelist pro důvěryhodné IP?
```

## 🐛 Troubleshooting

### Problém: Legitimní uživatel dostal jen 20 kreditů
**Řešení:**
1. Zkontrolujte admin dashboard
2. Podívejte se na suspicious score
3. Pokud je to false positive, můžete manuálně přidat kredity přes admin panel

### Problém: Systém nedetekuje duplicity
**Řešení:**
1. Zkontrolujte konzoli prohlížeče (F12) - jsou tam chyby?
2. Ověřte, že API endpointy fungují: `/api/registration/check`
3. Zkontrolujte Firestore - existuje kolekce `registration_tracking`?

### Problém: Admin dashboard nefunguje
**Řešení:**
1. Jste přihlášeni jako admin? (správný email)
2. Zkontrolujte Firestore rules - jsou nasazené?
3. Podívejte se do konzole na chyby

## 📞 Kontakt

Při problémech nebo dotazech:
- Zkontrolujte `REGISTRATION_ANTI_ABUSE.md` pro detailní dokumentaci
- Podívejte se do logů (konzole prohlížeče + server logy)
- Kontaktujte vývojáře

## ✨ Tip pro testování

Chcete otestovat systém?

1. **Normální registrace**: Použijte normální prohlížeč
2. **Podezřelá registrace**: Použijte stejný prohlížeč + stejnou IP
3. **Zkontrolujte**: Admin dashboard by měl ukázat druhou registraci jako podezřelou

---

**Hotovo!** 🎉 Systém je aktivní a chrání vaše kredity.

