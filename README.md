# Task Manager - React + Node.js + SQLite

Kompletní full-stack aplikace pro správu úkolů a projektů.

## 🏗️ Architektura

- **Frontend**: React 18 + Vite + TailwindCSS + Lucide Icons
- **Backend**: Node.js + Express
- **Databáze**: SQLite (better-sqlite3)

## 📊 Databázové schéma

### Tabulky

#### `users` - Uživatelé
- `id` - primární klíč
- `name` - jméno uživatele
- `email` - email (unikátní)
- `created_at` - datum vytvoření

#### `projects` - Projekty
- `id` - primární klíč
- `name` - název projektu
- `description` - popis
- `user_id` - vlastník projektu (FK -> users)
- `status` - stav (active/archived)
- `created_at` - datum vytvoření

#### `tasks` - Úkoly
- `id` - primární klíč
- `title` - název úkolu
- `description` - popis
- `status` - stav (todo/in_progress/completed)
- `priority` - priorita (low/medium/high)
- `project_id` - projekt (FK -> projects)
- `user_id` - přiřazený uživatel (FK -> users)
- `due_date` - termín splnění
- `created_at` - datum vytvoření
- `updated_at` - datum poslední aktualizace

#### `comments` - Komentáře
- `id` - primární klíč
- `content` - obsah komentáře
- `task_id` - úkol (FK -> tasks)
- `user_id` - autor (FK -> users)
- `created_at` - datum vytvoření

## 🚀 Instalace a spuštění

### 1. Instalace závislostí

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Spuštění aplikace

**Terminál 1 - Backend:**
```bash
cd backend
npm start
```
Server poběží na `http://localhost:3001`

**Terminál 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Aplikace poběží na `http://localhost:3000`

### 3. Otevřete prohlížeč

Přejděte na `http://localhost:3000`

## 📡 API Endpointy

### Uživatelé
- `GET /api/users` - seznam všech uživatelů
- `GET /api/users/:id` - detail uživatele
- `POST /api/users` - vytvoření uživatele

### Projekty
- `GET /api/projects` - seznam všech projektů
- `GET /api/projects/:id` - detail projektu
- `POST /api/projects` - vytvoření projektu
- `PUT /api/projects/:id` - aktualizace projektu
- `DELETE /api/projects/:id` - smazání projektu

### Úkoly
- `GET /api/tasks` - seznam všech úkolů (filtry: project_id, status, priority)
- `GET /api/tasks/:id` - detail úkolu
- `POST /api/tasks` - vytvoření úkolu
- `PUT /api/tasks/:id` - aktualizace úkolu
- `DELETE /api/tasks/:id` - smazání úkolu

### Komentáře
- `GET /api/tasks/:taskId/comments` - komentáře k úkolu
- `POST /api/tasks/:taskId/comments` - přidání komentáře

### Statistiky
- `GET /api/stats` - celkové statistiky

## 🎨 Funkce aplikace

- ✅ Dashboard s přehledem statistik
- ✅ Správa projektů
- ✅ Správa úkolů s filtry
- ✅ Změna stavu úkolů
- ✅ Prioritizace úkolů
- ✅ Správa uživatelů
- ✅ Moderní a responzivní UI
- ✅ Automatická inicializace databáze s ukázkovými daty

## 📁 Struktura projektu

```
reactrealprojekt/
├── backend/
│   ├── package.json
│   ├── server.js          # Express server + API routes
│   ├── database.js        # SQLite databáze + schéma
│   └── tasks.db          # SQLite databázový soubor (vytvoří se automaticky)
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx       # Hlavní komponenta
│       └── index.css
└── README.md
```

## 🛠️ Technologie

### Frontend
- **React 18** - UI knihovna
- **Vite** - build tool
- **TailwindCSS** - styling
- **Lucide React** - ikony

### Backend
- **Express** - web framework
- **better-sqlite3** - SQLite databáze
- **cors** - CORS middleware

## 💡 Tipy pro rozšíření

1. **Autentizace** - přidat JWT tokeny pro přihlášení
2. **Validace** - přidat validaci vstupů (např. Zod)
3. **Formuláře** - přidat modály pro vytváření/editaci
4. **Notifikace** - přidat toast notifikace
5. **Drag & Drop** - Kanban board pro úkoly
6. **Real-time** - WebSocket pro live updates
7. **Export** - export dat do CSV/PDF

## 📝 Poznámky

- Databáze se vytvoří automaticky při prvním spuštění
- Ukázková data se naplní automaticky
- Pro produkci doporučuji použít PostgreSQL místo SQLite
- Frontend používá Vite proxy pro API volání

## 🐛 Řešení problémů

**Backend se nespustí:**
- Zkontrolujte, zda máte nainstalovaný Node.js (verze 18+)
- Zkontrolujte, zda port 3001 není obsazený

**Frontend se nespustí:**
- Zkontrolujte, zda port 3000 není obsazený
- Smažte `node_modules` a spusťte `npm install` znovu

**Databáze se nevytvoří:**
- Zkontrolujte oprávnění k zápisu v adresáři `backend/`
- Smažte `tasks.db` a restartujte backend
