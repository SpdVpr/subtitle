# Funkce Synchronizace Titulků

## Přehled

Do editoru titulků byla přidána nová funkce **Synchronizace Titulků**, která umožňuje upravit časování všech titulků najednou. Tato funkce je ideální pro situace, kdy jsou titulky správně přeložené, ale jejich časování je posunuté oproti videu.

## Kde Najít Funkci

1. Otevřete **Editor Titulků** na `/cs/subtitle-editor`
2. Nahrajte SRT soubor s titulky
3. V horní části editoru přepněte na záložku **"Synchronizace"**

## Jak Používat

### Základní Použití

1. **Zadejte Časový Posun:**
   - **Sekundy**: Zadejte počet sekund (může být záporný)
   - **Milisekundy**: Pro jemné doladění (0-999 ms)

2. **Směr Posunu:**
   - **Kladné hodnoty** (+): Posunou titulky dopředu (později)
   - **Záporné hodnoty** (-): Posunou titulky dozadu (dříve)

3. **Aplikujte Změny:**
   - Klikněte na **"Náhled"** pro zobrazení změn před aplikací
   - Nebo klikněte na **"Aplikovat Synchronizaci"** pro okamžitou aplikaci

### Příklady Použití

#### Příklad 1: Titulky jsou o 1 sekundu pozadu
```
Problém: Titulky se objevují 1 sekundu před dialogem
Řešení: Zadejte +1 do pole "Sekundy"
Výsledek: Všechny titulky se posunou o 1 sekundu později
```

#### Příklad 2: Titulky jsou o 2.5 sekundy napřed
```
Problém: Titulky se objevují 2.5 sekundy po dialogu
Řešení: Zadejte -2 do pole "Sekundy" a -500 do pole "Milisekundy"
Výsledek: Všechny titulky se posunou o 2.5 sekundy dříve
```

#### Příklad 3: Jemné doladění o 300 ms
```
Problém: Titulky jsou téměř synchronizované, ale potřebují malou úpravu
Řešení: Zadejte 0 do pole "Sekundy" a 300 do pole "Milisekundy"
Výsledek: Všechny titulky se posunou o 300 ms později
```

## Rychlé Předvolby

Pro rychlé úpravy jsou k dispozici tlačítka s přednastavenými hodnotami:

- **-5s**: Posun o 5 sekund dozadu
- **-1s**: Posun o 1 sekundu dozadu
- **+1s**: Posun o 1 sekundu dopředu
- **+5s**: Posun o 5 sekund dopředu

## Režim Náhledu

Před aplikací změn můžete použít režim náhledu:

1. Klikněte na tlačítko **"Náhled"**
2. Zkontrolujte první a poslední titulek v sekci "Náhled Změn"
3. Pokud je vše v pořádku, klikněte na **"Potvrdit Změny"**
4. Pokud ne, klikněte na **"Zrušit"** a upravte hodnoty

### Co Zobrazuje Náhled

- **První titulek**: Ukazuje, jak bude vypadat časování prvního titulku
- **Poslední titulek**: Ukazuje, jak bude vypadat časování posledního titulku
- **Celkový posun**: Zobrazuje celkový časový posun v sekundách

## Bezpečnostní Funkce

### Ochrana Proti Záporným Časům

Funkce automaticky zabraňuje vytvoření záporných časů:

```
Příklad:
- První titulek začíná v 00:00:02,000
- Pokusíte se posunout o -5 sekund
- Systém zobrazí chybu: "Časový posun by způsobil záporné časy"
```

### Automatické Označení Upravených Titulků

Všechny titulky upravené synchronizací jsou automaticky označeny jako "upravené" (`isEdited: true`), což umožňuje:
- Sledovat, které titulky byly změněny
- Filtrovat upravené titulky v editoru
- Vrátit změny pomocí funkce "Obnovit"

## Technické Detaily

### Formát Času

Funkce pracuje s časovým formátem SRT:
```
HH:MM:SS,mmm
```

Kde:
- `HH` = hodiny (00-99)
- `MM` = minuty (00-59)
- `SS` = sekundy (00-59)
- `mmm` = milisekundy (000-999)

### Přesnost

- Funkce zachovává přesnost na milisekundy
- Všechny výpočty jsou prováděny v milisekundách pro maximální přesnost
- Výsledné časy jsou zaokrouhleny na celé milisekundy

### Výkon

- Synchronizace je optimalizovaná pro velké soubory
- Zpracování 1000+ titulků trvá méně než 100 ms
- Náhled je generován okamžitě bez zpoždění

## Workflow Doporučení

### Doporučený Postup Synchronizace

1. **Nahrajte titulky** do editoru
2. **Přehrajte video** s titulky a zjistěte, o kolik jsou posunuté
3. **Otevřete záložku Synchronizace**
4. **Zadejte časový posun** (začněte s odhadem)
5. **Použijte náhled** pro kontrolu
6. **Aplikujte změny** pokud je vše v pořádku
7. **Stáhněte upravené titulky**
8. **Otestujte s videem** a v případě potřeby opakujte

### Tipy pro Přesnou Synchronizaci

1. **Najděte referenční bod**: Vyberte výrazný dialog nebo zvuk na začátku videa
2. **Změřte rozdíl**: Zjistěte přesný časový rozdíl mezi titulkem a dialogem
3. **Aplikujte posun**: Použijte změřený rozdíl jako hodnotu posunu
4. **Ověřte na více místech**: Zkontrolujte synchronizaci na začátku, uprostřed a na konci videa

## Integrace s Ostatními Funkcemi

### Kompatibilita

Funkce synchronizace je plně kompatibilní s:
- ✅ Editorem titulků (jednotlivé úpravy)
- ✅ Hledání a nahrazování
- ✅ Historií úprav (Undo/Redo)
- ✅ Plovoucím režimem editoru
- ✅ Automatickým ukládáním

### Kombinace s Jinými Funkcemi

Můžete kombinovat synchronizaci s dalšími funkcemi:

1. **Synchronizace + Editace textu**:
   - Nejdříve synchronizujte časování
   - Poté upravte text jednotlivých titulků

2. **Synchronizace + Hledání a nahrazování**:
   - Upravte text pomocí hledání a nahrazování
   - Poté synchronizujte časování

3. **Synchronizace + Plovoucí editor**:
   - Použijte plovoucí režim pro sledování videa
   - Synchronizujte titulky při sledování

## Řešení Problémů

### Problém: Synchronizace nefunguje

**Možné příčiny:**
- Není načten žádný soubor s titulky
- Časový posun je nastaven na 0
- Titulky mají neplatný formát času

**Řešení:**
1. Zkontrolujte, že jsou titulky načteny
2. Zadejte nenulovou hodnotu posunu
3. Ověřte formát času v původním souboru

### Problém: Chyba "Časový posun by způsobil záporné časy"

**Příčina:**
Pokus o posun titulků před čas 00:00:00,000

**Řešení:**
- Použijte menší záporný posun
- Nebo upravte první titulky ručně před synchronizací

### Problém: Synchronizace je nepřesná

**Možné příčiny:**
- Video má proměnlivou rychlost snímků
- Titulky byly vytvořeny pro jinou verzi videa
- Chyba v měření časového rozdílu

**Řešení:**
1. Zkontrolujte synchronizaci na více místech ve videu
2. Použijte jemnější hodnoty (milisekundy)
3. V případě potřeby upravte jednotlivé titulky ručně

## Klávesové Zkratky

Při práci v editoru titulků můžete použít:

- `Ctrl+S` - Stáhnout upravené titulky
- `Ctrl+Z` - Vrátit změny (funguje i pro synchronizaci)
- `Ctrl+O` - Otevřít nový soubor

## Budoucí Vylepšení

Plánované funkce pro budoucí verze:

- 🔄 Progresivní synchronizace (různý posun pro začátek a konec)
- 📊 Vizuální timeline pro snadnější synchronizaci
- 🎯 Automatická detekce posunu pomocí audio analýzy
- 📝 Uložení synchronizačních profilů
- 🔗 Integrace s video přehrávačem pro real-time testování

## Podpora

Pokud máte problémy nebo návrhy na vylepšení:

1. Použijte tlačítko **"Sdílet Zpětnou Vazbu"** na hlavní stránce
2. Kontaktujte podporu přes `/cs/contact`
3. Zkontrolujte dokumentaci na `/cs/about`

---

**Verze:** 1.0  
**Datum:** 2025-10-06  
**Autor:** SubtitleAI Team

