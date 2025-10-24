# 🎨 Popis uživatelského rozhraní

## Navigace

### Horní lišta (Navbar)
- **Logo**: "Task Manager" - modrý text, velikost 2xl
- **Záložky**:
  - 📊 Dashboard
  - 📁 Projekty
  - ✅ Úkoly
  - 👥 Uživatelé

Aktivní záložka má modré podtržení, neaktivní jsou šedé.

---

## 📊 Dashboard

### Statistické karty (4 karty v řadě)
1. **Celkem projektů** - modrá karta
2. **Celkem úkolů** - fialová karta
3. **Dokončeno** - zelená karta
4. **Probíhá** - žlutá karta

Každá karta obsahuje:
- Ikonu (CheckSquare)
- Název statistiky
- Číslo (velikost 2xl)

### Poslední úkoly (levý sloupec)
- Bílá karta s nadpisem "Poslední úkoly"
- Seznam 5 posledních úkolů
- Každý úkol zobrazuje:
  - Název úkolu (tučně)
  - Název projektu (šedě, menší)
  - Status badge (barevný štítek)

### Aktivní projekty (pravý sloupec)
- Bílá karta s nadpisem "Aktivní projekty"
- Seznam aktivních projektů
- Každý projekt zobrazuje:
  - Název projektu (tučně)
  - Počet úkolů (šedě, menší)

---

## 📁 Projekty

### Grid layout (3 sloupce)
Každý projekt je karta obsahující:
- **Název projektu** (tučně, velikost lg)
- **Ikona koše** (vpravo nahoře, červená) - smazání projektu
- **Popis projektu** (šedý text)
- **Spodní lišta**:
  - Počet úkolů (vlevo)
  - Jméno vlastníka (vpravo)

**Hover efekt**: Karta se zvýrazní (větší stín)

---

## ✅ Úkoly

### Tabulka úkolů
Hlavička tabulky (šedé pozadí):
- Název
- Projekt
- Stav
- Priorita
- Akce

**Každý řádek obsahuje**:

1. **Název úkolu**:
   - Název (tučně)
   - Popis (šedě, menší)

2. **Projekt**:
   - Název projektu (šedý text)

3. **Stav**:
   - Dropdown menu s možnostmi:
     - K provedení (todo)
     - Probíhá (in_progress)
     - Dokončeno (completed)
   - Okamžitá změna při výběru

4. **Priorita**:
   - Barevný badge:
     - **Nízká** - šedý
     - **Střední** - žlutý
     - **Vysoká** - červený

5. **Akce**:
   - Ikona koše (červená) - smazání úkolu

**Hover efekt**: Řádek se zvýrazní světle šedou barvou

---

## 👥 Uživatelé

### Seznam uživatelů
Každý uživatel je řádek obsahující:
- **Jméno** (tučně)
- **Email** (šedě, menší)
- **Datum vytvoření** (vpravo, šedě)

**Hover efekt**: Řádek se zvýrazní světle šedou barvou

---

## 🎨 Barevné schéma

### Primární barvy
- **Modrá**: `blue-500`, `blue-600` - primární akce, odkazy
- **Šedá**: `gray-50`, `gray-100`, `gray-500`, `gray-900` - pozadí, text
- **Bílá**: `white` - karty, pozadí

### Status barvy
- **Todo** (K provedení): `gray-100` pozadí, `gray-800` text
- **In Progress** (Probíhá): `blue-100` pozadí, `blue-800` text
- **Completed** (Dokončeno): `green-100` pozadí, `green-800` text

### Priorita barvy
- **Nízká**: `gray-100` pozadí, `gray-800` text
- **Střední**: `yellow-100` pozadí, `yellow-800` text
- **Vysoká**: `red-100` pozadí, `red-800` text

### Statistiky barvy
- **Modrá**: `bg-blue-500` - projekty
- **Fialová**: `bg-purple-500` - úkoly
- **Zelená**: `bg-green-500` - dokončené
- **Žlutá**: `bg-yellow-500` - probíhající

### Akční barvy
- **Smazat**: `red-600`, hover `red-800`
- **Editovat**: `blue-600`, hover `blue-800`

---

## 📱 Responzivita

### Desktop (lg+)
- Grid 3 sloupce pro projekty
- Grid 2 sloupce pro dashboard
- Plná tabulka pro úkoly

### Tablet (sm-lg)
- Grid 2 sloupce pro projekty
- Grid 1 sloupec pro dashboard
- Plná tabulka pro úkoly

### Mobil (xs-sm)
- Grid 1 sloupec pro projekty
- Grid 1 sloupec pro dashboard
- Horizontální scroll pro tabulku

---

## 🎯 Interaktivní prvky

### Tlačítka
- **Primární**: Modrá barva, bílý text
- **Sekundární**: Šedá barva, tmavý text
- **Nebezpečné**: Červená barva, bílý text

### Hover stavy
- Karty: Zvětšení stínu
- Tlačítka: Ztmavnutí barvy
- Řádky tabulky: Světle šedé pozadí
- Odkazy: Podtržení

### Focus stavy
- Inputy: Modrý border
- Tlačítka: Modrý outline

---

## 🔔 Dialogy a potvrzení

### Smazání úkolu/projektu
```
Opravdu chcete smazat tento úkol?
[Zrušit] [Smazat]
```

Používá nativní `confirm()` dialog prohlížeče.

---

## ⚡ Animace

### Přechody
- Hover efekty: `transition-shadow`
- Změna záložek: Okamžitá
- Načítání dat: Loading text

### Loading stavy
```
Načítání...
```
Zobrazuje se při načítání dat z API.

---

## 🎭 Ikony (Lucide React)

Používané ikony:
- **LayoutDashboard** - Dashboard
- **FolderKanban** - Projekty
- **CheckSquare** - Úkoly, statistiky
- **Users** - Uživatelé
- **Plus** - Přidat nový
- **Trash2** - Smazat
- **Edit** - Editovat
- **Calendar** - Datum

---

## 📐 Rozměry a spacing

### Padding
- Karty: `p-6` (24px)
- Tlačítka: `px-4 py-2` (16px, 8px)
- Tabulka buňky: `px-6 py-4` (24px, 16px)

### Margin
- Mezi sekcemi: `mb-6` (24px)
- Mezi prvky: `mb-4` (16px)
- Mezi texty: `mb-2` (8px)

### Gap
- Grid: `gap-6` (24px)
- Flex: `space-x-8` (32px)

### Border radius
- Karty: `rounded-lg` (8px)
- Tlačítka: `rounded-md` (6px)
- Badges: `rounded-full` (9999px)

---

## 🎨 Typography

### Nadpisy
- **h1**: `text-2xl font-bold` - Logo
- **h2**: `text-2xl font-bold` - Nadpisy stránek
- **h3**: `text-lg font-medium` - Nadpisy karet

### Text
- **Normální**: `text-sm` nebo `text-base`
- **Malý**: `text-xs`
- **Velký**: `text-2xl`

### Font weight
- **Bold**: `font-bold` - Nadpisy, důležité texty
- **Semibold**: `font-semibold` - Badges
- **Medium**: `font-medium` - Popisky
- **Normal**: `font-normal` - Běžný text

### Barvy textu
- **Primární**: `text-gray-900` - Hlavní text
- **Sekundární**: `text-gray-500` - Popisky
- **Akční**: `text-blue-600` - Odkazy
- **Nebezpečné**: `text-red-600` - Smazat

---

## 🌟 Best practices použité v UI

1. **Konzistence** - Stejné prvky vypadají stejně
2. **Hierarchie** - Důležité věci jsou větší/tučnější
3. **Kontrast** - Dobrá čitelnost textu
4. **Feedback** - Hover stavy, potvrzení akcí
5. **Responzivita** - Funguje na všech zařízeních
6. **Přístupnost** - Sémantické HTML, dobré barvy

---

## 🎨 Jak změnit vzhled?

### Změnit primární barvu
V `frontend/src/App.jsx` nahraďte všechny:
- `blue-500` → `purple-500`
- `blue-600` → `purple-600`
- `blue-800` → `purple-800`

### Změnit font
V `frontend/src/index.css` změňte:
```css
font-family: 'Váš font', -apple-system, ...
```

### Změnit spacing
V `frontend/tailwind.config.js` přidejte:
```javascript
theme: {
  extend: {
    spacing: {
      '128': '32rem',
    }
  }
}
```

### Přidat tmavý režim
1. Přidejte `darkMode: 'class'` do `tailwind.config.js`
2. Použijte `dark:` prefix pro styly
3. Přidejte toggle pro přepínání

---

## 📸 Očekávaný vzhled

### Dashboard
```
┌─────────────────────────────────────────────────────┐
│ Task Manager                                        │
│ [Dashboard] [Projekty] [Úkoly] [Uživatelé]        │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Dashboard                                           │
│                                                     │
│ [Celkem projektů] [Celkem úkolů] [Dokončeno] [...]│
│      2                4              1         1   │
│                                                     │
│ ┌─────────────────┐  ┌─────────────────┐         │
│ │ Poslední úkoly  │  │ Aktivní projekty│         │
│ │                 │  │                 │         │
│ │ • Úkol 1 [todo] │  │ • Projekt 1     │         │
│ │ • Úkol 2 [done] │  │ • Projekt 2     │         │
│ └─────────────────┘  └─────────────────┘         │
└─────────────────────────────────────────────────────┘
```

### Projekty
```
┌─────────────────────────────────────────────────────┐
│ Projekty                                            │
│                                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│ │Projekt 1│ │Projekt 2│ │Projekt 3│              │
│ │Popis... │ │Popis... │ │Popis... │              │
│ │4 úkolů  │ │2 úkoly  │ │6 úkolů  │              │
│ └─────────┘ └─────────┘ └─────────┘              │
└─────────────────────────────────────────────────────┘
```

### Úkoly
```
┌─────────────────────────────────────────────────────┐
│ Úkoly                                               │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ Název    │ Projekt │ Stav    │ Priorita │ Akce ││
│ ├─────────────────────────────────────────────────┤│
│ │ Úkol 1   │ Proj 1  │ [Todo▼] │ [Vysoká] │ [🗑] ││
│ │ Úkol 2   │ Proj 1  │ [Done▼] │ [Nízká]  │ [🗑] ││
│ └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```
