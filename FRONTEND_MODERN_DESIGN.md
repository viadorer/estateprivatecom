# 🎨 Moderní Frontend - Glassmorphism Design

Kompletní specifikace moderního frontendu s glassmorphism efektem.

## 🎯 Požadavky

- ✅ Glassmorphism efekt (liquid glass)
- ✅ Bílé pozadí s gradientem
- ✅ Dashboard podle práv
- ✅ Vyhledávání nabídek a poptávek
- ✅ CRUD operace
- ✅ Detaily (nabídky, poptávky, uživatelé)
- ✅ Historie
- ✅ Admin rozhraní
- ✅ Našeptávače (IČO, adresy)

---

## 🎨 Design System

### Barvy
```css
:root {
  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  
  /* Gradienty */
  --gradient-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-card: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  
  /* Primární barvy */
  --primary: #667eea;
  --secondary: #764ba2;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  
  /* Neutrální */
  --white: #ffffff;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-900: #111827;
}
```

### Glassmorphism komponenty
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

.glass-nav {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-button {
  background: rgba(102, 126, 234, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.glass-button:hover {
  background: rgba(102, 126, 234, 1);
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
}
```

---

## 📱 Struktura aplikace

### 1. Layout
```
┌─────────────────────────────────────────────┐
│  Glassmorphism Navigation                   │
│  Logo | Dashboard | Nabídky | Poptávky |... │
│                          👤 User | Logout   │
├─────────────────────────────────────────────┤
│                                             │
│  Main Content Area                          │
│  (s gradientním pozadím)                    │
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ Glass Card 1 │  │ Glass Card 2 │       │
│  └──────────────┘  └──────────────┘       │
│                                             │
└─────────────────────────────────────────────┘
```

### 2. Stránky podle role

#### **Admin** 👑
- Dashboard (statistiky, grafy)
- Nabídky (všechny + CRUD)
- Poptávky (všechny + CRUD)
- Uživatelé (všichni + CRUD)
- Společnosti (všechny + CRUD)
- Historie (audit log)
- Nastavení

#### **Agent** 🏢
- Dashboard (moje statistiky)
- Nabídky (moje + všechny read-only)
- Poptávky (všechny)
- Moji klienti
- Prohlídky
- Matches (shody)

#### **Client** 👤
- Dashboard (moje poptávky)
- Vyhledávání nabídek
- Moje poptávky
- Oblíbené
- Prohlídky
- Profil

---

## 🏠 Dashboard

### Admin Dashboard
```jsx
<div className="dashboard-grid">
  {/* Statistiky */}
  <GlassCard>
    <h3>Celkem nemovitostí</h3>
    <div className="stat-number">247</div>
    <div className="stat-change">+12% tento měsíc</div>
  </GlassCard>
  
  <GlassCard>
    <h3>Aktivní poptávky</h3>
    <div className="stat-number">89</div>
  </GlassCard>
  
  <GlassCard>
    <h3>Nové matche</h3>
    <div className="stat-number">34</div>
  </GlassCard>
  
  {/* Graf */}
  <GlassCard className="col-span-2">
    <h3>Prodeje za posledních 6 měsíců</h3>
    <LineChart data={salesData} />
  </GlassCard>
  
  {/* Poslední aktivity */}
  <GlassCard>
    <h3>Poslední aktivity</h3>
    <ActivityFeed />
  </GlassCard>
</div>
```

---

## 🔍 Vyhledávání nabídek

### Filtry s glassmorphism
```jsx
<GlassCard className="filters">
  <div className="filter-grid">
    {/* Typ transakce */}
    <div className="filter-group">
      <label>Typ transakce</label>
      <select className="glass-select">
        <option>Prodej</option>
        <option>Pronájem</option>
      </select>
    </div>
    
    {/* Typ nemovitosti */}
    <div className="filter-group">
      <label>Typ nemovitosti</label>
      <select className="glass-select">
        <option>Byt</option>
        <option>Dům</option>
        <option>Komerční</option>
        <option>Pozemek</option>
      </select>
    </div>
    
    {/* Město - s našeptávačem */}
    <div className="filter-group">
      <label>Město</label>
      <Autocomplete
        api="/api/suggest/address"
        placeholder="Začněte psát..."
      />
    </div>
    
    {/* Cena */}
    <div className="filter-group">
      <label>Cena</label>
      <div className="range-inputs">
        <input type="number" placeholder="Od" />
        <input type="number" placeholder="Do" />
      </div>
    </div>
    
    {/* Plocha */}
    <div className="filter-group">
      <label>Plocha (m²)</label>
      <div className="range-inputs">
        <input type="number" placeholder="Od" />
        <input type="number" placeholder="Do" />
      </div>
    </div>
    
    {/* Pokoje */}
    <div className="filter-group">
      <label>Počet pokojů</label>
      <div className="checkbox-group">
        <label><input type="checkbox" /> 1</label>
        <label><input type="checkbox" /> 2</label>
        <label><input type="checkbox" /> 3</label>
        <label><input type="checkbox" /> 4+</label>
      </div>
    </div>
  </div>
  
  <div className="filter-actions">
    <button className="glass-button">Vyhledat</button>
    <button className="glass-button-secondary">Reset</button>
  </div>
</GlassCard>
```

### Seznam nabídek
```jsx
<div className="properties-grid">
  {properties.map(property => (
    <GlassCard key={property.id} className="property-card">
      <div className="property-image">
        <img src={property.main_image} alt={property.title} />
        <div className="property-badge">{property.transaction_type}</div>
      </div>
      
      <div className="property-content">
        <h3>{property.title}</h3>
        <div className="property-location">
          📍 {property.city}, {property.district}
        </div>
        
        <div className="property-details">
          <span>📐 {property.area} m²</span>
          <span>🛏️ {property.rooms} pokoje</span>
          <span>🏢 {property.floor}. patro</span>
        </div>
        
        <div className="property-price">
          {formatPrice(property.price)} Kč
        </div>
        
        <div className="property-actions">
          <button className="glass-button-small">Detail</button>
          <button className="glass-button-small">❤️</button>
        </div>
      </div>
    </GlassCard>
  ))}
</div>
```

---

## 📝 Detail nabídky

```jsx
<div className="detail-page">
  {/* Hlavní fotka */}
  <div className="detail-hero">
    <img src={property.main_image} />
    <div className="hero-overlay glass-card">
      <h1>{property.title}</h1>
      <div className="price">{formatPrice(property.price)} Kč</div>
    </div>
  </div>
  
  {/* Galerie */}
  <GlassCard className="gallery">
    <ImageGallery images={property.images} />
  </GlassCard>
  
  {/* Informace */}
  <div className="detail-grid">
    <GlassCard className="col-span-2">
      <h2>Popis</h2>
      <p>{property.description}</p>
      
      <h3>Parametry</h3>
      <div className="params-grid">
        <div className="param">
          <span className="param-label">Plocha</span>
          <span className="param-value">{property.area} m²</span>
        </div>
        <div className="param">
          <span className="param-label">Pokoje</span>
          <span className="param-value">{property.rooms}</span>
        </div>
        <div className="param">
          <span className="param-label">Patro</span>
          <span className="param-value">{property.floor}/{property.total_floors}</span>
        </div>
        <div className="param">
          <span className="param-label">Typ stavby</span>
          <span className="param-value">{LABELS_CS[property.building_type]}</span>
        </div>
      </div>
      
      <h3>Vybavení</h3>
      <div className="features">
        {property.has_balcony && <span className="feature">🏡 Balkon</span>}
        {property.has_elevator && <span className="feature">🛗 Výtah</span>}
        {property.has_parking && <span className="feature">🚗 Parkování</span>}
        {property.has_cellar && <span className="feature">📦 Sklep</span>}
      </div>
    </GlassCard>
    
    {/* Kontakt na agenta */}
    <GlassCard>
      <h3>Kontakt</h3>
      <div className="agent-card">
        <div className="agent-avatar">{property.agent_avatar}</div>
        <div className="agent-info">
          <h4>{property.agent_name}</h4>
          <p>{property.agent_company}</p>
          <p>📞 {property.agent_phone}</p>
          <p>📧 {property.agent_email}</p>
        </div>
        <button className="glass-button">Kontaktovat</button>
        <button className="glass-button-secondary">Naplánovat prohlídku</button>
      </div>
    </GlassCard>
    
    {/* Mapa */}
    <GlassCard>
      <h3>Poloha</h3>
      <Map lat={property.latitude} lng={property.longitude} />
    </GlassCard>
  </div>
</div>
```

---

## 🔍 Poptávky

### Vytvoření poptávky
```jsx
<GlassCard className="demand-form">
  <h2>Vytvořit poptávku</h2>
  
  <form onSubmit={handleSubmit}>
    <div className="form-grid">
      <div className="form-group">
        <label>Co hledáte?</label>
        <select name="transaction_type" className="glass-input">
          <option value="sale">Prodej</option>
          <option value="rent">Pronájem</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Typ nemovitosti</label>
        <select name="property_type" className="glass-input">
          <option value="flat">Byt</option>
          <option value="house">Dům</option>
          <option value="commercial">Komerční</option>
          <option value="land">Pozemek</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Města (můžete vybrat více)</label>
        <MultiSelect
          options={cities}
          placeholder="Vyberte města..."
        />
      </div>
      
      <div className="form-group">
        <label>Cenové rozpětí</label>
        <div className="range-inputs">
          <input type="number" name="price_min" placeholder="Od" className="glass-input" />
          <input type="number" name="price_max" placeholder="Do" className="glass-input" />
        </div>
      </div>
      
      <div className="form-group">
        <label>Plocha (m²)</label>
        <div className="range-inputs">
          <input type="number" name="area_min" placeholder="Od" className="glass-input" />
          <input type="number" name="area_max" placeholder="Do" className="glass-input" />
        </div>
      </div>
      
      <div className="form-group">
        <label>Počet pokojů</label>
        <div className="range-inputs">
          <input type="number" name="rooms_min" placeholder="Od" className="glass-input" />
          <input type="number" name="rooms_max" placeholder="Do" className="glass-input" />
        </div>
      </div>
      
      <div className="form-group col-span-2">
        <label>Požadované vlastnosti</label>
        <div className="checkbox-group">
          <label><input type="checkbox" name="has_balcony" /> Balkon</label>
          <label><input type="checkbox" name="has_elevator" /> Výtah</label>
          <label><input type="checkbox" name="has_parking" /> Parkování</label>
          <label><input type="checkbox" name="has_garage" /> Garáž</label>
        </div>
      </div>
    </div>
    
    <div className="form-actions">
      <button type="submit" className="glass-button">Vytvořit poptávku</button>
      <button type="button" className="glass-button-secondary">Zrušit</button>
    </div>
  </form>
</GlassCard>
```

### Matches (shody)
```jsx
<div className="matches-list">
  <h2>Nalezené shody pro vaši poptávku</h2>
  
  {matches.map(match => (
    <GlassCard key={match.id} className="match-card">
      <div className="match-score">
        <CircularProgress value={match.match_score} />
        <span>{match.match_score}% shoda</span>
      </div>
      
      <div className="match-property">
        <img src={match.property.main_image} />
        <div className="match-info">
          <h3>{match.property.title}</h3>
          <p>{match.property.city}</p>
          <p className="price">{formatPrice(match.property.price)} Kč</p>
        </div>
      </div>
      
      <div className="match-actions">
        <button className="glass-button">Zobrazit detail</button>
        <button className="glass-button-success">Mám zájem</button>
        <button className="glass-button-danger">Odmítnout</button>
      </div>
    </GlassCard>
  ))}
</div>
```

---

## 👥 Uživatelé (Admin)

### Seznam uživatelů
```jsx
<GlassCard className="users-table">
  <div className="table-header">
    <h2>Uživatelé</h2>
    <button className="glass-button">+ Přidat uživatele</button>
  </div>
  
  <table className="glass-table">
    <thead>
      <tr>
        <th>Jméno</th>
        <th>Email</th>
        <th>Role</th>
        <th>Společnost</th>
        <th>Telefon</th>
        <th>Město</th>
        <th>Akce</th>
      </tr>
    </thead>
    <tbody>
      {users.map(user => (
        <tr key={user.id}>
          <td>
            <div className="user-cell">
              <span className="avatar">{user.avatar}</span>
              {user.name}
            </div>
          </td>
          <td>{user.email}</td>
          <td><RoleBadge role={user.role} /></td>
          <td>{user.company_name || '-'}</td>
          <td>{user.phone}</td>
          <td>{user.address_city}</td>
          <td>
            <button className="icon-button">👁️</button>
            <button className="icon-button">✏️</button>
            <button className="icon-button">🗑️</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</GlassCard>
```

### Detail uživatele
```jsx
<div className="user-detail">
  <GlassCard>
    <div className="user-header">
      <div className="user-avatar-large">{user.avatar}</div>
      <div className="user-info">
        <h1>{user.name}</h1>
        <RoleBadge role={user.role} />
        <p>{user.email}</p>
      </div>
    </div>
  </GlassCard>
  
  <div className="detail-grid">
    <GlassCard>
      <h3>Kontaktní údaje</h3>
      <div className="info-list">
        <div className="info-item">
          <span className="label">Telefon:</span>
          <span className="value">{user.phone}</span>
        </div>
        <div className="info-item">
          <span className="label">Telefon 2:</span>
          <span className="value">{user.phone_secondary || '-'}</span>
        </div>
        <div className="info-item">
          <span className="label">Email:</span>
          <span className="value">{user.email}</span>
        </div>
      </div>
    </GlassCard>
    
    <GlassCard>
      <h3>Adresa</h3>
      <div className="info-list">
        <div className="info-item">
          <span className="label">Ulice:</span>
          <span className="value">{user.address_street}</span>
        </div>
        <div className="info-item">
          <span className="label">Město:</span>
          <span className="value">{user.address_city}</span>
        </div>
        <div className="info-item">
          <span className="label">PSČ:</span>
          <span className="value">{user.address_zip}</span>
        </div>
      </div>
    </GlassCard>
    
    {user.company_id && (
      <GlassCard>
        <h3>Společnost</h3>
        <div className="info-list">
          <div className="info-item">
            <span className="label">Název:</span>
            <span className="value">{user.company_name}</span>
          </div>
          <div className="info-item">
            <span className="label">IČO:</span>
            <span className="value">{user.company_ico}</span>
          </div>
          <div className="info-item">
            <span className="label">Pozice:</span>
            <span className="value">{user.company_position}</span>
          </div>
        </div>
      </GlassCard>
    )}
    
    <GlassCard className="col-span-2">
      <h3>Poznámky</h3>
      <p>{user.notes || 'Žádné poznámky'}</p>
    </GlassCard>
  </div>
  
  {/* Historie aktivit */}
  <GlassCard>
    <h3>Historie aktivit</h3>
    <ActivityTimeline userId={user.id} />
  </GlassCard>
</div>
```

---

## 🔧 Našeptávače

### IČO Autocomplete
```jsx
<div className="form-group">
  <label>IČO</label>
  <input
    type="text"
    className="glass-input"
    value={ico}
    onChange={handleIcoChange}
    onBlur={fetchCompanyData}
    placeholder="Zadejte IČO..."
  />
  {loading && <span className="loading-spinner">⏳</span>}
  {companyData && (
    <div className="autocomplete-result glass-card">
      <p><strong>{companyData.name}</strong></p>
      <p>{companyData.address.street}</p>
      <p>{companyData.address.city}, {companyData.address.zip}</p>
      <button onClick={fillCompanyData}>Použít tyto údaje</button>
    </div>
  )}
</div>
```

### Adresa Autocomplete
```jsx
<div className="form-group">
  <label>Adresa</label>
  <input
    type="text"
    className="glass-input"
    value={address}
    onChange={handleAddressChange}
    placeholder="Začněte psát adresu..."
  />
  {suggestions.length > 0 && (
    <div className="autocomplete-dropdown glass-card">
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="autocomplete-item"
          onClick={() => selectAddress(suggestion)}
        >
          <p><strong>{suggestion.street}</strong></p>
          <p>{suggestion.city}, {suggestion.zip}</p>
        </div>
      ))}
    </div>
  )}
</div>
```

---

## 📊 Historie (Audit Log)

```jsx
<GlassCard className="audit-log">
  <h2>Historie změn</h2>
  
  <div className="timeline">
    {auditLog.map(entry => (
      <div key={entry.id} className="timeline-item">
        <div className="timeline-marker"></div>
        <div className="timeline-content glass-card-small">
          <div className="timeline-header">
            <span className="user">{entry.user_name}</span>
            <span className="time">{formatDate(entry.created_at)}</span>
          </div>
          <div className="timeline-body">
            <span className="action">{entry.action}</span>
            <span className="entity">{entry.entity_type} #{entry.entity_id}</span>
          </div>
          {entry.changes && (
            <div className="timeline-changes">
              {Object.entries(entry.changes).map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong> {value.old} → {value.new}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
</GlassCard>
```

---

## 🎨 CSS pro Glassmorphism

```css
/* Globální styly */
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  padding: 24px;
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.2);
}

/* Glass Input */
.glass-input {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  width: 100%;
  transition: all 0.3s ease;
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.7);
  border-color: #667eea;
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Glass Button */
.glass-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.glass-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Animace */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.glass-card {
  animation: fadeIn 0.5s ease;
}
```

---

## 📦 Potřebné knihovny

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "recharts": "^2.10.0",
    "react-select": "^5.8.0",
    "react-leaflet": "^4.2.1",
    "leaflet": "^1.9.4",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.294.0"
  }
}
```

---

*Toto je kompletní specifikace moderního frontendu. Implementace bude pokračovat v dalších krocích.*
