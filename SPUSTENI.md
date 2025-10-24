# 🚀 Jak spustit projekt

## Rychlý start

### 1. Otevřete 2 terminály

**Terminál 1 - Backend:**
```bash
cd backend
npm start
```

Měli byste vidět:
```
✅ Databáze inicializována
🚀 Server běží na http://localhost:3001
```

**Terminál 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Měli byste vidět:
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:3000/
```

### 2. Otevřete prohlížeč

Přejděte na: **http://localhost:3000**

## Co aplikace umí?

✅ **Dashboard** - přehled statistik a aktivních úkolů  
✅ **Projekty** - správa projektů  
✅ **Úkoly** - správa úkolů s možností změny stavu  
✅ **Uživatelé** - seznam uživatelů  

## Databáze

- Databáze se vytvoří automaticky v `backend/tasks.db`
- Obsahuje ukázková data (2 uživatelé, 2 projekty, 4 úkoly)
- Pokud chcete začít znovu, smažte soubor `backend/tasks.db` a restartujte backend

## Testování API

Můžete testovat API přímo:

```bash
# Statistiky
curl http://localhost:3001/api/stats

# Seznam projektů
curl http://localhost:3001/api/projects

# Seznam úkolů
curl http://localhost:3001/api/tasks

# Seznam uživatelů
curl http://localhost:3001/api/users
```

## Struktura databáze

### Tabulky:
- **users** - uživatelé systému
- **projects** - projekty
- **tasks** - úkoly přiřazené k projektům
- **comments** - komentáře k úkolům

### Vztahy:
- Projekt patří uživateli
- Úkol patří projektu a je přiřazen uživateli
- Komentář patří úkolu a uživateli

## Tipy

1. **Změna portu backendu**: Upravte `PORT` v `backend/server.js`
2. **Změna portu frontendu**: Upravte `server.port` v `frontend/vite.config.js`
3. **Přidání dat**: Použijte API endpointy nebo upravte `backend/database.js`

## Problémy?

**Port už je používán:**
```bash
# Najděte proces na portu 3001
lsof -i :3001
# Ukončete proces
kill -9 <PID>
```

**Databáze se nevytvoří:**
- Zkontrolujte oprávnění k zápisu
- Smažte `backend/tasks.db` a zkuste znovu

**Frontend se nepřipojí k backendu:**
- Zkontrolujte, že backend běží na portu 3001
- Zkontrolujte konzoli prohlížeče pro chyby
