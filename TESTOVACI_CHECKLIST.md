# ✅ Testovací checklist

## 🚀 Spuštění

- [ ] Backend se spustí bez chyb (`cd backend && npm start`)
- [ ] Frontend se spustí bez chyb (`cd frontend && npm run dev`)
- [ ] Databáze se vytvoří automaticky (`backend/tasks.db`)
- [ ] Ukázková data se načtou
- [ ] Backend běží na portu 3001
- [ ] Frontend běží na portu 3000

## 🌐 Základní funkčnost

### Dashboard
- [ ] Dashboard se načte
- [ ] Zobrazí se 4 statistické karty
- [ ] Statistiky obsahují správná čísla
- [ ] Zobrazí se poslední úkoly (max 5)
- [ ] Zobrazí se aktivní projekty
- [ ] Status badges mají správné barvy

### Navigace
- [ ] Kliknutí na "Dashboard" zobrazí dashboard
- [ ] Kliknutí na "Projekty" zobrazí projekty
- [ ] Kliknutí na "Úkoly" zobrazí úkoly
- [ ] Kliknutí na "Uživatelé" zobrazí uživatele
- [ ] Aktivní záložka má modré podtržení

## 📁 Projekty

### Zobrazení
- [ ] Zobrazí se všechny projekty
- [ ] Každý projekt má název
- [ ] Každý projekt má popis
- [ ] Zobrazí se počet úkolů
- [ ] Zobrazí se jméno vlastníka
- [ ] Projekty jsou v grid layoutu (3 sloupce na desktopu)

### Interakce
- [ ] Hover na projektu zvýrazní kartu
- [ ] Kliknutí na ikonu koše zobrazí potvrzení
- [ ] Po potvrzení se projekt smaže
- [ ] Po smazání se stránka aktualizuje
- [ ] Smazání projektu smaže i jeho úkoly

## ✅ Úkoly

### Zobrazení
- [ ] Zobrazí se všechny úkoly v tabulce
- [ ] Každý úkol má název a popis
- [ ] Zobrazí se název projektu
- [ ] Zobrazí se status dropdown
- [ ] Zobrazí se priorita badge
- [ ] Priorita má správnou barvu (nízká=šedá, střední=žlutá, vysoká=červená)

### Změna stavu
- [ ] Kliknutí na status dropdown zobrazí možnosti
- [ ] Výběr "K provedení" změní stav na todo
- [ ] Výběr "Probíhá" změní stav na in_progress
- [ ] Výběr "Dokončeno" změní stav na completed
- [ ] Po změně se stránka aktualizuje
- [ ] Změna se projeví i v dashboard statistikách

### Mazání
- [ ] Kliknutí na ikonu koše zobrazí potvrzení
- [ ] Po potvrzení se úkol smaže
- [ ] Po smazání se stránka aktualizuje
- [ ] Smazání se projeví v počtu úkolů projektu

## 👥 Uživatelé

### Zobrazení
- [ ] Zobrazí se všichni uživatelé
- [ ] Každý uživatel má jméno
- [ ] Každý uživatel má email
- [ ] Zobrazí se datum vytvoření
- [ ] Datum je ve správném formátu (DD.MM.YYYY)

### Interakce
- [ ] Hover na uživateli zvýrazní řádek

## 📡 API Testování

### Uživatelé
- [ ] `GET /api/users` vrací seznam uživatelů
- [ ] `GET /api/users/1` vrací detail uživatele
- [ ] `POST /api/users` vytvoří nového uživatele

### Projekty
- [ ] `GET /api/projects` vrací seznam projektů
- [ ] `GET /api/projects/1` vrací detail projektu
- [ ] `POST /api/projects` vytvoří nový projekt
- [ ] `PUT /api/projects/1` aktualizuje projekt
- [ ] `DELETE /api/projects/1` smaže projekt

### Úkoly
- [ ] `GET /api/tasks` vrací seznam úkolů
- [ ] `GET /api/tasks?project_id=1` filtruje podle projektu
- [ ] `GET /api/tasks?status=todo` filtruje podle stavu
- [ ] `GET /api/tasks?priority=high` filtruje podle priority
- [ ] `GET /api/tasks/1` vrací detail úkolu
- [ ] `POST /api/tasks` vytvoří nový úkol
- [ ] `PUT /api/tasks/1` aktualizuje úkol
- [ ] `DELETE /api/tasks/1` smaže úkol

### Statistiky
- [ ] `GET /api/stats` vrací správné statistiky
- [ ] Statistiky obsahují všechna pole
- [ ] Čísla odpovídají skutečnému stavu databáze

## 🎨 UI/UX

### Responzivita
- [ ] Aplikace funguje na desktopu (1920x1080)
- [ ] Aplikace funguje na tabletu (768x1024)
- [ ] Aplikace funguje na mobilu (375x667)
- [ ] Grid se přizpůsobuje velikosti obrazovky
- [ ] Tabulka má horizontální scroll na mobilu

### Barvy a styly
- [ ] Primární barva je modrá
- [ ] Hover efekty fungují
- [ ] Status badges mají správné barvy
- [ ] Priorita badges mají správné barvy
- [ ] Text je čitelný (dobrý kontrast)

### Ikony
- [ ] Všechny ikony se zobrazují
- [ ] Ikony mají správnou velikost
- [ ] Ikony mají správnou barvu

## 🔄 Aktualizace dat

### Real-time aktualizace
- [ ] Po vytvoření úkolu se zobrazí v seznamu
- [ ] Po aktualizaci úkolu se změna projeví
- [ ] Po smazání úkolu zmizí ze seznamu
- [ ] Statistiky se aktualizují po změnách
- [ ] Dashboard se aktualizuje po změnách

## 🐛 Error handling

### Chybové stavy
- [ ] Chyba při načítání dat se zobrazí v konzoli
- [ ] Chybějící backend zobrazí chybu
- [ ] Neplatné API volání vrátí chybu 404/500
- [ ] Smazání neexistujícího záznamu vrátí chybu

## 🔒 Validace

### Backend validace
- [ ] Nelze vytvořit uživatele bez jména
- [ ] Nelze vytvořit uživatele bez emailu
- [ ] Nelze vytvořit projekt bez názvu
- [ ] Nelze vytvořit úkol bez názvu
- [ ] Nelze vytvořit úkol bez project_id

## 📊 Databáze

### Struktura
- [ ] Tabulka users existuje
- [ ] Tabulka projects existuje
- [ ] Tabulka tasks existuje
- [ ] Tabulka comments existuje
- [ ] Všechny cizí klíče fungují

### Kaskádové mazání
- [ ] Smazání uživatele smaže jeho projekty
- [ ] Smazání projektu smaže jeho úkoly
- [ ] Smazání úkolu smaže jeho komentáře

### Ukázková data
- [ ] Existují 2 uživatelé
- [ ] Existují 2 projekty
- [ ] Existují 4 úkoly
- [ ] Data jsou správně propojená

## 🚀 Performance

### Rychlost načítání
- [ ] Dashboard se načte do 1 sekundy
- [ ] Projekty se načtou do 1 sekundy
- [ ] Úkoly se načtou do 1 sekundy
- [ ] API odpovídá do 100ms

### Optimalizace
- [ ] Žádné zbytečné re-rendery
- [ ] Žádné memory leaky
- [ ] Žádné console.error v produkci

## 🔧 Konfigurace

### Backend
- [ ] Port lze změnit v server.js
- [ ] CORS je správně nakonfigurován
- [ ] Databáze se vytvoří ve správné složce

### Frontend
- [ ] Port lze změnit v vite.config.js
- [ ] Proxy funguje správně
- [ ] Build proces funguje (`npm run build`)

## 📝 Dokumentace

### Soubory
- [ ] README.md existuje a je aktuální
- [ ] SPUSTENI.md obsahuje správné instrukce
- [ ] DATABASE_SCHEMA.md popisuje správné schéma
- [ ] API_EXAMPLES.md obsahuje funkční příklady
- [ ] TIPY_PRO_ZACATECNIKY.md je srozumitelný

### Komentáře v kódu
- [ ] Backend kód má komentáře
- [ ] Frontend kód má komentáře
- [ ] Složité části jsou vysvětlené

## 🎯 Celkové hodnocení

### Funkčnost
- [ ] Všechny základní funkce fungují
- [ ] Žádné kritické bugy
- [ ] Aplikace je použitelná

### Kvalita kódu
- [ ] Kód je čitelný
- [ ] Kód je konzistentní
- [ ] Kód je dobře strukturovaný

### UX
- [ ] Aplikace je intuitivní
- [ ] Aplikace je responzivní
- [ ] Aplikace je rychlá

---

## 🧪 Jak testovat

### Manuální testování
1. Projděte každý bod v checklistu
2. Zaškrtněte fungující položky
3. Poznamenejte si problémy

### API testování
```bash
# Použijte curl nebo Postman
curl http://localhost:3001/api/stats
curl http://localhost:3001/api/projects
curl http://localhost:3001/api/tasks
```

### Databáze testování
```bash
# Použijte DB Browser for SQLite
# Otevřete backend/tasks.db
# Prohlédněte si tabulky a data
```

### Browser DevTools
1. Otevřete konzoli (F12)
2. Zkontrolujte Network tab
3. Zkontrolujte Console tab
4. Zkontrolujte React DevTools

---

## 📊 Výsledky testování

Po dokončení testování vyplňte:

**Datum testování**: ___________

**Testoval**: ___________

**Celkový počet testů**: 100+

**Úspěšné testy**: _____ / _____

**Neúspěšné testy**: _____ / _____

**Kritické bugy**: _____

**Poznámky**: 
_________________________________
_________________________________
_________________________________
