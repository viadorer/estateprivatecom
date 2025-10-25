# 📧 Nastavení Emailu pro Google Workspace

## MOŽNOST 1: App Password (Jednodušší)

### 1. Zapni 2FA
- https://myaccount.google.com/security
- Zapni "2-Step Verification"

### 2. Vytvoř App Password
- https://myaccount.google.com/apppasswords
- Mail → Other → "Estate Private"
- Zkopíruj 16-místný kód

### 3. Nastav .env
```env
EMAIL_USER=tvuj-email@tvoje-domena.cz
EMAIL_PASSWORD=abcdefghijklmnop
```

---

## MOŽNOST 2: OAuth2 (Pokud App Password nefunguje)

### 1. Vytvoř Google Cloud Project
1. Jdi na https://console.cloud.google.com
2. Vytvoř nový projekt: "Estate Private Email"
3. Zapni Gmail API

### 2. Vytvoř OAuth2 Credentials
1. APIs & Services → Credentials
2. Create Credentials → OAuth 2.0 Client ID
3. Application type: Web application
4. Authorized redirect URIs: `https://developers.google.com/oauthplayground`
5. Zkopíruj Client ID a Client Secret

### 3. Získej Refresh Token
1. Jdi na https://developers.google.com/oauthplayground
2. Klikni na ⚙️ (Settings) vpravo nahoře
3. Zaškrtni "Use your own OAuth credentials"
4. Vlož Client ID a Client Secret
5. V levém panelu vyber: `Gmail API v1` → `https://mail.google.com`
6. Klikni "Authorize APIs"
7. Přihlaš se svým Workspace účtem
8. Klikni "Exchange authorization code for tokens"
9. Zkopíruj **Refresh Token**

### 4. Nastav .env
```env
EMAIL_USER=tvuj-email@tvoje-domena.cz
EMAIL_CLIENT_ID=tvuj-client-id.apps.googleusercontent.com
EMAIL_CLIENT_SECRET=tvuj-client-secret
EMAIL_REFRESH_TOKEN=tvuj-refresh-token
```

### 5. Uprav emailService.js
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.EMAIL_CLIENT_ID,
    clientSecret: process.env.EMAIL_CLIENT_SECRET,
    refreshToken: process.env.EMAIL_REFRESH_TOKEN
  }
});
```

---

## MOŽNOST 3: SMTP (Nejjednodušší pro Workspace)

Pokud máš přístup k SMTP nastavení:

### 1. Zjisti SMTP server
- Většinou: `smtp.gmail.com`
- Port: `587` (TLS) nebo `465` (SSL)

### 2. Nastav .env
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tvuj-email@tvoje-domena.cz
EMAIL_PASSWORD=tvoje-heslo-nebo-app-password
```

### 3. Uprav emailService.js
```javascript
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true pro 465, false pro 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

---

## TESTOVÁNÍ

Po nastavení otestuj:

```bash
cd backend
node testEmail.js
```

Měl bys dostat email na testovací adresu!

---

## TROUBLESHOOTING

### "Invalid login"
- Zkontroluj, že máš zapnutou 2FA
- Zkontroluj, že používáš App Password, ne běžné heslo
- Zkontroluj, že App Password je bez mezer

### "Less secure app access"
- Google Workspace může blokovat "méně bezpečné aplikace"
- Kontaktuj Workspace admina
- Nebo použij OAuth2

### "Daily sending quota exceeded"
- Gmail má limit 500 emailů/den
- Workspace má vyšší limity (2000+)
- Pro produkci zvažte SendGrid, Mailgun, AWS SES

---

## DOPORUČENÍ PRO PRODUKCI

Pro produkční nasazení doporučuji:

1. **SendGrid** (zdarma 100 emailů/den)
2. **Mailgun** (zdarma 5000 emailů/měsíc)
3. **AWS SES** (velmi levné, $0.10 za 1000 emailů)

Tyto služby mají lepší deliverability a vyšší limity.
