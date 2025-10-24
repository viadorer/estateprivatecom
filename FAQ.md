# ❓ Často kladené otázky (FAQ)

## 🚀 Spuštění a instalace

### Jak spustím aplikaci?
```bash
# Jednoduchý způsob
./scripts/start-dev.sh

# Nebo manuálně
cd backend && npm start  # Terminál 1
cd frontend && npm run dev  # Terminál 2
```

### Port 3000/3001 je obsazený, co mám dělat?
```bash
# Najděte proces
lsof -i :3000
lsof -i :3001

# Ukončete proces
kill -9 <PID>

# Nebo změňte port v konfiguraci
# Backend: backend/server.js (PORT = 3001)
# Frontend: frontend/vite.config.js (port: 3000)
```

### Jak nainstaluji závislosti?
```bash
./scripts/install-all.sh

# Nebo manuálně
npm install  # root
cd backend && npm install
cd frontend && npm install
```

---

## 🗄️ Databáze

### Kde je databáze uložená?
```
backend/tasks.db
```

### Jak resetuji databázi?
```bash
./scripts/reset-db.sh

# Nebo manuálně
rm backend/tasks.db
# Pak restartujte backend
```

### Jak vytvořím zálohu databáze?
```bash
./scripts/backup-db.sh

# Zálohy jsou v: backups/tasks_YYYYMMDD_HHMMSS.db
```

### Jak obnovím zálohu?
```bash
cp backups/tasks_20241021_153045.db backend/tasks.db
```

### Jak přidám nová ukázková data?
Upravte `backend/database.js` a přidejte nové `insertUser`, `insertProject`, nebo `insertTask` volání.

---

## 🔧 Backend

### Jak přidám nový API endpoint?
V `backend/server.js`:
```javascript
app.get('/api/muj-endpoint', (req, res) => {
  // Váš kód
  res.json({ message: 'Funguje!' });
});
```

### Jak změním strukturu databáze?
1. Upravte SQL v `backend/database.js`
2. Smažte `backend/tasks.db`
3. Restartujte backend

### Jak testuji API?
```bash
# cURL
curl http://localhost:3001/api/tasks

# Nebo použijte Postman, Thunder Client, atd.
```

### Backend vrací CORS chybu
Zkontrolujte `backend/server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:3000'
}));
```

---

## 🎨 Frontend

### Jak změním barvy?
V `frontend/src/App.jsx` nahraďte TailwindCSS třídy:
```javascript
// Modrá → Fialová
'bg-blue-500' → 'bg-purple-500'
'text-blue-600' → 'text-purple-600'
```

### Jak přidám novou stránku?
1. Vytvořte komponentu:
```javascript
function NovaStranka() {
  return <div>Nová stránka</div>
}
```

2. Přidejte záložku v navigaci
3. Přidejte do podmínky:
```javascript
{activeTab === 'nova' && <NovaStranka />}
```

### Jak přidám nový formulář?
Použijte controlled components:
```javascript
const [formData, setFormData] = useState({ title: '' });

const handleSubmit = async (e) => {
  e.preventDefault();
  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
};
```

### Změny se nezobrazují
- Zkuste obnovit stránku (Cmd+R / Ctrl+R)
- Zkontrolujte konzoli prohlížeče (F12)
- Restartujte Vite dev server

---

## 🐛 Chyby a problémy

### "Cannot GET /api/tasks"
- Backend neběží → Spusťte `cd backend && npm start`
- Špatný port → Zkontrolujte `vite.config.js` proxy

### "Failed to fetch"
- Backend neběží na portu 3001
- CORS není správně nakonfigurován
- Zkontrolujte Network tab v DevTools

### "SQLITE_ERROR: no such table"
- Databáze nebyla vytvořena
- Smažte `tasks.db` a restartujte backend

### Frontend se nenačte
- Zkontrolujte, zda běží Vite dev server
- Zkontrolujte port 3000
- Podívejte se do terminálu na chyby

### npm install selhává
```bash
# Smažte node_modules a zkuste znovu
rm -rf node_modules package-lock.json
npm install

# Zkuste npm cache clean
npm cache clean --force
```

---

## 📱 Funkce aplikace

### Jak změním stav úkolu?
Klikněte na dropdown v tabulce úkolů a vyberte nový stav.

### Jak smažu projekt/úkol?
Klikněte na ikonu koše. Zobrazí se potvrzovací dialog.

### Jak vytvořím nový úkol?
Momentálně pouze přes API. Formuláře budou přidány v budoucí verzi.

### Jak filtruji úkoly?
Použijte API parametry:
```bash
/api/tasks?status=todo
/api/tasks?priority=high
/api/tasks?project_id=1
```

---

## 🚀 Deployment

### Jak nasadím do produkce?
Viz [DEPLOYMENT.md](DEPLOYMENT.md) pro detailní návod.

### Jaké jsou možnosti hostingu?
- **Vercel** (frontend) + **Railway** (backend)
- **Heroku** (full-stack)
- **DigitalOcean / VPS**
- **Docker**

### Potřebuji databázový server?
Ne, SQLite je file-based databáze. Pro produkci ale doporučujeme PostgreSQL.

---

## 🔒 Bezpečnost

### Je aplikace bezpečná?
Základní verze nemá autentizaci. Pro produkci přidejte:
- JWT autentizaci
- HTTPS
- Rate limiting
- Input validaci

### Jak přidám autentizaci?
Viz [ROZSIRENI.md](ROZSIRENI.md) sekce "Autentizace uživatelů".

---

## 📚 Rozšíření

### Jak přidám novou funkci?
1. Přečtěte si [ROZSIRENI.md](ROZSIRENI.md)
2. Naplánujte implementaci
3. Začněte s backendem (databáze + API)
4. Pokračujte frontendem (UI)

### Kde najdu inspiraci?
- [ROZSIRENI.md](ROZSIRENI.md) - 20+ nápadů
- GitHub - podobné projekty
- Dribbble - UI inspirace

---

## 💡 Tipy a triky

### Rychlé testování API
```bash
# Alias v .zshrc
alias api-test="curl http://localhost:3001/api"

# Použití
api-test/tasks
api-test/projects
```

### Automatické spuštění při startu
```bash
# macOS - LaunchAgent
# Linux - systemd service
# Windows - Task Scheduler
```

### Vývojářské nástroje
- **React DevTools** - Chrome extension
- **Thunder Client** - VS Code extension pro API
- **DB Browser for SQLite** - GUI pro databázi

---

## 📞 Kde hledat pomoc?

### Dokumentace projektu
- [README.md](README.md) - Hlavní dokumentace
- [INDEX.md](INDEX.md) - Průvodce projektem
- [TIPY_PRO_ZACATECNIKY.md](TIPY_PRO_ZACATECNIKY.md) - Pro začátečníky

### Externí zdroje
- **React**: https://react.dev
- **Express**: https://expressjs.com
- **TailwindCSS**: https://tailwindcss.com
- **Stack Overflow**: https://stackoverflow.com

### Komunita
- GitHub Issues - pro bugy a feature requesty
- GitHub Discussions - pro otázky

---

## 🎓 Učení

### Jsem začátečník, kde začít?
1. [RYCHLY_START.md](RYCHLY_START.md) - Spusťte aplikaci
2. [TIPY_PRO_ZACATECNIKY.md](TIPY_PRO_ZACATECNIKY.md) - Pochopte základy
3. Experimentujte s kódem

### Chci se naučit React
- https://react.dev/learn - Oficiální tutoriál
- https://reactjs.org/tutorial/tutorial.html - Tic-Tac-Toe

### Chci se naučit Node.js
- https://nodejs.dev/learn - Oficiální guide
- https://expressjs.com/en/starter/installing.html - Express

---

## 📊 Statistiky projektu

### Kolik má projekt řádků kódu?
- Backend: ~400 řádků
- Frontend: ~500 řádků
- Dokumentace: ~2000 řádků

### Jaké technologie používá?
- React 18
- Node.js + Express
- SQLite
- TailwindCSS
- Vite

---

**Nenašli jste odpověď? Vytvořte issue na GitHubu!** 🚀
