# Admin Panel - Správa Uživatelů

## Přehled

Admin panel nyní podporuje kompletní správu uživatelů s reálnými daty z Firestore. Všechny mock data byly odstraněny a systém pracuje pouze s reálnými uživateli.

## Funkce Admin Panelu

### 1. Zobrazení Uživatelů
- **Reálná data**: Zobrazuje skutečné uživatele z Firestore databáze
- **Informace o uživatelích**: Email, plán, počet překladů, zůstatek kreditů, poslední aktivita
- **Status blokování**: Vizuální označení blokovaných uživatelů

### 2. Správa Kreditů
- **Editace kreditů**: Kliknutím na zůstatek kreditů můžete upravit hodnotu
- **Automatické logování**: Všechny změny se zaznamenávají do `creditTransactions`
- **Okamžitá aktualizace**: Po změně se data automaticky obnoví

### 3. Blokování Uživatelů
- **Blokování**: Tlačítko "Block" s možností zadat důvod
- **Odblokování**: Tlačítko "Unblock" pro obnovení přístupu
- **Audit trail**: Zaznamenává kdo a kdy uživatele zablokoval/odblokoval

### 4. Reset Statistik
- **Reset usage**: Vynuluje statistiky použití (překlady, storage, batch jobs)
- **Audit trail**: Zaznamenává kdo a kdy provedl reset

## API Endpointy

### `/api/admin/users` (GET)
Vrací seznam všech uživatelů s kompletními informacemi.

**Headers:**
```
x-admin-email: admin@subtitle-ai.com
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "users": [
    {
      "userId": "user123",
      "email": "user@example.com",
      "displayName": "User Name",
      "plan": "credits",
      "lastActive": "2024-01-15T10:30:00Z",
      "translationsCount": 25,
      "creditsBalance": 150.5,
      "isBlocked": false,
      "subscriptionPlan": "free"
    }
  ]
}
```

### `/api/admin/credits` (POST)
Upravuje kredity uživatele.

**Body:**
```json
{
  "userId": "user123",
  "deltaCredits": 50.0,
  "description": "Admin bonus"
}
```

### `/api/admin/user-management` (POST)
Univerzální endpoint pro správu uživatelů.

**Akce:**
- `adjustCredits`: Úprava kreditů
- `blockUser`: Blokování uživatele
- `unblockUser`: Odblokování uživatele
- `updateUserPlan`: Změna plánu
- `resetUserUsage`: Reset statistik

**Příklad - Blokování uživatele:**
```json
{
  "action": "blockUser",
  "userId": "user123",
  "data": {
    "reason": "Porušení podmínek"
  }
}
```

## Oprávnění

### Admin Emails
Pouze tyto emaily mají admin přístup:
- `admin@subtitle-ai.com`
- `ceo@subtitle-ai.com`
- `manager@subtitle-ai.com`
- `premium@test.com` (test účet)
- `pro@test.com` (test účet)

### Firestore Rules
Firestore pravidla umožňují admin uživatelům číst všechny kolekce:
- `users` - čtení všech uživatelů
- `creditTransactions` - čtení všech transakcí

## Nastavení Admin Přístupu

### 1. Nastavení Admin Email
```javascript
localStorage.setItem('adminEmail', 'admin@subtitle-ai.com')
```

### 2. Testování Přístupu
Admin panel obsahuje "Admin Setup" sekci pro testování:
- Ověření admin oprávnění
- Test přístupu k Firestore
- Zobrazení počtu uživatelů v databázi

### 3. Firebase Admin SDK
Pro server-side operace se používá Firebase Admin SDK:
- Obchází client-side security rules
- Umožňuje plný přístup k databázi
- Vyžaduje správné environment variables

## Environment Variables

```env
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

## Bezpečnost

### 1. Server-side Validace
- Všechny admin operace se ověřují na serveru
- Kontrola admin emailu při každém požadavku
- Logování všech admin akcí

### 2. Audit Trail
- Všechny změny se zaznamenávají s timestampem
- Informace o tom, kdo změnu provedl
- Historie všech admin operací

### 3. Error Handling
- Detailní error zprávy pro debugging
- Graceful fallback při chybách
- Automatické obnovení dat po chybách

## Troubleshooting

### Problém: "Admin access required"
- Zkontrolujte admin email v localStorage
- Ověřte, že email je v seznamu povolených
- Zkontrolujte Firestore security rules

### Problém: "Firestore not available"
- Zkontrolujte Firebase Admin SDK credentials
- Ověřte environment variables
- Zkontrolujte síťové připojení

### Problém: Uživatelé se nezobrazují
- Zkontrolujte Firestore security rules
- Ověřte admin oprávnění
- Zkontrolujte console pro error zprávy

## Monitoring

Admin panel poskytuje:
- Real-time statistiky uživatelů
- Monitoring aktivních uživatelů
- Přehled revenue z kreditů
- System status indikátory

Všechny admin akce se logují do console a do Firestore pro audit účely.
