# 👋 Vítejte v Task Manager projektu!

## 🎯 Začněte zde

Tento soubor vás provede prvními kroky s projektem.

---

## ⚡ Rychlý start (2 minuty)

### 1. Spusťte aplikaci

Otevřete **2 terminály** a spusťte:

**Terminál 1:**
```bash
cd backend
npm start
```

**Terminál 2:**
```bash
cd frontend
npm run dev
```

### 2. Otevřete prohlížeč

```
http://localhost:3000
```

### 3. Hotovo! 🎉

Aplikace běží a můžete začít pracovat.

---

## 📚 Co dál?

### Jsem začátečník
1. 📖 [TIPY_PRO_ZACATECNIKY.md](TIPY_PRO_ZACATECNIKY.md) - Vysvětlení základů
2. 🎨 [UI_POPIS.md](UI_POPIS.md) - Jak vypadá aplikace
3. ❓ [FAQ.md](FAQ.md) - Časté otázky

### Jsem pokročilý
1. 📋 [INDEX.md](INDEX.md) - Přehled všech dokumentů
2. 🗄️ [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Struktura databáze
3. 📡 [API_EXAMPLES.md](API_EXAMPLES.md) - API příklady
4. 🚀 [ROZSIRENI.md](ROZSIRENI.md) - Nápady na rozšíření

### Chci nasadit do produkce
1. 🚀 [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide

---

## 🛠️ Užitečné příkazy

### Spuštění
```bash
./scripts/start-dev.sh          # Spustí celou aplikaci
```

### Údržba
```bash
./scripts/backup-db.sh          # Zálohuje databázi
./scripts/reset-db.sh           # Resetuje databázi
./scripts/check-health.sh       # Zkontroluje zdraví
```

### Instalace
```bash
./scripts/install-all.sh        # Nainstaluje vše
```

---

## 📁 Struktura projektu

```
reactrealprojekt/
│
├── 📄 Dokumentace (18 souborů)
│   ├── START_HERE.md ⭐ (tento soubor)
│   ├── README.md
│   ├── INDEX.md
│   └── ... další dokumenty
│
├── 🔧 Backend (Node.js + Express + SQLite)
│   ├── server.js
│   ├── database.js
│   └── tasks.db
│
├── 🎨 Frontend (React + Vite + TailwindCSS)
│   └── src/
│       ├── App.jsx
│       └── main.jsx
│
└── 🛠️ Scripts (utility skripty)
    ├── start-dev.sh
    ├── backup-db.sh
    └── ...
```

---

## 🎯 Co aplikace umí?

✅ **Dashboard** - Přehled statistik  
✅ **Projekty** - Správa projektů  
✅ **Úkoly** - Správa úkolů s možností změny stavu  
✅ **Uživatelé** - Seznam uživatelů  
✅ **REST API** - 20+ endpointů  
✅ **Responzivní design** - Funguje na všech zařízeních  

---

## ❓ Časté otázky

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

### Chci začít znovu
```bash
./scripts/reset-db.sh
```

---

## 📖 Kompletní dokumentace

### Základní
- **[README.md](README.md)** - Hlavní dokumentace
- **[RYCHLY_START.md](RYCHLY_START.md)** - Rychlý start
- **[SPUSTENI.md](SPUSTENI.md)** - Detailní návod

### Pro začátečníky
- **[TIPY_PRO_ZACATECNIKY.md](TIPY_PRO_ZACATECNIKY.md)** - Vysvětlení
- **[FAQ.md](FAQ.md)** - Časté otázky

### Technická
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Databáze
- **[API_EXAMPLES.md](API_EXAMPLES.md)** - API
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment

### Rozšíření
- **[ROZSIRENI.md](ROZSIRENI.md)** - 20+ nápadů
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Jak přispět

### Přehled
- **[INDEX.md](INDEX.md)** - Průvodce dokumentací
- **[PREHLED_PROJEKTU.md](PREHLED_PROJEKTU.md)** - Kompletní přehled
- **[FINAL_SUMMARY.md](FINAL_SUMMARY.md)** - Finální shrnutí

---

## 🎓 Doporučené pořadí

### Den 1 - Spuštění
1. ⚡ Spusťte aplikaci (viz výše)
2. 🎨 Prohlédněte si UI
3. 📖 Přečtěte [TIPY_PRO_ZACATECNIKY.md](TIPY_PRO_ZACATECNIKY.md)

### Den 2 - Pochopení
1. 🗄️ Prostudujte [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
2. 📡 Vyzkoušejte [API_EXAMPLES.md](API_EXAMPLES.md)
3. 💡 Přečtěte [FAQ.md](FAQ.md)

### Den 3 - Rozšíření
1. 🚀 Vyberte si nápad z [ROZSIRENI.md](ROZSIRENI.md)
2. 🔧 Začněte implementovat
3. 🧪 Otestujte pomocí [TESTOVACI_CHECKLIST.md](TESTOVACI_CHECKLIST.md)

---

## 💡 Tipy

### Alias pro rychlý start
Přidejte do `.zshrc` nebo `.bashrc`:
```bash
alias taskman="cd ~/path/to/project && ./scripts/start-dev.sh"
```

Pak stačí napsat:
```bash
taskman
```

### Automatická záloha
Nastavte cron job:
```bash
crontab -e
```

Přidejte:
```
0 2 * * * cd ~/path/to/project && ./scripts/backup-db.sh
```

---

## 🎯 Cíle projektu

### Naučit se
- ✅ React 18
- ✅ Node.js + Express
- ✅ SQLite databáze
- ✅ REST API
- ✅ TailwindCSS
- ✅ Full-stack architekturu

### Vytvořit
- ✅ Funkční aplikaci
- ✅ Moderní UI
- ✅ Robustní backend
- ✅ Kompletní dokumentaci

---

## 🚀 Další kroky

1. **Prozkoumejte kód**
   - `backend/server.js` - API endpointy
   - `frontend/src/App.jsx` - React komponenty
   - `backend/database.js` - Databázové schéma

2. **Vyzkoušejte API**
   ```bash
   curl http://localhost:3001/api/stats
   ```

3. **Upravte UI**
   - Změňte barvy v `App.jsx`
   - Přidejte novou komponentu

4. **Rozšiřte funkcionalitu**
   - Přidejte formulář pro vytváření úkolů
   - Implementujte vyhledávání
   - Přidejte notifikace

---

## 📞 Potřebujete pomoc?

1. 📖 Zkontrolujte [FAQ.md](FAQ.md)
2. 📚 Přečtěte si [INDEX.md](INDEX.md)
3. 🔍 Prohledejte dokumentaci
4. 💬 Vytvořte GitHub Issue

---

## ✨ Užijte si projekt!

Máte před sebou kompletní full-stack aplikaci připravenou k:
- 📚 Učení
- 🔧 Rozšiřování
- 🚀 Nasazení do produkce

**Hodně štěstí a bavte se!** 🎉

---

**[⬆ Zpět nahoru](#-vítejte-v-task-manager-projektu)**

*Pro kompletní přehled viz [INDEX.md](INDEX.md)*
