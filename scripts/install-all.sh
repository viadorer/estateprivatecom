#!/bin/bash

# Skript pro instalaci všech závislostí
# Použití: ./scripts/install-all.sh

echo "📦 Instaluji všechny závislosti..."
echo ""

# Root závislosti
echo "🔧 Root závislosti..."
npm install

echo ""

# Backend závislosti
echo "🔧 Backend závislosti..."
cd backend
npm install
cd ..

echo ""

# Frontend závislosti
echo "🔧 Frontend závislosti..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Všechny závislosti jsou nainstalovány!"
echo ""
echo "🚀 Pro spuštění aplikace použijte:"
echo "   npm run dev"
echo ""
echo "   nebo"
echo ""
echo "   ./scripts/start-dev.sh"
