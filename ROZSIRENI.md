# 🚀 Možná rozšíření projektu

## 1. Formuláře pro vytváření a editaci

### Přidat modální okna
- Formulář pro vytvoření projektu
- Formulář pro vytvoření úkolu
- Formulář pro editaci úkolu
- Formulář pro vytvoření uživatele

**Implementace:**
```javascript
// Přidat state pro modal
const [showModal, setShowModal] = useState(false)
const [modalType, setModalType] = useState(null)

// Komponenta modalu
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        {children}
      </div>
    </div>
  )
}
```

## 2. Autentizace uživatelů

### Přihlášení a registrace
- JWT tokeny
- Bcrypt pro hashování hesel
- Protected routes
- Session management

**Backend:**
```bash
npm install jsonwebtoken bcrypt
```

**Nové endpointy:**
- `POST /api/auth/register` - Registrace
- `POST /api/auth/login` - Přihlášení
- `POST /api/auth/logout` - Odhlášení
- `GET /api/auth/me` - Aktuální uživatel

## 3. Vyhledávání a filtrování

### Fulltextové vyhledávání
- Vyhledávání v názvech úkolů
- Vyhledávání v popisech
- Filtrování podle více kritérií

**Implementace:**
```javascript
const [searchQuery, setSearchQuery] = useState('')

const filteredTasks = tasks.filter(task =>
  task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  task.description.toLowerCase().includes(searchQuery.toLowerCase())
)
```

## 4. Drag & Drop - Kanban board

### Přetahování úkolů
- Knihovna: react-beautiful-dnd nebo dnd-kit
- Sloupce: Todo, In Progress, Done
- Přetažení = změna stavu

**Instalace:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

## 5. Notifikace

### Toast notifikace
- Úspěšné akce (zelená)
- Chyby (červená)
- Informace (modrá)

**Knihovna:**
```bash
npm install react-hot-toast
```

**Použití:**
```javascript
import toast from 'react-hot-toast'

toast.success('Úkol byl vytvořen!')
toast.error('Chyba při mazání projektu')
```

## 6. Real-time aktualizace

### WebSocket
- Socket.io pro real-time komunikaci
- Live updates při změnách
- Notifikace o změnách od jiných uživatelů

**Backend:**
```bash
npm install socket.io
```

**Frontend:**
```bash
npm install socket.io-client
```

## 7. Export dat

### Export do různých formátů
- CSV export
- PDF export
- Excel export

**Knihovny:**
```bash
npm install papaparse jspdf xlsx
```

## 8. Přílohy k úkolům

### Nahrávání souborů
- Multer pro upload
- Ukládání do složky nebo cloud (AWS S3)
- Zobrazení příloh u úkolu

**Backend:**
```bash
npm install multer
```

**Nová tabulka:**
```sql
CREATE TABLE attachments (
  id INTEGER PRIMARY KEY,
  filename TEXT,
  path TEXT,
  task_id INTEGER,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
)
```

## 9. Štítky (Tags)

### Kategorizace úkolů
- Many-to-Many vztah
- Barevné štítky
- Filtrování podle štítků

**Nové tabulky:**
```sql
CREATE TABLE tags (
  id INTEGER PRIMARY KEY,
  name TEXT,
  color TEXT
);

CREATE TABLE task_tags (
  task_id INTEGER,
  tag_id INTEGER,
  PRIMARY KEY (task_id, tag_id)
);
```

## 10. Časové sledování

### Time tracking
- Start/Stop timer
- Celkový čas na úkolu
- Reporty času

**Nová tabulka:**
```sql
CREATE TABLE time_entries (
  id INTEGER PRIMARY KEY,
  task_id INTEGER,
  user_id INTEGER,
  start_time DATETIME,
  end_time DATETIME,
  duration INTEGER
);
```

## 11. Komentáře a diskuze

### Rozšíření komentářů
- Odpovědi na komentáře (threading)
- Mentions (@uživatel)
- Markdown podpora

## 12. Notifikace emailem

### Email notifikace
- Nodemailer pro odesílání emailů
- Notifikace o přiřazení úkolu
- Připomínky termínů

**Backend:**
```bash
npm install nodemailer
```

## 13. Kalendářní pohled

### Kalendář s úkoly
- React Calendar nebo FullCalendar
- Zobrazení úkolů podle termínu
- Drag & drop v kalendáři

**Instalace:**
```bash
npm install react-calendar
```

## 14. Grafy a statistiky

### Vizualizace dat
- Chart.js nebo Recharts
- Graf dokončených úkolů
- Produktivita v čase

**Instalace:**
```bash
npm install recharts
```

## 15. Tmavý režim

### Dark mode
- Toggle pro přepínání
- Uložení preference do localStorage
- TailwindCSS dark: prefix

**Implementace:**
```javascript
const [darkMode, setDarkMode] = useState(false)

useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, [darkMode])
```

**TailwindCSS config:**
```javascript
module.exports = {
  darkMode: 'class',
  // ...
}
```

## 16. Mobilní aplikace

### React Native
- Sdílený kód s webem
- Native aplikace pro iOS/Android

## 17. Offline režim

### PWA (Progressive Web App)
- Service Workers
- Offline funkčnost
- Synchronizace při připojení

## 18. Týmy a oprávnění

### Multi-tenant systém
- Týmy/organizace
- Role (admin, member, viewer)
- Oprávnění na projekty

**Nové tabulky:**
```sql
CREATE TABLE teams (
  id INTEGER PRIMARY KEY,
  name TEXT
);

CREATE TABLE team_members (
  team_id INTEGER,
  user_id INTEGER,
  role TEXT
);
```

## 19. Šablony úkolů

### Opakující se úkoly
- Šablony pro časté úkoly
- Vytvoření úkolu ze šablony
- Opakující se úkoly (denně, týdně)

## 20. Integrace s externími službami

### API integrace
- GitHub issues
- Slack notifikace
- Google Calendar
- Trello import

## 🎯 Doporučené pořadí implementace

### Fáze 1 - Základní UX
1. Formuláře pro vytváření/editaci
2. Notifikace (toast)
3. Vyhledávání a filtrování

### Fáze 2 - Pokročilé funkce
4. Autentizace
5. Štítky
6. Přílohy

### Fáze 3 - Vizualizace
7. Kanban board
8. Grafy a statistiky
9. Kalendářní pohled

### Fáze 4 - Rozšířené funkce
10. Real-time aktualizace
11. Email notifikace
12. Export dat

### Fáze 5 - Enterprise
13. Týmy a oprávnění
14. Časové sledování
15. Offline režim

## 📚 Užitečné knihovny

### UI Komponenty
- **shadcn/ui** - Moderní komponenty
- **Headless UI** - Unstyled komponenty
- **Radix UI** - Primitives

### Formuláře
- **React Hook Form** - Správa formulářů
- **Zod** - Validace schémat

### State Management
- **Zustand** - Lehký state management
- **React Query** - Data fetching

### Styling
- **clsx** - Podmíněné třídy
- **tailwind-merge** - Merge TailwindCSS tříd

### Utility
- **date-fns** - Práce s datumy
- **lodash** - Utility funkce

## 💡 Tipy pro implementaci

1. **Začněte malé** - Implementujte jednu funkci najednou
2. **Testujte průběžně** - Každou novou funkci otestujte
3. **Dokumentujte** - Aktualizujte dokumentaci
4. **Verzujte** - Používejte Git pro verzování
5. **Optimalizujte** - Sledujte výkon aplikace

## 🔗 Další zdroje

- **React dokumentace**: https://react.dev
- **TailwindCSS komponenty**: https://tailwindui.com
- **Node.js best practices**: https://github.com/goldbergyoni/nodebestpractices
- **SQLite optimalizace**: https://www.sqlite.org/optoverview.html
