# ✅ TODO: Dokončení LOI Systému

**Datum:** 24. října 2024 20:34  
**Status:** 🔄 V PROCESU

---

## ✅ **HOTOVO:**

### **Backend:**
1. ✅ Opravena logika `/api/properties/matching/:userId`
   - Vrací VŠECHNY aktivní nabídky
   - Přidány flagy: `is_mine`, `has_loi`
   - Seřazeno podle priority

2. ✅ Opravena kontrola přístupu `/api/properties/:id/check-access/:userId`
   - Kontrola vlastníka (agent_id)
   - Kontrola podepsané LOI
   - Vrací `message: "LOI již podepsána"`

3. ✅ Opravena kontrola přístupu `/api/demands/:id/check-access/:userId`
   - Kontrola vlastníka (client_id)
   - Kontrola podepsané LOI

4. ✅ Dokumentace vytvořena
   - `LOI_SYSTEM_CORRECT.md`
   - `TODO_LOI_SYSTEM.md`

---

## 🔄 **ZBÝVÁ DODĚLAT:**

### **1. Frontend - PropertyDetail Komponenta** 🎨

#### **Přidat kontrolu LOI:**
```javascript
// App.jsx - PropertyDetail komponenta
function PropertyDetail({ property, currentUser, onClose, ... }) {
  const [hasAccess, setHasAccess] = useState(null)
  const [accessReason, setAccessReason] = useState(null)
  const [showLOIModal, setShowLOIModal] = useState(false)
  
  useEffect(() => {
    // Zkontrolovat přístup
    fetch(`/api/properties/${property.id}/check-access/${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        setHasAccess(data.hasAccess)
        setAccessReason(data.reason)
        
        if (!data.hasAccess) {
          setShowLOIModal(true) // Zobrazit modal "Požádat o přístup"
        }
      })
  }, [property.id, currentUser.id])
  
  // Pokud nemá přístup, zobrazit modal
  if (!hasAccess && showLOIModal) {
    return <LOIRequestModal property={property} onClose={onClose} />
  }
  
  // Pokud má přístup, zobrazit detail
  return (
    <div>
      {accessReason === 'signed_loi' && (
        <div className="badge bg-green-100 text-green-700">
          ✅ LOI již podepsána
        </div>
      )}
      {accessReason === 'owner' && (
        <div className="badge bg-blue-100 text-blue-700">
          🏠 Moje nabídka
        </div>
      )}
      
      {/* Kompletní detail */}
    </div>
  )
}
```

---

### **2. Frontend - LOIRequestModal Komponenta** 📝

#### **Vytvořit novou komponentu:**
```javascript
// components/LOIRequestModal.jsx
export default function LOIRequestModal({ property, currentUser, onClose, onSigned }) {
  const [step, setStep] = useState(1) // 1 = Info, 2 = Smlouva, 3 = Kód
  const [agreed, setAgreed] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleRequestLOI = async () => {
    // POST /api/loi/request
    const response = await fetch('/api/loi/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser.id,
        property_id: property.id
      })
    })
    
    if (response.ok) {
      setStep(2) // Zobrazit smlouvu
    }
  }
  
  const handleSignLOI = async () => {
    // POST /api/loi/sign
    const response = await fetch('/api/loi/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser.id,
        property_id: property.id,
        code: code
      })
    })
    
    if (response.ok) {
      onSigned() // Zavřít modal a zobrazit detail
    }
  }
  
  return (
    <div className="modal">
      {step === 1 && (
        <div>
          <h2>🔒 Přístup omezen</h2>
          <p>Pro zobrazení detailu je nutné podepsat LOI (Letter of Intent)</p>
          <button onClick={handleRequestLOI}>Požádat o přístup</button>
          <button onClick={onClose}>Zrušit</button>
        </div>
      )}
      
      {step === 2 && (
        <div>
          <h2>📝 LOI Smlouva</h2>
          <div className="loi-content">
            {/* Text smlouvy */}
          </div>
          <input 
            type="checkbox" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)} 
          />
          <label>Souhlasím s LOI</label>
          <button onClick={() => setStep(3)} disabled={!agreed}>
            Pokračovat
          </button>
        </div>
      )}
      
      {step === 3 && (
        <div>
          <h2>🔑 Zadejte kód z emailu</h2>
          <input 
            type="text" 
            value={code} 
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="XXXXXX"
          />
          <button onClick={handleSignLOI} disabled={code.length !== 6}>
            Podepsat LOI
          </button>
        </div>
      )}
    </div>
  )
}
```

---

### **3. Backend - LOI Endpointy** 🔧

#### **POST /api/loi/request**
```javascript
app.post('/api/loi/request', async (req, res) => {
  try {
    const { user_id, property_id } = req.body;
    
    // Zkontrolovat, zda už LOI neexistuje
    const existing = db.prepare(`
      SELECT * FROM loi_signatures
      WHERE user_id = ? AND match_property_id = ?
    `).get(user_id, property_id);
    
    if (existing) {
      return res.json({ 
        message: 'LOI již existuje',
        loi: existing 
      });
    }
    
    // Vygenerovat kód
    let code;
    do {
      code = generateAccessCode();
    } while (db.prepare('SELECT id FROM loi_signatures WHERE code = ?').get(code));
    
    // Expirace 30 minut
    const expireDate = new Date();
    expireDate.setMinutes(expireDate.getMinutes() + 30);
    const expires_at = expireDate.toISOString();
    
    // Uložit LOI
    const result = db.prepare(`
      INSERT INTO loi_signatures (user_id, match_property_id, code, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(user_id, property_id, code, expires_at);
    
    // Odeslat email s kódem
    const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(user_id);
    const property = db.prepare('SELECT title FROM properties WHERE id = ?').get(property_id);
    
    await sendLOICode(user.email, user.name, code, property.title, expires_at);
    
    // Log akce
    logAction(user_id, 'request_loi', 'property', property_id, `Žádost o LOI: ${property.title}`, req);
    
    res.json({ 
      success: true,
      loi_id: result.lastInsertRowid,
      message: 'Kód odeslán na email'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### **POST /api/loi/sign**
```javascript
app.post('/api/loi/sign', (req, res) => {
  try {
    const { user_id, property_id, code } = req.body;
    
    // Najít LOI
    const loi = db.prepare(`
      SELECT * FROM loi_signatures
      WHERE user_id = ? 
        AND match_property_id = ?
        AND code = ?
        AND signed_at IS NULL
    `).get(user_id, property_id, code);
    
    if (!loi) {
      return res.status(404).json({ error: 'Neplatný kód' });
    }
    
    // Kontrola expirace
    if (loi.expires_at && new Date(loi.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Kód vypršel' });
    }
    
    // Podepsat LOI
    db.prepare('UPDATE loi_signatures SET signed_at = ? WHERE id = ?')
      .run(new Date().toISOString(), loi.id);
    
    // Log akce
    logAction(user_id, 'sign_loi', 'property', property_id, `Podepsána LOI kódem: ${code}`, req);
    
    res.json({ 
      success: true,
      message: 'LOI úspěšně podepsána'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### **4. Frontend - Rozdělení Nabídek na Taby** 📊

#### **Přidat taby do PropertiesPage:**
```javascript
// App.jsx nebo PropertiesPage.jsx
const [activePropertyTab, setActivePropertyTab] = useState('all')

// Filtrování podle tabu
const filteredProperties = properties.filter(p => {
  switch (activePropertyTab) {
    case 'mine':
      return p.is_mine === 1
    case 'signed':
      return p.has_loi === 1
    case 'related':
      return p.matching_score > 80
    case 'all':
    default:
      return true
  }
})

return (
  <div>
    {/* Taby */}
    <div className="tabs">
      <button 
        onClick={() => setActivePropertyTab('mine')}
        className={activePropertyTab === 'mine' ? 'active' : ''}
      >
        🏠 Moje nabídky ({properties.filter(p => p.is_mine).length})
      </button>
      <button 
        onClick={() => setActivePropertyTab('signed')}
        className={activePropertyTab === 'signed' ? 'active' : ''}
      >
        ✅ Podepsané ({properties.filter(p => p.has_loi).length})
      </button>
      <button 
        onClick={() => setActivePropertyTab('related')}
        className={activePropertyTab === 'related' ? 'active' : ''}
      >
        🎯 Související ({properties.filter(p => p.matching_score > 80).length})
      </button>
      <button 
        onClick={() => setActivePropertyTab('all')}
        className={activePropertyTab === 'all' ? 'active' : ''}
      >
        📦 Všechny ({properties.length})
      </button>
    </div>
    
    {/* Seznam nabídek */}
    <div className="properties-grid">
      {filteredProperties.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  </div>
)
```

---

### **5. Frontend - Badge na Kartě Nabídky** 🏷️

#### **Přidat badge do PropertyCard:**
```javascript
// components/PropertyCard.jsx
function PropertyCard({ property }) {
  return (
    <div className="property-card">
      <img src={property.main_image} alt={property.title} />
      
      {/* Badges */}
      <div className="badges">
        {property.is_mine === 1 && (
          <span className="badge bg-blue-100 text-blue-700">
            🏠 Moje nabídka
          </span>
        )}
        {property.has_loi === 1 && (
          <span className="badge bg-green-100 text-green-700">
            ✅ LOI podepsána
          </span>
        )}
        {property.matching_score > 80 && (
          <span className="badge bg-purple-100 text-purple-700">
            🎯 Související ({property.matching_score}%)
          </span>
        )}
      </div>
      
      <h3>{property.title}</h3>
      <p>{property.price} Kč</p>
      
      <button onClick={() => onViewDetail(property)}>
        Zobrazit detail
      </button>
    </div>
  )
}
```

---

### **6. Email Service - LOI Email** 📧

#### **Přidat do emailService.js:**
```javascript
// emailService.js
export const sendLOICode = async (email, name, code, propertyTitle, expiresAt) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  const mailOptions = {
    from: {
      name: 'Estateprivate.com',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: '🔑 Kód pro podpis LOI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .code-box { background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; letter-spacing: 0.3em; color: #667eea; font-family: 'Courier New', monospace; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔑 Kód pro podpis LOI</h1>
        </div>
        <div class="content">
          <p>Dobrý den ${name},</p>
          
          <p>Váš kód pro podpis LOI (Letter of Intent) pro nabídku:</p>
          <p><strong>${propertyTitle}</strong></p>
          
          <div class="code-box">
            <p style="margin: 0; font-size: 14px; color: #666;">Váš kód:</p>
            <div class="code">${code}</div>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
              Platnost do: ${new Date(expiresAt).toLocaleString('cs-CZ')}
            </p>
          </div>
          
          <p><strong>Další kroky:</strong></p>
          <ol>
            <li>Přihlaste se do systému</li>
            <li>Otevřete detail nabídky</li>
            <li>Zadejte kód ${code}</li>
            <li>LOI bude podepsána</li>
          </ol>
          
          <p>S pozdravem,<br><strong>Tým Estateprivate.com</strong></p>
        </div>
      </body>
      </html>
    `
  };
  
  await transporter.sendMail(mailOptions);
};
```

---

## 📝 **CHECKLIST:**

### **Backend:**
- [x] Opravit `/api/properties/matching/:userId`
- [x] Opravit `/api/properties/:id/check-access/:userId`
- [x] Opravit `/api/demands/:id/check-access/:userId`
- [ ] Vytvořit `POST /api/loi/request`
- [ ] Vytvořit `POST /api/loi/sign`
- [ ] Přidat `sendLOICode()` do emailService.js

### **Frontend:**
- [ ] Upravit `PropertyDetail` - kontrola LOI
- [ ] Vytvořit `LOIRequestModal` komponentu
- [ ] Přidat taby: Moje | Podepsané | Související | Všechny
- [ ] Přidat badges na karty nabídek
- [ ] Upravit `DemandDetail` - kontrola LOI
- [ ] Přidat taby pro poptávky

### **Testování:**
- [ ] Test: Agent vidí všechny nabídky
- [ ] Test: Klient vidí všechny nabídky
- [ ] Test: Detail bez LOI → modal
- [ ] Test: Detail s LOI → zobrazí se
- [ ] Test: Podpis LOI workflow
- [ ] Test: Taby fungují správně
- [ ] Test: Badges se zobrazují správně

---

## 🚀 **PRIORITA:**

1. **VYSOKÁ** - Backend LOI endpointy
2. **VYSOKÁ** - Frontend LOIRequestModal
3. **STŘEDNÍ** - Taby a filtry
4. **NÍZKÁ** - Badges a UI vylepšení

---

**Odhadovaný čas:** 4-6 hodin  
**Závislosti:** Žádné  
**Rizika:** Žádná
