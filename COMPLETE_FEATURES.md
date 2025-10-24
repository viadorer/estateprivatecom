# 🚀 PrivateEstate - Kompletní Funkce

## ✅ CO UŽ MÁME

- ✅ Glassmorphism design
- ✅ Dashboard se statistikami
- ✅ Seznam nabídek (read-only)
- ✅ Seznam poptávek (read-only)
- ✅ Seznam uživatelů (admin only)
- ✅ Admin-only práva pro tlačítka

---

## 🎯 CO PŘIDÁME

### 1. CRUD Operace pro Nabídky (Properties)

**Funkce:**
- ✅ Zobrazení seznamu
- ⏳ Detail nabídky (modal/stránka)
- ⏳ Přidat nabídku (formulář)
- ⏳ Upravit nabídku
- ⏳ Smazat nabídku
- ⏳ Aktivovat/Deaktivovat nabídku

**Formulář přidání/úpravy:**
```jsx
- Základní info: název, popis
- Typ: prodej/pronájem, byt/dům/komerční/pozemek
- Cena + poznámka
- Lokace: město, okres, ulice, GPS
- Parametry: plocha, pokoje, patro
- Vybavení: balkon, výtah, parkování, sklep
- Stav: aktivní/rezervováno/prodáno/archivováno
- Fotky (URL)
- Agent
```

### 2. CRUD Operace pro Poptávky (Demands)

**Funkce:**
- ✅ Zobrazení seznamu
- ⏳ Detail poptávky
- ⏳ Přidat poptávku
- ⏳ Upravit poptávku
- ⏳ Smazat poptávku
- ⏳ Aktivovat/Deaktivovat poptávku

**Formulář:**
```jsx
- Klient (výběr)
- Typ transakce a nemovitosti
- Cenové rozpětí (min-max)
- Města (multi-select)
- Plocha (min-max)
- Pokoje (min-max)
- Požadované vlastnosti (checkboxy)
- Email notifikace (ano/ne)
```

### 3. CRUD Operace pro Uživatele (Users)

**Funkce:**
- ✅ Zobrazení seznamu
- ⏳ Detail uživatele
- ⏳ Přidat uživatele
- ⏳ Upravit uživatele
- ⏳ Smazat uživatele
- ⏳ Aktivovat/Deaktivovat uživatele

**Formulář:**
```jsx
- Základní: jméno, email, heslo, role
- Kontakty: telefon, telefon 2
- Adresa: ulice, město, PSČ
- Firma: výběr společnosti, pozice, IČO, DIČ
- Preference: preferovaný kontakt, newsletter
- Poznámky
```

### 4. CRUD Operace pro Společnosti (Companies)

**Funkce:**
- ⏳ Zobrazení seznamu
- ⏳ Detail společnosti
- ⏳ Přidat společnost
- ⏳ Upravit společnost
- ⏳ Smazat společnost

**Formulář:**
```jsx
- Název, IČO, DIČ
- Adresa: ulice, město, PSČ
- Kontakty: telefon, email, web
- Popis
- Logo (URL)
```

### 5. Automatické Párování (Matching)

**Funkce:**
- ⏳ Automatické spuštění při vytvoření poptávky
- ⏳ Manuální spuštění párování
- ⏳ Zobrazení shod (matches)
- ⏳ Skóre shody (0-100%)
- ⏳ Akce: Zobrazit, Mám zájem, Odmítnout

**Algoritmus:**
```javascript
Kritéria:
- Typ transakce (must match)
- Typ nemovitosti (must match)
- Cena (v rozpětí) - váha 30%
- Město (v seznamu) - váha 25%
- Plocha (v rozpětí) - váha 20%
- Pokoje (v rozpětí) - váha 15%
- Vlastnosti (match) - váha 10%

Výpočet skóre:
score = (price_match * 0.3) + (city_match * 0.25) + 
        (area_match * 0.2) + (rooms_match * 0.15) + 
        (features_match * 0.1)
```

### 6. Detailní Stránky

**Detail Nabídky:**
```jsx
- Galerie fotek (carousel)
- Všechny parametry
- Mapa s polohou
- Kontakt na agenta
- Historie změn
- Tlačítka: Upravit, Smazat, Aktivovat/Deaktivovat
- Tlačítko: Najít podobné poptávky
```

**Detail Poptávky:**
```jsx
- Všechny parametry
- Info o klientovi
- Seznam shod (matches) s % shodou
- Tlačítka: Upravit, Smazat, Aktivovat/Deaktivovat
- Tlačítko: Spustit párování
```

**Detail Uživatele:**
```jsx
- Všechny údaje
- Info o společnosti (pokud má)
- Seznam jeho nabídek (agent)
- Seznam jeho poptávek (klient)
- Historie aktivit
- Tlačítka: Upravit, Smazat, Aktivovat/Deaktivovat
```

### 7. Aktivace/Deaktivace

**Stavy:**
```
Nabídky:
- active (aktivní)
- reserved (rezervováno)
- sold (prodáno)
- archived (archivováno)

Poptávky:
- active (aktivní)
- fulfilled (splněno)
- cancelled (zrušeno)

Uživatelé:
- is_active: 1 (aktivní)
- is_active: 0 (deaktivovaný)
```

### 8. Oblíbené (Favorites)

**Funkce:**
- ⏳ Přidat do oblíbených (❤️)
- ⏳ Odebrat z oblíbených
- ⏳ Seznam oblíbených
- ⏳ Počítadlo oblíbených

### 9. Prohlídky (Viewings)

**Funkce:**
- ⏳ Naplánovat prohlídku
- ⏳ Seznam prohlídek
- ⏳ Kalendář prohlídek
- ⏳ Stavy: naplánováno, dokončeno, zrušeno

### 10. Historie (Audit Log)

**Funkce:**
- ⏳ Záznam všech změn
- ⏳ Kdo, kdy, co změnil
- ⏳ Před/po hodnotách
- ⏳ Filtry podle entity a uživatele

---

## 📝 IMPLEMENTAČNÍ PLÁN

### Fáze 1: CRUD pro Nabídky (2 hodiny)
1. Vytvořit PropertyForm komponentu
2. Přidat modal pro přidání/úpravu
3. Implementovat DELETE
4. Přidat PropertyDetail komponentu
5. Implementovat aktivaci/deaktivaci

### Fáze 2: CRUD pro Poptávky (1.5 hodiny)
1. Vytvořit DemandForm komponentu
2. Přidat modal pro přidání/úpravu
3. Implementovat DELETE
4. Přidat DemandDetail komponentu
5. Implementovat aktivaci/deaktivaci

### Fáze 3: CRUD pro Uživatele (1.5 hodiny)
1. Vytvořit UserForm komponentu
2. Přidat modal pro přidání/úpravu
3. Implementovat DELETE
4. Přidat UserDetail komponentu
5. Implementovat aktivaci/deaktivaci

### Fáze 4: CRUD pro Společnosti (1 hodina)
1. Vytvořit CompanyForm komponentu
2. Přidat Companies stránku
3. Implementovat CRUD operace
4. Přidat CompanyDetail

### Fáze 5: Automatické Párování (2 hodiny)
1. Vytvořit matching algoritmus
2. Přidat Matches komponentu
3. Implementovat zobrazení shod
4. Přidat akce (zájem, odmítnutí)

### Fáze 6: Detailní Stránky (2 hodiny)
1. Rozšířit PropertyDetail
2. Rozšířit DemandDetail
3. Rozšířit UserDetail
4. Přidat galerie a mapy

### Fáze 7: Oblíbené a Prohlídky (1.5 hodiny)
1. Implementovat Favorites
2. Implementovat Viewings
3. Přidat kalendář

### Fáze 8: Historie (1 hodina)
1. Vytvořit AuditLog komponentu
2. Implementovat timeline
3. Přidat filtry

**Celkový čas: 12-13 hodin**

---

## 🎨 UI Komponenty

### Modaly
```jsx
<PropertyModal 
  property={editingProperty}
  onSave={handleSave}
  onClose={handleClose}
/>

<DemandModal 
  demand={editingDemand}
  onSave={handleSave}
  onClose={handleClose}
/>

<UserModal 
  user={editingUser}
  companies={companies}
  onSave={handleSave}
  onClose={handleClose}
/>
```

### Detailní Stránky
```jsx
<PropertyDetail 
  propertyId={id}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onToggleStatus={handleToggleStatus}
/>
```

### Akční Tlačítka
```jsx
<div className="action-buttons">
  <button onClick={onEdit} className="glass-button">
    ✏️ Upravit
  </button>
  <button onClick={onDelete} className="glass-button-danger">
    🗑️ Smazat
  </button>
  <button onClick={onToggleStatus} className="glass-button-secondary">
    {isActive ? '⏸️ Deaktivovat' : '▶️ Aktivovat'}
  </button>
</div>
```

---

## 🔧 API Endpointy (už máme)

```
Properties:
GET    /api/properties
GET    /api/properties/:id
POST   /api/properties
PUT    /api/properties/:id
DELETE /api/properties/:id

Demands:
GET    /api/demands
GET    /api/demands/:id
POST   /api/demands
PUT    /api/demands/:id
DELETE /api/demands/:id

Users:
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id

Companies:
GET    /api/companies
GET    /api/companies/:id
POST   /api/companies
PUT    /api/companies/:id
DELETE /api/companies/:id

Matches:
GET    /api/matches
POST   /api/matches (spustit párování)

Favorites:
GET    /api/favorites/:userId
POST   /api/favorites
DELETE /api/favorites/:id

Viewings:
GET    /api/viewings
POST   /api/viewings
PUT    /api/viewings/:id
DELETE /api/viewings/:id
```

---

## 🚀 JAK POKRAČOVAT

1. **Začít s PropertyForm** - nejdůležitější funkce
2. **Přidat PropertyDetail** - zobrazení detailu
3. **Implementovat DELETE a aktivaci**
4. **Pokračovat s Demands**
5. **Pak Users a Companies**
6. **Nakonec Matching a pokročilé funkce**

**Chcete, abych začal implementovat?** 🎯
