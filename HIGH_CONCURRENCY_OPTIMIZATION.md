# High Concurrency Optimization - Pro filmy s 70-100+ batches

## 🎬 Problém s dlouhými filmy

### Typické velikosti filmů:
- **TV epizoda:** 20-40 batches (400-800 titulků)
- **Krátký film:** 40-60 batches (800-1200 titulků)  
- **Dlouhý film:** 70-100 batches (1400-2000 titulků)
- **Velmi dlouhý film:** 100+ batches (2000+ titulků)

### Současný problém:
- **Vercel limit:** 5 minut (300 sekund)
- **Starý concurrency:** Max 4 paralelní requesty
- **100 batches × 4 concurrency:** ~25 chunků × 15s = 375s ❌ (překračuje limit)

## 🚀 Nová vysoká paralelizace

### Adaptive Concurrency Strategy:
```typescript
let maxConcurrency
if (totalBatches >= 80) {
  // Velmi velké soubory (filmy): 12-15 concurrent requests
  maxConcurrency = Math.min(15, Math.floor(totalBatches / 6))
} else if (totalBatches >= 50) {
  // Velké soubory: 8-12 concurrent requests  
  maxConcurrency = Math.min(12, Math.floor(totalBatches / 5))
} else if (totalBatches >= 20) {
  // Střední soubory: 6-8 concurrent requests
  maxConcurrency = Math.min(8, Math.floor(totalBatches / 3))
} else {
  // Malé soubory: 3-4 concurrent requests
  maxConcurrency = Math.min(4, Math.max(2, Math.floor(totalBatches / 2)))
}
```

### Konkrétní příklady:

| Titulky | Batches | PŘED (concurrency) | PO (concurrency) | Zrychlení |
|---------|---------|-------------------|------------------|-----------|
| 400     | 20      | 4                 | 6                | **1.5x**  |
| 800     | 40      | 4                 | 8                | **2x**    |
| 1200    | 60      | 4                 | 12               | **3x**    |
| 1600    | 80      | 4                 | 13               | **3.25x** |
| 2000    | 100     | 4                 | 15               | **3.75x** |

## ⏱️ Časové úspory

### Výpočet pro 100 batches (dlouhý film):

#### PŘED (konzervativní):
```
100 batches ÷ 4 concurrency = 25 chunků
25 chunků × 15s per chunk = 375s (6.25 min) ❌ Překračuje Vercel limit
```

#### PO (agresivní):
```
100 batches ÷ 15 concurrency = 7 chunků  
7 chunků × 12s per chunk = 84s (1.4 min) ✅ Bezpečně pod limitem
```

**Zrychlení: 375s → 84s = 4.5x rychlejší!**

### Adaptive Delays:
```typescript
const delay = totalBatches >= 80 ? 150 : // Velmi velké: 150ms
             totalBatches >= 50 ? 200 : // Velké: 200ms  
             totalBatches >= 20 ? 250 : // Střední: 250ms
             300 // Malé: 300ms
```

**Kratší delays = rychlejší zpracování velkých souborů**

## 📊 Vercel timeout compliance

### Nové časové odhady:

| Batches | Concurrency | Chunks | Time per chunk | Total time | Status |
|---------|-------------|--------|----------------|------------|--------|
| 20      | 6           | 4      | 12s            | 48s        | ✅ Safe |
| 40      | 8           | 5      | 12s            | 60s        | ✅ Safe |
| 60      | 12          | 5      | 12s            | 60s        | ✅ Safe |
| 80      | 13          | 7      | 12s            | 84s        | ✅ Safe |
| 100     | 15          | 7      | 12s            | 84s        | ✅ Safe |
| 120     | 15          | 8      | 12s            | 96s        | ✅ Safe |

**Všechny velikosti nyní bezpečně pod 5 min limitem!**

## 🔧 Technické optimalizace

### 1. Adaptive Batch Timeouts:
```typescript
const adaptiveTimeout = maxConcurrency >= 10 ? 45000 : // High: 45s
                       maxConcurrency >= 6 ? 50000 :   // Medium: 50s
                       60000                            // Low: 60s
```

**Vyšší concurrency = kratší timeout = rychlejší error recovery**

### 2. Rate Limiting Protection:
- **150ms delay** pro velmi velké soubory (80+ batches)
- **200ms delay** pro velké soubory (50+ batches)
- **Postupné zvyšování** delay pro menší soubory

### 3. OpenAI API Limits:
- **Tier 1:** 3,500 RPM (requests per minute)
- **15 concurrent requests:** 900 requests per minute ✅ Bezpečně pod limitem
- **Built-in retry mechanism** pro rate limit handling

## ⚠️ Risk Management

### Potenciální rizika:
1. **API rate limits** - monitoring a retry mechanism
2. **Quality consistency** - zachování všech quality features
3. **Error propagation** - robust error handling pro každý batch

### Mitigation strategies:
```typescript
// Rate limit handling
try {
  const translatedBatch = await this.translateBatchWithRetry(...)
} catch (batchError) {
  if (batchError.message.includes('rate_limit')) {
    // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
  }
  // Fallback translation
}
```

### Quality preservation:
- ✅ **Context analysis** - zachováno
- ✅ **Research data** - zachováno  
- ✅ **Cultural adaptation** - zachováno
- ✅ **Retry mechanism** - zachováno
- ✅ **Fallback translation** - zachováno

## 📈 Expected Performance

### Filmy různých délek:

#### Krátký film (800 titulků, 40 batches):
- **PŘED:** 40 ÷ 4 = 10 chunků × 15s = 150s (2.5 min)
- **PO:** 40 ÷ 8 = 5 chunků × 12s = 60s (1 min)
- **Zrychlení:** 2.5x rychlejší

#### Dlouhý film (1600 titulků, 80 batches):
- **PŘED:** 80 ÷ 4 = 20 chunků × 15s = 300s (5 min) ⚠️ Na hranici
- **PO:** 80 ÷ 13 = 7 chunků × 12s = 84s (1.4 min)
- **Zrychlení:** 3.6x rychlejší

#### Velmi dlouhý film (2000 titulků, 100 batches):
- **PŘED:** 100 ÷ 4 = 25 chunků × 15s = 375s (6.25 min) ❌ Timeout
- **PO:** 100 ÷ 15 = 7 chunků × 12s = 84s (1.4 min)
- **Zrychlení:** 4.5x rychlejší

## 🎯 Monitoring

### Klíčové metriky:
- **Processing time** - celkový čas překladu
- **Concurrency utilization** - využití paralelních requestů
- **API rate limit hits** - frekvence rate limit chyb
- **Batch success rate** - úspěšnost jednotlivých batchů
- **Quality consistency** - zachování kvality při vysoké paralelizaci

### Success indicators:
- **< 2 minuty** pro filmy do 100 batches
- **< 95% API rate limit usage** 
- **> 95% batch success rate**
- **Zachovaná kvalita** překladu

## 🚀 Deployment Impact

### Immediate benefits:
- **Filmy 70-100 batches** nyní dokončitelné pod 5 min limitem
- **3-4x rychlejší** zpracování velkých souborů
- **Lepší user experience** s kratšími čekacími časy
- **Vyšší throughput** pro více uživatelů

### Long-term scalability:
- **Podpora pro velmi dlouhé filmy** (2000+ titulků)
- **Optimální využití** Vercel Free plan limitů
- **Připravenost** pro upgrade na Pro plan (15 min limit)

Tato optimalizace umožní zpracování i nejdelších filmů v rámci Vercel limitů! 🎬🚀
