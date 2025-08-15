# Test plán pro robustnost překladu titulků

## Implementované opravy

### 1. Progress Callback Debouncing
- Přidán debouncing mechanismus pro progress callback (500ms)
- Zabráněno spamování progress updates
- Lepší error handling v progress callback

### 2. Timeout mechanismy
- OpenAI API timeout: 60 sekund
- Batch translation timeout: 90 sekund
- Frontend streaming timeout: 2 minuty (sníženo z 5 minut)
- Progress monitoring timeout: 2 minuty bez progress = error

### 3. Retry logika
- Batch retry s exponential backoff (max 3 pokusy)
- Frontend automatic retry (max 2 pokusy)
- Fallback translation pro selhané batche

### 4. Progress monitoring
- Detekce zaseknutého progress (30s bez update)
- Automatické zrušení po 90s bez progress
- Server-side progress timeout monitoring

### 5. Error handling
- Lepší error propagation
- Graceful degradation s fallback překladem
- Automatic recovery mechanismy

## Test scénáře

### Test 1: Dlouhý soubor (500+ titulků)
1. Nahrát dlouhý SRT soubor
2. Spustit překlad
3. Ověřit, že se dokončí do 100%
4. Zkontrolovat kvalitu překladu

### Test 2: Síťové problémy
1. Simulovat pomalé připojení
2. Ověřit retry mechanismus
3. Zkontrolovat automatic recovery

### Test 3: API timeout
1. Simulovat pomalé OpenAI API
2. Ověřit timeout handling
3. Zkontrolovat fallback mechanismus

### Test 4: Progress monitoring
1. Simulovat zaseknutý progress
2. Ověřit detekci a recovery
3. Zkontrolovat user experience

## Očekávané výsledky

- ✅ Překlad se vždy dokončí (buď úspěšně nebo s fallback)
- ✅ Žádné nekonečné smyčky nebo zasekávání
- ✅ Jasné error zprávy pro uživatele
- ✅ Automatic retry při dočasných problémech
- ✅ Rychlá detekce a recovery při problémech

## Monitoring metriky

- Doba trvání překladu
- Počet retry pokusů
- Úspěšnost batch překladů
- Frekvence timeout událostí
- User experience (čas do dokončení)
