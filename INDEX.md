# 📖 Index - Průvodce projektem

## 🚀 Začínáme

### Pro úplné začátečníky
1. **[RYCHLY_START.md](RYCHLY_START.md)** - Spusťte aplikaci ve 3 krocích
2. **[TIPY_PRO_ZACATECNIKY.md](TIPY_PRO_ZACATECNIKY.md)** - Vysvětlení základních pojmů
3. **[UI_POPIS.md](UI_POPIS.md)** - Jak vypadá uživatelské rozhraní

### Pro pokročilé
1. **[README.md](README.md)** - Hlavní dokumentace projektu
2. **[PREHLED_PROJEKTU.md](PREHLED_PROJEKTU.md)** - Kompletní přehled
3. **[SPUSTENI.md](SPUSTENI.md)** - Detailní návod na spuštění

---

## 📚 Dokumentace

### Základní
- **[README.md](README.md)** - Hlavní dokumentace
  - Architektura projektu
  - Instalace a spuštění
  - API endpointy
  - Funkce aplikace

- **[RYCHLY_START.md](RYCHLY_START.md)** - Rychlý start
  - 3 kroky ke spuštění
  - Základní řešení problémů

- **[SPUSTENI.md](SPUSTENI.md)** - Návod na spuštění
  - Detailní instrukce
  - Testování API
  - Tipy a triky

### Technická
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Databázové schéma
  - Vizuální diagram
  - Detailní popis tabulek
  - Vztahy mezi tabulkami
  - SQL dotazy

- **[API_EXAMPLES.md](API_EXAMPLES.md)** - Příklady API
  - Všechny endpointy
  - cURL příklady
  - JavaScript příklady
  - Možné hodnoty

### Pro začátečníky
- **[TIPY_PRO_ZACATECNIKY.md](TIPY_PRO_ZACATECNIKY.md)** - Tipy
  - Co je co v projektu
  - Jak to funguje
  - Základní pojmy
  - Jak upravit projekt
  - Časté chyby

### UI/UX
- **[UI_POPIS.md](UI_POPIS.md)** - Popis rozhraní
  - Navigace
  - Všechny stránky
  - Barevné schéma
  - Responzivita
  - Ikony a typography

- **[PRIHLASENI.md](PRIHLASENI.md)** - 🆕 Systém přihlášení
  - Jak funguje přihlášení
  - localStorage persistence
  - UI komponenty
  - Bezpečnostní poznámky
  - Rozšíření na produkční použití

### Testování
- **[TESTOVACI_CHECKLIST.md](TESTOVACI_CHECKLIST.md)** - Checklist
  - Spuštění
  - Základní funkčnost
  - API testování
  - UI/UX testování
  - Performance

### Přehled
- **[PREHLED_PROJEKTU.md](PREHLED_PROJEKTU.md)** - Přehled
  - Co je hotové
  - Hlavní funkce
  - Struktura projektu
  - Technologie
  - Možná rozšíření

---

## 🗂️ Struktura souborů

```
reactrealprojekt/
│
├── 📄 Dokumentace
│   ├── INDEX.md                    # Tento soubor
│   ├── README.md                   # Hlavní dokumentace
│   ├── RYCHLY_START.md             # Rychlý start
│   ├── SPUSTENI.md                 # Návod na spuštění
│   ├── PREHLED_PROJEKTU.md         # Přehled projektu
│   ├── DATABASE_SCHEMA.md          # Databázové schéma
│   ├── API_EXAMPLES.md             # Příklady API
│   ├── TIPY_PRO_ZACATECNIKY.md     # Tipy pro začátečníky
│   ├── UI_POPIS.md                 # Popis UI
│   └── TESTOVACI_CHECKLIST.md      # Testovací checklist
│
├── 🔧 Backend
│   ├── package.json                # Závislosti
│   ├── server.js                   # Express server
│   ├── database.js                 # SQLite databáze
│   └── tasks.db                    # Databázový soubor
│
└── 🎨 Frontend
    ├── package.json                # Závislosti
    ├── vite.config.js              # Vite konfigurace
    ├── tailwind.config.js          # TailwindCSS
    ├── postcss.config.js           # PostCSS
    ├── index.html                  # HTML šablona
    └── src/
        ├── main.jsx                # Vstupní bod
        ├── App.jsx                 # Hlavní komponenta
        └── index.css               # Globální styly
```

---

## 🎯 Podle účelu

### Chci spustit aplikaci
→ **[RYCHLY_START.md](RYCHLY_START.md)**

### Chci pochopit, jak to funguje
→ **[TIPY_PRO_ZACATECNIKY.md](TIPY_PRO_ZACATECNIKY.md)**

### Chci upravit databázi
→ **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)**

### Chci použít API
→ **[API_EXAMPLES.md](./API_EXAMPLES.md)**

### Chci změnit vzhled
→ **[UI_POPIS.md](./UI_POPIS.md)**

### Chci otestovat aplikaci
→ **[TESTOVACI_CHECKLIST.md](TESTOVACI_CHECKLIST.md)**

### Chci kompletní přehled
→ **[PREHLED_PROJEKTU.md](PREHLED_PROJEKTU.md)**

---

## 🔍 Podle role

### Jsem začátečník
1. [RYCHLY_START.md](RYCHLY_START.md) - Spusťte aplikaci
2. [TIPY_PRO_ZACATECNIKY.md](TIPY_PRO_ZACATECNIKY.md) - Pochopte základy
3. [UI_POPIS.md](UI_POPIS.md) - Prohlédněte si UI

### Jsem vývojář
1. [README.md](README.md) - Přečtěte si dokumentaci
2. [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Prostudujte databázi
3. [API_EXAMPLES.md](API_EXAMPLES.md) - Vyzkoušejte API

### Jsem tester
1. [TESTOVACI_CHECKLIST.md](TESTOVACI_CHECKLIST.md) - Otestujte aplikaci
2. [API_EXAMPLES.md](API_EXAMPLES.md) - Otestujte API
3. [UI_POPIS.md](UI_POPIS.md) - Zkontrolujte UI

### Jsem designer
1. [UI_POPIS.md](UI_POPIS.md) - Prohlédněte si design
2. [TIPY_PRO_ZACATECNIKY.md](TIPY_PRO_ZACATECNIKY.md) - Jak změnit vzhled

---

## 📊 Statistiky projektu

### Soubory
- **Dokumentace**: 10 souborů
- **Backend**: 3 soubory (.js)
- **Frontend**: 5 souborů (.jsx, .js, .css, .html)
- **Konfigurace**: 5 souborů (.json, .config.js)

### Řádky kódu (přibližně)
- **Backend**: ~400 řádků
- **Frontend**: ~500 řádků
- **Dokumentace**: ~2000 řádků

### Funkce
- **API endpointy**: 20+
- **React komponenty**: 8
- **Databázové tabulky**: 4

---

## 🎓 Doporučené pořadí čtení

### Pro začátečníky
1. **[RYCHLY_START.md](RYCHLY_START.md)** - Spusťte aplikaci
2. **[TIPY_PRO_ZACATECNIKY.md](TIPY_PRO_ZACATECNIKY.md)** - Pochopte základy
3. **[UI_POPIS.md](UI_POPIS.md)** - Prohlédněte si UI
4. **[API_EXAMPLES.md](API_EXAMPLES.md)** - Vyzkoušejte API
5. **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Prostudujte databázi

### Pro pokročilé
1. **[README.md](README.md)** - Přečtěte si dokumentaci
2. **[PREHLED_PROJEKTU.md](PREHLED_PROJEKTU.md)** - Získejte přehled
3. **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Prostudujte databázi
4. **[API_EXAMPLES.md](API_EXAMPLES.md)** - Vyzkoušejte API
5. **[TESTOVACI_CHECKLIST.md](TESTOVACI_CHECKLIST.md)** - Otestujte

---

## 🔗 Užitečné odkazy

### Dokumentace technologií
- **React**: https://react.dev
- **Express**: https://expressjs.com
- **Vite**: https://vitejs.dev
- **TailwindCSS**: https://tailwindcss.com
- **SQLite**: https://www.sqlite.org

### Nástroje
- **VS Code**: https://code.visualstudio.com
- **Postman**: https://www.postman.com
- **DB Browser for SQLite**: https://sqlitebrowser.org

---

## 💡 Tipy

### Rychlé odkazy v terminálu
```bash
# Otevřít dokumentaci
open README.md

# Spustit backend
cd backend && npm start

# Spustit frontend
cd frontend && npm run dev

# Otevřít aplikaci
open http://localhost:3000
```

### Zkratky
- **Ctrl+C** - Zastavit server
- **Cmd+R** - Obnovit stránku
- **F12** - Otevřít DevTools

---

## 📞 Podpora

### Máte problém?
1. Zkontrolujte **[SPUSTENI.md](SPUSTENI.md)** - Řešení problémů
2. Přečtěte si **[TIPY_PRO_ZACATECNIKY.md](TIPY_PRO_ZACATECNIKY.md)** - Časté chyby
3. Zkontrolujte konzoli prohlížeče (F12)

### Chcete přidat funkci?
1. Přečtěte si **[PREHLED_PROJEKTU.md](PREHLED_PROJEKTU.md)** - Možná rozšíření
2. Prostudujte **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Databáze
3. Podívejte se na **[API_EXAMPLES.md](API_EXAMPLES.md)** - API

---

**Užijte si práci s projektem! 🚀**
