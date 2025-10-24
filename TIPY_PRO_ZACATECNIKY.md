# 💡 Tipy pro začátečníky

## Co je co v projektu?

### Backend (server)
- **Složka**: `backend/`
- **Co dělá**: Zpracovává požadavky, pracuje s databází
- **Technologie**: Node.js + Express
- **Port**: 3001

### Frontend (klient)
- **Složka**: `frontend/`
- **Co dělá**: Zobrazuje uživatelské rozhraní v prohlížeči
- **Technologie**: React + Vite
- **Port**: 3000

### Databáze
- **Soubor**: `backend/tasks.db`
- **Co dělá**: Ukládá všechna data (uživatele, projekty, úkoly)
- **Technologie**: SQLite

## Jak to funguje dohromady?

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Prohlížeč  │  HTTP   │   Backend   │  SQL    │  Databáze   │
│  (React)    │◄───────►│  (Express)  │◄───────►│  (SQLite)   │
│  :3000      │         │   :3001     │         │  tasks.db   │
└─────────────┘         └─────────────┘         └─────────────┘
```

1. **Uživatel** otevře prohlížeč na `http://localhost:3000`
2. **React** zobrazí uživatelské rozhraní
3. **React** pošle požadavek na backend (např. "dej mi seznam úkolů")
4. **Backend** zpracuje požadavek a zeptá se databáze
5. **Databáze** vrátí data
6. **Backend** pošle data zpět Reactu
7. **React** zobrazí data uživateli

## Důležité soubory

### Backend

**`backend/package.json`**
- Seznam závislostí (knihoven), které backend potřebuje
- Příkazy pro spuštění (`npm start`)

**`backend/database.js`**
- Vytváří databázi a tabulky
- Definuje strukturu dat
- Vkládá ukázková data

**`backend/server.js`**
- Hlavní soubor backendu
- Definuje API endpointy (cesty jako `/api/tasks`)
- Zpracovává požadavky (GET, POST, PUT, DELETE)

### Frontend

**`frontend/package.json`**
- Seznam závislostí pro frontend
- Příkazy pro spuštění (`npm run dev`)

**`frontend/src/App.jsx`**
- Hlavní komponenta aplikace
- Obsahuje celé uživatelské rozhraní
- Komunikuje s backendem pomocí `fetch()`

**`frontend/src/index.css`**
- Styly aplikace (TailwindCSS)

**`frontend/vite.config.js`**
- Konfigurace Vite (build tool)
- Nastavení proxy pro API

## Základní pojmy

### API (Application Programming Interface)
- Způsob, jak spolu komunikují frontend a backend
- V našem případě REST API s HTTP požadavky

### REST API
- Architektura pro API
- Používá HTTP metody:
  - **GET** - získat data (např. seznam úkolů)
  - **POST** - vytvořit nová data (např. nový úkol)
  - **PUT** - aktualizovat data (např. změnit stav úkolu)
  - **DELETE** - smazat data (např. smazat úkol)

### Endpoint
- Konkrétní cesta v API
- Příklad: `/api/tasks` - endpoint pro práci s úkoly

### JSON (JavaScript Object Notation)
- Formát pro výměnu dat mezi frontendem a backendem
- Vypadá jako JavaScript objekt:
```json
{
  "id": 1,
  "title": "Můj úkol",
  "status": "todo"
}
```

### Komponenta (React)
- Znovupoužitelný kus UI
- V našem projektu: `Dashboard`, `Projects`, `Tasks`, `Users`

### State (Stav)
- Data, která se mění v průběhu času
- V Reactu pomocí `useState()`
- Příklad: seznam úkolů, aktivní záložka

### Props
- Parametry předávané do komponenty
- Příklad: `<StatCard title="Celkem úkolů" value={10} />`

## Jak upravit projekt?

### Přidat nové pole do úkolu

1. **Databáze** (`backend/database.js`):
```javascript
CREATE TABLE tasks (
  ...
  estimated_hours INTEGER,  // Přidáme nové pole
  ...
)
```

2. **Backend** (`backend/server.js`):
```javascript
// V POST /api/tasks
const { title, description, ..., estimated_hours } = req.body;
```

3. **Frontend** (`frontend/src/App.jsx`):
```javascript
// Zobrazit nové pole
<div>{task.estimated_hours} hodin</div>
```

### Změnit barvy

Upravte TailwindCSS třídy v `frontend/src/App.jsx`:
- `bg-blue-500` → `bg-purple-500` (fialová)
- `text-gray-900` → `text-blue-900` (modrý text)

### Přidat novou stránku

1. Vytvořte novou komponentu:
```javascript
function NewPage() {
  return (
    <div>
      <h2>Nová stránka</h2>
    </div>
  )
}
```

2. Přidejte záložku v navigaci:
```javascript
<button onClick={() => setActiveTab('newpage')}>
  Nová stránka
</button>
```

3. Zobrazte komponentu:
```javascript
{activeTab === 'newpage' && <NewPage />}
```

## Časté chyby a řešení

### "Cannot GET /api/tasks"
- **Problém**: Backend neběží
- **Řešení**: Spusťte `npm start` v `backend/`

### "Failed to fetch"
- **Problém**: Frontend se nemůže připojit k backendu
- **Řešení**: Zkontrolujte, že backend běží na portu 3001

### "Port 3000 is already in use"
- **Problém**: Port je obsazený
- **Řešení**: 
  ```bash
  lsof -i :3000
  kill -9 <PID>
  ```

### Změny se nezobrazují
- **Frontend**: Zkuste obnovit stránku (Cmd+R)
- **Backend**: Restartujte server (Ctrl+C a pak `npm start`)

## Užitečné příkazy

### Zobrazit běžící procesy na portu
```bash
lsof -i :3000
lsof -i :3001
```

### Zastavit server
- Stiskněte `Ctrl+C` v terminálu

### Vyčistit databázi
```bash
rm backend/tasks.db
# Pak restartujte backend - vytvoří se nová databáze
```

### Reinstalovat závislosti
```bash
rm -rf node_modules
npm install
```

## Další kroky

1. **Naučte se React**:
   - Oficiální tutoriál: https://react.dev/learn
   - Komponenty, props, state, hooks

2. **Naučte se Express**:
   - Oficiální dokumentace: https://expressjs.com
   - Routing, middleware, error handling

3. **Naučte se SQL**:
   - SQLite tutoriál: https://www.sqlitetutorial.net
   - SELECT, INSERT, UPDATE, DELETE, JOIN

4. **Přidejte funkce**:
   - Formuláře pro vytváření úkolů
   - Vyhledávání a filtrování
   - Drag & Drop pro úkoly
   - Autentizace uživatelů

## Doporučené nástroje

- **VS Code** - editor kódu
- **Postman** - testování API
- **DB Browser for SQLite** - prohlížení databáze
- **React Developer Tools** - Chrome extension
- **Thunder Client** - VS Code extension pro API

## Kde hledat pomoc?

- **React dokumentace**: https://react.dev
- **Express dokumentace**: https://expressjs.com
- **MDN Web Docs**: https://developer.mozilla.org
- **Stack Overflow**: https://stackoverflow.com
- **GitHub Issues**: Pokud najdete bug v projektu
