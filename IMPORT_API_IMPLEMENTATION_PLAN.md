# Implementační Plán - Import API

**Datum:** 26. října 2024  
**Priorita:** STŘEDNÍ  
**Odhad:** 10-12 dní

---

## RYCHLÝ START

### Co implementujeme?

Importní rozhraní pro příjem realitních nabídek od třetích stran (realitních kanceláří).

**Analogie:** Jsme jako Sreality.cz, kam se importují nabídky z jiných RK systémů.

---

## FÁZE 1: DATABÁZE (Den 1)

### Nové tabulky

```sql
-- backend/migrations/001_import_tables.sql

-- Zdroje importu (RK)
CREATE TABLE IF NOT EXISTS import_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  contact_email TEXT,
  contact_phone TEXT,
  is_active INTEGER DEFAULT 1,
  rate_limit INTEGER DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Log importů
CREATE TABLE IF NOT EXISTS import_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  external_id TEXT,
  status TEXT NOT NULL,
  error_message TEXT,
  request_data TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (source_id) REFERENCES import_sources(id) ON DELETE CASCADE
);

-- Mapování externích ID
CREATE TABLE IF NOT EXISTS import_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER NOT NULL,
  external_id TEXT NOT NULL,
  internal_id INTEGER NOT NULL,
  entity_type TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (source_id) REFERENCES import_sources(id) ON DELETE CASCADE,
  UNIQUE(source_id, external_id, entity_type)
);

-- Index pro rychlé vyhledávání
CREATE INDEX IF NOT EXISTS idx_import_logs_source ON import_logs(source_id, created_at);
CREATE INDEX IF NOT EXISTS idx_import_mappings_lookup ON import_mappings(source_id, external_id, entity_type);
```

### Přidání do database.js

```javascript
// backend/database.js
// Přidat za existující tabulky

db.exec(`
  -- Import tables zde
  ${SQL_Z_MIGRACE}
`);

// Vložit testovací import source
const testSource = db.prepare(`
  INSERT OR IGNORE INTO import_sources (id, name, api_key, contact_email, is_active)
  VALUES (1, 'Test RK', 'test_api_key_123456', 'test@rk.cz', 1)
`).run();

console.log('Import tables created');
```

---

## FÁZE 2: MAPOVÁNÍ ČÍSELNÍKŮ (Den 1-2)

### Vytvořit importMapper.js

```javascript
// backend/importMapper.js

// Mapování typů transakce
export const TRANSACTION_TYPE_MAP = {
  'sale': 'sale',
  'rent': 'rent',
  'auction': 'sale', // Dražby jako prodej
  'share': 'sale'    // Podíly jako prodej
};

// Mapování typů nemovitostí
export const PROPERTY_TYPE_MAP = {
  'flat': 'flat',
  'house': 'house',
  'land': 'land',
  'commercial': 'commercial',
  'other': 'other'
};

// Mapování podtypů bytů
export const FLAT_SUBTYPE_MAP = {
  '1+kk': '1+kk',
  '1+1': '1+1',
  '2+kk': '2+kk',
  '2+1': '2+1',
  '3+kk': '3+kk',
  '3+1': '3+1',
  '4+kk': '4+kk',
  '4+1': '4+1',
  '5+kk': '5+kk',
  '5+1': '5+1',
  '6+': '6+kk',
  'atypical': 'atypical'
};

// Mapování podtypů domů
export const HOUSE_SUBTYPE_MAP = {
  'family': 'family',
  'villa': 'villa',
  'cottage': 'cottage',
  'farmhouse': 'farmhouse',
  'other': 'other'
};

// Validace vstupních dat
export function validatePropertyData(data) {
  const errors = [];
  
  // Povinná pole
  if (!data.external_id) errors.push('external_id je povinné');
  if (!data.transaction_type) errors.push('transaction_type je povinné');
  if (!data.property_type) errors.push('property_type je povinné');
  if (!data.price || data.price <= 0) errors.push('price musí být větší než 0');
  if (!data.title || data.title.length < 10) errors.push('title musí mít alespoň 10 znaků');
  if (!data.description || data.description.length < 50) errors.push('description musí mít alespoň 50 znaků');
  if (!data.city) errors.push('city je povinné');
  if (!data.area || data.area <= 0) errors.push('area musí být větší než 0');
  
  // Validace číselníků
  if (data.transaction_type && !TRANSACTION_TYPE_MAP[data.transaction_type]) {
    errors.push(`Neplatný transaction_type: ${data.transaction_type}`);
  }
  
  if (data.property_type && !PROPERTY_TYPE_MAP[data.property_type]) {
    errors.push(`Neplatný property_type: ${data.property_type}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Mapování na náš interní formát
export function mapToInternalFormat(externalData) {
  return {
    title: externalData.title,
    description: externalData.description,
    transaction_type: TRANSACTION_TYPE_MAP[externalData.transaction_type],
    property_type: PROPERTY_TYPE_MAP[externalData.property_type],
    property_subtype: externalData.property_subtype || null,
    price: parseFloat(externalData.price),
    price_note: externalData.price_note || null,
    city: externalData.city,
    district: externalData.district || null,
    street: externalData.street || null,
    latitude: externalData.latitude || null,
    longitude: externalData.longitude || null,
    area: parseInt(externalData.area),
    rooms: externalData.rooms || null,
    floor: externalData.floor || null,
    total_floors: externalData.total_floors || null,
    building_type: externalData.building_type || null,
    building_condition: externalData.building_condition || null,
    furnished: externalData.furnished || null,
    has_balcony: externalData.balcony ? 1 : 0,
    has_elevator: externalData.elevator ? 1 : 0,
    has_parking: externalData.parking ? 1 : 0,
    agent_id: externalData.agent_id || null,
    status: externalData.published ? 'active' : 'draft',
    images: '[]', // Fotky se přidají později
    main_image: null
  };
}
```

---

## FÁZE 3: API ENDPOINTY (Den 2-4)

### Middleware pro autentizaci

```javascript
// backend/importMiddleware.js
import db from './database.js';
import rateLimit from 'express-rate-limit';

// Ověření API klíče
export const authenticateImportSource = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API klíč chybí',
      message: 'Použijte header X-API-Key'
    });
  }
  
  const source = db.prepare(`
    SELECT * FROM import_sources 
    WHERE api_key = ? AND is_active = 1
  `).get(apiKey);
  
  if (!source) {
    return res.status(401).json({ 
      error: 'Neplatný API klíč',
      message: 'API klíč není aktivní nebo neexistuje'
    });
  }
  
  req.importSource = source;
  next();
};

// Rate limiting per source
export const importRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hodina
  max: (req) => req.importSource?.rate_limit || 100,
  keyGenerator: (req) => `import_${req.importSource?.id}`,
  message: { error: 'Překročen limit importů', retry_after: '1 hour' },
  standardHeaders: true,
  legacyHeaders: false
});

// Logování requestu
export const logImportRequest = (req, res, next) => {
  req.importStartTime = Date.now();
  
  // Log po dokončení requestu
  res.on('finish', () => {
    const duration = Date.now() - req.importStartTime;
    console.log(`[IMPORT] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms) - Source: ${req.importSource?.name}`);
  });
  
  next();
};
```

### Import Controller

```javascript
// backend/importController.js
import db from './database.js';
import { validatePropertyData, mapToInternalFormat } from './importMapper.js';

// Helper funkce pro logování
function logImport(sourceId, action, entityType, entityId, externalId, status, error = null, requestData = null, req) {
  db.prepare(`
    INSERT INTO import_logs (
      source_id, action, entity_type, entity_id, external_id, 
      status, error_message, request_data, ip_address, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    sourceId,
    action,
    entityType,
    entityId,
    externalId,
    status,
    error,
    requestData ? JSON.stringify(requestData) : null,
    req.ip,
    req.get('user-agent')
  );
}

// POST /api/import/properties - Vytvoření nebo aktualizace nemovitosti
export const importProperty = async (req, res) => {
  try {
    const externalData = req.body;
    
    // Validace
    const validation = validatePropertyData(externalData);
    if (!validation.valid) {
      logImport(
        req.importSource.id,
        'create',
        'property',
        null,
        externalData.external_id,
        'error',
        validation.errors.join(', '),
        externalData,
        req
      );
      
      return res.status(400).json({ 
        error: 'Neplatná data', 
        details: validation.errors 
      });
    }
    
    // Mapování na náš formát
    const internalData = mapToInternalFormat(externalData);
    
    // Kontrola, zda už existuje mapování
    const existing = db.prepare(`
      SELECT internal_id FROM import_mappings 
      WHERE source_id = ? AND external_id = ? AND entity_type = 'property'
    `).get(req.importSource.id, externalData.external_id);
    
    let propertyId;
    let action;
    
    if (existing) {
      // UPDATE existující nemovitosti
      const updateFields = Object.keys(internalData).map(key => `${key} = ?`).join(', ');
      const updateValues = [...Object.values(internalData), existing.internal_id];
      
      db.prepare(`
        UPDATE properties 
        SET ${updateFields}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(...updateValues);
      
      propertyId = existing.internal_id;
      action = 'update';
      
    } else {
      // CREATE nové nemovitosti
      const insertFields = Object.keys(internalData).join(', ');
      const insertPlaceholders = Object.keys(internalData).map(() => '?').join(', ');
      
      const result = db.prepare(`
        INSERT INTO properties (${insertFields})
        VALUES (${insertPlaceholders})
      `).run(...Object.values(internalData));
      
      propertyId = result.lastInsertRowid;
      action = 'create';
      
      // Uložit mapování
      db.prepare(`
        INSERT INTO import_mappings (source_id, external_id, internal_id, entity_type)
        VALUES (?, ?, ?, 'property')
      `).run(req.importSource.id, externalData.external_id, propertyId);
    }
    
    // Log úspěchu
    logImport(
      req.importSource.id,
      action,
      'property',
      propertyId,
      externalData.external_id,
      'success',
      null,
      null,
      req
    );
    
    res.json({ 
      success: true, 
      property_id: propertyId,
      external_id: externalData.external_id,
      action: action
    });
    
  } catch (error) {
    console.error('Chyba při importu nemovitosti:', error);
    
    logImport(
      req.importSource.id,
      'create',
      'property',
      null,
      req.body.external_id,
      'error',
      error.message,
      req.body,
      req
    );
    
    res.status(500).json({ 
      error: 'Interní chyba serveru',
      message: error.message 
    });
  }
};

// DELETE /api/import/properties/:external_id - Smazání nemovitosti
export const deleteImportedProperty = async (req, res) => {
  try {
    const { external_id } = req.params;
    
    // Najít mapování
    const mapping = db.prepare(`
      SELECT internal_id FROM import_mappings 
      WHERE source_id = ? AND external_id = ? AND entity_type = 'property'
    `).get(req.importSource.id, external_id);
    
    if (!mapping) {
      return res.status(404).json({ 
        error: 'Nemovitost nenalezena',
        external_id: external_id
      });
    }
    
    // Smazat nemovitost
    db.prepare('DELETE FROM properties WHERE id = ?').run(mapping.internal_id);
    
    // Smazat mapování
    db.prepare(`
      DELETE FROM import_mappings 
      WHERE source_id = ? AND external_id = ? AND entity_type = 'property'
    `).run(req.importSource.id, external_id);
    
    // Log
    logImport(
      req.importSource.id,
      'delete',
      'property',
      mapping.internal_id,
      external_id,
      'success',
      null,
      null,
      req
    );
    
    res.json({ 
      success: true,
      external_id: external_id
    });
    
  } catch (error) {
    console.error('Chyba při mazání nemovitosti:', error);
    
    logImport(
      req.importSource.id,
      'delete',
      'property',
      null,
      req.params.external_id,
      'error',
      error.message,
      null,
      req
    );
    
    res.status(500).json({ 
      error: 'Interní chyba serveru',
      message: error.message 
    });
  }
};

// GET /api/import/properties - Seznam importovaných nemovitostí
export const listImportedProperties = async (req, res) => {
  try {
    const properties = db.prepare(`
      SELECT 
        p.*,
        im.external_id,
        im.created_at as imported_at
      FROM properties p
      JOIN import_mappings im ON p.id = im.internal_id
      WHERE im.source_id = ? AND im.entity_type = 'property'
      ORDER BY p.created_at DESC
    `).all(req.importSource.id);
    
    res.json({ 
      success: true,
      count: properties.length,
      properties: properties
    });
    
  } catch (error) {
    console.error('Chyba při výpisu nemovitostí:', error);
    res.status(500).json({ 
      error: 'Interní chyba serveru',
      message: error.message 
    });
  }
};

// GET /api/import/stats - Statistiky importu
export const getImportStats = async (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_imports,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed,
        COUNT(DISTINCT DATE(created_at)) as active_days
      FROM import_logs
      WHERE source_id = ?
    `).get(req.importSource.id);
    
    const recentLogs = db.prepare(`
      SELECT *
      FROM import_logs
      WHERE source_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(req.importSource.id);
    
    res.json({
      success: true,
      stats: stats,
      recent_logs: recentLogs
    });
    
  } catch (error) {
    console.error('Chyba při načítání statistik:', error);
    res.status(500).json({ 
      error: 'Interní chyba serveru',
      message: error.message 
    });
  }
};
```

### Přidání routů do server.js

```javascript
// backend/server.js

import { 
  authenticateImportSource, 
  importRateLimiter, 
  logImportRequest 
} from './importMiddleware.js';

import { 
  importProperty, 
  deleteImportedProperty, 
  listImportedProperties,
  getImportStats
} from './importController.js';

// Import API routes
app.post('/api/import/properties', 
  authenticateImportSource, 
  importRateLimiter,
  logImportRequest,
  importProperty
);

app.delete('/api/import/properties/:external_id', 
  authenticateImportSource, 
  importRateLimiter,
  logImportRequest,
  deleteImportedProperty
);

app.get('/api/import/properties', 
  authenticateImportSource, 
  logImportRequest,
  listImportedProperties
);

app.get('/api/import/stats', 
  authenticateImportSource, 
  logImportRequest,
  getImportStats
);
```

---

## FÁZE 4: TESTOVÁNÍ (Den 5)

### Test Script

```bash
#!/bin/bash
# test-import-api.sh

API_KEY="test_api_key_123456"
BASE_URL="http://localhost:3001/api/import"

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
    "title": "Testovací byt 2+kk v centru Prahy",
    "description": "Krásný světlý byt po kompletní rekonstrukci. Plně vybavená kuchyň, velký balkon s výhledem na park.",
    "city": "Praha",
    "district": "Vinohrady",
    "street": "Korunní",
    "area": 65,
    "rooms": 2,
    "floor": 3,
    "total_floors": 5,
    "balcony": true,
    "parking": true,
    "agent_id": 2
  }'

echo -e "\n\n=== Test 2: Seznam nemovitostí ==="
curl "$BASE_URL/properties" \
  -H "X-API-Key: $API_KEY"

echo -e "\n\n=== Test 3: Statistiky ==="
curl "$BASE_URL/stats" \
  -H "X-API-Key: $API_KEY"

echo -e "\n\n=== Test 4: Smazání nemovitosti ==="
curl -X DELETE "$BASE_URL/properties/TEST001" \
  -H "X-API-Key: $API_KEY"
```

---

## FÁZE 5: ADMIN ROZHRANÍ (Den 6-7)

### Správa Import Sources

Přidat do admin rozhraní:

1. **Seznam import sources**
   - Tabulka se všemi RK
   - Aktivní/neaktivní status
   - API klíč (skrytý, možnost zobrazit)

2. **Vytvoření nového source**
   - Formulář s názvem, emailem, telefonem
   - Automatické generování API klíče
   - Nastavení rate limitu

3. **Statistiky per source**
   - Počet importů
   - Success rate
   - Poslední aktivita

4. **Log viewer**
   - Filtrování podle source, data, statusu
   - Detail každého importu

---

## DOKUMENTACE PRO RK

### API Dokumentace

```markdown
# Estate Private - Import API Dokumentace

## Autentizace

Všechny requesty musí obsahovat API klíč v headeru:

```
X-API-Key: VÁŠ_API_KLÍČ
```

## Rate Limiting

- Max 100 requestů za hodinu
- Po překročení: HTTP 429 Too Many Requests

## Endpointy

### POST /api/import/properties

Vytvoření nebo aktualizace nemovitosti.

**Request:**
```json
{
  "external_id": "RK123",
  "transaction_type": "sale",
  "property_type": "flat",
  "property_subtype": "2+kk",
  "price": 5000000,
  "title": "Moderní byt 2+kk",
  "description": "Popis...",
  "city": "Praha",
  "area": 65
}
```

**Response:**
```json
{
  "success": true,
  "property_id": 123,
  "external_id": "RK123",
  "action": "create"
}
```

### DELETE /api/import/properties/:external_id

Smazání nemovitosti.

**Response:**
```json
{
  "success": true,
  "external_id": "RK123"
}
```

### GET /api/import/properties

Seznam všech vašich importovaných nemovitostí.

### GET /api/import/stats

Statistiky vašich importů.
```

---

## ČASOVÝ HARMONOGRAM

| Den | Úkol | Status |
|-----|------|--------|
| 1 | Databázové tabulky + mapování | ⏳ |
| 2-4 | API endpointy + middleware | ⏳ |
| 5 | Testování | ⏳ |
| 6-7 | Admin rozhraní | ⏳ |
| 8-10 | Import fotografií + videí | ⏳ |
| 11-12 | Dokumentace + finální testy | ⏳ |

---

## DALŠÍ KROKY

1. **Schválení plánu**
2. **Vytvoření databázových tabulek**
3. **Implementace základního importu**
4. **Testování s testovacími daty**
5. **Rozšíření o fotky a videa**

---

**Vytvořeno:** 26. října 2024  
**Verze:** 1.0
