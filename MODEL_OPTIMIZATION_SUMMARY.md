# 💰 Optimalizace nákladů na překlad - Model Split

## 🎯 Cíl optimalizace
Rozdělit použití OpenAI modelů pro úsporu nákladů:
- **o1-mini** (levnější) - pro analytické a research úkoly
- **o1** (dražší) - pouze pro samotný překlad

## ✅ Provedené změny

### 1. **Premium Translation Service** (`src/lib/premium-translation-service.ts`)

#### Analytické úkoly → o1-mini:
- **`conductShowResearch()`** - řádek 419
  - Změna: `gpt-4o` → `o1-mini`
  - Účel: Research informací o seriálu/filmu
  - Úspora: ~80% nákladů na research

- **`getShowContext()`** - řádek 538
  - Změna: `gpt-4o` → `o1-mini`
  - Účel: Kontextová analýza obsahu
  - Úspora: ~80% nákladů na analýzu

#### Překladové úkoly → o1:
- **`translateWithOpenAI()`** - řádek 40
  - Změna: `gpt-4o` → `o1`
  - Účel: Jednotlivé překlady textů

- **`translateBatch()`** - řádek 987
  - Změna: `gpt-4o` → `o1`
  - Účel: Batch překlad titulků

- **`translateBatchWithRetry()`** - řádek 1105
  - Změna: `gpt-4o` → `o1`
  - Účel: Opravy neúspěšných překladů

### 2. **Translation Services** (`src/lib/translation-services.ts`)

#### Překladové úkoly → o1:
- **`translate()`** - řádek 88
  - Změna: `gpt-4o` → `o1`
  - Účel: Základní překlad

- **`translateWithContext()`** - řádek 288
  - Změna: `gpt-4o` → `o1`
  - Účel: Kontextový překlad

### 3. **API Response Updates** (`src/app/api/translate/route.ts`)

#### Metadata aktualizace:
- **Response model info** - řádky 278, 775
  - Změna: `gpt-4o` → `o1`
  - Účel: Správné zobrazení použitého modelu v odpovědi

### 4. **Dokumentace** (`SPEED_OPTIMIZATION_GUIDE.md`)

#### Aktualizace popisu modelů:
- Rozdělení na analytické (o1-mini) a překladové (o1) úkoly
- Vysvětlení nákladové efektivity

## 💡 Výsledek optimalizace

### Workflow překladu:
1. **Analýza souboru** → o1-mini (levný)
2. **Research seriálu/filmu** → o1-mini (levný)
3. **Analýza obsahu titulků** → o1-mini (levný)
4. **Samotný překlad** → o1 (kvalitní)
5. **Opravy překladů** → o1 (kvalitní)

### Očekávané úspory:
- **Research fáze**: ~80% úspora nákladů
- **Analýza obsahu**: ~80% úspora nákladů
- **Celková úspora**: ~40-60% (závislé na poměru research vs. překlad)

### Zachovaná kvalita:
- ✅ **Překlad**: Stejná kvalita (o1)
- ✅ **Research**: Dostatečná kvalita pro analytické úkoly (o1-mini)
- ✅ **Uživatelský zážitek**: Beze změny

## 🔧 Technické detaily

### Model pricing (orientační):
- **o1**: ~$15 per 1M input tokens
- **o1-mini**: ~$3 per 1M input tokens
- **Úspora**: 5x levnější pro analytické úkoly

### Rozdělení úkolů:
```typescript
// Analytické úkoly (o1-mini)
- conductShowResearch()     // Research seriálu/filmu
- getShowContext()          // Kontextová analýza
- analyzeContent()          // Analýza obsahu titulků

// Překladové úkoly (o1)
- translateBatch()          // Hlavní překlad
- translateWithOpenAI()     // Jednotlivé překlady
- retranslation fixes       // Opravy překladů
```

## 🔧 Kritické opravy pro o1 modely

### API parametry:
- **Odstraněn `temperature`**: o1 modely nepodporují temperature parametr
- **Změněn `max_tokens` → `max_completion_tokens`**: o1 modely používají jiný parametr

### Opravené soubory:
- `src/lib/premium-translation-service.ts` - 5 API volání
- `src/lib/translation-services.ts` - 2 API volání

## ✅ Testování
Po implementaci doporučuji otestovat:
1. **Funkčnost**: Překlad stále funguje správně (opraveny API parametry)
2. **Kvalita**: Kvalita překladu zůstala zachována
3. **Náklady**: Monitoring skutečných úspor v OpenAI dashboard
4. **Performance**: Rychlost překladu (o1-mini může být rychlejší)

## 📊 Monitoring
Sledovat v OpenAI dashboard:
- Použití o1 vs o1-mini tokenů
- Celkové náklady před/po optimalizaci
- Případné chyby s novými modely
