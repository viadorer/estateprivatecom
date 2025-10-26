# Analýza Sreality Importního Rozhraní

**Datum:** 26. října 2024  
**Verze API:** 4.0.0

---

## PŘEHLED SREALITY API

### Co je Sreality Import?

Sreality.cz poskytuje XML-RPC rozhraní pro import realitních nabídek od třetích stran (realitních kanceláří). My bychom v tomto případě byli **zdrojem dat** (jako Sreality), kam se importují nabídky od jiných RK.

**Důležité:** Dokumentace popisuje **export DO Sreality**, my potřebujeme **import OD třetích stran**.

---

## KLÍČOVÉ KONCEPTY

### 1. Autentizace

**Sreality používá:**
- XML-RPC protokol na `https://import.sreality.cz/RPC2`
- Session-based autentizace s MD5 hashováním
- Každý request mění session_id

```javascript
// Výpočet session_id
fixedPart = session_id[0:48]
varPart = md5(session_id + md5(password) + software_key)
session_id = fixedPart + varPart
```

**Pro náš systém:**
- Můžeme použít jednodušší JWT autentizaci (už máme)
- API klíč pro každou RK
- Rate limiting per RK

### 2. Datová Struktura Inzerátu

**Povinné položky:**
- `advert_function` - Typ (1=Prodej, 2=Pronájem, 3=Dražby, 4=Podíly)
- `advert_type` - Kategorie (1=Byty, 2=Domy, 3=Pozemky, 4=Komerční, 5=Ostatní)
- `advert_subtype` - Podkategorie (1+kk, 2+1, atd.)
- `advert_price` - Cena
- `advert_price_currency` - Měna (1=Kč, 2=USD, 3=EUR)
- `advert_price_unit` - Jednotka (za nemovitost, za měsíc, atd.)
- `description` - Popis
- `locality_city` - Město
- `usable_area` - Užitná plocha

**Nepovinné položky (100+):**
- Fotografie (max 100)
- Videa (max 10)
- GPS souřadnice
- Energetický štítek
- Vybavení (balkón, terasa, sklep, atd.)

### 3. Správa Fotografií

- Min rozlišení: 480x360
- Max velikost: 100 MB
- Max počet: 100 fotek
- Formáty: JPEG, PNG, GIF
- Typy: hlavní foto, vedlejší foto, půdorys, 360° foto

### 4. Správa Videí

- Max velikost: 3 GB
- Max počet: 10 videí
- Podporované formáty: všechny ffmpeg formáty
- Zpracování: 3-10 minut (asynchronní)

---

## MAPOVÁNÍ NA NÁŠ SYSTÉM

### Naše Databáze → Sreality Formát

| Naše pole | Sreality pole | Poznámka |
|-----------|---------------|----------|
| transaction_type | advert_function | sale→1, rent→2 |
| property_type | advert_type | flat→1, house→2, land→3, commercial→4 |
| property_subtype | advert_subtype | Potřeba mapování |
| price | advert_price | Přímý převod |
| description | description | Přímý převod |
| city | locality_city | Přímý převod |
| street | locality_street | Přímý převod |
| area | usable_area | Přímý převod |
| images | photos | JSON array → multiple uploads |

### Číselníky - Mapování

**transaction_type:**
```javascript
const TRANSACTION_TYPE_MAP = {
  'sale': 1,      // Prodej
  'rent': 2,      // Pronájem
  'auction': 3,   // Dražby
  'share': 4      // Podíly
};
```

**property_type:**
```javascript
const PROPERTY_TYPE_MAP = {
  'flat': 1,       // Byty
  'house': 2,      // Domy
  'land': 3,       // Pozemky
  'commercial': 4, // Komerční
  'other': 5       // Ostatní
};
```

**property_subtype (Byty):**
```javascript
const FLAT_SUBTYPE_MAP = {
  '1+kk': 2,
  '1+1': 3,
  '2+kk': 4,
  '2+1': 5,
  '3+kk': 6,
  '3+1': 7,
  '4+kk': 8,
  '4+1': 9,
  '5+kk': 10,
  '5+1': 11,
  '6+': 12,
  'atypical': 16
};
```

---

## NÁVRH IMPLEMENTACE

### Architektura

```
┌─────────────────┐
│  Třetí strana   │ (Realitní kancelář)
│  (RK)           │
└────────┬────────┘
         │ HTTP POST/PUT/DELETE
         │ JSON format
         ▼
┌─────────────────────────────────┐
│  Estate Private API             │
│  /api/import/*                  │
│                                 │
│  ┌──────────────────────────┐  │
│  │ Import Controller        │  │
│  │ - Autentizace (API key)  │  │
│  │ - Validace dat           │  │
│  │ - Mapování číselníků     │  │
│  │ - Rate limiting          │  │
│  └──────────┬───────────────┘  │
│             │                   │
│             ▼                   │
│  ┌──────────────────────────┐  │
│  │ Import Service           │  │
│  │ - Zpracování fotek       │  │
│  │ - Zpracování videí       │  │
│  │ - Deduplikace            │  │
│  │ - Audit log              │  │
│  └──────────┬───────────────┘  │
│             │                   │
│             ▼                   │
│  ┌──────────────────────────┐  │
│  │ Database                 │  │
│  │ - properties             │  │
│  │ - import_sources         │  │
│  │ - import_logs            │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
```

### Nové Databázové Tabulky

```sql
-- Zdroje importu (RK)
CREATE TABLE import_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  is_active INTEGER DEFAULT 1,
  rate_limit INTEGER DEFAULT 100, -- requests per hour
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Log importů
CREATE TABLE import_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  entity_type TEXT NOT NULL, -- 'property', 'photo', 'video'
  entity_id INTEGER,
  external_id TEXT, -- ID z RK systému
  status TEXT NOT NULL, -- 'success', 'error'
  error_message TEXT,
  request_data TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (source_id) REFERENCES import_sources(id)
);

-- Mapování externích ID
CREATE TABLE import_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER NOT NULL,
  external_id TEXT NOT NULL,
  internal_id INTEGER NOT NULL,
  entity_type TEXT NOT NULL, -- 'property', 'photo', 'video'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (source_id) REFERENCES import_sources(id),
  UNIQUE(source_id, external_id, entity_type)
);
```

### API Endpointy

```javascript
// Autentizace
POST /api/import/auth/login
  Body: { api_key: string }
  Response: { token: string, expires_in: number }

// Správa nemovitostí
POST /api/import/properties
  Headers: { Authorization: "Bearer TOKEN" }
  Body: PropertyImportData
  Response: { success: true, property_id: number, external_id: string }

PUT /api/import/properties/:external_id
  Headers: { Authorization: "Bearer TOKEN" }
  Body: PropertyImportData
  Response: { success: true, property_id: number }

DELETE /api/import/properties/:external_id
  Headers: { Authorization: "Bearer TOKEN" }
  Response: { success: true }

GET /api/import/properties
  Headers: { Authorization: "Bearer TOKEN" }
  Response: { properties: Array<PropertySummary> }

// Správa fotografií
POST /api/import/properties/:external_id/photos
  Headers: { Authorization: "Bearer TOKEN" }
  Body: multipart/form-data (image + metadata)
  Response: { success: true, photo_id: number }

DELETE /api/import/properties/:external_id/photos/:photo_id
  Headers: { Authorization: "Bearer TOKEN" }
  Response: { success: true }

// Správa videí
POST /api/import/properties/:external_id/videos
  Headers: { Authorization: "Bearer TOKEN" }
  Body: multipart/form-data (video + metadata)
  Response: { success: true, video_id: number, status: 'processing' }

// Statistiky
GET /api/import/stats
  Headers: { Authorization: "Bearer TOKEN" }
  Query: { from: date, to: date }
  Response: { stats: ImportStats }
```

### Datový Formát Import Request

```javascript
// POST /api/import/properties
{
  // Identifikace
  "external_id": "RK123456", // ID z RK systému
  
  // Základní info
  "transaction_type": "sale", // sale, rent, auction, share
  "property_type": "flat", // flat, house, land, commercial, other
  "property_subtype": "2+kk",
  
  // Cena
  "price": 5000000,
  "price_currency": "CZK", // CZK, USD, EUR
  "price_unit": "total", // total, per_month, per_m2, per_m2_month
  "price_negotiable": false,
  
  // Popis
  "title": "Moderní byt 2+kk v centru Prahy",
  "description": "Krásný světlý byt...",
  "description_en": "Beautiful bright apartment...",
  
  // Lokace
  "city": "Praha",
  "district": "Vinohrady",
  "street": "Korunní",
  "street_number": "1234/56",
  "zip": "12000",
  "latitude": 50.0755,
  "longitude": 14.4378,
  
  // Parametry
  "area": 65, // m2
  "floor": 3,
  "total_floors": 5,
  "rooms": 2,
  "bedrooms": 1,
  "bathrooms": 1,
  
  // Vybavení (boolean)
  "balcony": true,
  "terrace": false,
  "cellar": true,
  "parking": true,
  "elevator": true,
  "furnished": "fully", // none, partly, fully
  
  // Stav
  "building_condition": "after_reconstruction",
  "building_type": "brick",
  "ownership": "personal", // personal, cooperative, state
  
  // Energie
  "energy_class": "B",
  "heating": ["central_gas", "floor"],
  
  // Kontakt
  "agent_id": 123, // ID makléře v našem systému
  
  // Metadata
  "published": true,
  "available_from": "2024-11-01",
  "expires_at": "2025-01-01"
}
```

---

## IMPLEMENTACE - KROK ZA KROKEM

### Fáze 1: Základní Infrastruktura (2-3 dny)

1. **Databázové tabulky**
   - `import_sources`
   - `import_logs`
   - `import_mappings`

2. **API klíče pro RK**
   - Generování API klíčů
   - Správa v admin rozhraní

3. **Autentizace**
   - Middleware pro ověření API klíče
   - Rate limiting per source

### Fáze 2: Import Nemovitostí (3-4 dny)

1. **Mapování číselníků**
   - Vytvoření mapovacích funkcí
   - Validace vstupních dat

2. **CRUD operace**
   - POST /api/import/properties (create)
   - PUT /api/import/properties/:id (update)
   - DELETE /api/import/properties/:id (delete)
   - GET /api/import/properties (list)

3. **Deduplikace**
   - Kontrola duplicit podle adresy
   - Kontrola duplicit podle external_id

### Fáze 3: Import Fotografií (2 dny)

1. **Upload fotografií**
   - Multipart/form-data handling
   - Komprese pomocí Sharp
   - Uložení do uploads/

2. **Správa fotografií**
   - Nastavení hlavní fotky
   - Pořadí fotek
   - Mazání fotek

### Fáze 4: Import Videí (2 dny)

1. **Upload videí**
   - Asynchronní zpracování
   - Fronta pro zpracování
   - Status tracking

2. **Správa videí**
   - Seznam videí
   - Mazání videí

### Fáze 5: Monitoring & Statistiky (1 den)

1. **Audit log**
   - Logování všech importů
   - Error tracking

2. **Statistiky**
   - Počet importů per source
   - Success rate
   - Error rate

---

## BEZPEČNOST

### 1. Autentizace
- API klíč v Authorization header
- JWT token s expirací
- Rate limiting per source

### 2. Validace
- Validace všech vstupních dat
- Sanitizace HTML v popisech
- Kontrola velikosti souborů

### 3. Rate Limiting
```javascript
const importLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hodina
  max: 100, // max 100 requestů
  keyGenerator: (req) => req.importSource.id,
  message: 'Překročen limit importů'
});
```

### 4. Audit Log
- Logování všech operací
- IP adresa
- User agent
- Request data

---

## PŘÍKLAD IMPLEMENTACE

### Backend - Import Controller

```javascript
// backend/importController.js
import db from './database.js';
import { validatePropertyData, mapToInternalFormat } from './importMapper.js';

// Middleware pro ověření API klíče
export const authenticateImportSource = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API klíč chybí' });
  }
  
  const source = db.prepare(`
    SELECT * FROM import_sources 
    WHERE api_key = ? AND is_active = 1
  `).get(apiKey);
  
  if (!source) {
    return res.status(401).json({ error: 'Neplatný API klíč' });
  }
  
  req.importSource = source;
  next();
};

// Import nemovitosti
export const importProperty = async (req, res) => {
  try {
    const externalData = req.body;
    
    // Validace
    const validation = validatePropertyData(externalData);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Neplatná data', 
        details: validation.errors 
      });
    }
    
    // Mapování na náš formát
    const internalData = mapToInternalFormat(externalData);
    
    // Kontrola, zda už existuje
    const existing = db.prepare(`
      SELECT internal_id FROM import_mappings 
      WHERE source_id = ? AND external_id = ? AND entity_type = 'property'
    `).get(req.importSource.id, externalData.external_id);
    
    let propertyId;
    
    if (existing) {
      // Update
      db.prepare(`
        UPDATE properties 
        SET title = ?, description = ?, price = ?, ...
        WHERE id = ?
      `).run(...Object.values(internalData), existing.internal_id);
      
      propertyId = existing.internal_id;
    } else {
      // Create
      const result = db.prepare(`
        INSERT INTO properties (title, description, price, ...)
        VALUES (?, ?, ?, ...)
      `).run(...Object.values(internalData));
      
      propertyId = result.lastInsertRowid;
      
      // Uložit mapování
      db.prepare(`
        INSERT INTO import_mappings (source_id, external_id, internal_id, entity_type)
        VALUES (?, ?, ?, 'property')
      `).run(req.importSource.id, externalData.external_id, propertyId);
    }
    
    // Log
    db.prepare(`
      INSERT INTO import_logs (source_id, action, entity_type, entity_id, external_id, status)
      VALUES (?, ?, 'property', ?, ?, 'success')
    `).run(
      req.importSource.id, 
      existing ? 'update' : 'create',
      propertyId,
      externalData.external_id
    );
    
    res.json({ 
      success: true, 
      property_id: propertyId,
      external_id: externalData.external_id
    });
    
  } catch (error) {
    console.error('Chyba při importu:', error);
    
    // Log error
    db.prepare(`
      INSERT INTO import_logs (source_id, action, entity_type, status, error_message, request_data)
      VALUES (?, 'create', 'property', 'error', ?, ?)
    `).run(
      req.importSource.id,
      error.message,
      JSON.stringify(req.body)
    );
    
    res.status(500).json({ error: error.message });
  }
};
```

---

## TESTOVÁNÍ

### Test 1: Import nemovitosti
```bash
curl -X POST http://localhost:3001/api/import/properties \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "RK123",
    "transaction_type": "sale",
    "property_type": "flat",
    "property_subtype": "2+kk",
    "price": 5000000,
    "title": "Test byt",
    "description": "Popis...",
    "city": "Praha",
    "area": 65
  }'
```

### Test 2: Update nemovitosti
```bash
curl -X PUT http://localhost:3001/api/import/properties/RK123 \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 5500000
  }'
```

### Test 3: Smazání nemovitosti
```bash
curl -X DELETE http://localhost:3001/api/import/properties/RK123 \
  -H "X-API-Key: YOUR_API_KEY"
```

---

## ČASOVÝ ODHAD

| Fáze | Popis | Čas |
|------|-------|-----|
| 1 | Databáze + API klíče | 2-3 dny |
| 2 | Import nemovitostí | 3-4 dny |
| 3 | Import fotografií | 2 dny |
| 4 | Import videí | 2 dny |
| 5 | Monitoring | 1 den |
| **Celkem** | | **10-12 dní** |

---

## ZÁVĚR

**Doporučení:**
1. Začít s Fází 1 (infrastruktura)
2. Implementovat Fázi 2 (základní import)
3. Otestovat s jednou RK
4. Postupně přidat fotky a videa

**Výhody našeho řešení:**
- Jednodušší než Sreality XML-RPC
- RESTful API (JSON)
- JWT autentizace (už máme)
- Rate limiting (už máme)
- Audit log (už máme)

**Náklady:** 0 Kč (vše vlastní implementace)

---

**Vytvořeno:** 26. října 2024  
**Verze:** 1.0
