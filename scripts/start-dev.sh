#!/bin/bash

# Skript pro spuštění vývojového prostředí
# Použití: ./scripts/start-dev.sh

echo "🚀 Spouštím Task Manager v development módu..."
echo ""

# Kontrola, zda existují node_modules
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instaluji backend závislosti..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Instaluji frontend závislosti..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "✅ Závislosti jsou nainstalovány"
echo ""
echo "🔧 Spouštím servery..."
echo ""
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Pro zastavení stiskněte Ctrl+C"
echo ""

# Spuštění obou serverů současně
npm run dev
