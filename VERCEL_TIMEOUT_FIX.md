# Oprava Vercel timeout problému - KRITICKÁ OPRAVA

## 🔍 Identifikovaný problém
Překlad se zasekával na 56% kvůli **Vercel serverless function timeout**:

```json
// vercel.json - PROBLEMATICKÉ NASTAVENÍ
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 60  // ❌ Pouze 60 sekund!
    }
  }
}
```

**Příčina:** 
- Vercel ukončoval serverless funkci po 60 sekundách
- Překlad dlouhých souborů (500+ titulků) trvá 3-5 minut
- Function se ukončila uprostřed překladu → stream se zavřel → frontend dostal "🏁 Streaming completed"

## ✅ Implementované opravy

### 1. Zvýšení obecného timeout
```json
// vercel.json - OPRAVENÉ NASTAVENÍ
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 300  // ✅ 5 minut pro všechny API
    },
    "src/app/api/translate-stream/route.ts": {
      "maxDuration": 900,  // ✅ 15 minut pro překlad
      "memory": 1024       // ✅ Více paměti pro překlad
    }
  }
}
```

### 2. Specifické nastavení pro translate-stream
- **maxDuration: 900** - 15 minut timeout (dostatečné i pro velmi dlouhé soubory)
- **memory: 1024** - 1GB paměti (více než default 512MB)

### 3. Timeout hierarchie
```
Vercel Function: 15 minut (900s)
    ↓
Backend Progress Timeout: 5 minut (300s) pro translating
    ↓
Frontend Stream Timeout: 6 minut (360s)
    ↓
Frontend Progress Monitor: 5 minut (300s)
```

## 📊 Timeout comparison

### PŘED (problematické):
```
Vercel Function: 60s ❌
Backend Timeout: 300s
Frontend Timeout: 360s

Výsledek: Function se ukončí po 60s → Stream se zavře → Frontend čeká zbytečně
```

### PO (opravené):
```
Vercel Function: 900s ✅
Backend Timeout: 300s
Frontend Timeout: 360s

Výsledek: Function má dostatek času → Překlad se dokončí → Frontend dostane výsledek
```

## 🎯 Vercel limits

### Free Plan:
- **maxDuration**: 10s (příliš krátké)
- **memory**: 512MB

### Pro Plan:
- **maxDuration**: 900s (15 minut) ✅
- **memory**: 1024MB ✅

### Enterprise Plan:
- **maxDuration**: 900s (15 minut)
- **memory**: 3008MB

## 📋 Deployment checklist

### ✅ Před nasazením ověřit:
1. **Vercel Plan** - musí být Pro nebo Enterprise (ne Free)
2. **vercel.json** - správné timeout nastavení
3. **Environment variables** - všechny nastavené
4. **Build success** - bez chyb
5. **Function logs** - sledovat po nasazení

### 🚨 Monitoring po nasazení:
1. **Function duration** - sledovat v Vercel dashboard
2. **Memory usage** - ověřit, že nepřesahuje limit
3. **Error rate** - sledovat timeout chyby
4. **User feedback** - ověřit úspěšné dokončení překladů

## 🧪 Test scénáře

### Test 1: Krátký soubor (< 100 titulků)
- **Očekávaná doba**: 30-60 sekund
- **Očekávaný výsledek**: ✅ Úspěšné dokončení

### Test 2: Střední soubor (100-300 titulků)
- **Očekávaná doba**: 1-3 minuty
- **Očekávaný výsledek**: ✅ Úspěšné dokončení

### Test 3: Dlouhý soubor (300-600 titulků)
- **Očekávaná doba**: 3-8 minut
- **Očekávaný výsledek**: ✅ Úspěšné dokončení (dříve selhávalo)

### Test 4: Velmi dlouhý soubor (600+ titulků)
- **Očekávaná doba**: 8-15 minut
- **Očekávaný výsledek**: ✅ Úspěšné dokončení

## 📝 Poznámky

### Proč se problém neprojevil v development:
- Development běží lokálně bez Vercel timeout limitů
- Lokální Next.js server nemá 60s limit
- Problém se projevil pouze v produkci na Vercel

### Proč 56% konkrétně:
- 56% odpovídá přibližně 60 sekundám překladu
- Vercel ukončil funkci přesně po 60s
- Frontend dostal "stream completed" bez výsledku

### Důležité pro budoucnost:
- Vždy testovat v produkčním prostředí
- Sledovat Vercel function metrics
- Nastavit monitoring pro timeout chyby
- Dokumentovat timeout limity pro různé operace

## 🚀 Status

**KRITICKÁ OPRAVA - PŘIPRAVENA K NASAZENÍ**

Tato oprava řeší hlavní příčinu zasekávání překladu v produkci. Po nasazení by se měly všechny překlady dokončovat úspěšně do 100%.

### Deployment priority: 🔥 VYSOKÁ
- Řeší kritický produkční problém
- Ovlivňuje všechny uživatele
- Jednoduchá změna konfigurace
- Žádné breaking changes
