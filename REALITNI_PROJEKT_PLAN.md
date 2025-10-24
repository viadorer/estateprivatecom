# 🏠 Realitní Projekt - Kompletní Plán Přeměny

## 📋 Přehled

Přeměna Task Manageru na **profesionální realitní aplikaci** s:
- 🏢 Databází nemovitostí (prodej/pronájem)
- 👥 Systémem uživatelských rolí a práv
- 🔍 Poptávkami a automatickým matchováním
- 🌐 Integrací Sreality API
- 📊 Pokročilým filtrováním

---

## 🗄️ Databázové Schéma

### **Tabulky**

#### 1. **users** (Uživatelé)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL, -- 'admin', 'agent', 'client'
  phone TEXT,
  avatar TEXT,
  company TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Role:**
- **admin** 👑 - Správa celého systému
- **agent** 🏢 - Realitní makléř (přidává nabídky, spravuje klienty)
- **client** 👤 - Klient (vytváří poptávky, prohlíží nabídky)

#### 2. **properties** (Nemovitosti)
```sql
CREATE TABLE properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Typ transakce
  transaction_type TEXT NOT NULL, -- 'sale', 'rent'
  
  -- Typ nemovitosti
  property_type TEXT NOT NULL, -- 'flat', 'house', 'commercial', 'land'
  property_subtype TEXT, -- '1+kk', '2+1', 'rodinny_dum', 'pozemek' atd.
  
  -- Cena
  price REAL NOT NULL,
  price_note TEXT, -- 'za měsíc', 'dohodou' atd.
  
  -- Lokace
  city TEXT NOT NULL,
  district TEXT,
  street TEXT,
  zip_code TEXT,
  latitude REAL,
  longitude REAL,
  
  -- Parametry
  area REAL, -- m²
  land_area REAL, -- m² pozemku
  rooms INTEGER,
  floor INTEGER,
  total_floors INTEGER,
  
  -- Vlastnosti
  building_type TEXT, -- 'brick', 'panel', 'wood'
  building_condition TEXT, -- 'new_building', 'after_reconstruction', 'original'
  ownership TEXT, -- 'personal', 'cooperative'
  
  -- Vybavení
  furnished TEXT, -- 'furnished', 'partly_furnished', 'not_furnished'
  has_balcony BOOLEAN DEFAULT 0,
  has_terrace BOOLEAN DEFAULT 0,
  has_cellar BOOLEAN DEFAULT 0,
  has_garage BOOLEAN DEFAULT 0,
  has_parking BOOLEAN DEFAULT 0,
  has_elevator BOOLEAN DEFAULT 0,
  has_garden BOOLEAN DEFAULT 0,
  has_pool BOOLEAN DEFAULT 0,
  
  -- Energie
  energy_rating TEXT, -- 'A', 'B', 'C', 'D', 'E', 'F', 'G'
  heating_type TEXT, -- 'gas', 'electric', 'central'
  
  -- Správa
  agent_id INTEGER NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'reserved', 'sold', 'archived'
  views_count INTEGER DEFAULT 0,
  
  -- Obrázky
  images TEXT, -- JSON array URL obrázků
  main_image TEXT,
  
  -- Sreality integrace
  sreality_id TEXT UNIQUE,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 3. **demands** (Poptávky)
```sql
CREATE TABLE demands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  
  -- Co hledá
  transaction_type TEXT NOT NULL, -- 'sale', 'rent'
  property_type TEXT NOT NULL,
  property_subtype TEXT,
  
  -- Cenové rozpětí
  price_min REAL,
  price_max REAL,
  
  -- Lokace
  cities TEXT, -- JSON array měst
  districts TEXT, -- JSON array částí
  
  -- Parametry
  area_min REAL,
  area_max REAL,
  rooms_min INTEGER,
  rooms_max INTEGER,
  floor_min INTEGER,
  floor_max INTEGER,
  
  -- Požadavky
  required_features TEXT, -- JSON array požadovaných vlastností
  
  -- Stav
  status TEXT DEFAULT 'active', -- 'active', 'fulfilled', 'cancelled'
  
  -- Notifikace
  email_notifications BOOLEAN DEFAULT 1,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 4. **matches** (Shody poptávek s nabídkami)
```sql
CREATE TABLE matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  demand_id INTEGER NOT NULL,
  property_id INTEGER NOT NULL,
  match_score INTEGER, -- 0-100 skóre shody
  status TEXT DEFAULT 'new', -- 'new', 'viewed', 'interested', 'rejected'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (demand_id) REFERENCES demands(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);
```

#### 5. **favorites** (Oblíbené)
```sql
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  property_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  UNIQUE(user_id, property_id)
);
```

#### 6. **viewings** (Prohlídky)
```sql
CREATE TABLE viewings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  agent_id INTEGER NOT NULL,
  
  scheduled_at DATETIME NOT NULL,
  duration INTEGER DEFAULT 30, -- minuty
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🎯 Systém Práv

### **Admin** 👑
- ✅ Vše
- ✅ Správa všech uživatelů
- ✅ Správa všech nemovitostí
- ✅ Statistiky a reporty
- ✅ Nastavení systému

### **Agent** 🏢 (Realitní makléř)
- ✅ Přidávání/editace/mazání vlastních nemovitostí
- ✅ Zobrazení všech nemovitostí (read-only ostatních agentů)
- ✅ Správa vlastních klientů
- ✅ Plánování prohlídek
- ✅ Zobrazení matchů pro své nemovitosti
- ❌ Nemůže mazat jiné agenty
- ❌ Nemůže měnit systémová nastavení

### **Client** 👤 (Klient)
- ✅ Vytváření poptávek
- ✅ Prohlížení nabídek
- ✅ Oblíbené nemovitosti
- ✅ Žádosti o prohlídky
- ✅ Zobrazení matchů pro své poptávky
- ❌ Nemůže přidávat nemovitosti
- ❌ Nemůže vidět kontakty ostatních klientů

---

## 🔍 Systém Matchování

### **Algoritmus**

```javascript
function calculateMatch(demand, property) {
  let score = 0;
  let maxScore = 0;
  
  // Typ transakce (MUST match)
  if (demand.transaction_type !== property.transaction_type) return 0;
  
  // Typ nemovitosti (MUST match)
  if (demand.property_type !== property.property_type) return 0;
  
  // Cena (30 bodů)
  maxScore += 30;
  if (property.price >= demand.price_min && property.price <= demand.price_max) {
    score += 30;
  } else if (property.price < demand.price_min * 1.2 || property.price > demand.price_max * 0.8) {
    score += 15; // Částečná shoda
  }
  
  // Lokace (25 bodů)
  maxScore += 25;
  if (demand.cities.includes(property.city)) {
    score += 25;
  }
  
  // Plocha (20 bodů)
  maxScore += 20;
  if (property.area >= demand.area_min && property.area <= demand.area_max) {
    score += 20;
  }
  
  // Počet pokojů (15 bodů)
  maxScore += 15;
  if (property.rooms >= demand.rooms_min && property.rooms <= demand.rooms_max) {
    score += 15;
  }
  
  // Požadované vlastnosti (10 bodů)
  maxScore += 10;
  const matchedFeatures = demand.required_features.filter(f => 
    property[f] === true
  );
  score += (matchedFeatures.length / demand.required_features.length) * 10;
  
  return Math.round((score / maxScore) * 100);
}
```

### **Kdy se vytváří match?**
- ✅ Při vytvoření nové poptávky → projdou se všechny aktivní nabídky
- ✅ Při přidání nové nabídky → projdou se všechny aktivní poptávky
- ✅ Match se vytvoří pouze pokud score >= 60%

---

## 📡 API Endpointy

### **Auth**
- `POST /api/auth/login` - Přihlášení
- `POST /api/auth/register` - Registrace

### **Users**
- `GET /api/users` - Seznam uživatelů (admin)
- `GET /api/users/:id` - Detail uživatele
- `PUT /api/users/:id` - Aktualizace
- `DELETE /api/users/:id` - Smazání (admin)

### **Properties**
- `GET /api/properties` - Seznam nemovitostí (s filtry)
- `GET /api/properties/:id` - Detail nemovitosti
- `POST /api/properties` - Přidání (agent, admin)
- `PUT /api/properties/:id` - Aktualizace (vlastník, admin)
- `DELETE /api/properties/:id` - Smazání (vlastník, admin)
- `GET /api/properties/my` - Moje nemovitosti (agent)

### **Demands**
- `GET /api/demands` - Seznam poptávek
- `GET /api/demands/:id` - Detail poptávky
- `POST /api/demands` - Vytvoření (client, agent, admin)
- `PUT /api/demands/:id` - Aktualizace (vlastník)
- `DELETE /api/demands/:id` - Smazání (vlastník)
- `GET /api/demands/my` - Moje poptávky

### **Matches**
- `GET /api/matches/demand/:id` - Shody pro poptávku
- `GET /api/matches/property/:id` - Shody pro nemovitost
- `PUT /api/matches/:id/status` - Změna stavu

### **Favorites**
- `GET /api/favorites` - Oblíbené
- `POST /api/favorites` - Přidat do oblíbených
- `DELETE /api/favorites/:id` - Odebrat

### **Viewings**
- `GET /api/viewings` - Seznam prohlídek
- `POST /api/viewings` - Naplánovat prohlídku
- `PUT /api/viewings/:id` - Aktualizovat
- `DELETE /api/viewings/:id` - Zrušit

### **Sreality**
- `GET /api/sreality/import` - Import z Sreality API
- `GET /api/sreality/sync/:id` - Synchronizace konkrétní nemovitosti

### **Stats**
- `GET /api/stats` - Statistiky (dashboard)

---

## 🎨 Frontend Komponenty

### **Stránky**

1. **Dashboard** 📊
   - Statistiky (počty nemovitostí, poptávek, matchů)
   - Poslední aktivity
   - Grafy (ceny, typy nemovitostí)

2. **Properties** 🏠 (Nabídky)
   - Seznam s filtry
   - Mapa s piny
   - Detail nemovitosti
   - Formulář pro přidání/editaci

3. **Demands** 🔍 (Poptávky)
   - Seznam poptávek
   - Formulář pro vytvoření
   - Matches pro poptávku

4. **Matches** 🎯 (Shody)
   - Seznam matchů
   - Skóre shody
   - Akce (zájem, odmítnout)

5. **Favorites** ⭐ (Oblíbené)
   - Seznam oblíbených nemovitostí

6. **Viewings** 📅 (Prohlídky)
   - Kalendář prohlídek
   - Plánování nové prohlídky

7. **Users** 👥 (Uživatelé)
   - Seznam uživatelů (admin, agent)
   - Role a oprávnění

### **Komponenty**

- `PropertyCard` - Karta nemovitosti
- `PropertyDetail` - Detail nemovitosti
- `PropertyForm` - Formulář pro nemovitost
- `PropertyFilters` - Filtry
- `PropertyMap` - Mapa s nemovitostmi
- `DemandCard` - Karta poptávky
- `DemandForm` - Formulář poptávky
- `MatchCard` - Karta shody
- `ViewingCalendar` - Kalendář prohlídek
- `RoleBadge` - Badge role
- `PriceDisplay` - Zobrazení ceny

---

## 🔧 Implementační Kroky

### **Fáze 1: Backend (2-3 hodiny)**
1. ✅ Nové databázové schéma
2. ✅ Seed data (ukázkové nemovitosti)
3. ✅ API endpointy pro properties
4. ✅ API endpointy pro demands
5. ✅ Matching algoritmus
6. ✅ Middleware pro kontrolu práv

### **Fáze 2: Frontend (3-4 hodiny)**
1. ✅ Přejmenování aplikace
2. ✅ Nové komponenty pro nemovitosti
3. ✅ Filtry a vyhledávání
4. ✅ Formuláře pro přidání nemovitostí
5. ✅ Systém poptávek
6. ✅ Zobrazení matchů
7. ✅ Mapa nemovitostí (Leaflet)

### **Fáze 3: Pokročilé funkce (2-3 hodiny)**
1. ✅ Sreality API integrace
2. ✅ Oblíbené nemovitosti
3. ✅ Systém prohlídek
4. ✅ Email notifikace
5. ✅ Export do PDF

### **Fáze 4: Dokumentace (1 hodina)**
1. ✅ README
2. ✅ API dokumentace
3. ✅ Uživatelská příručka

---

## 📊 Ukázková Data

### **Nemovitosti**
- 5 bytů na prodej (Praha, Brno)
- 3 byty na pronájem
- 2 rodinné domy
- 1 komerční prostor
- 1 pozemek

### **Uživatelé**
- 1 Admin
- 2 Agenti
- 3 Klienti

### **Poptávky**
- Byt 2+kk Praha, 5-8 mil
- Dům Brno, 10-15 mil
- Pronájem 3+1 Praha, do 30k/měs

---

## 🚀 Spuštění

```bash
# 1. Smazat starou databázi
rm backend/tasks.db

# 2. Nainstalovat závislosti
npm run install:all

# 3. Spustit aplikaci
npm run dev
```

---

## 📝 Poznámky

- **Sreality API** je veřejné, ale má rate limiting
- **Mapy** - použít Leaflet.js nebo Mapbox
- **Obrázky** - ukládat URL nebo upload na server
- **Email** - použít nodemailer
- **PDF** - použít jsPDF nebo puppeteer

---

*Vytvořeno: 2024-10-21*
*Odhadovaný čas implementace: 8-10 hodin*
