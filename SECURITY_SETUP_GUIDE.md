# Průvodce Bezpečnostním Nastavením

## RYCHLÝ START

### 1. Nastavení JWT Secrets

**DŮLEŽITÉ:** Před spuštěním v produkci MUSÍŠ nastavit JWT secrets!

```bash
cd backend

# Zkopíruj .env.production do .env
cp .env.production .env

# NEBO vygeneruj nové secrets:
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex')); console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Vlož vygenerované secrets do backend/.env
```

### 2. Kontrola Instalace

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Spuštění

```bash
# Backend (v jednom terminálu)
cd backend
node server.js

# Frontend (v druhém terminálu)
cd frontend
npm run dev
```

---

## CO SE ZMĚNILO

### BEZPEČNOSTNÍ VYLEPŠENÍ

#### 1. JWT Autentizace
- **Před:** Session v localStorage (XSS vulnerable)
- **Po:** JWT v HttpOnly cookies (JavaScript nemůže přistupovat)

#### 2. Token Expirace
- **Před:** Session platná navždy
- **Po:** Access token 15 minut, Refresh token 7 dní

#### 3. Rate Limiting
- **Před:** Žádný limit
- **Po:** 100 requestů/15min (API), 5 pokusů/15min (login)

#### 4. Security Headers
- **Před:** Žádné security headers
- **Po:** Helmet middleware (XSS, clickjacking ochrana)

---

## TESTOVÁNÍ BEZPEČNOSTI

### Test 1: Přihlášení

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@realitka.cz","password":"heslo123"}' \
  -v

# Zkontroluj v response headers:
# Set-Cookie: auth_token=...; HttpOnly; SameSite=Strict
# Set-Cookie: refresh_token=...; HttpOnly; SameSite=Strict
```

### Test 2: Ověření Session

```bash
# Ulož cookies z předchozího requestu do souboru
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@realitka.cz","password":"heslo123"}' \
  -c cookies.txt

# Použij cookies pro ověření
curl http://localhost:3001/api/auth/me \
  -b cookies.txt

# Mělo by vrátit user data
```

### Test 3: Rate Limiting

```bash
# Zkus 6x přihlášení rychle po sobě
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.cz","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n"
done

# 6. request by měl vrátit 429 (Too Many Requests)
```

### Test 4: XSS Ochrana

```javascript
// Otevři DevTools v prohlížeči a zkus:
document.cookie

// Mělo by vrátit prázdný string nebo cookies BEZ auth_token
// (HttpOnly cookies nejsou přístupné přes JavaScript)
```

---

## PRODUKČNÍ CHECKLIST

### Před Nasazením:

- [ ] Nastav JWT_SECRET v .env (min 32 znaků)
- [ ] Nastav JWT_REFRESH_SECRET v .env (min 32 znaků)
- [ ] Nastav FRONTEND_URL na produkční URL
- [ ] Nastav NODE_ENV=production
- [ ] Zkontroluj CORS nastavení
- [ ] Nastav HTTPS (secure cookies vyžadují HTTPS)
- [ ] Otestuj login/logout flow
- [ ] Otestuj token refresh
- [ ] Zkontroluj rate limiting
- [ ] Proveď security audit

### Email Konfigurace (Volitelné):

```bash
# Pro Gmail:
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # NE běžné heslo, ale App Password!
EMAIL_FROM=Estate Private <noreply@estateprivate.com>

# Jak získat Gmail App Password:
# 1. Jdi na https://myaccount.google.com/security
# 2. Zapni 2-Step Verification
# 3. Jdi na App Passwords
# 4. Vygeneruj nový App Password pro "Mail"
# 5. Zkopíruj 16-místný kód do EMAIL_PASSWORD
```

---

## ZNÁMÉ PROBLÉMY A ŘEŠENÍ

### Problém 1: "Nepřihlášen" po refreshi stránky

**Příčina:** Frontend nevolá `/api/auth/me` při načtení

**Řešení:** Zkontroluj, že useEffect v App.jsx volá checkAuth()

### Problém 2: CORS error

**Příčina:** Frontend URL není v CORS whitelist

**Řešení:** 
```javascript
// backend/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
```

### Problém 3: Cookies se neukládají

**Příčina:** Chybí `credentials: 'include'` ve fetch

**Řešení:**
```javascript
fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include',  // DŮLEŽITÉ!
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

### Problém 4: "Token vypršel" po 15 minutách

**Příčina:** Access token má krátkou expiraci (15min)

**Řešení:** Implementuj automatický refresh:
```javascript
// Při 401 error s { expired: true }
if (response.status === 401) {
  const data = await response.json()
  if (data.expired) {
    // Zavolej refresh
    await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    })
    // Opakuj původní request
  }
}
```

---

## MIGRACE EXISTUJÍCÍCH UŽIVATELŮ

Pokud už máš uživatele, kteří používali localStorage:

### Automatická Migrace:

Přidej do App.jsx:
```javascript
useEffect(() => {
  const oldUser = localStorage.getItem('currentUser')
  if (oldUser) {
    localStorage.removeItem('currentUser')
    alert('Z bezpečnostních důvodů se prosím přihlaste znovu')
    setShowLoginModal(true)
  }
}, [])
```

---

## MONITORING A LOGOVÁNÍ

### Audit Log:

Všechny přihlášení a odhlášení se logují do `audit_logs` tabulky:

```sql
SELECT * FROM audit_logs 
WHERE action IN ('login', 'logout') 
ORDER BY created_at DESC 
LIMIT 10;
```

### Refresh Tokens:

Zkontroluj aktivní refresh tokeny:

```sql
SELECT 
  rt.id,
  u.email,
  rt.expires_at,
  rt.revoked,
  rt.created_at
FROM refresh_tokens rt
JOIN users u ON u.id = rt.user_id
WHERE rt.revoked = 0
ORDER BY rt.created_at DESC;
```

### Rate Limiting:

Rate limiting je v paměti (resetuje se při restartu serveru).
Pro produkci zvažte Redis:

```bash
npm install rate-limit-redis redis
```

---

## DALŠÍ KROKY

### Priorita 1 (Implementovat brzy):
1. Password reset flow
2. Email verification
3. Automatický token refresh na frontendu

### Priorita 2 (Doporučeno):
1. 2FA (Two-Factor Authentication)
2. Session management (zobrazit aktivní sessions)
3. IP blocking při podezřelé aktivitě

### Priorita 3 (Nice to have):
1. OAuth2 (Google, Facebook login)
2. Biometrická autentizace
3. Advanced monitoring

---

## PODPORA

Pokud narazíš na problém:

1. Zkontroluj konzoli prohlížeče (F12)
2. Zkontroluj backend logs
3. Zkontroluj .env konfiguraci
4. Zkontroluj CORS nastavení
5. Zkontroluj cookies v DevTools (Application → Cookies)

---

**Vytvořeno:** 26. října 2024  
**Verze:** 1.0  
**Autor:** Cascade AI
