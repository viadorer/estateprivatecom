# Souhrn Bezpečnostních Změn

**Datum:** 26. října 2024  
**Status:** IMPLEMENTOVÁNO

---

## CO BYLO OPRAVENO

### KRITICKÉ BEZPEČNOSTNÍ DÍRY (OPRAVENO):

#### 1. Session v localStorage - XSS VULNERABLE
**Před:**
```javascript
localStorage.setItem('currentUser', JSON.stringify(user))
```
**Riziko:** Útočník může přes XSS útok ukrást kompletní user objekt včetně všech dat.

**Po:**
```javascript
// JWT v HttpOnly cookie - JavaScript nemůže přistupovat
res.cookie('auth_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
})
```
**Výsledek:** XSS útok nemůže ukrást tokeny.

---

#### 2. Žádná Expirace Session
**Před:** Session platná navždy

**Po:** 
- Access Token: 15 minut
- Refresh Token: 7 dní
- Automatická revokace při logout

**Výsledek:** Ukradený token má omezenou platnost.

---

#### 3. Žádný Rate Limiting
**Před:** Neomezené pokusy o přihlášení

**Po:**
- Login: max 5 pokusů / 15 minut
- API: max 100 requestů / 15 minut

**Výsledek:** Ochrana proti brute-force útokům.

---

#### 4. Žádné Security Headers
**Před:** Žádná ochrana proti XSS, clickjacking

**Po:** Helmet middleware s:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security

**Výsledek:** Základní ochrana proti běžným útokům.

---

## NOVÉ FUNKCE

### JWT Autentizace
- Access Token (15min) + Refresh Token (7d)
- Tokeny v HttpOnly cookies
- Refresh token mechanismus
- Token revokace při logout

### Nové API Endpointy
- `GET /api/auth/me` - Ověření session
- `POST /api/auth/refresh` - Refresh tokenu
- `POST /api/auth/logout` - Odhlášení s revokací

### Nové Databázové Tabulky
- `refresh_tokens` - Správa refresh tokenů
- `password_reset_tokens` - Připraveno pro reset hesla
- `email_verification_tokens` - Připraveno pro verifikaci emailu

---

## JAK TO TESTOVAT

### 1. Přihlášení
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@realitka.cz","password":"heslo123"}' \
  -c cookies.txt -v
```

### 2. Ověření Session
```bash
curl http://localhost:3001/api/auth/me -b cookies.txt
```

### 3. Odhlášení
```bash
curl -X POST http://localhost:3001/api/auth/logout -b cookies.txt
```

---

## CO DÁLE

### Priorita 1 (Brzy):
- Password reset flow
- Email verification
- Automatický token refresh na frontendu

### Priorita 2 (Doporučeno):
- 2FA
- Session management UI
- IP blocking

---

## DŮLEŽITÉ POZNÁMKY

1. **JWT_SECRET musí být nastaven v .env**
   - Vygeneruj: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Přidej do `backend/.env`

2. **Všechny fetch requesty musí mít credentials: 'include'**
   - Frontend automaticky posílá cookies

3. **HTTPS v produkci je POVINNÉ**
   - Secure cookies fungují jen přes HTTPS

4. **Existující uživatelé se musí přihlásit znovu**
   - localStorage už neobsahuje session

---

**Bezpečnostní skóre:**
- Před: 3/10
- Po: 7/10

**Zbývá implementovat:**
- Password reset
- Email verification
- 2FA
- CSRF protection (částečně řešeno SameSite cookies)
- Input validation (Joi/Zod)
