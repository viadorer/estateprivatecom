# 🔐 Systém přihlášení

Dokumentace k systému přihlášení uživatelů v Task Manager aplikaci.

---

## 📋 Přehled

Aplikace nyní obsahuje **jednoduchý systém přihlášení**, který umožňuje uživatelům přihlásit se a pracovat s aplikací pod svým účtem.

### Klíčové vlastnosti

- ✅ **Výběr uživatele** - Přihlášení výběrem z existujících uživatelů
- ✅ **Persistentní session** - Přihlášení se ukládá do localStorage
- ✅ **Ochrana obsahu** - Nepřihlášení uživatelé vidí pouze přihlašovací obrazovku
- ✅ **Zobrazení aktuálního uživatele** - V navigaci je vidět jméno přihlášeného uživatele
- ✅ **Odhlášení** - Možnost se kdykoli odhlásit

---

## 🎯 Jak to funguje

### 1. **Přihlášení**

Když uživatel není přihlášen:
- Vidí uvítací obrazovku s tlačítkem "Přihlásit se"
- Po kliknutí se otevře modal s výběrem uživatelů
- Uživatel vybere svůj účet kliknutím

```javascript
const handleLogin = (user) => {
  setCurrentUser(user)
  localStorage.setItem('currentUser', JSON.stringify(user))
  setShowLoginModal(false)
}
```

### 2. **Ukládání session**

Přihlášení se ukládá do **localStorage**:
- Klíč: `currentUser`
- Hodnota: JSON objekt s údaji uživatele

```javascript
// Při načtení aplikace
const savedUser = localStorage.getItem('currentUser')
if (savedUser) {
  setCurrentUser(JSON.parse(savedUser))
}
```

### 3. **Odhlášení**

Uživatel se může odhlásit kliknutím na tlačítko "Odhlásit":
- Vymaže se `currentUser` ze state
- Vymaže se `currentUser` z localStorage
- Uživatel je přesměrován na přihlašovací obrazovku

```javascript
const handleLogout = () => {
  setCurrentUser(null)
  localStorage.removeItem('currentUser')
}
```

---

## 🎨 UI komponenty

### **Navigační lišta**

#### Nepřihlášený uživatel
```
┌─────────────────────────────────────────┐
│ Task Manager          [Přihlásit se]    │
└─────────────────────────────────────────┘
```

#### Přihlášený uživatel
```
┌──────────────────────────────────────────────────────┐
│ Task Manager | Dashboard | Projekty | Úkoly | Uživatelé │
│                           👤 Jan Novák [Odhlásit]    │
└──────────────────────────────────────────────────────┘
```

### **Přihlašovací modal**

```
┌─────────────────────────────────┐
│ Vyberte uživatele               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Jan Novák                   │ │
│ │ jan.novak@example.com       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Marie Svobodová             │ │
│ │ marie.svobodova@example.com │ │
│ └─────────────────────────────┘ │
│                                 │
│           [Zrušit]              │
└─────────────────────────────────┘
```

### **Uvítací obrazovka**

```
┌─────────────────────────────────┐
│                                 │
│            👤                   │
│                                 │
│   Vítejte v Task Manageru       │
│                                 │
│ Pro pokračování se prosím       │
│      přihlaste                  │
│                                 │
│      [Přihlásit se]             │
│                                 │
└─────────────────────────────────┘
```

---

## 💻 Implementace

### **State management**

```javascript
const [currentUser, setCurrentUser] = useState(null)
const [showLoginModal, setShowLoginModal] = useState(false)
```

### **Podmíněné zobrazení**

```javascript
// Navigace - zobrazit pouze pro přihlášené
{currentUser && (
  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
    {/* Navigační tlačítka */}
  </div>
)}

// Obsah - zobrazit pouze pro přihlášené
{!currentUser ? (
  <WelcomeScreen />
) : (
  <MainContent />
)}
```

### **localStorage API**

```javascript
// Uložit
localStorage.setItem('currentUser', JSON.stringify(user))

// Načíst
const savedUser = localStorage.getItem('currentUser')
const user = savedUser ? JSON.parse(savedUser) : null

// Smazat
localStorage.removeItem('currentUser')
```

---

## 🔒 Bezpečnost

### **Aktuální implementace**

⚠️ **Důležité**: Toto je **zjednodušená implementace** pro výukové účely!

- ❌ Žádné heslo
- ❌ Žádné šifrování
- ❌ Žádná validace na serveru
- ❌ Žádná ochrana proti XSS

### **Pro produkční použití**

Pro reálnou aplikaci byste měli implementovat:

1. **Autentizace s heslem**
   ```javascript
   POST /api/auth/login
   {
     "email": "jan.novak@example.com",
     "password": "heslo123"
   }
   ```

2. **JWT tokeny**
   ```javascript
   // Server vrátí token
   const token = response.data.token
   localStorage.setItem('authToken', token)
   
   // Přidat do každého requestu
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

3. **Refresh tokeny**
   - Access token (krátká platnost)
   - Refresh token (dlouhá platnost)

4. **HTTPS**
   - Vždy používat HTTPS v produkci

5. **Bezpečnostní knihovny**
   - `bcrypt` pro hashování hesel
   - `jsonwebtoken` pro JWT
   - `helmet` pro HTTP hlavičky

---

## 🎓 Rozšíření

### **1. Přidání hesel**

```javascript
// Backend - hash hesla
import bcrypt from 'bcrypt'

const hashedPassword = await bcrypt.hash(password, 10)

// Ověření
const isValid = await bcrypt.compare(password, user.password)
```

### **2. JWT autentizace**

```javascript
// Backend - generování tokenu
import jwt from 'jsonwebtoken'

const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
)
```

### **3. Middleware pro ochranu routes**

```javascript
// Backend
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' })
    req.user = user
    next()
  })
}

// Použití
app.get('/api/projects', authenticateToken, (req, res) => {
  // ...
})
```

### **4. Registrace nových uživatelů**

```javascript
// Formulář pro registraci
<form onSubmit={handleRegister}>
  <input name="name" placeholder="Jméno" />
  <input name="email" type="email" placeholder="Email" />
  <input name="password" type="password" placeholder="Heslo" />
  <button type="submit">Registrovat</button>
</form>
```

### **5. Reset hesla**

- Email s reset linkem
- Dočasný token
- Formulář pro nové heslo

---

## 📊 Datový tok

```
┌─────────────┐
│  Uživatel   │
└──────┬──────┘
       │
       │ 1. Klikne "Přihlásit se"
       ▼
┌─────────────┐
│   Modal     │
└──────┬──────┘
       │
       │ 2. Vybere uživatele
       ▼
┌─────────────┐
│  handleLogin│
└──────┬──────┘
       │
       │ 3. Uloží do state + localStorage
       ▼
┌─────────────┐
│ currentUser │
└──────┬──────┘
       │
       │ 4. Zobrazí aplikaci
       ▼
┌─────────────┐
│ Main Content│
└─────────────┘
```

---

## 🧪 Testování

### **Manuální testy**

1. **Přihlášení**
   - [ ] Otevřít aplikaci
   - [ ] Kliknout "Přihlásit se"
   - [ ] Vybrat uživatele
   - [ ] Ověřit, že se zobrazí navigace a obsah

2. **Persistence**
   - [ ] Přihlásit se
   - [ ] Obnovit stránku (F5)
   - [ ] Ověřit, že uživatel zůstal přihlášen

3. **Odhlášení**
   - [ ] Přihlásit se
   - [ ] Kliknout "Odhlásit"
   - [ ] Ověřit, že se zobrazí přihlašovací obrazovka

4. **localStorage**
   - [ ] Otevřít DevTools → Application → Local Storage
   - [ ] Ověřit přítomnost klíče `currentUser`
   - [ ] Smazat klíč a obnovit stránku
   - [ ] Ověřit, že uživatel není přihlášen

---

## 🐛 Řešení problémů

### **Uživatel se neukládá**

```javascript
// Zkontrolovat localStorage
console.log(localStorage.getItem('currentUser'))

// Zkontrolovat state
console.log(currentUser)
```

### **Uživatel zůstává přihlášen po odhlášení**

```javascript
// Vymazat localStorage manuálně
localStorage.clear()

// Nebo jen currentUser
localStorage.removeItem('currentUser')
```

### **Modal se nezobrazuje**

```javascript
// Zkontrolovat state
console.log(showLoginModal)

// Zkontrolovat z-index
className="... z-50"
```

---

## 📚 Související dokumentace

- **FAQ.md** - Časté otázky
- **ROZSIRENI.md** - Nápady na rozšíření
- **API_EXAMPLES.md** - API příklady

---

## ✅ Checklist funkcí

- ✅ Modal pro výběr uživatele
- ✅ Ukládání do localStorage
- ✅ Načítání při startu aplikace
- ✅ Zobrazení jména v navigaci
- ✅ Tlačítko pro odhlášení
- ✅ Ochrana obsahu (pouze pro přihlášené)
- ✅ Uvítací obrazovka
- ✅ Responzivní design

---

*Vytvořeno: 2024-10-21*
