# Firebase Email Templates Customization

## 🎯 Problém
Výchozí Firebase verification emails vypadají jako spam:
- Generický předmět: "Verify your email for project-33065350598"
- Žádný branding nebo název aplikace
- Nevysvětluje účel verifikace
- Vypadá nedůvěryhodně

## ✅ Řešení: Přizpůsobené Email Templates

### 1. **Firebase Console Nastavení**

#### Krok 1: Přejděte do Firebase Console
1. Otevřete [Firebase Console](https://console.firebase.google.com/)
2. Vyberte váš projekt
3. Přejděte na **Authentication** → **Templates**

#### Krok 2: Upravte Email Verification Template
1. Klikněte na **Email address verification**
2. Klikněte na ikonu tužky (Edit template)

#### Krok 3: Nastavte Custom Template

**Předmět emailu:**
```
Ověřte svůj email pro SubtitleAI - AI Překlad Titulků
```

**Tělo emailu (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎬 SubtitleAI</div>
            <h1>Vítejte v SubtitleAI!</h1>
        </div>
        
        <div class="content">
            <h2>Ověřte svou emailovou adresu</h2>
            
            <p>Děkujeme za registraci! Pro dokončení vytvoření účtu a začátek používání našich AI překladových služeb prosím ověřte svou emailovou adresu.</p>
            
            <div style="text-align: center;">
                <a href="%LINK%" class="button">✅ Ověřit Email Adresu</a>
            </div>
            
            <p><strong>Proč ověřujeme email?</strong></p>
            <ul>
                <li>🛡️ Ochrana vašeho účtu před zneužitím</li>
                <li>📧 Zajištění komunikace o vašich překladech</li>
                <li>🚫 Prevence spam registrací</li>
            </ul>
            
            <p>Po ověření budete moci:</p>
            <ul>
                <li>🎯 Překládat titulky pomocí AI</li>
                <li>💳 Využívat 200 zdarma kreditů</li>
                <li>📊 Sledovat historii překladů</li>
                <li>⚡ Používat batch překlad</li>
            </ul>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            
            <p><small>Pokud nefunguje tlačítko, zkopírujte tento odkaz do prohlížeče:</small></p>
            <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace;">%LINK%</p>
            
            <p><small>Pokud jste si nevytvořili účet na SubtitleAI, můžete tento email ignorovat.</small></p>
        </div>
        
        <div class="footer">
            <p><strong>SubtitleAI Team</strong></p>
            <p>🌐 <a href="https://subtitleai.com">subtitleai.com</a></p>
            <p>AI-powered subtitle translation service</p>
        </div>
    </div>
</body>
</html>
```

### 2. **Alternativní Jednoduchá Verze**

Pokud preferujete jednodušší text email:

**Předmět:**
```
Ověřte svůj email pro SubtitleAI
```

**Tělo (Text):**
```
Vítejte v SubtitleAI! 🎬

Děkujeme za registraci na naší platformě pro AI překlad titulků.

Pro dokončení vytvoření účtu prosím klikněte na odkaz níže:
%LINK%

Po ověření emailu budete moci:
✅ Překládat titulky pomocí AI
✅ Využívat 200 zdarma kreditů  
✅ Sledovat historii překladů
✅ Používat batch překlad

Proč ověřujeme email?
🛡️ Ochrana vašeho účtu
📧 Zajištění komunikace
🚫 Prevence spamu

Pokud jste si nevytvořili účet na SubtitleAI, můžete tento email ignorovat.

S pozdravem,
Tým SubtitleAI
https://subtitleai.com
```

### 3. **Nastavení Sender Name**

V Firebase Console také nastavte:
1. **Sender name**: `SubtitleAI`
2. **Reply-to email**: `noreply@subtitleai.com` (nebo vaše doména)

### 4. **Testování**

Po nastavení templates:
1. Vytvořte testovací účet
2. Zkontrolujte, jak vypadá nový email
3. Ověřte, že odkazy fungují správně
4. Testujte na různých email klientech (Gmail, Outlook, Apple Mail)

### 5. **Další Doporučení**

#### Domain Authentication
Pro lepší deliverability nastavte:
1. **Custom domain** pro Firebase Auth
2. **SPF/DKIM records** pro vaši doménu
3. **DMARC policy**

#### A/B Testing
Testujte různé verze:
- Různé předměty emailů
- Různé call-to-action texty
- Různé vysvětlení důvodů verifikace

#### Monitoring
Sledujte:
- Open rates emailů
- Click-through rates
- Verification completion rates
- Spam complaints

### 6. **Lokalizace**

Pro českou verzi webu můžete vytvořit český email template:

**Předmět (CZ):**
```
Ověřte svůj email pro SubtitleAI - AI Překlad Titulků
```

**Pro anglickou verzi:**
```
Verify your email for SubtitleAI - AI Subtitle Translation
```

### 7. **Troubleshooting**

**Časté problémy:**
- Emails jdou do spamu → Nastavte SPF/DKIM
- Pomalé doručování → Zkontrolujte Firebase quotas
- Nefunkční odkazy → Ověřte domain nastavení
- Špatné formátování → Testujte HTML template

**Testovací nástroje:**
- [Mail Tester](https://www.mail-tester.com/) - spam score
- [Litmus](https://litmus.com/) - email client testing
- Firebase Console logs - delivery status

Toto nastavení výrazně zlepší důvěryhodnost a profesionalitu vašich verification emailů!
