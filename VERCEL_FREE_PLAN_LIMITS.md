# Vercel Free Plan Timeout Limits - Adjusted Configuration

## 🔍 Problém s Vercel Free Plan
Při pokusu o deployment se objevila chyba:
```
The value for maxDuration must be between 1 second and 300 seconds, 
in order to increase this limit upgrade your plan: https://vercel.com/pricing
```

## 📊 Vercel Plan Limits

### Free Plan:
- **maxDuration**: 1-300 sekund (5 minut) ❌
- **memory**: 512MB
- **bandwidth**: 100GB/měsíc
- **functions**: 12 per deployment

### Pro Plan ($20/měsíc):
- **maxDuration**: 1-900 sekund (15 minut) ✅
- **memory**: 1024MB
- **bandwidth**: 1TB/měsíc
- **functions**: 100 per deployment

## ✅ Upravená konfigurace pro Free Plan

### vercel.json (OPRAVENO):
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 300  // ✅ 5 minut (max pro Free plan)
    },
    "src/app/api/translate-stream/route.ts": {
      "maxDuration": 300  // ✅ 5 minut (sníženo z 900s)
    }
  }
}
```

### Backend timeout (UPRAVENO):
```typescript
// translate-stream/route.ts
const timeoutDuration = stage === 'translating' ? 240000 : 120000 
// 4 minuty pro translating, 2 minuty pro ostatní
```

### Frontend timeout (UPRAVENO):
```typescript
// translation-interface.tsx
const timeoutId = setTimeout(() => {
  reader.cancel()
}, 280000) // 4.67 minut (méně než Vercel 5 minut limit)
```

## 🎯 Nová timeout hierarchie

```
Vercel Function: 300s (5 minut) ← NEJVYŠŠÍ (Free plan limit)
    ↓
Frontend Stream: 280s (4.67 minut)
    ↓
Backend Progress: 240s (4 minuty) pro translating
    ↓
Backend Progress: 120s (2 minuty) pro ostatní
```

## 📋 Omezení na Free Plan

### ✅ Co bude fungovat:
- **Krátké soubory** (< 100 titulků): 30-60s ✅
- **Střední soubory** (100-200 titulků): 1-2 min ✅
- **Delší soubory** (200-300 titulků): 2-4 min ✅

### ⚠️ Co může být problematické:
- **Velmi dlouhé soubory** (400+ titulků): 4-8 min ❌
- **Extrémně dlouhé soubory** (600+ titulků): 8+ min ❌

## 🔧 Optimalizace pro Free Plan

### 1. Batch Size Optimization
```typescript
// Menší batche pro rychlejší zpracování
const batchSize = 15 // Sníženo z 20
```

### 2. Progress Debouncing
```typescript
// Méně častější progress updates
if (now - lastProgressTime < 1000) return // 1s místo 500ms
```

### 3. Timeout Monitoring
```typescript
// Agresivnější timeout detection
if (now - lastProgressTime > 45000) { // 45s místo 60s
  progressStuckCount++
}
```

## 🚀 Deployment Strategy

### Okamžité řešení (Free Plan):
1. ✅ Použít upravenou konfiguraci (300s limit)
2. ✅ Optimalizovat pro kratší soubory
3. ✅ Informovat uživatele o limitech

### Dlouhodobé řešení (Pro Plan):
1. 💰 Upgrade na Vercel Pro ($20/měsíc)
2. 🔧 Zvýšit timeout na 900s (15 minut)
3. 📈 Podporovat velmi dlouhé soubory

## 📝 User Experience

### Doporučení pro uživatele:
- **Optimální velikost**: 200-300 titulků
- **Maximální doporučená**: 400 titulků
- **Při delších souborech**: Rozdělit na menší části

### Error handling:
```typescript
if (entries.length > 400) {
  return {
    error: 'File too large for Free plan. Please upgrade or split into smaller files.',
    maxSubtitles: 400,
    currentSubtitles: entries.length
  }
}
```

## 🎯 Výsledek

### ✅ Výhody:
- Funguje na Vercel Free plan
- Deployment bude úspěšný
- Podporuje většinu běžných souborů

### ⚠️ Omezení:
- Kratší timeout (5 minut vs 15 minut)
- Omezení na délku souborů
- Potřeba optimalizace pro performance

## 📊 Monitoring

Po nasazení sledovat:
- **Function duration** - měla by být < 300s
- **Success rate** - pro různé velikosti souborů
- **User feedback** - ohledně timeout problémů
- **Upgrade requests** - uživatelé požadující delší limity

Tato konfigurace umožní deployment na Vercel Free plan s rozumným kompromisem mezi funkcionalitou a limity.
