# Import API Refactoring - Summary

## Datum: 26.10.2025

## Prehled zmen

Import API bylo uspesne refaktorovano tak, aby pouzivalo existujici `users` tabulku s role `agent` misto samostatne tabulky `import_sources`. Tato zmena zjednodusuje architekturu a vyuziva jiz existujici system pro spravu agentu.

## Hlavni zmeny

### 1. Databazove schema (database.js)

#### Pridane sloupce do `users` tabulky:
- `api_key TEXT UNIQUE` - API klic pro import pristup
- `rate_limit INTEGER DEFAULT 100` - Limit requestu za hodinu

#### Upravene tabulky:
- **import_logs**: `source_id` -> `user_id` (reference na users.id)
- **import_mappings**: `source_id` -> `user_id` (reference na users.id)
- **Indexy**: Aktualizovany na `user_id`

#### Odstranena tabulka:
- `import_sources` - uz neni potreba

#### Testovaci data:
- Jana Novakova (agent): API key `rk_premium_reality_api_key_123456789`, rate limit 100/h
- Petr Svoboda (agent): API key `rk_city_realty_api_key_987654321`, rate limit 50/h

### 2. Backend API

#### importMiddleware.js
- `authenticateImportSource`: Nyni autentizuje proti `users` tabulce s podminkou `role = 'agent'`
- Kontroluje `api_key`, `role = 'agent'` a `is_active = 1`

#### importController.js
- Vsechny funkce aktualizovany na pouzivani `user_id` misto `source_id`
- `logImport()`: Parameter `sourceId` -> `userId`
- Vsechny SQL dotazy aktualizovany

#### server.js - Admin endpointy

**Nove endpointy:**
- `POST /api/admin/import-sources/:id/generate-key` - Vygeneruje API klic pro agenta
- `DELETE /api/admin/import-sources/:id/revoke-key` - Odebere API pristup agentovi

**Upravene endpointy:**
- `GET /api/admin/import-sources` - Vraci agenty s jejich spolecnostmi a import statistikami
- `GET /api/admin/import-sources/:id` - Detail agenta vcetne company_name
- `PUT /api/admin/import-sources/:id` - Aktualizace rate_limit a is_active
- `POST /api/admin/import-sources/:id/regenerate-key` - Regenerace API klice (pouze pokud jiz existuje)
- `GET /api/admin/import-stats` - Aktualizovano na `user_id`

**Odstranene endpointy:**
- `POST /api/admin/import-sources` - Vytvareni novych zdroju (agenti se vytvareji pres standardni user management)
- `DELETE /api/admin/import-sources/:id` - Mazani zdroju (nahrazeno revoke-key)

### 3. Frontend (AdminImportSources.jsx)

#### Odstranena funkcionalita:
- Modal pro vytvareni novych import sources
- Tlacitko "Pridat novy zdroj"
- Mazani import sources

#### Pridana funkcionalita:
- Modal pro generovani API klice existujicimu agentovi
- Tlacitko "Vygenerovat klic" pro agenty bez API pristupu
- Tlacitko "Odebrat pristup" pro odebirani API klice
- Zobrazeni spolecnosti agenta

#### Upravena tabulka:
- Sloupec "Agent" - jmeno, email, telefon
- Sloupec "Spolecnost" - nazev spolecnosti
- Sloupec "API Pristup" - status a rate limit, nebo tlacitko pro generovani
- Tlacitko "Upravit" pro zmenu rate limitu

#### Detail agenta:
- Zobrazeni spolecnosti
- Zobrazeni stavu API pristupu
- Podmineně zobrazene tlacitka podle toho, zda ma agent API pristup

## Vyuziti

### Pro admina:

1. **Vygenerovani API pristupu pro agenta:**
   - Prejit na "Import API - Agenti"
   - Najit agenta bez API pristupu
   - Kliknout na "Vygenerovat klic"
   - Nastavit rate limit
   - API klic se zobrazi pouze jednou

2. **Regenerace API klice:**
   - Otevrit detail agenta
   - Kliknout na "Regenerovat API klic"
   - Stary klic prestane fungovat

3. **Odebirani API pristupu:**
   - Otevrit detail agenta
   - Kliknout na "Odebrat pristup"
   - API klic bude odstranen

### Pro agenty (RK):

Import API funguje stejne jako predtim:

```bash
# Import nemovitosti
curl -X POST http://localhost:3001/api/import/properties \
  -H "X-API-Key: rk_premium_reality_api_key_123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "RK123",
    "transaction_type": "sale",
    "property_type": "flat",
    "price": 5000000,
    "title": "Byt 2+kk",
    "description": "Popis...",
    "city": "Praha",
    "area": 65
  }'

# Smazani nemovitosti
curl -X DELETE http://localhost:3001/api/import/properties/RK123 \
  -H "X-API-Key: rk_premium_reality_api_key_123456789"

# Seznam importovanych nemovitosti
curl -X GET http://localhost:3001/api/import/properties \
  -H "X-API-Key: rk_premium_reality_api_key_123456789"

# Statistiky
curl -X GET http://localhost:3001/api/import/stats \
  -H "X-API-Key: rk_premium_reality_api_key_123456789"
```

## Vyhody refaktoringu

1. **Jednoducha architektura** - Jeden system pro spravu uzivatelu
2. **Konzistence** - Agenti maji vsechny sve udaje na jednom miste
3. **Lepsi integrace** - Import API je primo propojeno s existujicim user managementem
4. **Flexibilita** - Lze snadno pridat/odebrat API pristup libovolnemu agentovi
5. **Bezpecnost** - Vyuziva existujici autentizacni a autorizacni mechanismy

## Migrace dat

Pri prvnim spusteni po refaktoringu:
1. Smazat starou databazi: `rm backend/realestate.db`
2. Spustit `node backend/database.js` pro vytvoreni nove struktury
3. Testovaci agenti uz maji vygenerovane API klice

## Testovani

Databaze byla uspesne vytvorena s nasledujicimi testovacimi daty:
- 2 agenti s API pristupem
- Jana Novakova: `rk_premium_reality_api_key_123456789` (100 req/h)
- Petr Svoboda: `rk_city_realty_api_key_987654321` (50 req/h)

Backend server je pripraven k testovani na `http://localhost:3001`
