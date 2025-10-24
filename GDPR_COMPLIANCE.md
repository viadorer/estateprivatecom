# 🔒 GDPR Compliance - Kompletní Dokumentace

## Přehled

Tento dokument popisuje implementaci GDPR (General Data Protection Regulation) v realitní aplikaci PrivateEstate v souladu s Nařízením EU 2016/679.

---

## 📋 Právní Základ

### **Správce osobních údajů**
- **Název:** PrivateEstate s.r.o.
- **IČO:** 12345678
- **Sídlo:** [Adresa]
- **Email:** gdpr@privateestate.cz
- **Telefon:** +420 XXX XXX XXX
- **Pověřenec pro ochranu osobních údajů (DPO):** [Jméno a kontakt]

### **Právní základ zpracování**
1. **Souhlas subjektu údajů** (čl. 6 odst. 1 písm. a) GDPR)
2. **Plnění smlouvy** (čl. 6 odst. 1 písm. b) GDPR)
3. **Právní povinnost** (čl. 6 odst. 1 písm. c) GDPR)
4. **Oprávněný zájem** (čl. 6 odst. 1 písm. f) GDPR)

---

## 🗄️ Databázové Tabulky

### **1. gdpr_consents** - Evidence souhlasů

```sql
CREATE TABLE gdpr_consents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,                              -- ID uživatele (může být NULL pro nepřihlášené)
  email TEXT,                                   -- Email pro identifikaci
  ip_address TEXT,                              -- IP adresa pro důkazní účely
  user_agent TEXT,                              -- Browser/zařízení
  
  -- Typy souhlasů
  consent_terms INTEGER DEFAULT 0,              -- Obchodní podmínky
  consent_privacy INTEGER DEFAULT 0,            -- Zpracování osobních údajů
  consent_marketing INTEGER DEFAULT 0,          -- Marketingová komunikace
  consent_profiling INTEGER DEFAULT 0,          -- Profilování
  consent_third_party INTEGER DEFAULT 0,        -- Sdílení třetím stranám
  consent_cookies_necessary INTEGER DEFAULT 1,  -- Nutné cookies (vždy)
  consent_cookies_analytics INTEGER DEFAULT 0,  -- Analytické cookies
  consent_cookies_marketing INTEGER DEFAULT 0,  -- Marketingové cookies
  
  -- Metadata
  consent_version TEXT DEFAULT '1.0',           -- Verze podmínek
  consent_language TEXT DEFAULT 'cs',
  consent_method TEXT,                          -- web, email, phone
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  withdrawn_at DATETIME,                        -- Datum odvolání
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### **2. gdpr_requests** - Žádosti subjektů údajů

```sql
CREATE TABLE gdpr_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  request_type TEXT NOT NULL,  -- Typ žádosti
  status TEXT DEFAULT 'pending',
  request_data TEXT,           -- JSON s detaily
  response_data TEXT,          -- JSON s odpovědí
  processed_by INTEGER,        -- Admin
  processed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Typy žádostí:**
- `export` - Právo na přenositelnost dat (čl. 20 GDPR)
- `delete` - Právo na výmaz (čl. 17 GDPR)
- `rectify` - Právo na opravu (čl. 16 GDPR)
- `restrict` - Právo na omezení zpracování (čl. 18 GDPR)
- `object` - Právo vznést námitku (čl. 21 GDPR)
- `portability` - Právo na přenositelnost (čl. 20 GDPR)

### **3. gdpr_breaches** - Evidence narušení zabezpečení

```sql
CREATE TABLE gdpr_breaches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  breach_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  affected_users INTEGER,
  description TEXT NOT NULL,
  detected_at DATETIME NOT NULL,
  reported_to_authority INTEGER DEFAULT 0,
  reported_to_users INTEGER DEFAULT 0,
  authority_report_date DATETIME,
  users_notification_date DATETIME,
  mitigation_steps TEXT,
  status TEXT DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 API Endpointy

### **Souhlasy**

#### **Uložení souhlasu**
```http
POST /api/gdpr/consent
Content-Type: application/json

{
  "user_id": 5,
  "email": "user@email.cz",
  "consent_terms": true,
  "consent_privacy": true,
  "consent_marketing": true,
  "consent_cookies_analytics": true,
  "consent_cookies_marketing": false,
  "consent_method": "web_banner"
}
```

#### **Získání souhlasů uživatele**
```http
GET /api/gdpr/consent/:userId
```

#### **Aktualizace souhlasů**
```http
PUT /api/gdpr/consent/:userId
Content-Type: application/json

{
  "consent_marketing": false,
  "consent_cookies_analytics": false
}
```

#### **Odvolání souhlasu**
```http
POST /api/gdpr/consent/:userId/withdraw
```

### **Žádosti subjektů údajů**

#### **Vytvoření žádosti**
```http
POST /api/gdpr/request
Content-Type: application/json

{
  "user_id": 5,
  "request_type": "export",
  "request_data": {
    "reason": "Chci získat kopii svých dat"
  }
}
```

#### **Získání žádostí uživatele**
```http
GET /api/gdpr/requests/:userId
```

#### **Získání všech žádostí (admin)**
```http
GET /api/gdpr/requests?status=pending
```

#### **Zpracování žádosti (admin)**
```http
PUT /api/gdpr/request/:id
Content-Type: application/json

{
  "status": "completed",
  "response_data": {
    "message": "Data byla exportována"
  },
  "processed_by": 1
}
```

### **Export dat**

#### **Export všech dat uživatele**
```http
GET /api/gdpr/export/:userId
```

**Odpověď:**
```json
{
  "user": { ... },
  "properties": [ ... ],
  "demands": [ ... ],
  "audit_logs": [ ... ],
  "gdpr_consents": [ ... ],
  "export_date": "2024-10-22T13:45:30.000Z",
  "export_format": "JSON"
}
```

---

## 🎨 Frontend Komponenty

### **GDPRBanner.jsx** - Cookie Banner

Komponenta zobrazuje cookie banner při první návštěvě:

```jsx
import GDPRBanner from './components/GDPRBanner'

function App() {
  return (
    <>
      <GDPRBanner onAccept={(consents) => {
        console.log('Souhlasy:', consents)
      }} />
      {/* Zbytek aplikace */}
    </>
  )
}
```

**Funkce:**
- ✅ Informace o cookies a zpracování dat
- ✅ Tlačítko "Přijmout vše"
- ✅ Tlačítko "Pouze nezbytné"
- ✅ Detailní nastavení cookies
- ✅ Odkazy na Privacy Policy a Terms
- ✅ Uložení do localStorage
- ✅ Odeslání na backend

---

## 📜 Práva Subjektů Údajů

### **1. Právo na přístup (čl. 15 GDPR)**

Uživatel má právo získat:
- Potvrzení, zda jsou zpracovávány jeho osobní údaje
- Kopii zpracovávaných údajů
- Informace o účelu zpracování
- Informace o příjemcích údajů
- Dobu uložení údajů

**Implementace:**
```javascript
// Uživatel může stáhnout svá data
const exportData = await fetch(`/api/gdpr/export/${userId}`)
```

### **2. Právo na opravu (čl. 16 GDPR)**

Uživatel může opravit své údaje v profilu:
```javascript
// Úprava profilu
await fetch(`/api/users/${userId}`, {
  method: 'PUT',
  body: JSON.stringify(updatedData)
})
```

### **3. Právo na výmaz (čl. 17 GDPR)**

Uživatel může požádat o smazání svých dat:
```javascript
// Vytvoření žádosti o výmaz
await fetch('/api/gdpr/request', {
  method: 'POST',
  body: JSON.stringify({
    user_id: userId,
    request_type: 'delete',
    request_data: { reason: 'Nechci již používat službu' }
  })
})
```

**Lhůta:** 30 dní od podání žádosti

### **4. Právo na omezení zpracování (čl. 18 GDPR)**

Uživatel může požádat o omezení zpracování:
```javascript
await fetch('/api/gdpr/request', {
  method: 'POST',
  body: JSON.stringify({
    user_id: userId,
    request_type: 'restrict'
  })
})
```

### **5. Právo na přenositelnost (čl. 20 GDPR)**

Uživatel může získat data ve strukturovaném formátu:
```javascript
// Export ve formátu JSON
const data = await fetch(`/api/gdpr/export/${userId}`)
```

### **6. Právo vznést námitku (čl. 21 GDPR)**

Uživatel může vznést námitku proti zpracování:
```javascript
await fetch('/api/gdpr/request', {
  method: 'POST',
  body: JSON.stringify({
    user_id: userId,
    request_type: 'object',
    request_data: { reason: 'Nesouhlasím s marketingem' }
  })
})
```

### **7. Právo odvolat souhlas (čl. 7 odst. 3 GDPR)**

Uživatel může kdykoli odvolat souhlas:
```javascript
await fetch(`/api/gdpr/consent/${userId}/withdraw`, {
  method: 'POST'
})
```

---

## 🔐 Bezpečnostní Opatření

### **Technická opatření**
- ✅ HTTPS šifrování
- ✅ Hashování hesel (bcrypt)
- ✅ SQL injection prevence (prepared statements)
- ✅ XSS prevence
- ✅ CSRF ochrana
- ✅ Rate limiting
- ✅ Audit log všech akcí

### **Organizační opatření**
- ✅ Školení zaměstnanců
- ✅ Přístupová práva (role-based)
- ✅ Pravidelné zálohy
- ✅ Incident response plán
- ✅ Data retention policy

---

## 📊 Doba Uchovávání Údajů

| Typ údajů | Doba uchovávání | Právní základ |
|-----------|-----------------|---------------|
| Uživatelské účty | Po dobu aktivního účtu + 3 roky | Smlouva |
| Audit logy | 1 rok | Oprávněný zájem |
| GDPR souhlasy | Po dobu platnosti + 3 roky | Právní povinnost |
| Nemovitosti | Po dobu aktivní nabídky + 1 rok | Smlouva |
| Poptávky | Po dobu aktivní poptávky + 1 rok | Smlouva |

### **Automatické mazání**

```sql
-- Smazat audit logy starší než 1 rok
DELETE FROM audit_logs 
WHERE created_at < DATE('now', '-365 days');

-- Anonymizovat IP adresy starší než 90 dní
UPDATE audit_logs 
SET ip_address = 'anonymized'
WHERE created_at < DATE('now', '-90 days')
  AND ip_address != 'anonymized';

-- Smazat odvolané souhlasy starší než 3 roky
DELETE FROM gdpr_consents
WHERE withdrawn_at IS NOT NULL
  AND withdrawn_at < DATE('now', '-1095 days');
```

---

## 🚨 Narušení Zabezpečení (Data Breach)

### **Postup při narušení**

1. **Detekce a zaznamenání** (okamžitě)
```javascript
await fetch('/api/gdpr/breach', {
  method: 'POST',
  body: JSON.stringify({
    breach_type: 'unauthorized_access',
    severity: 'high',
    affected_users: 150,
    description: 'Neoprávněný přístup k databázi',
    detected_at: new Date().toISOString()
  })
})
```

2. **Oznámení ÚOOÚ** (do 72 hodin)
   - Pokud narušení představuje riziko pro práva a svobody

3. **Oznámení subjektům údajů** (bez zbytečného odkladu)
   - Pokud narušení představuje vysoké riziko

4. **Dokumentace**
   - Popis narušení
   - Dopad
   - Přijatá opatření

---

## 📄 Povinné Dokumenty

### **1. Zásady ochrany osobních údajů (Privacy Policy)**

Musí obsahovat:
- Identifikaci správce
- Účel zpracování
- Právní základ
- Příjemce údajů
- Dobu uchovávání
- Práva subjektů údajů
- Právo podat stížnost ÚOOÚ

### **2. Obchodní podmínky (Terms of Service)**

### **3. Záznam o činnostech zpracování**

Podle čl. 30 GDPR musí správce vést:
- Účel zpracování
- Kategorie subjektů údajů
- Kategorie osobních údajů
- Kategorie příjemců
- Předání do třetích zemí
- Lhůty pro výmaz
- Technická a organizační opatření

---

## ✅ Checklist Compliance

### **Základní požadavky**
- [x] Právní základ pro zpracování
- [x] Informační povinnost (Privacy Policy)
- [x] Získání souhlasu
- [x] Možnost odvolat souhlas
- [x] Právo na přístup k údajům
- [x] Právo na opravu
- [x] Právo na výmaz
- [x] Právo na přenositelnost
- [x] Audit log
- [x] Bezpečnostní opatření

### **Technická implementace**
- [x] Cookie banner
- [x] GDPR consent API
- [x] Export dat
- [x] Smazání dat
- [x] Audit log
- [x] Šifrování hesel
- [x] HTTPS

### **Dokumentace**
- [x] Privacy Policy
- [ ] Terms of Service
- [ ] Cookie Policy
- [ ] Záznam o činnostech zpracování
- [ ] Incident response plán
- [ ] Data retention policy

### **Procesy**
- [ ] Školení zaměstnanců
- [ ] Proces pro žádosti subjektů údajů
- [ ] Proces pro data breach
- [ ] Pravidelné audity
- [ ] Pravidelné zálohy

---

## 📞 Kontakt pro GDPR

**Email:** gdpr@privateestate.cz  
**Telefon:** +420 XXX XXX XXX  
**Adresa:** [Adresa společnosti]

**Pověřenec pro ochranu osobních údajů (DPO):**  
[Jméno]  
[Email]  
[Telefon]

**Úřad pro ochranu osobních údajů (ÚOOÚ):**  
Pplk. Sochora 27  
170 00 Praha 7  
Tel.: +420 234 665 111  
Email: posta@uoou.cz  
Web: www.uoou.cz

---

## 📚 Užitečné Odkazy

- [GDPR - Plné znění (EUR-Lex)](https://eur-lex.europa.eu/legal-content/CS/TXT/?uri=CELEX:32016R0679)
- [ÚOOÚ - Úřad pro ochranu osobních údajů](https://www.uoou.cz/)
- [GDPR Info - Neoficiální průvodce](https://gdpr-info.eu/)
- [ICO - UK GDPR Guidance](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/)

---

*Poslední aktualizace: 2024-10-22*  
*Verze: 1.0*  
*Autor: PrivateEstate s.r.o.*
