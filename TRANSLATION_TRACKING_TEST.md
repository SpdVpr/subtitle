# Translation Tracking Test Guide

## 🧪 Testování sledování překladů v admin dashboardu

### Co testujeme:
- Správné počítání překladů pro každého uživatele
- Zobrazení počtu překladů v admin dashboardu
- Aktualizace statistik po dokončení překladu

### Jak systém funguje:

#### 1. **Tracking při překladu**
```typescript
// V /api/translate route (řádek 434-437)
await UserService.updateUsage(userId, {
  translationsUsed: 1  // Přičte 1 k celkovému počtu
})
```

#### 2. **Tracking při batch překladu**
```typescript
// V /api/batch route (řádek 298-301)
await UserService.updateUsage(userId, {
  batchJobsUsed: 1,
  translationsUsed: translatedFiles.length  // Přičte počet úspěšně přeložených souborů
})
```

#### 3. **Zobrazení v admin dashboardu**
- **API endpoint**: `/api/admin/users` vrací `user.usage?.translationsUsed || 0`
- **Admin dashboard**: Zobrazuje jako `translationsCount` s ikonkou 📄
- **Formátování**: Číslo s tisícovými oddělovači + popis "X files translated"

### 🔍 Testovací kroky:

#### Krok 1: Ověření současného stavu
1. Přihlaste se jako admin (`admin@subtitle-ai.com`)
2. Jděte do admin dashboardu
3. Zkontrolujte sloupec "Translations" u uživatelů
4. Poznamenejte si současné hodnoty

#### Krok 2: Provedení testovacího překladu
1. Přihlaste se jako běžný uživatel (ne admin)
2. Nahrajte subtitle soubor a proveďte překlad
3. Počkejte na dokončení překladu

#### Krok 3: Ověření aktualizace
1. Vraťte se do admin dashboardu
2. Obnovte stránku nebo klikněte "Refresh"
3. Zkontrolujte, že se počet překladů u uživatele zvýšil o 1

#### Krok 4: Test batch překladu (pokud je dostupný)
1. Nahrajte více souborů najednou
2. Proveďte batch překlad
3. Ověřte, že se počet zvýšil o počet úspěšně přeložených souborů

### 📊 Co byste měli vidět:

#### V admin dashboardu:
- **Stats Cards**: "Files Translated" s celkovým počtem
- **User Activity Table**: 
  - Sloupec "Translations" s ikonkou 📄
  - Formát: "📄 123" + "123 files translated"
  - Tooltip s dodatečnými informacemi

#### V databázi (Firestore):
```javascript
// V kolekci 'users' -> document uživatele
{
  usage: {
    translationsUsed: 5,  // Celkový počet překladů
    // ... další usage data
  }
}
```

### 🐛 Možné problémy:

1. **Počet se neaktualizuje**:
   - Zkontrolujte, že překlad skutečně dokončil (status 'completed')
   - Ověřte, že uživatel není demo uživatel ('premium-user-demo')

2. **Chyba v admin dashboardu**:
   - Zkontrolujte Firestore Security Rules (měly by být aktualizované)
   - Ověřte admin oprávnění

3. **Nesprávný počet**:
   - Zkontrolujte, že se tracking volá pouze při úspěšném překladu
   - Ověřte, že se nepočítají failed překlady

### ✅ Očekávané výsledky:
- Každý úspěšný překlad zvýší počet o 1
- Batch překlad zvýší počet o počet úspěšně přeložených souborů
- Admin dashboard zobrazuje aktuální data s pěkným formátováním
- Celkové statistiky v Stats Cards se aktualizují
