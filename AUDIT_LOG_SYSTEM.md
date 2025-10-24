# 📊 Audit Log Systém

## Přehled

Kompletní systém pro sledování všech akcí uživatelů v realitní aplikaci. Každá důležitá akce je zaznamenána do databáze s detailními informacemi.

---

## 🗄️ Databázová Struktura

### Tabulka `audit_logs`

```sql
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,           -- ID uživatele, který akci provedl
  action TEXT NOT NULL,                -- Typ akce (create, update, delete, view, export, atd.)
  entity_type TEXT NOT NULL,           -- Typ entity (property, demand, user, atd.)
  entity_id INTEGER,                   -- ID konkrétní entity
  details TEXT,                        -- Detailní popis akce
  ip_address TEXT,                     -- IP adresa uživatele
  user_agent TEXT,                     -- Browser/zařízení uživatele
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 📝 Typy Akcí (Actions)

### **Základní CRUD operace**
- `create` - Vytvoření nové entity
- `update` - Úprava existující entity
- `delete` - Smazání entity
- `view` - Zobrazení detailu entity
- `deactivate` - Deaktivace entity (soft delete)

### **Autentizace**
- `login` - Přihlášení uživatele
- `logout` - Odhlášení uživatele
- `register` - Registrace nového uživatele

### **Nemovitosti**
- `export` - Export nemovitosti (PDF, Excel, Word)
- `print` - Tisk nemovitosti
- `share` - Sdílení nemovitosti (email, link, social)
- `favorite_add` - Přidání do oblíbených
- `favorite_remove` - Odebrání z oblíbených
- `download_image` - Stažení obrázku nemovitosti

### **Poptávky**
- `status_change` - Změna stavu poptávky

### **Komunikace**
- `contact_agent` - Kontaktování agenta
- `search` - Vyhledávání/filtrování

### **Ochrana dat**
- `copy_text` - Kopírování textu
- `right_click_image` - Pravé tlačítko na obrázku
- `drag_image` - Pokus o přetažení obrázku

---

## 🎯 Typy Entit (Entity Types)

- `property` - Nemovitost
- `demand` - Poptávka
- `user` - Uživatel
- `company` - Společnost
- `content` - Obecný obsah (pro kopírování textu)
- `image` - Obrázek

---

## 🔌 API Endpointy

### **Získání audit logů** (pouze admin)
```http
GET /api/audit-logs
```

**Query parametry:**
- `user_id` - Filtr podle uživatele
- `action` - Filtr podle typu akce
- `entity_type` - Filtr podle typu entity
- `date_from` - Datum od (YYYY-MM-DD)
- `date_to` - Datum do (YYYY-MM-DD)

**Odpověď:**
```json
[
  {
    "id": 1,
    "user_id": 5,
    "user_name": "Jan Dvořák",
    "user_email": "jan.dvorak@email.cz",
    "action": "view",
    "entity_type": "property",
    "entity_id": 3,
    "details": "Zobrazení nemovitosti: Moderní byt 2+kk Praha",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "created_at": "2024-10-22 13:45:30"
  }
]
```

### **Logování akce z frontendu**
```http
POST /api/audit-logs
```

**Body:**
```json
{
  "user_id": 5,
  "action": "copy_text",
  "entity_type": "content",
  "entity_id": null,
  "details": "Zkopírováno: Moderní byt v centru Prahy..."
}
```

### **Logování exportu nemovitosti**
```http
POST /api/properties/:id/export
```

**Body:**
```json
{
  "user_id": 5,
  "format": "pdf"
}
```

### **Logování tisku**
```http
POST /api/properties/:id/print
```

**Body:**
```json
{
  "user_id": 5
}
```

### **Logování sdílení**
```http
POST /api/properties/:id/share
```

**Body:**
```json
{
  "user_id": 5,
  "method": "email",
  "recipient": "prijemce@email.cz"
}
```

### **Logování oblíbených**
```http
POST /api/properties/:id/favorite
```

**Body:**
```json
{
  "user_id": 5,
  "action": "add"
}
```

### **Logování stažení obrázku**
```http
POST /api/properties/:id/download-image
```

**Body:**
```json
{
  "user_id": 5,
  "image_url": "https://..."
}
```

### **Logování kontaktování agenta**
```http
POST /api/contact-agent
```

**Body:**
```json
{
  "user_id": 5,
  "agent_id": 2,
  "property_id": 3,
  "message_type": "email"
}
```

### **Logování vyhledávání**
```http
POST /api/search-log
```

**Body:**
```json
{
  "user_id": 5,
  "search_type": "properties",
  "filters": {
    "city": "Praha",
    "price_max": 8000000,
    "rooms": 3
  }
}
```

---

## 💻 Použití ve Frontendu

### **Automatické logování**

Frontend automaticky loguje tyto akce:

```javascript
// Kopírování textu
document.addEventListener('copy', (e) => {
  const copiedText = window.getSelection().toString()
  if (copiedText.length > 10) {
    logUserAction('copy_text', 'content', null, `Zkopírováno: ${copiedText}`)
  }
})

// Pravé tlačítko na obrázku
document.addEventListener('contextmenu', (e) => {
  if (e.target.tagName === 'IMG') {
    logUserAction('right_click_image', 'image', null, `Pravé tlačítko na: ${e.target.src}`)
  }
})

// Drag & drop obrázků
document.addEventListener('dragstart', (e) => {
  if (e.target.tagName === 'IMG') {
    logUserAction('drag_image', 'image', null, `Pokus o přetažení: ${e.target.src}`)
  }
})
```

### **Manuální logování**

```javascript
// Zobrazení detailu nemovitosti
const handleViewProperty = (property) => {
  logUserAction('view', 'property', property.id, `Zobrazení nemovitosti: ${property.title}`)
  setShowPropertyDetail(true)
}

// Export nemovitosti
const handleExport = async (propertyId, format) => {
  await fetch(`/api/properties/${propertyId}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: currentUser.id, format })
  })
}

// Sdílení nemovitosti
const handleShare = async (propertyId, method, recipient) => {
  await fetch(`/api/properties/${propertyId}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      user_id: currentUser.id, 
      method, 
      recipient 
    })
  })
}
```

---

## 📊 Statistiky a Reporty

### **Nejaktivnější uživatelé**
```sql
SELECT 
  u.name,
  u.email,
  COUNT(*) as action_count
FROM audit_logs al
JOIN users u ON al.user_id = u.id
WHERE al.created_at >= DATE('now', '-30 days')
GROUP BY u.id
ORDER BY action_count DESC
LIMIT 10;
```

### **Nejprohlíženější nemovitosti**
```sql
SELECT 
  p.title,
  p.city,
  COUNT(*) as view_count
FROM audit_logs al
JOIN properties p ON al.entity_id = p.id
WHERE al.action = 'view' 
  AND al.entity_type = 'property'
  AND al.created_at >= DATE('now', '-30 days')
GROUP BY p.id
ORDER BY view_count DESC
LIMIT 10;
```

### **Aktivita podle typu akce**
```sql
SELECT 
  action,
  COUNT(*) as count
FROM audit_logs
WHERE created_at >= DATE('now', '-7 days')
GROUP BY action
ORDER BY count DESC;
```

### **Podezřelé aktivity**
```sql
-- Nadměrné kopírování textu
SELECT 
  u.name,
  u.email,
  COUNT(*) as copy_count
FROM audit_logs al
JOIN users u ON al.user_id = u.id
WHERE al.action = 'copy_text'
  AND al.created_at >= DATE('now', '-1 day')
GROUP BY u.id
HAVING copy_count > 20
ORDER BY copy_count DESC;

-- Nadměrné stahování obrázků
SELECT 
  u.name,
  u.email,
  COUNT(*) as download_count
FROM audit_logs al
JOIN users u ON al.user_id = u.id
WHERE al.action = 'download_image'
  AND al.created_at >= DATE('now', '-1 day')
GROUP BY u.id
HAVING download_count > 50
ORDER BY download_count DESC;
```

---

## 🔒 Bezpečnost a Soukromí

### **GDPR Compliance**

1. **Informování uživatelů** - Uživatelé musí být informováni o sledování jejich aktivit
2. **Právo na výmaz** - Při smazání uživatele se smažou i jeho audit logy (CASCADE)
3. **Anonymizace** - Po určité době lze IP adresy anonymizovat
4. **Přístup k datům** - Pouze admin má přístup k audit logům

### **Automatické čištění starých záznamů**

```sql
-- Smazat záznamy starší než 1 rok
DELETE FROM audit_logs 
WHERE created_at < DATE('now', '-365 days');

-- Anonymizovat IP adresy starší než 90 dní
UPDATE audit_logs 
SET ip_address = 'anonymized'
WHERE created_at < DATE('now', '-90 days')
  AND ip_address != 'anonymized';
```

---

## 📈 Dashboard pro Admina

### **Přehled aktivit**
- Graf aktivit za posledních 30 dní
- Top 10 nejaktivnějších uživatelů
- Top 10 nejprohlíženějších nemovitostí
- Rozdělení akcí podle typu

### **Filtry**
- Podle uživatele
- Podle typu akce
- Podle typu entity
- Podle data
- Podle IP adresy

### **Export**
- Export do CSV
- Export do Excel
- Export do PDF

---

## 🎯 Příklady Použití

### **Sledování zájmu o nemovitost**
```javascript
// Kolik lidí si prohlédlo tuto nemovitost?
const viewCount = db.prepare(`
  SELECT COUNT(DISTINCT user_id) as count
  FROM audit_logs
  WHERE action = 'view'
    AND entity_type = 'property'
    AND entity_id = ?
`).get(propertyId).count;
```

### **Kdo si stáhl obrázky z této nemovitosti?**
```javascript
const downloads = db.prepare(`
  SELECT u.name, u.email, al.created_at
  FROM audit_logs al
  JOIN users u ON al.user_id = u.id
  WHERE al.action = 'download_image'
    AND al.entity_type = 'property'
    AND al.entity_id = ?
  ORDER BY al.created_at DESC
`).all(propertyId);
```

### **Jaké filtry uživatelé nejčastěji používají?**
```javascript
const popularFilters = db.prepare(`
  SELECT details, COUNT(*) as count
  FROM audit_logs
  WHERE action = 'search'
    AND entity_type = 'properties'
  GROUP BY details
  ORDER BY count DESC
  LIMIT 10
`).all();
```

---

## ✅ Checklist Implementace

- [x] Databázová tabulka `audit_logs`
- [x] Backend funkce `logAction()`
- [x] API endpoint pro získání logů
- [x] API endpoint pro logování z frontendu
- [x] Automatické logování CRUD operací
- [x] Logování zobrazení detailů
- [x] Logování exportu/tisku/sdílení
- [x] Logování kopírování textu
- [x] Logování stahování obrázků
- [x] Logování kontaktování agentů
- [x] Logování vyhledávání
- [x] Admin dashboard pro audit logy
- [x] Filtry a vyhledávání v audit logu
- [ ] Export audit logů do CSV/Excel
- [ ] Automatické čištění starých záznamů
- [ ] Anonymizace IP adres
- [ ] Notifikace při podezřelých aktivitách

---

*Vytvořeno: 2024-10-22*
*Verze: 1.0*
