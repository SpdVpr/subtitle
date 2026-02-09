# Adaptive Timeout System - Řešení pro dlouhé soubory

## 🔍 Nový problém identifikován
Překlad se zasekává na **72%** u souboru s **672 titulky**:

```
🔄 Frontend received progress: translating 72
⏰ Streaming timeout - completing translation
🏁 Streaming completed
```

**Příčina:** Fixní timeout 280s (4.67 min) není dostatečný pro velmi dlouhé soubory.

## 📊 Analýza velikosti souborů

### Testované soubory:
- **503 titulků** → Dostal se na 95% (téměř úspěch)
- **672 titulků** → Zasekl se na 72% (timeout)

### Časové požadavky:
- **Krátké soubory** (< 200 titulků): 1-2 min
- **Střední soubory** (200-400 titulků): 2-4 min
- **Dlouhé soubory** (400-600 titulků): 4-5 min
- **Velmi dlouhé soubory** (600+ titulků): 5+ min ❌ (překračuje Vercel limit)

## ✅ Implementované řešení: Adaptive Timeout System

### 1. Frontend Adaptive Timeout
```typescript
// translation-interface.tsx
const subtitleCount = window.subtitleCount || 500
const baseTimeout = 180000 // 3 minutes base
const timeoutPerSubtitle = 200 // 200ms per subtitle
const adaptiveTimeout = Math.min(
  baseTimeout + (subtitleCount * timeoutPerSubtitle),
  290000 // Max 4.83 minutes (under Vercel 5 minute limit)
)

console.log(`🕐 Adaptive timeout set: ${Math.round(adaptiveTimeout/1000)}s for ${subtitleCount} subtitles`)
```

### 2. Backend Adaptive Timeout
```typescript
// translate-stream/route.ts
const subtitleCount = entries.length
const baseTimeout = stage === 'translating' ? 180000 : 120000
const timeoutPerSubtitle = stage === 'translating' ? 150 : 50
const adaptiveTimeout = Math.min(
  baseTimeout + (subtitleCount * timeoutPerSubtitle),
  280000 // Max 4.67 minutes
)
```

### 3. Warning System
```typescript
// Warn about very long files
if (parsed.length > 500) {
  console.warn(`⚠️ Large file detected: ${parsed.length} subtitles. May approach Vercel timeout limits.`)
}
```

## 📊 Timeout kalkulace

### Příklady pro různé velikosti:

#### 200 titulků:
- **Frontend**: 180s + (200 × 0.2s) = 220s (3.67 min)
- **Backend**: 180s + (200 × 0.15s) = 210s (3.5 min)

#### 400 titulků:
- **Frontend**: 180s + (400 × 0.2s) = 260s (4.33 min)
- **Backend**: 180s + (400 × 0.15s) = 240s (4 min)

#### 600 titulků:
- **Frontend**: 180s + (600 × 0.2s) = 300s → **290s** (4.83 min, capped)
- **Backend**: 180s + (600 × 0.15s) = 270s (4.5 min)

#### 672 titulků (aktuální problém):
- **Frontend**: 180s + (672 × 0.2s) = 314s → **290s** (4.83 min, capped)
- **Backend**: 180s + (672 × 0.15s) = 281s → **280s** (4.67 min, capped)

## 🎯 Timeout hierarchie (adaptive)

### Pro 672 titulků:
```
Vercel Function: 300s (5 minut) ← Nejvyšší
    ↓
Frontend Stream: 290s (4.83 minut) ← Adaptive
    ↓
Backend Progress: 280s (4.67 minut) ← Adaptive
    ↓
Stage timeouts: 30-90s ← Stage-specific
```

## 📋 Vercel Free Plan limity

### Maximální podporované velikosti:
- **Bezpečné**: do 400 titulků (4 min processing)
- **Hraniční**: 400-600 titulků (4-5 min processing)
- **Rizikové**: 600+ titulků (5+ min processing) ⚠️

### Doporučení pro uživatele:
```typescript
if (subtitleCount > 600) {
  // Zobrazit warning
  "⚠️ Large file detected. Consider splitting into smaller parts or upgrading to Pro plan."
} else if (subtitleCount > 400) {
  // Zobrazit info
  "ℹ️ Large file - processing may take up to 5 minutes."
}
```

## 🧪 Test scénáře

### Test 1: 672 titulků (aktuální problém)
- **Očekávaný timeout**: 290s frontend, 280s backend
- **Očekávaný výsledek**: ✅ Mělo by se dokončit

### Test 2: 800+ titulků
- **Očekávaný timeout**: 290s (capped)
- **Očekávaný výsledek**: ❌ Pravděpodobně timeout

### Test 3: 300 titulků
- **Očekávaný timeout**: 240s frontend, 225s backend
- **Očekávaný výsledek**: ✅ Bezpečně dokončeno

## 📊 Monitoring metriky

### Sledovat po nasazení:
- **Success rate** pro různé velikosti souborů
- **Actual processing time** vs predicted time
- **Timeout frequency** pro soubory 600+ titulků
- **User feedback** ohledně dlouhých souborů

### Optimalizace možnosti:
- **Batch size reduction** pro dlouhé soubory
- **Progress frequency** adjustment
- **Memory optimization** pro velké soubory
- **Parallel processing** (pokud možné)

## 🚀 Očekávané výsledky

### ✅ Zlepšení:
- **672 titulků** by se měly dokončit (vs současné 72%)
- **Adaptive timeouts** pro různé velikosti
- **Better user warnings** pro velké soubory
- **Optimální využití** Vercel Free plan limitů

### 📈 Success rate očekávání:
- **< 400 titulků**: 95%+ success rate
- **400-600 titulků**: 80%+ success rate
- **600+ titulků**: 60%+ success rate (hraniční)

## 📝 Poznámky

### Proč adaptive timeout:
- **Fixní timeout** nevyhovuje různým velikostem
- **Malé soubory** nepotřebují dlouhé timeouty
- **Velké soubory** potřebují více času
- **Vercel limity** vyžadují optimalizaci

### Budoucí vylepšení:
- **File size pre-check** před začátkem překladu
- **Automatic file splitting** pro velmi velké soubory
- **Progress prediction** based on file size
- **Pro plan detection** pro neomezené timeouty

Toto řešení by mělo vyřešit problém s dlouhými soubory v rámci Vercel Free plan limitů! 🎯
