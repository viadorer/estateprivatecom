# 🛠️ Utility Skripty

Užitečné skripty pro práci s projektem.

## 📋 Dostupné skripty

### 🚀 start-dev.sh
Spustí celou aplikaci v development módu (backend + frontend).

```bash
./scripts/start-dev.sh
```

**Co dělá:**
- Zkontroluje a nainstaluje závislosti
- Spustí backend na portu 3001
- Spustí frontend na portu 3000

---

### 📦 install-all.sh
Nainstaluje všechny závislosti (root, backend, frontend).

```bash
./scripts/install-all.sh
```

**Použití:**
- Po prvním klonování projektu
- Po přidání nových závislostí
- Po smazání node_modules

---

### 🗑️ reset-db.sh
Smaže databázi a umožní začít znovu.

```bash
./scripts/reset-db.sh
```

**Varování:** Smaže všechna data!

**Použití:**
- Když chcete začít s čistou databází
- Při testování
- Při řešení problémů s databází

---

### 💾 backup-db.sh
Vytvoří zálohu databáze.

```bash
./scripts/backup-db.sh
```

**Co dělá:**
- Vytvoří složku `backups/` (pokud neexistuje)
- Zkopíruje databázi s časovým razítkem
- Zobrazí informace o záloze

**Zálohy jsou uloženy jako:**
```
backups/tasks_20241021_153045.db
```

**Obnovení zálohy:**
```bash
cp backups/tasks_20241021_153045.db backend/tasks.db
```

---

### 🏥 check-health.sh
Zkontroluje, zda všechny části aplikace běží správně.

```bash
./scripts/check-health.sh
```

**Kontroluje:**
- ✅ Backend (port 3001)
- ✅ Frontend (port 3000)
- ✅ Databáze (existence souboru)
- ✅ Závislosti (node_modules)

---

## 🎯 Běžné workflow

### První spuštění
```bash
./scripts/install-all.sh
./scripts/start-dev.sh
```

### Denní vývoj
```bash
./scripts/start-dev.sh
```

### Před důležitou změnou
```bash
./scripts/backup-db.sh
# ... proveďte změny ...
```

### Kontrola zdraví
```bash
./scripts/check-health.sh
```

### Reset databáze
```bash
./scripts/backup-db.sh  # nejdřív záloha!
./scripts/reset-db.sh
```

---

## 💡 Tipy

### Alias v .zshrc nebo .bashrc
```bash
alias taskman-start="cd ~/path/to/project && ./scripts/start-dev.sh"
alias taskman-backup="cd ~/path/to/project && ./scripts/backup-db.sh"
alias taskman-health="cd ~/path/to/project && ./scripts/check-health.sh"
```

### Automatická záloha (cron)
```bash
# Každý den v 2:00
0 2 * * * cd ~/path/to/project && ./scripts/backup-db.sh
```

### Čištění starých záloh
```bash
# Smazat zálohy starší než 30 dní
find backups/ -name "tasks_*.db" -mtime +30 -delete
```

---

## 🐛 Troubleshooting

### Skript nelze spustit
```bash
# Přidejte execute oprávnění
chmod +x scripts/*.sh
```

### Backend/Frontend neběží
```bash
# Zkontrolujte zdraví
./scripts/check-health.sh

# Zkontrolujte porty
lsof -i :3000
lsof -i :3001
```

### Chyba při instalaci
```bash
# Smažte node_modules a zkuste znovu
rm -rf backend/node_modules frontend/node_modules node_modules
./scripts/install-all.sh
```

---

## 📝 Vytvoření vlastního skriptu

Příklad nového skriptu:

```bash
#!/bin/bash

# Popis skriptu
# Použití: ./scripts/muj-skript.sh

echo "🚀 Můj skript..."

# Váš kód zde

echo "✅ Hotovo!"
```

Nezapomeňte:
```bash
chmod +x scripts/muj-skript.sh
```
