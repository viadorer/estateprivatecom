#!/bin/bash

# Skript pro zálohu databáze
# Použití: ./scripts/backup-db.sh

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_FILE="backend/tasks.db"
BACKUP_FILE="$BACKUP_DIR/tasks_$TIMESTAMP.db"

echo "💾 Zálohuji databázi..."
echo ""

# Vytvoření složky pro zálohy
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    echo "📁 Vytvořena složka pro zálohy"
fi

# Kontrola existence databáze
if [ ! -f "$DB_FILE" ]; then
    echo "❌ Databáze neexistuje: $DB_FILE"
    exit 1
fi

# Záloha
cp "$DB_FILE" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Záloha vytvořena: $BACKUP_FILE"
    
    # Velikost souboru
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "📊 Velikost: $SIZE"
    
    # Počet záloh
    COUNT=$(ls -1 "$BACKUP_DIR" | wc -l)
    echo "📦 Celkem záloh: $COUNT"
else
    echo "❌ Chyba při vytváření zálohy"
    exit 1
fi

echo ""
echo "💡 Tip: Pro obnovení použijte:"
echo "   cp $BACKUP_FILE $DB_FILE"
