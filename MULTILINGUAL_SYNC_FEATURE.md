# Vícejazyčná Podpora Funkce Synchronizace

## Přehled

Funkce synchronizace titulků byla implementována s plnou podporou pro anglickou i českou verzi aplikace.

## Struktura

### Komponenty

1. **SubtitleSyncPanel** (`subtitle-sync-panel.tsx`)
   - Česká verze komponenty
   - Všechny texty v češtině
   - Používá se v `/cs/subtitle-editor`

2. **SubtitleSyncPanelEn** (`subtitle-sync-panel-en.tsx`)
   - Anglická verze komponenty
   - Všechny texty v angličtině
   - Používá se v `/subtitle-editor`

3. **AdvancedSubtitleEditor** (upraveno)
   - Přidán prop `locale?: 'en' | 'cs'`
   - Dynamicky vybírá správnou komponentu podle jazyka
   - Přizpůsobuje text tabu podle jazyka

## Implementace

### AdvancedSubtitleEditor Props

```typescript
interface AdvancedSubtitleEditorProps {
  entries: SubtitleEntry[]
  originalEntries: SubtitleEntry[]
  onEntriesChange: (entries: SubtitleEntry[]) => void
  fileName?: string
  editorId?: string
  initialFloating?: boolean
  initialPosition?: { x: number; y: number }
  onSave?: () => void
  locale?: 'en' | 'cs'  // NOVÝ PROP
}
```

### Použití v Česká Verze

**Soubor:** `src/app/cs/subtitle-editor/page.tsx`

```tsx
<AdvancedSubtitleEditor
  entries={entries}
  originalEntries={originalEntries}
  onEntriesChange={handleEntriesChange}
  fileName={fileName}
  locale="cs"  // České texty
/>
```

### Použití v Anglická Verze

**Soubor:** `src/app/subtitle-editor/page.tsx`

```tsx
<AdvancedSubtitleEditor
  entries={entries}
  originalEntries={originalEntries}
  onEntriesChange={handleEntriesChange}
  fileName={fileName}
  locale="en"  // Anglické texty
/>
```

### Dynamické Vykreslování

**V AdvancedSubtitleEditor:**

```tsx
// Text tabu
<span>{locale === 'cs' ? 'Synchronizace' : 'Sync'}</span>

// Komponenta
{locale === 'cs' ? (
  <SubtitleSyncPanel
    entries={entries}
    onEntriesChange={onEntriesChange}
  />
) : (
  <SubtitleSyncPanelEn
    entries={entries}
    onEntriesChange={onEntriesChange}
  />
)}
```

## Překlad Textů

### Česká Verze (SubtitleSyncPanel)

| Klíč | Text |
|------|------|
| Název | Synchronizace Titulků |
| Popis | Posuňte časování všech titulků najednou |
| Info | Použijte kladné hodnoty pro posunutí titulků dopředu (později) nebo záporné hodnoty pro posunutí dozadu (dříve). |
| Sekundy | Sekundy |
| Milisekundy | Milisekundy |
| Celkový posun | Celkový posun |
| Rychlé Předvolby | Rychlé Předvolby |
| Náhled | Náhled |
| Aplikovat Synchronizaci | Aplikovat Synchronizaci |
| Reset | Reset |
| Režim náhledu aktivní | Režim náhledu aktivní |
| Potvrdit Změny | Potvrdit Změny |
| Zrušit | Zrušit |
| První titulek | První titulek |
| Poslední titulek | Poslední titulek |
| Náhled Změn | Náhled Změn |
| Aktuální Titulky | Aktuální Titulky |

### Anglická Verze (SubtitleSyncPanelEn)

| Key | Text |
|-----|------|
| Title | Subtitle Synchronization |
| Description | Shift the timing of all subtitles at once |
| Info | Use positive values to shift subtitles forward (later) or negative values to shift backward (earlier). |
| Seconds | Seconds |
| Milliseconds | Milliseconds |
| Total offset | Total offset |
| Quick Presets | Quick Presets |
| Preview | Preview |
| Apply Sync | Apply Sync |
| Reset | Reset |
| Preview mode active | Preview mode active |
| Confirm Changes | Confirm Changes |
| Cancel | Cancel |
| First subtitle | First subtitle |
| Last subtitle | Last subtitle |
| Preview Changes | Preview Changes |
| Current Subtitles | Current Subtitles |

## Toast Notifikace

### Česká Verze

```typescript
// Chyby
toast.error('Zadejte časový posun', {
  description: 'Posun musí být nenulový'
})

toast.error('Chyba při synchronizaci', {
  description: error.message || 'Zkontrolujte zadané hodnoty'
})

// Úspěch
toast.success('Synchronizace úspěšná!', {
  description: `Všechny titulky posunuty o ${offset}s`
})

// Info
toast.info('Náhled synchronizace', {
  description: `Posun: ${offset}s`
})

toast.info('Náhled zrušen')
```

### Anglická Verze

```typescript
// Errors
toast.error('Enter a time offset', {
  description: 'Offset must be non-zero'
})

toast.error('Sync error', {
  description: error.message || 'Check the entered values'
})

// Success
toast.success('Sync successful!', {
  description: `All subtitles shifted by ${offset}s`
})

// Info
toast.info('Sync preview', {
  description: `Offset: ${offset}s`
})

toast.info('Preview cancelled')
```

## Testování

### Testovací Scénáře

#### Česká Verze (`/cs/subtitle-editor`)
1. ✅ Otevřít `/cs/subtitle-editor`
2. ✅ Nahrát SRT soubor
3. ✅ Kliknout na zelené tlačítko "Synchronizace"
4. ✅ Ověřit, že všechny texty jsou v češtině
5. ✅ Zadat posun a aplikovat
6. ✅ Ověřit české toast notifikace

#### Anglická Verze (`/subtitle-editor`)
1. ✅ Otevřít `/subtitle-editor`
2. ✅ Nahrát SRT soubor
3. ✅ Kliknout na zelené tlačítko "Sync"
4. ✅ Ověřit, že všechny texty jsou v angličtině
5. ✅ Zadat posun a aplikovat
6. ✅ Ověřit anglické toast notifikace

## Výhody Tohoto Přístupu

### ✅ Oddělené Komponenty
- Každý jazyk má vlastní komponentu
- Snadná údržba a aktualizace textů
- Žádné složité i18n knihovny

### ✅ Type Safety
- TypeScript zajišťuje správné použití locale
- Compile-time kontrola

### ✅ Výkon
- Žádné runtime překlady
- Minimální overhead
- Rychlé načítání

### ✅ Flexibilita
- Snadné přidání dalších jazyků
- Možnost různých layoutů pro různé jazyky
- Nezávislé testování

## Přidání Nového Jazyka

Pokud byste chtěli přidat další jazyk (např. němčinu):

1. **Vytvořit novou komponentu:**
   ```
   src/components/subtitle-editor/subtitle-sync-panel-de.tsx
   ```

2. **Přeložit všechny texty:**
   ```tsx
   <CardTitle>Untertitel-Synchronisation</CardTitle>
   <CardDescription>
     Verschieben Sie das Timing aller Untertitel auf einmal
   </CardDescription>
   ```

3. **Přidat do AdvancedSubtitleEditor:**
   ```tsx
   import { SubtitleSyncPanelDe } from './subtitle-sync-panel-de'
   
   // V props
   locale?: 'en' | 'cs' | 'de'
   
   // V render
   {locale === 'cs' ? (
     <SubtitleSyncPanel ... />
   ) : locale === 'de' ? (
     <SubtitleSyncPanelDe ... />
   ) : (
     <SubtitleSyncPanelEn ... />
   )}
   ```

4. **Vytvořit německou stránku:**
   ```
   src/app/de/subtitle-editor/page.tsx
   ```

5. **Použít s locale="de":**
   ```tsx
   <AdvancedSubtitleEditor
     ...
     locale="de"
   />
   ```

## Soubory

### Nové Soubory
- `src/components/subtitle-editor/subtitle-sync-panel.tsx` (česká)
- `src/components/subtitle-editor/subtitle-sync-panel-en.tsx` (anglická)

### Upravené Soubory
- `src/components/subtitle-editor/advanced-subtitle-editor.tsx`
  - Přidán prop `locale`
  - Import obou komponent
  - Dynamické vykreslování podle jazyka
  
- `src/app/cs/subtitle-editor/page.tsx`
  - Přidán `locale="cs"` prop

- `src/app/subtitle-editor/page.tsx`
  - Přidán `locale="en"` prop

## Závěr

Funkce synchronizace titulků je nyní plně lokalizovaná pro češtinu i angličtinu. Implementace je:

- ✅ **Čistá**: Oddělené komponenty pro každý jazyk
- ✅ **Udržovatelná**: Snadné přidání nových jazyků
- ✅ **Výkonná**: Žádný runtime overhead
- ✅ **Type-safe**: TypeScript kontrola
- ✅ **Testovatelná**: Nezávislé testování každého jazyka

---

**Implementováno:** 2025-10-06  
**Verze:** 1.0.0  
**Jazyky:** Čeština (cs), Angličtina (en)  
**Status:** ✅ Hotovo a testováno

