# Credits System Test Guide

## 🧪 Testování systému kreditů

### Co bylo opraveno:
1. **Zobrazení kreditů** - nahrazeno "Loading..." skutečným zobrazením
2. **Výpočet ceny** - přidán odhad ceny před překladem
3. **Odečítání kreditů** - kredity se nyní správně odečítají po překladu

### 🔍 Testovací kroky:

#### Krok 1: Ověření zobrazení kreditů
1. Přihlaste se na uživatelský účet
2. Jděte na stránku pro překlad titulků
3. **Očekávaný výsledek**: V sekci "Credits Balance" by se měl zobrazit skutečný počet kreditů místo "Loading..."

#### Krok 2: Test výpočtu ceny
1. Nahrajte SRT soubor s titulky
2. **Očekávaný výsledek**: 
   - Zobrazí se sekce "Estimated Cost"
   - Ukáže počet titulků a chunků
   - Zobrazí odhadovanou cenu v kreditech a USD
   - Cena se změní při změně AI služby (Google: 0.1, Premium: 0.2 kreditu na chunk)

#### Krok 3: Test odečítání kreditů
1. Poznamenejte si současný počet kreditů
2. Proveďte překlad souboru
3. Počkejte na dokončení překladu
4. **Očekávaný výsledek**: 
   - Kredity se odečtou podle vzorce: `Math.ceil(počet_titulků / 20) * sazba_za_chunk`
   - Standard (Google/OpenAI): 0.1 kreditu na chunk
   - Premium: 0.2 kreditu na chunk

#### Krok 4: Test kontroly kreditů
1. Zkuste přeložit soubor, když máte málo kreditů
2. **Očekávaný výsledek**: Zobrazí se chyba "Insufficient credits" s detaily

### 📊 Vzorce pro výpočet:

#### Počet chunků:
```
chunks = Math.ceil(počet_titulků / 20)
```

#### Cena podle služby:
- **Google Translate**: `chunks × 0.1` kreditů
- **OpenAI Standard**: `chunks × 0.1` kreditů  
- **Premium AI**: `chunks × 0.2` kreditů

#### Příklad:
- Soubor s 50 titulky
- Chunks: `Math.ceil(50 / 20) = 3`
- Google: `3 × 0.1 = 0.3` kreditů
- Premium: `3 × 0.2 = 0.6` kreditů

### 🐛 Možné problémy:

#### Kredity se stále nezobrazují:
- Zkontrolujte, že jste přihlášeni
- Obnovte stránku
- Zkontrolujte konzoli prohlížeče na chyby

#### Cena se nepočítá:
- Zkontrolujte, že soubor obsahuje platné SRT titulky
- Zkontrolujte konzoli na chyby při parsování

#### Kredity se neodečítají:
- Zkontrolujte, že překlad skutečně dokončil (status 'completed')
- Zkontrolujte admin dashboard pro ověření
- Zkontrolujte server logy

### 🔧 Debug informace:

#### V konzoli prohlížeče:
```javascript
// Zkontrolujte výpočet ceny
console.log('Subtitle count:', subtitleCount)
console.log('Estimated cost:', estimatedCost)
console.log('AI service:', aiService)
```

#### V server logách:
```
💰 Required credits: X.X, Current balance: Y.Y
💰 Deducting X.X credits for N subtitles (M chunks, 0.X per chunk)
```

### ✅ Očekávané výsledky:
- Kredity se zobrazují správně místo "Loading..."
- Odhad ceny se zobrazuje při nahrání souboru
- Cena se mění podle AI služby
- Kredity se odečítají po dokončení překladu
- Zobrazuje se chyba při nedostatku kreditů

### 📱 Testování v produkci:
Po deployi na Vercel otestujte stejné kroky na produkční URL.
