# 📝 Changelog

Všechny významné změny v projektu budou dokumentovány v tomto souboru.

## [1.0.0] - 2024-10-21

### ✨ Přidáno
- **Backend**
  - Express server s REST API
  - SQLite databáze s 4 tabulkami (users, projects, tasks, comments)
  - 20+ API endpointů
  - Automatická inicializace databáze
  - Ukázková data při prvním spuštění
  - CORS middleware

- **Frontend**
  - React 18 aplikace s Vite
  - TailwindCSS pro styling
  - Lucide React ikony
  - 4 hlavní stránky:
    - Dashboard s přehledem statistik
    - Projekty v grid layoutu
    - Úkoly v tabulce s možností změny stavu
    - Uživatelé v seznamu
  - Responzivní design
  - Interaktivní prvky (hover efekty, potvrzení mazání)

- **Databáze**
  - Tabulka users (uživatelé)
  - Tabulka projects (projekty)
  - Tabulka tasks (úkoly)
  - Tabulka comments (komentáře)
  - Kaskádové mazání
  - Foreign key constraints

- **Dokumentace**
  - README.md - hlavní dokumentace
  - INDEX.md - průvodce projektem
  - RYCHLY_START.md - rychlý start
  - SPUSTENI.md - detailní návod na spuštění
  - DATABASE_SCHEMA.md - schéma databáze s diagramem
  - API_EXAMPLES.md - příklady všech API volání
  - TIPY_PRO_ZACATECNIKY.md - vysvětlení pro začátečníky
  - UI_POPIS.md - popis uživatelského rozhraní
  - TESTOVACI_CHECKLIST.md - 100+ testovacích bodů
  - PREHLED_PROJEKTU.md - kompletní přehled
  - ROZSIRENI.md - možná rozšíření
  - CONTRIBUTING.md - pravidla pro přispívání
  - CHANGELOG.md - tento soubor

### 🎨 Design
- Moderní UI s TailwindCSS
- Barevné schéma: modrá, šedá, bílá
- Status badges (todo, in_progress, completed)
- Priority badges (low, medium, high)
- Responzivní grid layout
- Hover efekty na kartách a řádcích

### 🔧 Konfigurace
- Vite konfigurace s proxy
- TailwindCSS konfigurace
- PostCSS konfigurace
- ESLint ready
- .gitignore soubory

### 📦 Závislosti

**Backend:**
- express ^4.18.2
- cors ^2.8.5
- better-sqlite3 ^9.2.2

**Frontend:**
- react ^18.2.0
- react-dom ^18.2.0
- lucide-react ^0.294.0
- clsx ^2.0.0
- tailwind-merge ^2.1.0
- vite ^5.0.8
- tailwindcss ^3.3.6

---

## [Naplánováno] - Budoucí verze

### 🚀 Verze 1.1.0
- [ ] Formuláře pro vytváření projektů a úkolů
- [ ] Toast notifikace
- [ ] Vyhledávání v úkolech
- [ ] Pokročilé filtrování

### 🚀 Verze 1.2.0
- [ ] Autentizace uživatelů (JWT)
- [ ] Protected routes
- [ ] User sessions

### 🚀 Verze 1.3.0
- [ ] Kanban board s drag & drop
- [ ] Štítky pro úkoly
- [ ] Přílohy k úkolům

### 🚀 Verze 2.0.0
- [ ] Real-time aktualizace (WebSocket)
- [ ] Email notifikace
- [ ] Export dat (CSV, PDF)
- [ ] Grafy a statistiky
- [ ] Tmavý režim

---

## Formát

Tento changelog následuje [Keep a Changelog](https://keepachangelog.com/cs/1.0.0/) formát
a projekt používá [Semantic Versioning](https://semver.org/lang/cs/).

### Typy změn:
- **Přidáno** - nové funkce
- **Změněno** - změny v existující funkcionalitě
- **Zastaralé** - funkce, které budou brzy odstraněny
- **Odstraněno** - odstraněné funkce
- **Opraveno** - opravy chyb
- **Bezpečnost** - bezpečnostní opravy
