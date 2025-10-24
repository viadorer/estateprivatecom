# Frontend - Task Manager UI

## 🚀 Spuštění

```bash
npm install
npm run dev
```

Aplikace poběží na `http://localhost:3000`

## 🎨 Technologie

- **React 18** - UI knihovna
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Lucide React** - Ikony

## 📱 Stránky

### Dashboard
- Přehled statistik
- Poslední úkoly
- Aktivní projekty

### Projekty
- Grid view všech projektů
- Možnost mazání

### Úkoly
- Tabulka všech úkolů
- Změna stavu
- Filtrování
- Mazání

### Uživatelé
- Seznam všech uživatelů

## 🎨 Komponenty

- `App` - Hlavní komponenta
- `Dashboard` - Dashboard stránka
- `Projects` - Projekty stránka
- `Tasks` - Úkoly stránka
- `Users` - Uživatelé stránka
- `StatCard` - Statistická karta
- `StatusBadge` - Badge pro stav
- `PriorityBadge` - Badge pro prioritu

## 🔧 Konfigurace

### Změna portu
V `vite.config.js` změňte:
```javascript
server: {
  port: 3000, // Změňte na požadovaný port
}
```

### Změna API URL
V `vite.config.js` změňte:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001', // Změňte URL backendu
  }
}
```

## 🎨 Customizace

### Změna barev
V `src/App.jsx` nahraďte TailwindCSS třídy:
- `blue-500` → `purple-500`
- `blue-600` → `purple-600`

### Přidání nové stránky
1. Vytvořte komponentu
2. Přidejte záložku v navigaci
3. Přidejte do `activeTab` podmínky

## 📦 Build

```bash
npm run build
```

Výstup bude v `dist/` složce.

## 🔍 Preview

```bash
npm run preview
```
