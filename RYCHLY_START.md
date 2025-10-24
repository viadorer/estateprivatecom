# ⚡ Rychlý start - 3 kroky

## 1️⃣ Otevřete 2 terminály

### Terminál 1 - Backend
```bash
cd backend
npm start
```

✅ Měli byste vidět:
```
✅ Databáze inicializována
🚀 Server běží na http://localhost:3001
```

### Terminál 2 - Frontend
```bash
cd frontend
npm run dev
```

✅ Měli byste vidět:
```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:3000/
```

## 2️⃣ Otevřete prohlížeč

Přejděte na: **http://localhost:3000**

## 3️⃣ Hotovo! 🎉

Aplikace běží a můžete začít pracovat.

---

## 🎯 Co můžete dělat?

✅ Prohlížet projekty a úkoly  
✅ Měnit stav úkolů (todo → in_progress → completed)  
✅ Mazat projekty a úkoly  
✅ Sledovat statistiky na dashboardu  

---

## 📚 Další dokumentace

- **README.md** - kompletní dokumentace
- **PREHLED_PROJEKTU.md** - přehled celého projektu
- **TIPY_PRO_ZACATECNIKY.md** - vysvětlení pro začátečníky
- **DATABASE_SCHEMA.md** - struktura databáze
- **API_EXAMPLES.md** - příklady API volání

---

## ❓ Problémy?

### Backend se nespustí
```bash
# Zkontrolujte, zda port 3001 není obsazený
lsof -i :3001
```

### Frontend se nespustí
```bash
# Zkontrolujte, zda port 3000 není obsazený
lsof -i :3000
```

### Chcete začít znovu?
```bash
# Smažte databázi a restartujte backend
rm backend/tasks.db
cd backend
npm start
```

---

## 🎓 Pro začátečníky

Pokud nevíte, co dělat dál, přečtěte si:
1. **TIPY_PRO_ZACATECNIKY.md** - základní vysvětlení
2. **PREHLED_PROJEKTU.md** - co projekt obsahuje

---

**Užijte si práci s aplikací! 🚀**
