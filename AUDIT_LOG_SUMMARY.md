# 📊 Souhrn Audit Log Systému

## ✅ Co bylo implementováno

### **1. Databáze**
- ✅ Tabulka `audit_logs` s kompletní strukturou
- ✅ Foreign key na `users` s CASCADE delete
- ✅ Indexy pro rychlé vyhledávání

### **2. Backend API**

#### **Automatické logování (již existující)**
- ✅ `login` - Přihlášení uživatele
- ✅ `create` - Vytvoření nemovitosti/poptávky/uživatele
- ✅ `update` - Úprava nemovitosti/poptávky/uživatele
- ✅ `delete` - Smazání nemovitosti/poptávky
- ✅ `deactivate` - Deaktivace uživatele

#### **Nově přidané endpointy**
- ✅ `GET /api/properties/:id?user_id=X` - Logování zobrazení nemovitosti
- ✅ `GET /api/demands/:id?user_id=X` - Logování zobrazení poptávky
- ✅ `GET /api/users/:id?requesting_user_id=X` - Logování zobrazení uživatele
- ✅ `POST /api/properties/:id/export` - Logování exportu (PDF, Excel, Word)
- ✅ `POST /api/properties/:id/print` - Logování tisku
- ✅ `POST /api/properties/:id/share` - Logování sdílení (email, link, social)
- ✅ `POST /api/properties/:id/favorite` - Logování oblíbených (add/remove)
- ✅ `POST /api/properties/:id/download-image` - Logování stažení obrázku
- ✅ `POST /api/demands/:id/export` - Logování exportu poptávky
- ✅ `POST /api/demands/:id/status-change` - Logování změny stavu
- ✅ `POST /api/contact-agent` - Logování kontaktování agenta
- ✅ `POST /api/search-log` - Logování vyhledávání/filtrování
- ✅ `POST /api/audit-logs` - Obecné logování z frontendu

### **3. Frontend**

#### **Automatické logování (již existující)**
- ✅ Kopírování textu (copy event)
- ✅ Pravé tlačítko na obrázku (contextmenu event)
- ✅ Drag & drop obrázků (dragstart event)
- ✅ Zobrazení detailu nemovitosti
- ✅ Zobrazení detailu poptávky

---

## 📝 Typy akcí, které se logují

### **Autentizace**
- `login` - Přihlášení

### **CRUD operace**
- `create` - Vytvoření entity
- `update` - Úprava entity
- `delete` - Smazání entity
- `deactivate` - Deaktivace entity

### **Zobrazení**
- `view` - Zobrazení detailu (nemovitost, poptávka, uživatel)

### **Export a tisk**
- `export` - Export do PDF/Excel/Word
- `print` - Tisk

### **Sdílení a komunikace**
- `share` - Sdílení (email, link, social)
- `contact_agent` - Kontaktování agenta

### **Oblíbené**
- `favorite_add` - Přidání do oblíbených
- `favorite_remove` - Odebrání z oblíbených

### **Obrázky**
- `download_image` - Stažení obrázku
- `right_click_image` - Pravé tlačítko na obrázku
- `drag_image` - Pokus o přetažení obrázku

### **Vyhledávání**
- `search` - Vyhledávání/filtrování

### **Ochrana obsahu**
- `copy_text` - Kopírování textu

### **Změny stavu**
- `status_change` - Změna stavu poptávky

---

## 🎯 Typy entit

- `property` - Nemovitost
- `demand` - Poptávka
- `user` - Uživatel
- `company` - Společnost
- `content` - Obecný obsah
- `image` - Obrázek
- `properties` - Vyhledávání nemovitostí
- `demands` - Vyhledávání poptávek

---

## 📊 Příklady použití

### **1. Zobrazit všechny akce uživatele**
```javascript
const logs = await fetch(`/api/audit-logs?user_id=5`)
```

### **2. Zobrazit, kdo si prohlédl nemovitost**
```javascript
const logs = await fetch(`/api/audit-logs?entity_type=property&entity_id=3&action=view`)
```

### **3. Logovat export nemovitosti**
```javascript
await fetch(`/api/properties/3/export`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id: 5, format: 'pdf' })
})
```

### **4. Logovat sdílení**
```javascript
await fetch(`/api/properties/3/share`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    user_id: 5, 
    method: 'email',
    recipient: 'prijemce@email.cz'
  })
})
```

### **5. Logovat vyhledávání**
```javascript
await fetch(`/api/search-log`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    user_id: 5,
    search_type: 'properties',
    filters: { city: 'Praha', price_max: 8000000 }
  })
})
```

---

## 🔍 Statistiky, které můžeš sledovat

### **Uživatelé**
- Nejaktivnější uživatelé
- Uživatelé, kteří nejvíc kopírují text
- Uživatelé, kteří nejvíc stahují obrázky
- Uživatelé, kteří nejvíc exportují

### **Nemovitosti**
- Nejprohlíženější nemovitosti
- Nejsdílenější nemovitosti
- Nemovitosti s nejvíce staženými obrázky
- Nemovitosti s nejvíce exporty

### **Aktivita**
- Graf aktivit za den/týden/měsíc
- Rozdělení akcí podle typu
- Nejčastější vyhledávací filtry
- Počet kontaktování agentů

### **Bezpečnost**
- Podezřelé aktivity (nadměrné kopírování, stahování)
- Pokusy o stažení obrázků
- Neúspěšná přihlášení (pokud implementováno)

---

## 🚀 Jak to použít ve frontendu

### **Základní funkce pro logování**
```javascript
const logUserAction = async (action, entityType, entityId, details) => {
  if (!currentUser) return
  
  try {
    await fetch(`${API_URL}/audit-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details
      })
    })
  } catch (error) {
    console.error('Chyba při logování:', error)
  }
}
```

### **Příklady volání**

#### **Zobrazení detailu**
```javascript
const handleViewProperty = (property) => {
  logUserAction('view', 'property', property.id, `Zobrazení: ${property.title}`)
  setShowPropertyDetail(true)
}
```

#### **Export**
```javascript
const handleExport = async (propertyId, format) => {
  await fetch(`/api/properties/${propertyId}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: currentUser.id, format })
  })
  alert(`Nemovitost byla exportována do ${format}`)
}
```

#### **Sdílení**
```javascript
const handleShare = async (propertyId, method) => {
  await fetch(`/api/properties/${propertyId}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      user_id: currentUser.id, 
      method 
    })
  })
  alert('Nemovitost byla sdílena')
}
```

#### **Oblíbené**
```javascript
const handleFavorite = async (propertyId, action) => {
  await fetch(`/api/properties/${propertyId}/favorite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      user_id: currentUser.id, 
      action // 'add' nebo 'remove'
    })
  })
}
```

---

## 📋 Co můžeš přidat dále

### **Vysoká priorita**
- [ ] Export audit logů do CSV/Excel
- [ ] Grafy a statistiky v admin dashboardu
- [ ] Notifikace při podezřelých aktivitách
- [ ] Filtrování podle IP adresy

### **Střední priorita**
- [ ] Automatické čištění starých záznamů (starší než 1 rok)
- [ ] Anonymizace IP adres (po 90 dnech)
- [ ] Logování neúspěšných přihlášení
- [ ] Logování změn hesla

### **Nízká priorita**
- [ ] Heatmapa aktivit na mapě
- [ ] Timeline aktivit uživatele
- [ ] Porovnání aktivit mezi uživateli
- [ ] AI detekce anomálií

---

## 🔒 GDPR a Soukromí

### **Co je implementováno**
- ✅ Cascade delete - při smazání uživatele se smažou i jeho logy
- ✅ IP adresa a user agent se ukládají pro bezpečnost

### **Co je potřeba doplnit**
- [ ] Informování uživatelů o sledování (cookie banner, privacy policy)
- [ ] Možnost exportu vlastních dat pro uživatele
- [ ] Automatická anonymizace starých dat
- [ ] Možnost požádat o výmaz dat

---

## 📖 Dokumentace

Kompletní dokumentace je v souboru `AUDIT_LOG_SYSTEM.md`, který obsahuje:
- Detailní popis databázové struktury
- Všechny API endpointy s příklady
- SQL dotazy pro statistiky
- Příklady použití ve frontendu
- GDPR compliance
- Bezpečnostní doporučení

---

## ✨ Výhody tohoto systému

1. **Kompletní sledování** - Všechny důležité akce jsou zaznamenány
2. **Bezpečnost** - Detekce podezřelých aktivit
3. **Analytika** - Statistiky o chování uživatelů
4. **GDPR ready** - Připraveno pro GDPR compliance
5. **Škálovatelné** - Snadno rozšiřitelné o další akce
6. **Výkonné** - Optimalizované SQL dotazy

---

*Vytvořeno: 2024-10-22*
*Autor: Cascade AI*
