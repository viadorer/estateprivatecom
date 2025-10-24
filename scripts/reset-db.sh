#!/bin/bash

# Skript pro reset databáze
# Použití: ./scripts/reset-db.sh

echo "⚠️  VAROVÁNÍ: Tímto smažete celou databázi!"
echo ""
read -p "Opravdu chcete pokračovat? (ano/ne): " confirm

if [ "$confirm" != "ano" ]; then
    echo "❌ Operace zrušena"
    exit 0
fi

echo ""
echo "🗑️  Mažu databázi..."

if [ -f "backend/tasks.db" ]; then
    rm backend/tasks.db
    echo "✅ Databáze smazána"
else
    echo "ℹ️  Databáze neexistuje"
fi

echo ""
echo "🔄 Restartujte backend server pro vytvoření nové databáze"
echo "   cd backend && npm start"
