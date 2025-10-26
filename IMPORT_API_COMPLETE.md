# Import API - Implementace Dokoncena

**Datum:** 26. rijna 2024  
**Status:** HOTOVO A OTESTOVANO

---

## CO BYLO IMPLEMENTOVANO

### 1. Domenova Struktura

**Vyvojove prostredi:**
```
http://localhost:3000                  # Frontend
http://localhost:3001                  # Backend API
http://localhost:3001/api/import       # Import API
```

**Produkcni prostredi:**
```
https://estateprivate.com              # Frontend
https://api.estateprivate.com          # Backend API
https://import.estateprivate.com       # Import API
```

### 2. Databazove Tabulky

**import_sources** - Sprava RK
- API klice
- Rate limity
- Kontaktni udaje
- Aktivni/neaktivni status

**import_logs** - Audit trail
- Vsechny operace
- Success/error status
- IP adresy
- User agents
- Request data

**import_mappings** - Mapovani ID
- external_id → internal_id
- Umoznuje RK pouzivat vlastni ID
- Rychle vyhledavani

### 3. API Endpointy

```javascript
POST   /api/import/properties        // Import/update nemovitosti
DELETE /api/import/properties/:id    // Smazani
GET    /api/import/properties        // Seznam
GET    /api/import/stats             // Statistiky
```

### 4. Autentizace

**Header:**
```
X-API-Key: test_api_key_123456789
```

**Rate Limiting:**
- 100 requestu za hodinu per RK
- Burst: 10 requestu

### 5. Datovy Format

```json
{
  "external_id": "RK123",
  "transaction_type": "sale",
  "property_type": "flat",
  "property_subtype": "2+kk",
  "price": 5000000,
  "title": "Moderni byt 2+kk",
  "description": "Krasny svetly byt...",
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
}
```

---

## TESTOVANI

### Test 1: Import nemovitosti
```bash
curl -X POST http://localhost:3001/api/import/properties \
  -H "X-API-Key: test_api_key_123456789" \
  -H "Content-Type: application/json" \
  -d '{"external_id":"TEST001",...}'
```
**Vysledek:** USPECH - property_id: 8

### Test 2: Update nemovitosti
```bash
curl -X POST http://localhost:3001/api/import/properties \
  -H "X-API-Key: test_api_key_123456789" \
  -d '{"external_id":"TEST001","price":5500000,...}'
```
**Vysledek:** USPECH - action: update

### Test 3: Seznam nemovitosti
```bash
curl http://localhost:3001/api/import/properties \
  -H "X-API-Key: test_api_key_123456789"
```
**Vysledek:** USPECH - count: 1

### Test 4: Statistiky
```bash
curl http://localhost:3001/api/import/stats \
  -H "X-API-Key: test_api_key_123456789"
```
**Vysledek:** USPECH - total_imports: 2, successful: 2

### Test 5: Smazani
```bash
curl -X DELETE http://localhost:3001/api/import/properties/TEST001 \
  -H "X-API-Key: test_api_key_123456789"
```
**Vysledek:** USPECH

### Test 6: Neplatny API klic
```bash
curl http://localhost:3001/api/import/properties \
  -H "X-API-Key: invalid_key"
```
**Vysledek:** 401 Unauthorized

---

## NOVE SOUBORY

### Backend
- `backend/importMapper.js` - Mapovani dat
- `backend/importMiddleware.js` - Autentizace
- `backend/importController.js` - CRUD operace
- `backend/database.js` - Nove tabulky

### Dokumentace
- `IMPORT_API_DOMAINS.md` - Domenova struktura
- `IMPORT_API_COMPLETE.md` - Tento soubor
- `test-import-api.sh` - Test script

### Konfigurace
- `.env.example` - Aktualizovano s URLs
- `backend/.env.production` - Produkcni URLs

---

## JAK TO POUZIT

### Pro RK (Realitni Kancelar)

1. **Ziskat API klic**
   - Kontaktovat admina Estate Private
   - Dostat API klic (napr. `test_api_key_123456789`)

2. **Import nemovitosti**
```bash
curl -X POST https://import.estateprivate.com/properties \
  -H "X-API-Key: VAS_API_KLIC" \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "RK123",
    "transaction_type": "sale",
    "property_type": "flat",
    "price": 5000000,
    "title": "Byt 2+kk Praha",
    "description": "Popis...",
    "city": "Praha",
    "area": 65
  }'
```

3. **Update nemovitosti**
   - Stejny endpoint, stejne external_id
   - Automaticky updatuje existujici

4. **Smazani nemovitosti**
```bash
curl -X DELETE https://import.estateprivate.com/properties/RK123 \
  -H "X-API-Key: VAS_API_KLIC"
```

---

## BEZPECNOST

### Implementovano
- API klice v databazi
- Rate limiting (100 req/h)
- IP tracking
- User agent logging
- Audit log vsech operaci
- Validace vstupu
- Error handling

### Chybi (TODO)
- [ ] IP whitelisting
- [ ] Webhook notifikace
- [ ] Batch import
- [ ] Async zpracovani fotek

---

## MAPOVANI CISELNIKOV

### Transaction Type
```
sale → sale
rent → rent
auction → sale
share → sale
```

### Property Type
```
flat → flat
house → house
land → land
commercial → commercial
other → other
```

### Flat Subtype
```
1+kk, 1+1, 2+kk, 2+1, 3+kk, 3+1, 4+kk, 4+1, 5+kk, 5+1, 6+, atypical
```

---

## PRODUKCNI NASAZENI

### 1. DNS Nastaveni
```
A    estateprivate.com           YOUR_IP
A    api.estateprivate.com       YOUR_IP
A    import.estateprivate.com    YOUR_IP
```

### 2. SSL Certifikaty
```bash
sudo certbot --nginx -d estateprivate.com \
  -d api.estateprivate.com \
  -d import.estateprivate.com
```

### 3. Nginx Konfigurace
```nginx
server {
    listen 443 ssl;
    server_name import.estateprivate.com;
    
    location / {
        proxy_pass http://localhost:3001/api/import;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Environment Variables
```bash
FRONTEND_URL=https://estateprivate.com
API_URL=https://api.estateprivate.com
IMPORT_API_URL=https://import.estateprivate.com
```

---

## MONITORING

### Health Check
```bash
curl https://import.estateprivate.com/stats \
  -H "X-API-Key: YOUR_KEY"
```

### Log Files
```bash
# Import logs v databazi
SELECT * FROM import_logs ORDER BY created_at DESC LIMIT 10;

# Server logs
tail -f /var/log/estateprivate/backend.log
```

### Statistiky
```sql
-- Celkovy pocet importu
SELECT COUNT(*) FROM import_logs;

-- Success rate
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
  ROUND(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as success_rate
FROM import_logs;

-- Top RK
SELECT 
  s.name,
  COUNT(*) as imports
FROM import_logs l
JOIN import_sources s ON l.source_id = s.id
GROUP BY s.id
ORDER BY imports DESC;
```

---

## DALSI KROKY

### Priorita 1 (Tyden 1)
- [ ] Admin UI pro spravu import sources
- [ ] Generovani novych API klicu
- [ ] Deaktivace/aktivace RK
- [ ] Zobrazeni statistik v admin rozhrani

### Priorita 2 (Tyden 2)
- [ ] Import fotografii
- [ ] Import videi
- [ ] Batch import (vice nemovitosti najednou)
- [ ] Webhook notifikace

### Priorita 3 (Tyden 3)
- [ ] IP whitelisting
- [ ] Async zpracovani
- [ ] Retry mechanismus
- [ ] Email notifikace pri chybach

---

## ZNAMA OMEZENI

1. **Fotografie**
   - Zatim nejsou implementovane
   - Potreba pridat endpoint pro upload

2. **Videa**
   - Zatim nejsou implementovane
   - Potreba async zpracovani

3. **Batch Import**
   - Zatim jen jednotlive nemovitosti
   - Potreba optimalizace pro vice requestu

4. **Webhooks**
   - Zatim nejsou implementovane
   - RK musi aktivne dotazovat API

---

## PODPORA

### Kontakt
- Email: info@estateprivate.com
- Dokumentace: https://docs.estateprivate.com/import-api
- Status: https://status.estateprivate.com

### Testovaci Pristup
- API Key: `test_api_key_123456789`
- Endpoint: `http://localhost:3001/api/import`
- Rate Limit: 100 req/h

---

## ZAVER

**Status:** HOTOVO A OTESTOVANO

**Implementovano:**
- Kompletni Import API
- Autentizace s API klici
- Rate limiting
- Audit log
- Mapovani dat
- Validace
- Error handling

**Vysledek:**
- Vsechny testy prosly
- Pripraveno pro produkci
- Dokumentace kompletni

**Dalsi kroky:**
- Admin UI pro spravu RK
- Import fotografii a videi
- Batch import

---

**Vytvoreno:** 26. rijna 2024  
**Verze:** 1.0  
**Commit:** 7c05c53
