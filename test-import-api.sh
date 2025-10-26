#!/bin/bash

# Test script pro Import API
# Použití: ./test-import-api.sh

API_KEY="test_api_key_123456789"
BASE_URL="http://localhost:3001/api/import"

echo "========================================="
echo "Estate Private - Import API Test"
echo "========================================="
echo ""

echo "=== Test 1: Import nemovitosti ==="
curl -X POST "$BASE_URL/properties" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "TEST001",
    "transaction_type": "sale",
    "property_type": "flat",
    "property_subtype": "2+kk",
    "price": 5000000,
    "title": "Testovaci byt 2+kk v centru Prahy",
    "description": "Krasny svetly byt po kompletni rekonstrukci. Plne vybavena kuchyn, velky balkon s vyhledem na park.",
    "city": "Praha",
    "district": "Vinohrady",
    "street": "Korunni",
    "area": 65,
    "rooms": 2,
    "floor": 3,
    "total_floors": 5,
    "balcony": true,
    "parking": true,
    "agent_id": 2
  }'

echo -e "\n\n=== Test 2: Update nemovitosti ==="
curl -X POST "$BASE_URL/properties" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "TEST001",
    "transaction_type": "sale",
    "property_type": "flat",
    "property_subtype": "2+kk",
    "price": 5500000,
    "title": "Testovaci byt 2+kk v centru Prahy - AKTUALIZOVANO",
    "description": "Krasny svetly byt po kompletni rekonstrukci. Plne vybavena kuchyn, velky balkon s vyhledem na park. NOVA CENA!",
    "city": "Praha",
    "district": "Vinohrady",
    "street": "Korunni",
    "area": 65,
    "rooms": 2,
    "floor": 3,
    "total_floors": 5,
    "balcony": true,
    "parking": true,
    "agent_id": 2
  }'

echo -e "\n\n=== Test 3: Seznam nemovitosti ==="
curl "$BASE_URL/properties" \
  -H "X-API-Key: $API_KEY"

echo -e "\n\n=== Test 4: Statistiky ==="
curl "$BASE_URL/stats" \
  -H "X-API-Key: $API_KEY"

echo -e "\n\n=== Test 5: Smazani nemovitosti ==="
curl -X DELETE "$BASE_URL/properties/TEST001" \
  -H "X-API-Key: $API_KEY"

echo -e "\n\n=== Test 6: Neplatny API klic ==="
curl "$BASE_URL/properties" \
  -H "X-API-Key: invalid_key"

echo -e "\n\n========================================="
echo "Testy dokonceny"
echo "========================================="
