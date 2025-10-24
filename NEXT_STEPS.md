# 🚀 Další kroky - Implementace frontendu

## 📋 Aktuální situace

Máme:
- ✅ Plně funkční backend (API běží na http://localhost:3001)
- ✅ Glassmorphism design system v CSS
- ✅ Kompletní dokumentaci
- ✅ Všechny číselníky a konstanty

Zbývá:
- ⏳ Implementovat React komponenty
- ⏳ Propojit s API
- ⏳ Přidat routing
- ⏳ Implementovat všechny stránky

---

## 🎯 Implementační plán (12-15 hodin)

### Fáze 1: Základní struktura (2-3 hodiny)

**Soubory k vytvoření:**
```
frontend/src/
├── App.jsx (nový - s routingem)
├── components/
│   ├── Layout.jsx (glassmorphism navigace)
│   ├── LoginForm.jsx (už máme, upravit design)
│   └── RoleBadge.jsx (už máme)
├── pages/
│   ├── Dashboard.jsx
│   ├── Properties.jsx
│   ├── PropertyDetail.jsx
│   ├── Demands.jsx
│   ├── Users.jsx
│   └── Companies.jsx
└── utils/
    ├── api.js (fetch funkce)
    └── helpers.js (formátování)
```

**Kroky:**
1. Nainstalovat React Router: `npm install react-router-dom`
2. Vytvořit Layout komponentu s glassmorphism navigací
3. Přidat routing do App.jsx
4. Vytvořit základní stránky (prázdné komponenty)

### Fáze 2: Dashboard (1-2 hodiny)

**Dashboard podle rolí:**
- Admin: Statistiky všeho
- Agent: Moje nemovitosti + statistiky
- Client: Moje poptávky + doporučené nabídky

**Komponenty:**
- StatCard.jsx (glass card se statistikou)
- Chart.jsx (graf s recharts)
- ActivityFeed.jsx (poslední aktivity)

### Fáze 3: Nabídky (3-4 hodiny)

**Properties stránka:**
- Filtry (typ, město, cena, plocha)
- Grid s kartami nemovitostí
- Pagination
- Oblíbené (❤️)

**PropertyDetail stránka:**
- Galerie fotek
- Parametry
- Mapa
- Kontakt na agenta
- Tlačítko "Mám zájem"

**PropertyForm (admin/agent):**
- Formulář pro přidání/editaci
- Našeptávač adres
- Upload fotek (mock)

### Fáze 4: Poptávky (2-3 hodiny)

**Demands stránka:**
- Seznam mých poptávek
- Tlačítko "Vytvořit poptávku"
- Matches (shody s nabídkami)

**DemandForm:**
- Formulář poptávky
- Multi-select měst
- Cenové rozpětí
- Požadované vlastnosti

**Matches:**
- Karta s % shodou
- Akce: Zobrazit, Mám zájem, Odmítnout

### Fáze 5: Admin (2-3 hodiny)

**Users stránka:**
- Tabulka uživatelů
- Filtry podle role
- CRUD operace

**UserDetail:**
- Všechny údaje
- Vazba na společnost
- Historie aktivit

**Companies stránka:**
- Seznam společností
- Detail společnosti
- CRUD operace

### Fáze 6: Pokročilé (2-3 hodiny)

**Našeptávače:**
- IČO autocomplete (ARES API)
- Adresa autocomplete

**Oblíbené:**
- Seznam oblíbených nemovitostí
- Přidat/odebrat z oblíbených

**Prohlídky:**
- Kalendář prohlídek
- Naplánovat prohlídku

---

## 💻 Jak začít

### 1. Nainstalovat závislosti

```bash
cd frontend
npm install react-router-dom recharts date-fns
```

### 2. Vytvořit strukturu složek

```bash
mkdir -p src/components src/pages src/utils
```

### 3. Spustit development server

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Začít s implementací

Doporučené pořadí:
1. Layout.jsx (navigace)
2. App.jsx (routing)
3. Dashboard.jsx
4. Properties.jsx
5. PropertyDetail.jsx
6. Demands.jsx
7. Users.jsx
8. Companies.jsx

---

## 📝 Příklad implementace

### Layout.jsx (glassmorphism navigace)

```jsx
import { Home, Building2, Search, Users, LogOut } from 'lucide-react'

export default function Layout({ children, currentUser, onLogout }) {
  return (
    <div className="min-h-screen">
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-gradient" />
              <h1 className="text-2xl font-bold text-gradient">
                Realitní Portál
              </h1>
            </div>
            
            {/* Menu */}
            <div className="flex items-center space-x-6">
              <a href="/dashboard" className="nav-link">
                <Home className="w-5 h-5" />
                Dashboard
              </a>
              <a href="/properties" className="nav-link">
                <Building2 className="w-5 h-5" />
                Nabídky
              </a>
              <a href="/demands" className="nav-link">
                <Search className="w-5 h-5" />
                Poptávky
              </a>
              {currentUser.role === 'admin' && (
                <a href="/users" className="nav-link">
                  <Users className="w-5 h-5" />
                  Uživatelé
                </a>
              )}
            </div>
            
            {/* User */}
            <div className="flex items-center space-x-4">
              <div className="glass-card py-2 px-4">
                <span>{currentUser.avatar}</span>
                <span className="ml-2">{currentUser.name}</span>
              </div>
              <button onClick={onLogout} className="glass-button">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
```

### Dashboard.jsx (základní)

```jsx
import { Building2, Search, Users, TrendingUp } from 'lucide-react'

export default function Dashboard({ stats }) {
  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Celkem nemovitostí</p>
              <p className="text-4xl font-bold text-gradient mt-2">
                {stats.properties.total}
              </p>
            </div>
            <Building2 className="w-12 h-12 text-purple-500" />
          </div>
        </div>
        
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Aktivní poptávky</p>
              <p className="text-4xl font-bold text-gradient mt-2">
                {stats.demands.total}
              </p>
            </div>
            <Search className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Uživatelé</p>
              <p className="text-4xl font-bold text-gradient mt-2">
                {stats.users.total}
              </p>
            </div>
            <Users className="w-12 h-12 text-green-500" />
          </div>
        </div>
        
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Nové matche</p>
              <p className="text-4xl font-bold text-gradient mt-2">
                {stats.matches.new}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-orange-500" />
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 🎨 Design guidelines

### Barvy
- Primární: `#667eea` (fialová)
- Sekundární: `#764ba2` (tmavší fialová)
- Success: `#10b981` (zelená)
- Danger: `#ef4444` (červená)

### Komponenty
- Vždy použít `.glass-card` pro karty
- Tlačítka: `.glass-button` nebo `.glass-button-secondary`
- Inputy: `.glass-input`
- Animace: `.fade-in`

### Spacing
- Gap mezi kartami: `24px`
- Padding v kartách: `24px`
- Margin mezi sekcemi: `32px`

---

## 🔧 Utility funkce

### api.js

```javascript
const API_URL = 'http://localhost:3001/api'

export async function fetchProperties(filters = {}) {
  const params = new URLSearchParams(filters)
  const response = await fetch(`${API_URL}/properties?${params}`)
  return response.json()
}

export async function fetchStats() {
  const response = await fetch(`${API_URL}/stats`)
  return response.json()
}

// ... další funkce
```

### helpers.js

```javascript
export function formatPrice(price) {
  return new Intl.NumberFormat('cs-CZ').format(price)
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('cs-CZ')
}
```

---

## ✅ Checklist

- [ ] Nainstalovat závislosti
- [ ] Vytvořit strukturu složek
- [ ] Implementovat Layout
- [ ] Přidat routing
- [ ] Vytvořit Dashboard
- [ ] Implementovat Properties
- [ ] Přidat PropertyDetail
- [ ] Vytvořit Demands
- [ ] Implementovat Users
- [ ] Přidat Companies
- [ ] Testovat všechny funkce
- [ ] Optimalizovat výkon
- [ ] Doladit design

---

## 📞 Potřebujete pomoct?

Máte kompletní dokumentaci:
- FRONTEND_MODERN_DESIGN.md - UI specifikace
- REALITNI_PROJEKT_PLAN.md - Celkový plán
- Backend API běží a je plně funkční

**Odhadovaný čas: 12-15 hodin práce**

Můžete začít implementovat postupně podle tohoto plánu! 🚀
