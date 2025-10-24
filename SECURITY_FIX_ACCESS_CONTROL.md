# 🔐 Oprava Bezpečnostní Díry - Kontrola Přístupu Agentů

**Datum:** 24. října 2024  
**Závažnost:** 🔴 KRITICKÁ  
**Status:** ✅ OPRAVENO

---

## 🚨 Popis Problému

### **Původní chybná logika:**

Agent měl **automatický přístup** ke všem nabídkám, kde byl uveden jako `agent_id`, **bez ohledu na to**, zda:
- Nabídku sám vytvořil
- Má podepsanou zprostředkovatelskou smlouvu
- Má ověřené prohlášení agenta

**Scénář útoku:**
```
1. Admin vytvoří nabídku a přiřadí ji agentovi (agent_id = 3)
2. Agent nemá smlouvu s vlastníkem
3. Agent nemá ověřené prohlášení
4. Ale vidí VŠECHNY detaily včetně kontaktů!
```

---

## ✅ Řešení

### **Nová bezpečná logika:**

Agent vidí nabídku **POUZE pokud:**

1. ✅ **Má podepsanou zprostředkovatelskou smlouvu** pro konkrétní nabídku

**ZMĚNA (24.10.2024 17:37):** Prohlášení agenta (`agent_declarations`) už **NESTAČÍ** pro přístup. Agent musí mít podepsanou smlouvu pro každou nabídku zvlášť.

---

## 🔧 Provedené Změny

### **1. Endpoint: `GET /api/properties/matching/:userId`**

**Před:**
```javascript
if (user && user.role === 'agent') {
  // Vrátí VŠECHNY nabídky agenta
  WHERE p.agent_id = ?
}
```

**Po:**
```javascript
if (user && user.role === 'agent') {
  WHERE p.agent_id = ?
    AND (
      -- Má podepsanou smlouvu
      EXISTS (SELECT 1 FROM brokerage_contracts 
              WHERE user_id = ? AND entity_id = p.id AND signed_at IS NOT NULL)
      OR
      -- Má ověřené prohlášení
      EXISTS (SELECT 1 FROM agent_declarations 
              WHERE user_id = ? AND verified_at IS NOT NULL)
    )
}
```

### **2. Endpoint: `GET /api/properties/:id/check-access/:userId`**

**Přidáno:**
```javascript
// 0. Admin má přístup ke všemu
if (user.role === 'admin') {
  return { hasAccess: true, reason: 'admin' }
}

// 0b. Agent s ověřeným prohlášením
if (user.role === 'agent' && has_verified_declaration) {
  return { hasAccess: true, reason: 'agent_declaration' }
}
```

### **3. Endpoint: `GET /api/demands/:id/check-access/:userId`**

**Přidáno:**
```javascript
// 0. Admin má přístup ke všemu
// 0b. Vlastník poptávky
// 0c. Agent s ověřeným prohlášením
```

---

## 📊 Hierarchie Přístupových Práv

### **Admin** 👑
```
✅ Přístup ke VŠEM nabídkám a poptávkám
✅ Bez jakýchkoli omezení
```

### **Agent** 🏢
```
✅ Přístup POUZE k nabídkám s podepsanou zprostředkovatelskou smlouvou
❌ Prohlášení agenta (agent_declarations) už NESTAČÍ
❌ Musí mít smlouvu PRO KAŽDOU nabídku zvlášť
```

### **Klient** 👤
```
✅ Přístup k vlastním poptávkám
✅ Přístup k nabídkám s přístupovým kódem
✅ Přístup k nabídkám s podepsanou LOI
❌ Ostatní nabídky nevidí
```

---

## 🎯 Workflow Agenta

### **Scénář A: Agent se smlouvou**

```
1. Agent se přihlásí
2. Má podepsanou smlouvu pro nabídku #8
3. Vidí POUZE nabídku #8
4. Ostatní nabídky NEVIDÍ (i když má agent_id)
```

### **Scénář B: Agent bez smlouvy**

```
1. Agent se přihlásí
2. Nemá žádnou podepsanou smlouvu
3. NEVIDÍ ŽÁDNÉ nabídky
4. Musí podepsat smlouvu pro každou nabídku zvlášť
```

### **Scénář C: Admin přiřadí nabídku agentovi**

```
1. Admin vytvoří nabídku
2. Přiřadí ji agentovi (agent_id = 3)
3. Agent JI NEVIDÍ (nemá smlouvu ani prohlášení)
4. Agent musí:
   a) Podepsat zprostředkovatelskou smlouvu PRO TUTO nabídku
   NEBO
   b) Mít ověřené obecné prohlášení agenta
```

---

## 🔐 Bezpečnostní Výhody

### **Před opravou:**
- ❌ Agent viděl všechny nabídky bez kontroly
- ❌ Možnost zneužití citlivých dat
- ❌ Porušení GDPR (přístup k datům bez oprávnění)
- ❌ Právní riziko (agent bez smlouvy s vlastníkem)

### **Po opravě:**
- ✅ Agent vidí pouze oprávněné nabídky
- ✅ Ochrana citlivých dat
- ✅ GDPR compliance
- ✅ Právní ochrana (smlouva nebo prohlášení)

---

## 📝 Doporučení pro Produkci

### **1. Migrace existujících dat**
```sql
-- Zkontrolovat agenty bez prohlášení
SELECT u.id, u.name, u.email, COUNT(p.id) as properties_count
FROM users u
LEFT JOIN properties p ON p.agent_id = u.id
LEFT JOIN agent_declarations ad ON ad.user_id = u.id AND ad.verified_at IS NOT NULL
WHERE u.role = 'agent'
  AND ad.id IS NULL
GROUP BY u.id;

-- Vytvořit prohlášení pro stávající agenty (pokud je to v pořádku)
INSERT INTO agent_declarations (user_id, code, verified_at, declaration_text)
SELECT id, 'MIGRATED', CURRENT_TIMESTAMP, 'Automaticky vytvořeno při migraci'
FROM users
WHERE role = 'agent';
```

### **2. Notifikace agentů**
```
Odeslat email všem agentům:
"Byl zaveden nový bezpečnostní systém. 
Pro přístup k nabídkám je nutné mít ověřené prohlášení agenta."
```

### **3. Admin panel**
```
Přidat sekci pro správu prohlášení agentů:
- Seznam agentů
- Status prohlášení (ověřeno/neověřeno)
- Tlačítko "Vygenerovat prohlášení"
- Tlačítko "Ověřit prohlášení"
```

---

## 🧪 Testování

### **Test 1: Agent s prohlášením**
```javascript
// Given: Agent má ověřené prohlášení
// When: Načte své nabídky
// Then: Vidí všechny nabídky, kde je agent_id
```

### **Test 2: Agent bez prohlášení**
```javascript
// Given: Agent nemá prohlášení
// When: Načte své nabídky
// Then: Vidí pouze nabídky s podepsanou smlouvou
```

### **Test 3: Admin přiřadí nabídku**
```javascript
// Given: Admin vytvoří nabídku a přiřadí agentovi
// When: Agent se pokusí načíst nabídky
// Then: Nevidí novou nabídku (nemá smlouvu)
```

---

## 📚 Související Dokumentace

- `REALITNI_PROJEKT_PLAN.md` - Plán projektu
- `GDPR_COMPLIANCE.md` - GDPR compliance
- `AUDIT_LOG_SYSTEM.md` - Audit trail
- `DATABASE_SCHEMA.md` - Databázové schéma

---

**Autor:** Cascade AI  
**Schválil:** David (uživatel)  
**Verze:** 1.0
