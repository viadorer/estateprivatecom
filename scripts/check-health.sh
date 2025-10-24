#!/bin/bash

# Skript pro kontrolu zdraví aplikace
# Použití: ./scripts/check-health.sh

echo "🏥 Kontroluji zdraví aplikace..."
echo ""

# Kontrola backendu
echo "🔍 Backend (http://localhost:3001):"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/stats)

if [ "$BACKEND_STATUS" = "200" ]; then
    echo "   ✅ Backend běží"
    
    # Získání statistik
    STATS=$(curl -s http://localhost:3001/api/stats)
    echo "   📊 Statistiky: $STATS"
else
    echo "   ❌ Backend neběží (HTTP $BACKEND_STATUS)"
fi

echo ""

# Kontrola frontendu
echo "🔍 Frontend (http://localhost:3000):"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "   ✅ Frontend běží"
else
    echo "   ❌ Frontend neběží (HTTP $FRONTEND_STATUS)"
fi

echo ""

# Kontrola databáze
echo "🔍 Databáze:"
if [ -f "backend/tasks.db" ]; then
    SIZE=$(du -h backend/tasks.db | cut -f1)
    echo "   ✅ Databáze existuje ($SIZE)"
else
    echo "   ❌ Databáze neexistuje"
fi

echo ""

# Kontrola node_modules
echo "🔍 Závislosti:"
if [ -d "backend/node_modules" ] && [ -d "frontend/node_modules" ]; then
    echo "   ✅ Závislosti nainstalovány"
else
    echo "   ⚠️  Některé závislosti chybí"
    [ ! -d "backend/node_modules" ] && echo "      - Backend node_modules chybí"
    [ ! -d "frontend/node_modules" ] && echo "      - Frontend node_modules chybí"
fi

echo ""
echo "🏁 Kontrola dokončena"
