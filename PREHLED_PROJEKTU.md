# 📋 Přehled projektu - Task Manager

## ✅ Co je hotové

Vytvořil jsem kompletní full-stack aplikaci pro správu úkolů a projektů.

## 🎯 Hlavní funkce

✅ **Dashboard** - přehled statistik a aktivních úkolů  
✅ **Správa projektů** - vytváření, zobrazení, mazání projektů  
✅ **Správa úkolů** - vytváření, editace, změna stavu, mazání úkolů  
✅ **Správa uživatelů** - seznam uživatelů  
✅ **Filtrování** - úkoly podle projektu, stavu, priority  
✅ **REST API** - kompletní backend API  
✅ **Databáze** - SQLite s automatickou inicializací  
✅ **Moderní UI** - responzivní design s TailwindCSS  

## 📁 Struktura projektu

```
reactrealprojekt/
│
├── backend/                    # Backend server
│   ├── package.json           # Závislosti backendu
│   ├── server.js              # Express server + API routes
│   ├── database.js            # SQLite databáze + schéma
│   └── tasks.db              # Databázový soubor (vytvoří se automaticky)
│
├── frontend/                   # Frontend aplikace
│   ├── package.json           # Závislosti frontendu
│   ├── vite.config.js         # Konfigurace Vite
│   ├── tailwind.config.js     # Konfigurace TailwindCSS
│   ├── postcss.config.js      # Konfigurace PostCSS
│   ├── index.html             # HTML šablona
│   └── src/
│       ├── main.jsx           # Vstupní bod aplikace
│       ├── App.jsx            # Hlavní komponenta
│       └── index.css          # Globální styly
│
└── Dokumentace/
    ├── README.md              # Hlavní dokumentace
    ├── SPUSTENI.md            # Návod na spuštění
    ├── DATABASE_SCHEMA.md     # Schéma databáze
    ├── API_EXAMPLES.md        # Příklady API volání
    ├── TIPY_PRO_ZACATECNIKY.md # Tipy pro začátečníky
    └── PREHLED_PROJEKTU.md    # Tento soubor
```

## 🗄️ Databázové schéma

### Tabulky:
1. **users** - uživatelé systému
2. **projects** - projekty
3. **tasks** - úkoly přiřazené k projektům
4. **comments** - komentáře k úkolům

### Vztahy:
- Uživatel → Projekty (1:N)
- Uživatel → Úkoly (1:N)
- Projekt → Úkoly (1:N)
- Úkol → Komentáře (1:N)

Detailní schéma viz `DATABASE_SCHEMA.md`

## 🚀 Jak spustit

### Rychlý start:

**Terminál 1 - Backend:**
```bash
cd backend
npm start
```

**Terminál 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Prohlížeč:**
```
http://localhost:3000
```

Detailní návod viz `SPUSTENI.md`

## 📡 API Endpointy

### Uživatelé
- `GET /api/users` - seznam uživatelů
- `GET /api/users/:id` - detail uživatele
- `POST /api/users` - vytvoření uživatele

### Projekty
- `GET /api/projects` - seznam projektů
- `GET /api/projects/:id` - detail projektu
- `POST /api/projects` - vytvoření projektu
- `PUT /api/projects/:id` - aktualizace projektu
- `DELETE /api/projects/:id` - smazání projektu

### Úkoly
- `GET /api/tasks` - seznam úkolů (s filtry)
- `GET /api/tasks/:id` - detail úkolu
- `POST /api/tasks` - vytvoření úkolu
- `PUT /api/tasks/:id` - aktualizace úkolu
- `DELETE /api/tasks/:id` - smazání úkolu

### Komentáře
- `GET /api/tasks/:taskId/comments` - komentáře k úkolu
- `POST /api/tasks/:taskId/comments` - přidání komentáře

### Statistiky
- `GET /api/stats` - celkové statistiky

Příklady použití viz `API_EXAMPLES.md`

## 🛠️ Použité technologie

### Backend
- **Node.js** - runtime prostředí
- **Express** - web framework
- **better-sqlite3** - SQLite databáze
- **cors** - CORS middleware

### Frontend
- **React 18** - UI knihovna
- **Vite** - build tool a dev server
- **TailwindCSS** - utility-first CSS framework
- **Lucide React** - ikony
- **clsx** - utility pro podmíněné třídy

## 📊 Ukázková data

Databáze obsahuje předvyplněná data:

**Uživatelé:**
- Jan Novák (jan.novak@example.com)
- Eva Svobodová (eva.svobodova@example.com)

**Projekty:**
- Webová aplikace
- Marketing kampaň

**Úkoly:**
- Navrhnout databázi (dokončeno)
- Implementovat backend (probíhá)
- Vytvořit frontend (k provedení)
- Napsat obsah (k provedení)

## 🎨 UI Komponenty

### Stránky:
1. **Dashboard** - přehled statistik a aktivních úkolů
2. **Projekty** - grid view všech projektů
3. **Úkoly** - tabulka všech úkolů s možností změny stavu
4. **Uživatelé** - seznam všech uživatelů

### Komponenty:
- `StatCard` - karta se statistikou
- `StatusBadge` - barevný badge pro stav úkolu
- `PriorityBadge` - barevný badge pro prioritu

## 💡 Možná rozšíření

1. **Formuláře** - modály pro vytváření/editaci
2. **Autentizace** - přihlášení uživatelů
3. **Vyhledávání** - fulltextové vyhledávání
4. **Filtry** - pokročilé filtrování a řazení
5. **Drag & Drop** - Kanban board
6. **Notifikace** - toast notifikace
7. **Real-time** - WebSocket pro live updates
8. **Export** - export dat do CSV/PDF
9. **Přílohy** - nahrávání souborů k úkolům
10. **Štítky** - tagy pro kategorizaci úkolů

## 📚 Dokumentace

- **README.md** - hlavní dokumentace projektu
- **SPUSTENI.md** - podrobný návod na spuštění
- **DATABASE_SCHEMA.md** - detailní popis databáze
- **API_EXAMPLES.md** - příklady API volání
- **TIPY_PRO_ZACATECNIKY.md** - vysvětlení pro začátečníky

## 🐛 Řešení problémů

### Backend se nespustí
```bash
# Zkontrolujte port
lsof -i :3001
# Reinstalujte závislosti
cd backend
rm -rf node_modules
npm install
```

### Frontend se nespustí
```bash
# Zkontrolujte port
lsof -i :3000
# Reinstalujte závislosti
cd frontend
rm -rf node_modules
npm install
```

### Databáze se nevytvoří
```bash
# Smažte databázi a restartujte backend
rm backend/tasks.db
cd backend
npm start
```

## 📝 Poznámky

- Projekt je připraven k okamžitému použití
- Všechny závislosti jsou nainstalovány
- Databáze se vytvoří automaticky při prvním spuštění
- Backend běží na portu 3001
- Frontend běží na portu 3000
- Frontend používá Vite proxy pro API volání

## 🎓 Pro začátečníky

Pokud jste začátečník, začněte s těmito soubory:

1. **TIPY_PRO_ZACATECNIKY.md** - základní vysvětlení
2. **SPUSTENI.md** - jak spustit projekt
3. **API_EXAMPLES.md** - jak používat API
4. **frontend/src/App.jsx** - prohlédněte si kód frontendu
5. **backend/server.js** - prohlédněte si kód backendu

## ✨ Závěr

Máte plně funkční Task Manager aplikaci s:
- ✅ Moderním React frontendem
- ✅ Robustním Express backendem
- ✅ SQLite databází
- ✅ REST API
- ✅ Responzivním UI
- ✅ Kompletní dokumentací

Aplikace je připravena k použití a dalšímu rozšíření!
