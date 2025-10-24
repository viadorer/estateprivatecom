# 🔐 Hesla a systém rolí

Kompletní dokumentace k autentizaci s hesly a systému uživatelských rolí.

---

## 📋 Přehled

Aplikace nyní obsahuje **plnohodnotný autentizační systém** s:

- 🔒 **Hashovaná hesla** (bcrypt)
- 👥 **Systém rolí** (Admin, Manager, User)
- 🎨 **Moderní přihlašovací formulář**
- 🔐 **Bezpečné API**
- 🎭 **Vizuální indikace rolí**

---

## 👥 Systém rolí

### **Role a jejich oprávnění**

#### 🟣 **Admin** (Administrátor)
- ✅ Plný přístup ke všem funkcím
- ✅ Může spravovat všechny uživatele
- ✅ Může mazat jakékoli projekty a úkoly
- ✅ Může měnit role ostatních uživatelů
- 🎨 **Badge**: Fialový s ikonou koruny 👑

#### 🔵 **Manager** (Manažer)
- ✅ Může vytvářet a spravovat projekty
- ✅ Může přiřazovat úkoly
- ✅ Může vidět všechny projekty a úkoly
- ⚠️ Nemůže mazat uživatele
- 🎨 **Badge**: Modrý s ikonou nastavení ⚙️

#### ⚪ **User** (Běžný uživatel)
- ✅ Může vidět své úkoly
- ✅ Může měnit stav svých úkolů
- ✅ Může přidávat komentáře
- ⚠️ Nemůže vytvářet projekty
- ⚠️ Nemůže mazat úkoly
- 🎨 **Badge**: Šedý s ikonou uživatele 👤

---

## 🔒 Hashování hesel

### **Technologie**

Používáme **bcryptjs** pro bezpečné hashování hesel:

```javascript
import bcrypt from 'bcryptjs'

// Hashování při vytváření uživatele
const hashedPassword = bcrypt.hashSync('heslo123', 10)

// Ověření při přihlášení
const isValid = bcrypt.compareSync(password, user.password)
```

### **Bezpečnostní vlastnosti**

- ✅ **Salt rounds**: 10 (doporučená hodnota)
- ✅ **Jednosměrné hashování** - nelze zpětně dekódovat
- ✅ **Unikátní salt** pro každé heslo
- ✅ **Odolné proti rainbow table útokům**

---

## 🎨 Moderní design

### **Přihlašovací formulář**

```
┌────────────────────────────────────┐
│   🔒 Gradient header (modrá)       │
│                                    │
│         Přihlášení                 │
│   Zadejte své přihlašovací údaje   │
├────────────────────────────────────┤
│                                    │
│   📧 Email                         │
│   ┌──────────────────────────────┐ │
│   │ vas@email.cz                 │ │
│   └──────────────────────────────┘ │
│                                    │
│   🔒 Heslo                         │
│   ┌──────────────────────────────┐ │
│   │ ••••••••                     │ │
│   └──────────────────────────────┘ │
│                                    │
│   [🔒 Přihlásit se] (gradient)    │
│   [Zrušit]                         │
│                                    │
│   🔑 Demo přihlašovací údaje:     │
│   Admin: admin@taskmanager.cz     │
│   Manager: jan.novak@example.com  │
│   User: eva.svobodova@example.com │
│   Heslo pro všechny: heslo123     │
└────────────────────────────────────┘
```

### **Navigační lišta**

```
┌─────────────────────────────────────────────────────┐
│ ☑️ Task Manager | Dashboard | Projekty | Úkoly     │
│                                                     │
│                    👨‍💼 Admin                         │
│                    🟣 Admin Badge                   │
│                    [Odhlásit] (gradient)            │
└─────────────────────────────────────────────────────┘
```

### **Design prvky**

- 🎨 **Gradient pozadí**: `from-gray-50 via-blue-50 to-indigo-50`
- 🎨 **Gradient tlačítka**: `from-blue-600 to-indigo-600`
- 🎨 **Backdrop blur**: Průhledná navigace s rozmazáním
- 🎨 **Smooth transitions**: Plynulé animace
- 🎨 **Loading spinner**: Animovaný při přihlašování

---

## 📡 API Endpointy

### **POST /api/auth/login**

Přihlášení uživatele s ověřením hesla.

**Request:**
```json
{
  "email": "admin@taskmanager.cz",
  "password": "heslo123"
}
```

**Response (Success - 200):**
```json
{
  "id": 1,
  "name": "Admin",
  "email": "admin@taskmanager.cz",
  "role": "admin",
  "avatar": "👨‍💼",
  "created_at": "2024-01-21T10:00:00.000Z"
}
```

**Response (Error - 401):**
```json
{
  "error": "Neplatné přihlašovací údaje"
}
```

**Response (Error - 400):**
```json
{
  "error": "Email a heslo jsou povinné"
}
```

### **Bezpečnost**

- ❌ **Heslo se NIKDY neposílá** v response
- ✅ **Heslo se hashuje** před uložením do DB
- ✅ **Validace** emailu a hesla
- ✅ **Chybové zprávy** neodhalují, zda email existuje

---

## 💾 Databázové schéma

### **Tabulka users**

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,          -- 🆕 Hashované heslo
  role TEXT DEFAULT 'user',        -- 🆕 Role (admin/manager/user)
  avatar TEXT,                     -- 🆕 Emoji avatar
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **Ukázková data**

| ID | Name | Email | Role | Avatar | Password (hash) |
|----|------|-------|------|--------|-----------------|
| 1 | Admin | admin@taskmanager.cz | admin | 👨‍💼 | $2a$10$... |
| 2 | Jan Novák | jan.novak@example.com | manager | 👨‍💻 | $2a$10$... |
| 3 | Eva Svobodová | eva.svobodova@example.com | user | 👩‍💼 | $2a$10$... |
| 4 | Petr Dvořák | petr.dvorak@example.com | user | 👨‍🔧 | $2a$10$... |

**Všechna hesla**: `heslo123`

---

## 🎯 Použití

### **1. Přihlášení**

```javascript
// Frontend
const handleLogin = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  
  if (!response.ok) {
    throw new Error('Přihlášení selhalo')
  }
  
  const user = await response.json()
  localStorage.setItem('currentUser', JSON.stringify(user))
}
```

### **2. Zobrazení role**

```javascript
// RoleBadge komponenta
<RoleBadge role={user.role} />

// Výstup:
// Admin: 🟣 👑 Admin
// Manager: 🔵 ⚙️ Manager  
// User: ⚪ 👤 Uživatel
```

### **3. Kontrola oprávnění**

```javascript
// Kontrola, zda je uživatel admin
if (currentUser.role === 'admin') {
  // Zobrazit admin funkce
}

// Kontrola, zda je uživatel manager nebo admin
if (['admin', 'manager'].includes(currentUser.role)) {
  // Zobrazit manažerské funkce
}
```

---

## 🔐 Bezpečnostní best practices

### **✅ Co je implementováno**

1. **Hashování hesel** - bcrypt s 10 salt rounds
2. **Validace vstupu** - kontrola emailu a hesla
3. **Bezpečné chybové zprávy** - neodhalují citlivé informace
4. **localStorage** - ukládání session
5. **Neposílání hesel** - hesla se nikdy nevrací v API

### **⚠️ Co chybí pro produkci**

1. **JWT tokeny** - místo localStorage
2. **HTTPS** - šifrovaná komunikace
3. **Rate limiting** - ochrana proti brute force
4. **CSRF protection** - ochrana proti CSRF útokům
5. **Session timeout** - automatické odhlášení
6. **2FA** - dvoufaktorová autentizace
7. **Password reset** - obnovení hesla
8. **Email verification** - ověření emailu

---

## 🎨 UI Komponenty

### **LoginForm**

Moderní přihlašovací formulář s:
- Gradient header
- Ikony u inputů
- Loading state
- Error handling
- Demo credentials

### **RoleBadge**

Badge zobrazující roli uživatele:

```javascript
<RoleBadge role="admin" />
// Výstup: 🟣 👑 Admin

<RoleBadge role="manager" />
// Výstup: 🔵 ⚙️ Manager

<RoleBadge role="user" />
// Výstup: ⚪ 👤 Uživatel
```

### **User Avatar**

Emoji avatar v navigaci a seznamu uživatelů:

```javascript
<div className="text-2xl">{user.avatar || '👤'}</div>
```

---

## 🧪 Testování

### **Test přihlášení**

```bash
# Správné přihlášení
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@taskmanager.cz","password":"heslo123"}'

# Špatné heslo
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@taskmanager.cz","password":"spatne"}'

# Neexistující email
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"neexistuje@email.cz","password":"heslo123"}'
```

### **Manuální testy**

1. **Přihlášení jako Admin**
   - [ ] Email: admin@taskmanager.cz
   - [ ] Heslo: heslo123
   - [ ] Ověřit fialový badge s korunou

2. **Přihlášení jako Manager**
   - [ ] Email: jan.novak@example.com
   - [ ] Heslo: heslo123
   - [ ] Ověřit modrý badge

3. **Přihlášení jako User**
   - [ ] Email: eva.svobodova@example.com
   - [ ] Heslo: heslo123
   - [ ] Ověřit šedý badge

4. **Špatné heslo**
   - [ ] Zadat špatné heslo
   - [ ] Ověřit chybovou hlášku

5. **Persistence**
   - [ ] Přihlásit se
   - [ ] Obnovit stránku
   - [ ] Ověřit, že uživatel zůstal přihlášen

---

## 📚 Rozšíření

### **1. JWT Autentizace**

```javascript
// Backend
import jwt from 'jsonwebtoken'

const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
)

// Frontend
localStorage.setItem('token', token)
```

### **2. Middleware pro kontrolu rolí**

```javascript
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' })
    }
    next()
  }
}

// Použití
app.delete('/api/users/:id', requireRole(['admin']), (req, res) => {
  // Pouze admin může mazat uživatele
})
```

### **3. Password reset**

```javascript
// Generování reset tokenu
const resetToken = crypto.randomBytes(32).toString('hex')
const resetTokenHash = crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex')

// Uložení do DB s expirací
user.resetToken = resetTokenHash
user.resetTokenExpires = Date.now() + 3600000 // 1 hodina
```

---

## 📊 Statistiky

- **Počet rolí**: 3 (Admin, Manager, User)
- **Počet demo účtů**: 4
- **Hash algoritmus**: bcrypt
- **Salt rounds**: 10
- **Demo heslo**: heslo123
- **Délka hashe**: ~60 znaků

---

## 🎓 Pro začátečníky

### **Co je bcrypt?**

Bcrypt je algoritmus pro bezpečné hashování hesel. Převádí heslo na náhodný řetězec, který nelze zpětně dekódovat.

**Příklad:**
```
Heslo: heslo123
Hash: $2a$10$N9qo8uLOickgx2ZMRZoMye.IjefO3xjNn/9XKfqvxvEfU9qM1OAUK
```

### **Co je role?**

Role definuje, co uživatel může v aplikaci dělat. Například admin může mazat uživatele, ale běžný uživatel ne.

### **Co je localStorage?**

LocalStorage je úložiště v prohlížeči, kde můžeme ukládat data. Používáme ho pro uložení přihlášeného uživatele.

---

*Vytvořeno: 2024-10-21*
