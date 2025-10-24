# 🔐 SPRÁVNÝ SYSTÉM PŘÍSTUPU - LOI (Letter of Intent)

**Datum:** 24. října 2024 20:34  
**Status:** ✅ OPRAVENO

---

## 🎯 **SPRÁVNÁ LOGIKA SYSTÉMU**

### **Základní Princip:**
```
Agent/Klient vidí VŠECHNY nabídky/poptávky v seznamu
Detail vidí POUZE s podepsanou LOI nebo jako vlastník
```

---

## 📊 **HIERARCHIE PŘÍSTUPU**

### **1. Seznam Nabídek/Poptávek** 👁️
```
✅ VŠICHNI vidí VŠECHNY aktivní nabídky/poptávky
✅ Prioritně zobrazeny: vlastní + související (matching)
✅ Rozdělení na kategorie:
   - Moje nabídky/poptávky
   - Podepsané (mám LOI)
   - Nepodepsané (nemám LOI)
```

### **2. Detail Nabídky/Poptávky** 🔐
```
Přístup k detailu:
1. ✅ Admin - vždy
2. ✅ Vlastník (agent_id nebo client_id)
3. ✅ Podepsaná LOI
4. ❌ Ostatní - tlačítko "Požádat o přístup"
```

---

## 🔄 **PROCES PŘÍSTUPU K DETAILU**

### **Scénář A: Vlastník**
```
Agent Jana → Klikne na svou nabídku
→ Je agent_id = Jana
→ ✅ Zobrazí se detail ROVNOU
→ Vidí: "Moje nabídka"
```

### **Scénář B: S podepsanou LOI**
```
Klient Petr → Klikne na nabídku
→ Má podepsanou LOI
→ ✅ Zobrazí se detail ROVNOU
→ Vidí: "LOI již podepsána ✅"
```

### **Scénář C: Bez LOI**
```
Klient Petr → Klikne na nabídku
→ Nemá LOI
→ ❌ Zobrazí se modal: "Požádat o přístup"
→ Tlačítko: "Podepsat LOI"
→ Proces:
   1. Klient klikne "Podepsat LOI"
   2. Zobrazí se LOI smlouva
   3. Klient souhlasí
   4. Vygeneruje se kód (email)
   5. Klient zadá kód
   6. LOI podepsána ✅
   7. Detail se zobrazí
```

---

## 📋 **ROZDĚLENÍ NABÍDEK/POPTÁVEK**

### **Pro Agenta:**

#### **Tab 1: Moje Nabídky** 🏠
```sql
SELECT * FROM properties 
WHERE agent_id = ? 
ORDER BY created_at DESC
```

#### **Tab 2: Podepsané** ✅
```sql
SELECT p.* FROM properties p
JOIN loi_signatures ls ON ls.match_property_id = p.id
WHERE ls.user_id = ? AND ls.signed_at IS NOT NULL
ORDER BY ls.signed_at DESC
```

#### **Tab 3: Související** 🎯
```sql
-- Nabídky odpovídající mým poptávkám (matching)
SELECT p.* FROM properties p
WHERE p.status = 'active'
  AND EXISTS (
    SELECT 1 FROM demands d
    WHERE d.client_id = ?
      AND p.transaction_type = d.transaction_type
      AND p.property_type = d.property_type
      -- další matching kritéria
  )
```

#### **Tab 4: Ostatní** 📦
```sql
SELECT * FROM properties 
WHERE agent_id != ? 
  AND NOT EXISTS (SELECT 1 FROM loi_signatures WHERE ...)
ORDER BY created_at DESC
```

---

### **Pro Klienta:**

#### **Tab 1: Moje Poptávky** 🔍
```sql
SELECT * FROM demands 
WHERE client_id = ? 
ORDER BY created_at DESC
```

#### **Tab 2: Podepsané** ✅
```sql
SELECT p.* FROM properties p
JOIN loi_signatures ls ON ls.match_property_id = p.id
WHERE ls.user_id = ? AND ls.signed_at IS NOT NULL
ORDER BY ls.signed_at DESC
```

#### **Tab 3: Související** 🎯
```sql
-- Nabídky odpovídající mým poptávkám
SELECT p.* FROM properties p
WHERE p.status = 'active'
  AND EXISTS (
    SELECT 1 FROM demands d
    WHERE d.client_id = ?
      AND p.transaction_type = d.transaction_type
      AND p.property_type = d.property_type
      -- matching
  )
```

#### **Tab 4: Ostatní** 📦
```sql
SELECT * FROM properties 
WHERE status = 'active'
  AND NOT EXISTS (SELECT 1 FROM loi_signatures WHERE ...)
ORDER BY created_at DESC
```

---

## 🎨 **UI/UX DESIGN**

### **Karta Nabídky v Seznamu:**
```
┌─────────────────────────────────────┐
│ 📷 Obrázek                          │
│                                     │
│ Byt 2+kk, Praha                    │
│ 8 000 000 Kč                       │
│                                     │
│ [Badge]                            │
│ - Moje nabídka 🏠                  │
│ - LOI podepsána ✅                 │
│ - Související 🎯                   │
│                                     │
│ [Zobrazit detail]                  │
└─────────────────────────────────────┘
```

### **Detail BEZ LOI:**
```
┌─────────────────────────────────────┐
│ 🔒 Přístup omezen                   │
│                                     │
│ Pro zobrazení detailu je nutné     │
│ podepsat LOI (Letter of Intent)    │
│                                     │
│ [Požádat o přístup]                │
│ [Zrušit]                           │
└─────────────────────────────────────┘
```

### **Detail S LOI:**
```
┌─────────────────────────────────────┐
│ ✅ LOI již podepsána                │
│ Podepsáno: 24.10.2024 15:30       │
│                                     │
│ [Zobrazit detail nabídky]          │
└─────────────────────────────────────┘

[Kompletní detail s galerií, parametry, kontakty...]
```

---

## 🔧 **BACKEND ENDPOINTY**

### **1. GET /api/properties/matching/:userId**
```javascript
// Vrátí VŠECHNY aktivní nabídky
// S flagy: is_mine, has_loi
// Seřazeno: vlastní > podepsané > ostatní
```

### **2. GET /api/properties/:id/check-access/:userId**
```javascript
// Kontrola přístupu k detailu
// Vrátí:
// - hasAccess: true/false
// - reason: 'owner' | 'signed_loi' | 'admin'
// - message: "LOI již podepsána" | "Vlastník nabídky"
```

### **3. POST /api/loi/request**
```javascript
// Žádost o LOI
// Vytvoří LOI záznam
// Odešle email s kódem
```

### **4. POST /api/loi/sign**
```javascript
// Podpis LOI kódem
// Ověří kód
// Označí LOI jako podepsanou
```

---

## 📧 **EMAIL WORKFLOW**

### **Email 1: Žádost o LOI**
```
Předmět: Žádost o přístup k nabídce

Dobrý den,

Uživatel Petr Novák žádá o přístup k vaší nabídce:
"Byt 2+kk, Praha, 8 mil. Kč"

Pro schválení přístupu klikněte na odkaz:
[Schválit přístup]

S pozdravem,
Estate Private
```

### **Email 2: Kód pro podpis LOI**
```
Předmět: Kód pro podpis LOI

Dobrý den Petře,

Váš kód pro podpis LOI: ABC123
Platnost: 30 minut

Pro dokončení podpisu zadejte kód v aplikaci.

S pozdravem,
Estate Private
```

### **Email 3: LOI podepsána**
```
Předmět: LOI úspěšně podepsána

Dobrý den Petře,

LOI pro nabídku "Byt 2+kk, Praha" byla úspěšně podepsána.
Nyní máte přístup k detailu nabídky.

[Zobrazit detail]

S pozdravem,
Estate Private
```

---

## 🎯 **PRIORITY ZOBRAZENÍ**

### **Řazení nabídek:**
```
1. Moje nabídky (is_mine = 1)
2. Podepsané (has_loi = 1)
3. Související (matching score > 80%)
4. Ostatní (created_at DESC)
```

### **Matching Score:**
```javascript
// Výpočet shody nabídky s poptávkou
score = 0
if (transaction_type match) score += 30
if (property_type match) score += 30
if (price in range) score += 20
if (area in range) score += 10
if (city match) score += 10
// Total: 100%
```

---

## 🔐 **BEZPEČNOST**

### **LOI Tabulka:**
```sql
CREATE TABLE loi_signatures (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  match_property_id INTEGER,
  match_demand_id INTEGER,
  code TEXT UNIQUE,
  expires_at DATETIME,
  signed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **Validace:**
```javascript
✅ Kód musí být unikátní
✅ Expirace 30 minut
✅ Jednorázové použití
✅ Vázán na uživatele a entitu
✅ Audit log všech akcí
```

---

## 📝 **SHRNUTÍ ZMĚN**

### **Původní (CHYBNÝ) systém:**
```
❌ Agent vidí pouze nabídky se smlouvou
❌ Klient vidí pouze matching nabídky
❌ Detail vyžaduje přístupový kód
```

### **Nový (SPRÁVNÝ) systém:**
```
✅ Agent/Klient vidí VŠECHNY nabídky
✅ Detail vyžaduje LOI nebo vlastnictví
✅ Tlačítko "Požádat o přístup"
✅ Rozdělení: Moje | Podepsané | Související | Ostatní
✅ Prioritní zobrazení souvisejících
```

---

**Autor:** Cascade AI  
**Schválil:** David (uživatel)  
**Verze:** 2.0 (OPRAVENO)
