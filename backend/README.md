# Backend - Task Manager API

## 🚀 Spuštění

```bash
npm install
npm start
```

Server poběží na `http://localhost:3001`

## 📡 API Endpointy

### Users
- `GET /api/users` - Seznam všech uživatelů
- `GET /api/users/:id` - Detail uživatele
- `POST /api/users` - Vytvoření uživatele

### Projects
- `GET /api/projects` - Seznam všech projektů
- `GET /api/projects/:id` - Detail projektu
- `POST /api/projects` - Vytvoření projektu
- `PUT /api/projects/:id` - Aktualizace projektu
- `DELETE /api/projects/:id` - Smazání projektu

### Tasks
- `GET /api/tasks` - Seznam všech úkolů
- `GET /api/tasks/:id` - Detail úkolu
- `POST /api/tasks` - Vytvoření úkolu
- `PUT /api/tasks/:id` - Aktualizace úkolu
- `DELETE /api/tasks/:id` - Smazání úkolu

### Comments
- `GET /api/tasks/:taskId/comments` - Komentáře k úkolu
- `POST /api/tasks/:taskId/comments` - Přidání komentáře

### Stats
- `GET /api/stats` - Celkové statistiky

## 🗄️ Databáze

SQLite databáze se vytvoří automaticky v `tasks.db`

### Tabulky:
- **users** - Uživatelé
- **projects** - Projekty
- **tasks** - Úkoly
- **comments** - Komentáře

## 📝 Příklad použití

```bash
# Získat všechny úkoly
curl http://localhost:3001/api/tasks

# Vytvořit nový úkol
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nový úkol",
    "description": "Popis",
    "status": "todo",
    "priority": "high",
    "project_id": 1,
    "user_id": 1
  }'
```

## 🔧 Konfigurace

### Změna portu
V `server.js` změňte:
```javascript
const PORT = 3001; // Změňte na požadovaný port
```

### Reset databáze
```bash
rm tasks.db
npm start
```
