# Implementace JWT Autentizace a Bezpečnostních Opatření

**Datum:** 26. října 2024  
**Status:** IMPLEMENTOVÁNO  
**Priorita:** KRITICKÁ

---

## CO BYLO IMPLEMENTOVÁNO

### 1. JWT Autentizace s HttpOnly Cookies

#### Backend změny:

**Nové balíčky:**
- `jsonwebtoken` - JWT tokeny
- `cookie-parser` - Správa cookies
- `express-rate-limit` - Rate limiting
- `helmet` - Security headers

**Nové endpointy:**
- `POST /api/auth/login` - Přihlášení s JWT (upraveno)
- `GET /api/auth/me` - Ověření aktuální session
- `POST /api/auth/refresh` - Refresh access tokenu
- `POST /api/auth/logout` - Odhlášení a revokace tokenů

**JWT Tokeny:**
- **Access Token:** 15 minut expirace, v HttpOnly cookie
- **Refresh Token:** 7 dní expirace, v HttpOnly cookie, uložen v DB

**Bezpečnostní middleware:**
- `authenticateToken` - Ověření JWT tokenu
- `requireRole(...roles)` - Kontrola role uživatele
- Rate limiting na všechny API endpointy (100 req/15min)
- Rate limiting na login (5 pokusů/15min)
- Helmet security headers

#### Frontend změny:

**ODSTRANĚNO:**
- `localStorage.setItem('currentUser', ...)` - BEZPEČNOSTNÍ RIZIKO
- `localStorage.getItem('currentUser')` - BEZPEČNOSTNÍ RIZIKO

**PŘIDÁNO:**
- `credentials: 'include'` do všech fetch requestů
- Automatické ověření session při načtení stránky (`/api/auth/me`)
- Logout endpoint volání místo jen localStorage.clear()

---

## BEZPEČNOSTNÍ VYLEPŠENÍ

### Před implementací:
- Session v localStorage (XSS vulnerable)
- Žádná expirace session
- Žádný rate limiting
- Žádné security headers
- Hesla v plain bcrypt (OK, ale bez JWT)

### Po implementaci:
- JWT v HttpOnly cookies (JavaScript nemůže přistupovat)
- Access token expirace 15 minut
- Refresh token expirace 7 dní
- Rate limiting: 100 req/15min (API), 5 req/15min (login)
- Helmet security headers (XSS, clickjacking ochrana)
- Refresh token revokace při logout
- Token refresh mechanismus

---

## DATABÁZOVÉ ZMĚNY

### Nové tabulky:

```sql
-- Refresh Tokens
CREATE TABLE refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  revoked INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Password Reset Tokens (připraveno pro budoucnost)
CREATE TABLE password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Email Verification Tokens (připraveno pro budoucnost)
CREATE TABLE email_verification_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  verified_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## KONFIGURACE

### .env soubor (POVINNÉ):

```bash
# JWT Authentication
JWT_SECRET=your-secret-key-min-32-characters-random
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters-random

# Vygeneruj pomocí:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**VAROVÁNÍ:** Pokud JWT_SECRET není nastaven, server vygeneruje dočasný klíč a vypíše varování do konzole.

---

## JAK TO FUNGUJE

### Login Flow:

```
1. Uživatel zadá email + heslo
   ↓
2. Backend ověří credentials
   ↓
3. Vygeneruje Access Token (15min) + Refresh Token (7d)
   ↓
4. Uloží Refresh Token do DB
   ↓
5. Nastaví oba tokeny jako HttpOnly cookies
   ↓
6. Vrátí user data (bez hesla)
   ↓
7. Frontend uloží user do state (NE do localStorage!)
```

### Automatické ověření session:

```
1. Uživatel otevře aplikaci
   ↓
2. Frontend zavolá GET /api/auth/me
   ↓
3. Backend ověří Access Token z cookie
   ↓
4. Pokud platný → vrátí user data
   ↓
5. Pokud vypršel → frontend může zavolat /api/auth/refresh
```

### Refresh Token Flow:

```
1. Access Token vyprší (po 15 minutách)
   ↓
2. Frontend dostane 401 error s { expired: true }
   ↓
3. Frontend zavolá POST /api/auth/refresh
   ↓
4. Backend ověří Refresh Token
   ↓
5. Zkontroluje v DB (zda není revoked)
   ↓
6. Vygeneruje nový Access Token
   ↓
7. Nastaví nový Access Token cookie
   ↓
8. Frontend opakuje původní request
```

### Logout Flow:

```
1. Uživatel klikne na Odhlásit
   ↓
2. Frontend zavolá POST /api/auth/logout
   ↓
3. Backend revokuje Refresh Token v DB
   ↓
4. Smaže oba cookies
   ↓
5. Frontend vymaže user ze state
```

---

## TESTOVÁNÍ

### Test 1: Přihlášení
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@realitka.cz","password":"heslo123"}' \
  -c cookies.txt

# Mělo by vrátit user data a nastavit cookies
```

### Test 2: Ověření session
```bash
curl http://localhost:3001/api/auth/me \
  -b cookies.txt

# Mělo by vrátit user data
```

### Test 3: Refresh token
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -b cookies.txt

# Mělo by vrátit { success: true } a nastavit nový access token
```

### Test 4: Logout
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt

# Mělo by vrátit { success: true } a smazat cookies
```

---

## CO DÁLE IMPLEMENTOVAT

### Priorita 1 (Tento týden):
- [ ] Password reset flow
- [ ] Email verification
- [ ] Automatický refresh token při expiraci

### Priorita 2 (Příští týden):
- [ ] 2FA (Two-Factor Authentication)
- [ ] IP blocking při podezřelé aktivitě
- [ ] Session management (zobrazit aktivní sessions)

### Priorita 3 (Měsíc):
- [ ] OAuth2 (Google, Facebook login)
- [ ] Biometrická autentizace
- [ ] Advanced monitoring a alerting

---

## BREAKING CHANGES

### Pro vývojáře:

1. **localStorage už neobsahuje user data**
   - Před: `localStorage.getItem('currentUser')`
   - Po: Použij state z React nebo zavolej `/api/auth/me`

2. **Všechny fetch requesty musí mít credentials**
   - Před: `fetch('/api/users')`
   - Po: `fetch('/api/users', { credentials: 'include' })`

3. **Logout je async**
   - Před: `localStorage.removeItem('currentUser')`
   - Po: `await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })`

---

## ZNÁMÉ PROBLÉMY

1. **CORS v produkci:**
   - Musí být nastaven správný `FRONTEND_URL` v .env
   - Cookies fungují jen na stejné doméně nebo s správným CORS

2. **HTTPS v produkci:**
   - HttpOnly cookies s `secure: true` vyžadují HTTPS
   - V development je `secure: false`

3. **Token refresh není automatický:**
   - Frontend musí sám detekovat 401 error a zavolat refresh
   - TODO: Implementovat axios interceptor

---

## MIGRACE EXISTUJÍCÍCH UŽIVATELŮ

Pokud už máš uživatele v localStorage:

1. Při prvním načtení stránky se automaticky odhlásí
2. Musí se přihlásit znovu
3. Dostane nové JWT tokeny

**Alternativa:** Můžeš přidat migrační kód:
```javascript
useEffect(() => {
  const oldUser = localStorage.getItem('currentUser')
  if (oldUser) {
    // Vynutit přihlášení
    localStorage.removeItem('currentUser')
    setShowLoginModal(true)
    alert('Z bezpečnostních důvodů se prosím přihlaste znovu')
  }
}, [])
```

---

## BEZPEČNOSTNÍ CHECKLIST

- [x] JWT v HttpOnly cookies
- [x] Access token expirace (15min)
- [x] Refresh token expirace (7d)
- [x] Refresh token revokace
- [x] Rate limiting (API + login)
- [x] Helmet security headers
- [x] CORS s credentials
- [x] Bcrypt password hashing
- [x] SQL injection ochrana (prepared statements)
- [ ] Password reset flow
- [ ] Email verification
- [ ] 2FA
- [ ] CSRF protection (SameSite cookies částečně chrání)
- [ ] Input validation (Joi/Zod)

---

**Autor:** Cascade AI  
**Implementováno:** 26. října 2024  
**Verze:** 1.0
