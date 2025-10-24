# 📋 Task Manager - Full-Stack React Application

> Kompletní full-stack aplikace pro správu úkolů a projektů vytvořená s React, Node.js, Express a SQLite.

![React](https://img.shields.io/badge/React-18.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey)
![SQLite](https://img.shields.io/badge/SQLite-3-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38B2AC)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Funkce

- ✅ **Dashboard** s přehledem statistik a aktivních úkolů
- ✅ **Správa projektů** - vytváření, zobrazení, mazání
- ✅ **Správa úkolů** - CRUD operace, změna stavu, filtrování
- ✅ **Správa uživatelů** - seznam a detail uživatelů
- ✅ **REST API** - kompletní backend API s 20+ endpointy
- ✅ **Responzivní design** - funguje na všech zařízeních
- ✅ **Moderní UI** - TailwindCSS + Lucide ikony

## 🚀 Rychlý start

```bash
# 1. Klonování projektu
git clone https://github.com/vase-jmeno/task-manager.git
cd task-manager

# 2. Instalace závislostí
./scripts/install-all.sh

# 3. Spuštění aplikace
./scripts/start-dev.sh
```

Otevřete prohlížeč na `http://localhost:3000`

## 📸 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Projekty
![Projekty](screenshots/projects.png)

### Úkoly
![Úkoly](screenshots/tasks.png)

## 🏗️ Architektura

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Frontend   │  HTTP   │   Backend   │  SQL    │  Database   │
│  (React)    │◄───────►│  (Express)  │◄───────►│  (SQLite)   │
│  :3000      │         │   :3001     │         │  tasks.db   │
└─────────────┘         └─────────────┘         └─────────────┘
```

## 🛠️ Technologie

### Frontend
- **React 18** - UI knihovna
- **Vite** - Build tool
- **TailwindCSS** - CSS framework
- **Lucide React** - Ikony

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **better-sqlite3** - SQLite databáze
- **CORS** - Cross-origin middleware

## 📁 Struktura projektu

```
task-manager/
├── backend/          # Express server + API
├── frontend/         # React aplikace
├── scripts/          # Utility skripty
└── docs/            # Dokumentace (17 souborů)
```

## 📚 Dokumentace

- **[README.md](README.md)** - Hlavní dokumentace
- **[RYCHLY_START.md](RYCHLY_START.md)** - Rychlý start
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Schéma databáze
- **[API_EXAMPLES.md](API_EXAMPLES.md)** - API příklady
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guide
- **[FAQ.md](FAQ.md)** - Často kladené otázky

[Zobrazit všechnu dokumentaci →](INDEX.md)

## 🗄️ Databázové schéma

```
users ──┬──→ projects ──→ tasks ──→ comments
        │
        └──→ tasks
```

4 tabulky: `users`, `projects`, `tasks`, `comments`

[Detailní schéma →](DATABASE_SCHEMA.md)

## 📡 API Endpointy

### Projekty
```
GET    /api/projects     - Seznam projektů
POST   /api/projects     - Vytvoření projektu
PUT    /api/projects/:id - Aktualizace projektu
DELETE /api/projects/:id - Smazání projektu
```

### Úkoly
```
GET    /api/tasks        - Seznam úkolů
POST   /api/tasks        - Vytvoření úkolu
PUT    /api/tasks/:id    - Aktualizace úkolu
DELETE /api/tasks/:id    - Smazání úkolu
```

[Všechny endpointy + příklady →](API_EXAMPLES.md)

## 🎨 UI Komponenty

- **Dashboard** - Statistiky a přehled
- **Projects** - Grid view projektů
- **Tasks** - Tabulka úkolů s filtry
- **Users** - Seznam uživatelů
- **StatCard** - Statistická karta
- **StatusBadge** - Badge pro stav
- **PriorityBadge** - Badge pro prioritu

## 🚀 Deployment

### Podporované platformy
- **Vercel** (frontend) + **Railway** (backend)
- **Heroku** (full-stack)
- **DigitalOcean / VPS**
- **Docker**

[Deployment guide →](DEPLOYMENT.md)

## 🔧 Utility skripty

```bash
./scripts/start-dev.sh      # Spustí aplikaci
./scripts/install-all.sh    # Nainstaluje závislosti
./scripts/backup-db.sh      # Zálohuje databázi
./scripts/reset-db.sh       # Resetuje databázi
./scripts/check-health.sh   # Zkontroluje zdraví
```

## 🎯 Možná rozšíření

- 📝 Formuláře pro vytváření/editaci
- 🔐 JWT autentizace
- 🔍 Fulltextové vyhledávání
- 🎨 Kanban board s drag & drop
- 🔔 Toast notifikace
- 📊 Grafy a statistiky
- 🌙 Tmavý režim
- 📎 Přílohy k úkolům
- 🏷️ Štítky pro kategorizaci

[20+ dalších nápadů →](ROZSIRENI.md)

## 🤝 Přispívání

Příspěvky jsou vítány! Prosím přečtěte si [CONTRIBUTING.md](CONTRIBUTING.md).

### Jak přispět
1. Forkněte projekt
2. Vytvořte feature branch (`git checkout -b feature/nova-funkce`)
3. Commitněte změny (`git commit -m 'feat: Přidání nové funkce'`)
4. Pushněte do branch (`git push origin feature/nova-funkce`)
5. Otevřete Pull Request

## 📝 Changelog

Všechny změny jsou dokumentovány v [CHANGELOG.md](CHANGELOG.md).

## 📄 Licence

Tento projekt je licencován pod MIT licencí - viz [LICENSE](LICENSE) soubor.

## 🎓 Pro začátečníky

Tento projekt je ideální pro učení full-stack vývoje!

- 📚 Kompletní dokumentace
- 💡 Vysvětlení základních pojmů
- 🧪 Testovací checklist
- 🎯 Praktické příklady

[Začněte zde →](TIPY_PRO_ZACATECNIKY.md)

## 📊 Statistiky

- **Řádky kódu**: ~4000
- **Dokumentace**: 17 souborů
- **API endpointy**: 20+
- **React komponenty**: 8
- **Databázové tabulky**: 4

## 🌟 Star History

Pokud se vám projekt líbí, dejte mu hvězdičku! ⭐

## 🔗 Užitečné odkazy

- [React dokumentace](https://react.dev)
- [Express dokumentace](https://expressjs.com)
- [TailwindCSS dokumentace](https://tailwindcss.com)
- [SQLite dokumentace](https://www.sqlite.org)

## 📞 Podpora

- 🐛 **Bugy**: [GitHub Issues](https://github.com/vase-jmeno/task-manager/issues)
- 💬 **Diskuze**: [GitHub Discussions](https://github.com/vase-jmeno/task-manager/discussions)
- 📧 **Email**: your-email@example.com

## 👥 Autoři

- **Váš název** - *Initial work* - [GitHub](https://github.com/vase-jmeno)

## 🙏 Poděkování

- React team za skvělou knihovnu
- Express team za jednoduchý framework
- TailwindCSS za utility-first CSS
- Všem přispěvatelům

---

**Vytvořeno s ❤️ pro výuku full-stack vývoje**

[⬆ Zpět nahoru](#-task-manager---full-stack-react-application)
