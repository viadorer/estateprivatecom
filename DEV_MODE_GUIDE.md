# Vývojový režim - Průvodce

## Rychlé nastavení pro vývoj

Soubor `backend/devConfig.js` obsahuje všechna nastavení pro zjednodušení vývoje.

### Doporučené nastavení pro rychlý vývoj:

```javascript
// V backend/devConfig.js změňte:

auth: {
  requireLogin: false,           // Automatické přihlášení
  checkTokenExpiration: false,   // Tokeny nevyprší
  requireStrongPassword: false,  // Slabá hesla OK
  autoLoginAs: 'admin@realitka.cz'
},

rateLimiting: {
  enabled: false,                // Žádné limity
},

email: {
  sendEmails: false,             // Neposílat emaily
  showCodeInConsole: true,       // Kódy v konzoli
},

approval: {
  requirePropertyApproval: false, // Nabídky přímo aktivní
  requireDemandApproval: false,   // Poptávky přímo aktivní
  allAgentsVerified: true         // Všichni agenti ověřeni
},

loi: {
  requireLOI: false,              // Bez LOI
  requireBrokerageContract: false, // Bez smluv
}
```

## Jak to použít v kódu

### 1. Import konfigurace

```javascript
import DEV_CONFIG from './devConfig.js'
```

### 2. Kontrola nastavení

```javascript
// Místo pevného kódu:
if (user.role !== 'admin') {
  return res.status(403).json({ error: 'Forbidden' })
}

// Použijte:
if (DEV_CONFIG.auth.requireLogin && user.role !== 'admin') {
  return res.status(403).json({ error: 'Forbidden' })
}
```

### 3. Příklady použití

#### Autentizace
```javascript
// V middleware
if (!DEV_CONFIG.auth.requireLogin) {
  // Auto-login jako admin
  req.user = { email: DEV_CONFIG.auth.autoLoginAs, role: 'admin' }
  return next()
}
```

#### Emaily
```javascript
if (DEV_CONFIG.email.sendEmails) {
  await sendEmail(...)
} else {
  console.log('DEV: Email by byl odeslán:', recipient, subject)
}

if (DEV_CONFIG.email.showCodeInConsole) {
  console.log('PRISTUPOVY KOD:', code)
}
```

#### Schvalování
```javascript
// Při vytváření nabídky
const status = DEV_CONFIG.approval.requirePropertyApproval 
  ? 'pending_approval' 
  : 'active'
```

#### LOI
```javascript
// Kontrola přístupu
if (!DEV_CONFIG.loi.requireLOI || hasLOI) {
  // Povolit přístup
}
```

## Zobrazení aktuální konfigurace

V `server.js` na začátku:

```javascript
import { printDevConfig } from './devConfig.js'

if (process.env.NODE_ENV === 'development') {
  printDevConfig()
}
```

## Před nasazením do produkce

### DŮLEŽITÉ: Zkontrolujte všechna nastavení!

```javascript
// PRODUKČNÍ NASTAVENÍ:
auth: {
  requireLogin: true,
  checkTokenExpiration: true,
  requireStrongPassword: true,
},

rateLimiting: {
  enabled: true,
  authLimit: 5,
  apiLimit: 100
},

email: {
  sendEmails: true,
  showCodeInConsole: false,
},

approval: {
  requirePropertyApproval: true,
  requireDemandApproval: true,
  allAgentsVerified: false
},

loi: {
  requireLOI: true,
  requireBrokerageContract: true,
  skipCodeVerification: false
},

debug: {
  logAllQueries: false,
  logAllRequests: false,
  verboseErrors: false,
  showStackTraces: false
}
```

## Checklist před produkcí

- [ ] `requireLogin: true`
- [ ] `checkTokenExpiration: true`
- [ ] `rateLimiting.enabled: true`
- [ ] `sendEmails: true`
- [ ] `showCodeInConsole: false`
- [ ] `requirePropertyApproval: true`
- [ ] `requireDemandApproval: true`
- [ ] `requireLOI: true`
- [ ] `requireBrokerageContract: true`
- [ ] `verboseErrors: false`
- [ ] `showStackTraces: false`

## Tipy pro vývoj

### Rychlé testování bez překážek:
```javascript
// Vše vypnuto
requireLogin: false
requireLOI: false
requirePropertyApproval: false
sendEmails: false
```

### Testování emailů:
```javascript
sendEmails: false  // Neposílat
showCodeInConsole: true  // Vidět kódy
```

### Testování schvalování:
```javascript
requirePropertyApproval: true
email.sendEmails: false  // Vidět co by se poslalo
```

### Debugging:
```javascript
debug: {
  logAllQueries: true,
  logAllRequests: true,
  verboseErrors: true
}
```

## Poznámky

- Soubor `devConfig.js` je v `.gitignore` - každý vývojář má své nastavení
- Pro produkci vytvořte `prodConfig.js` se všemi kontrolami zapnutými
- Používejte environment variables pro citlivá data
