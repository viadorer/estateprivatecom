# 🎨 Frontend Integrace - Estateprivate.com

## 📋 Přehled implementovaných funkcí

### **1. Přístupové kódy** 🔐

#### **Jak to funguje:**

**Pro Agenta/Admina:**
1. Agent vytvoří nemovitost nebo admin schválí nemovitost
2. V detailu nemovitosti klikne na tlačítko **"Generovat přístupový kód"**
3. Zobrazí se modal `GenerateAccessCodeModal`:
   - Vybere klienta ze seznamu
   - Nastaví platnost kódu (1, 7, 14, 30, 90 dní nebo bez expirace)
   - Klikne "Generovat kód"
4. Systém:
   - Vygeneruje 6-místný kód (např. `AB12CD`)
   - Uloží do databáze
   - **Automaticky odešle email klientovi** s kódem
   - Zobrazí kód agentovi s možností kopírování

**Pro Klienta:**
1. Klient vidí nemovitost v seznamu
2. Klikne na **"Zobrazit detail"**
3. Zobrazí se modal `AccessCodeModal`:
   - Zadá 6-místný kód, který dostal emailem
   - Klikne "Ověřit kód"
4. Systém ověří kód a zobrazí detail nemovitosti

#### **Frontend komponenty:**
```jsx
// V App.jsx - pro agenta
<button onClick={() => {
  setSelectedEntityForCode(property);
  setCodeEntityType('property');
  setShowGenerateCodeModal(true);
}}>
  🔐 Generovat kód
</button>

// Modal se zobrazí automaticky
<GenerateAccessCodeModal
  isOpen={showGenerateCodeModal}
  onClose={() => setShowGenerateCodeModal(false)}
  entity={selectedEntityForCode}
  entityType={codeEntityType}
  onGenerate={(data) => {
    console.log('Kód vygenerován:', data);
    // data.email_sent = true pokud byl email odeslán
  }}
/>
```

#### **API volání:**
```javascript
// Generování kódu
const response = await fetch('/api/access-codes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: selectedClientId,
    entity_type: 'property',
    entity_id: propertyId,
    expires_in_days: 7,
    send_email: true  // automaticky odešle email
  })
});

// Response:
{
  id: 1,
  code: "AB12CD",
  expires_at: "2025-10-29T...",
  message: "Kód úspěšně vygenerován",
  email_sent: true  // ✅ Email byl odeslán
}
```

---

### **2. Schvalovací workflow** ✅❌

#### **Jak to funguje:**

**Agent vytváří nemovitost:**
1. Agent vyplní formulář pro novou nemovitost
2. Při odesílání se přidá `user_role: 'agent'`
3. Backend automaticky nastaví `status: 'pending'`
4. Nemovitost **není viditelná** pro klienty
5. Zobrazí se v seznamu "Čekající schválení" pro admina

**Admin schvaluje:**
1. Admin vidí sekci **"Čekající schválení"** na dashboardu
2. Zobrazí se seznam všech pending nemovitostí a poptávek
3. Admin klikne na **"Schválit"** nebo **"Zamítnout"**
4. Systém:
   - Změní status na `active` nebo `rejected`
   - **Vytvoří notifikaci** v databázi
   - **Odešle email** agentovi/klientovi
   - Zaloguje akci

**Agent dostane notifikaci:**
1. V horní liště se zobrazí **zvýrazněný zvoneček** s počtem nepřečtených
2. Kliknutím na zvoneček se zobrazí seznam notifikací
3. Notifikace obsahuje:
   - ✅ "Nemovitost schválena: Byt 2+kk Praha"
   - Čas: "před 5 minutami"
   - Tlačítko "Zobrazit" → přesměruje na detail
4. Zároveň dostal **email** s informací

#### **Frontend komponenty:**

```jsx
// V App.jsx - pro admina
{currentUser.role === 'admin' && (
  <button onClick={() => setActiveTab('pending-approvals')}>
    Čekající schválení
    {pendingCount > 0 && (
      <span className="badge">{pendingCount}</span>
    )}
  </button>
)}

// Sekce čekajících schválení
<PendingApprovalsPage
  properties={pendingProperties}
  demands={pendingDemands}
  onApprove={(id, type) => handleApprove(id, type, 'active')}
  onReject={(id, type) => handleApprove(id, type, 'rejected')}
/>

// Notifikační zvoneček
<NotificationBell
  userId={currentUser.id}
  unreadCount={unreadNotifications}
  onClick={() => setShowNotifications(true)}
/>
```

#### **API volání:**

```javascript
// Vytvoření nemovitosti (agent)
const response = await fetch('/api/properties', {
  method: 'POST',
  body: JSON.stringify({
    ...propertyData,
    user_role: currentUser.role,  // 'agent' → status: 'pending'
    agent_id: currentUser.id
  })
});

// Schválení nemovitosti (admin)
const response = await fetch(`/api/properties/${propertyId}/approve`, {
  method: 'PATCH',
  body: JSON.stringify({
    status: 'active',  // nebo 'rejected'
    admin_id: currentUser.id
  })
});
// Backend automaticky:
// - Změní status
// - Vytvoří notifikaci
// - Odešle email agentovi

// Získání čekajících schválení
const response = await fetch('/api/pending-approvals');
// Response:
{
  properties: [...],  // pending nemovitosti
  demands: [...],     // pending poptávky
  total: 5
}
```

---

### **3. Push notifikace** 🔔

#### **Jak to funguje:**

**Automatické notifikace se vytváří při:**
- ✅ Schválení nemovitosti/poptávky
- ❌ Zamítnutí nemovitosti/poptávky
- 🎯 Nové shody mezi poptávkou a nabídkou
- 📧 Nové zprávy
- ⚙️ Systémové události

**Uživatel vidí:**
1. **Zvoneček v horní liště** s počtem nepřečtených (červený badge)
2. Kliknutím se otevře **dropdown s notifikacemi**
3. Každá notifikace obsahuje:
   - Ikonu podle typu (✅❌🎯📧)
   - Nadpis a zprávu
   - Čas (např. "před 5 minutami")
   - Tlačítko "Zobrazit" → přesměruje na detail
4. Tlačítko **"Označit vše jako přečtené"**

#### **Frontend komponenty:**

```jsx
// Notifikační komponenta
function NotificationCenter({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Načíst notifikace
    fetchNotifications();
    
    // Polling každých 30 sekund pro nové notifikace
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = async () => {
    const response = await fetch(`/api/notifications/${userId}`);
    const data = await response.json();
    setNotifications(data);
    
    const unread = await fetch(`/api/notifications/${userId}/unread-count`);
    const { count } = await unread.json();
    setUnreadCount(count);
  };

  return (
    <div className="notification-bell">
      <Bell size={24} />
      {unreadCount > 0 && (
        <span className="badge">{unreadCount}</span>
      )}
      
      {showDropdown && (
        <NotificationDropdown
          notifications={notifications}
          onMarkAsRead={(id) => markAsRead(id)}
          onMarkAllAsRead={() => markAllAsRead()}
        />
      )}
    </div>
  );
}
```

#### **API volání:**

```javascript
// Získat notifikace uživatele
const response = await fetch(`/api/notifications/${userId}`);
// Response:
[
  {
    id: 1,
    type: "approval",
    title: "✅ Nemovitost schválena",
    message: "Vaše nemovitost 'Byt 2+kk' byla schválena",
    entity_type: "property",
    entity_id: 5,
    action_url: "/properties/5",
    is_read: 0,
    created_at: "2025-10-22T21:00:00Z"
  }
]

// Počet nepřečtených
const response = await fetch(`/api/notifications/${userId}/unread-count`);
// Response: { count: 3 }

// Označit jako přečtené
await fetch(`/api/notifications/${notificationId}/read`, {
  method: 'PATCH'
});

// Označit vše jako přečtené
await fetch(`/api/notifications/user/${userId}/read-all`, {
  method: 'PATCH'
});
```

---

### **4. Email notifikace** 📧

#### **Kdy se odesílají:**

**Automaticky při:**
1. **Generování přístupového kódu** → Email klientovi s kódem
2. **Schválení nemovitosti** → Email agentovi
3. **Zamítnutí nemovitosti** → Email agentovi
4. **Schválení poptávky** → Email klientovi
5. **Zamítnutí poptávky** → Email klientovi
6. **Nová shoda** → Email klientovi s detaily

**Obsah emailu:**
- 🎨 Moderní HTML design s gradientem
- 📝 Personalizovaný obsah
- 🔗 Odkazy na akce (pokud relevantní)
- 🏢 Podpis: "Tým Estateprivate.com"
- 📧 Odesílatel: info@ptf.cz

**Není potřeba nic dělat na frontendu** - emaily se odesílají automaticky z backendu!

---

## 🎯 Praktické použití

### **Scénář 1: Agent přidává nemovitost**

```javascript
// 1. Agent vyplní formulář
const handleSubmit = async (formData) => {
  const response = await fetch('/api/properties', {
    method: 'POST',
    body: JSON.stringify({
      ...formData,
      user_role: currentUser.role,  // 'agent'
      agent_id: currentUser.id
    })
  });
  
  const property = await response.json();
  
  // property.status === 'pending'
  alert('Nemovitost byla vytvořena a čeká na schválení adminem.');
};
```

### **Scénář 2: Admin schvaluje**

```javascript
// 1. Admin vidí čekající schválení
useEffect(() => {
  if (currentUser.role === 'admin') {
    fetch('/api/pending-approvals')
      .then(res => res.json())
      .then(data => {
        setPendingProperties(data.properties);
        setPendingDemands(data.demands);
      });
  }
}, []);

// 2. Admin schvaluje
const handleApprove = async (propertyId) => {
  await fetch(`/api/properties/${propertyId}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'active',
      admin_id: currentUser.id
    })
  });
  
  // Backend automaticky:
  // ✅ Změní status na 'active'
  // ✅ Vytvoří notifikaci pro agenta
  // ✅ Odešle email agentovi
  
  alert('Nemovitost schválena! Agent dostal email a notifikaci.');
};
```

### **Scénář 3: Agent generuje kód pro klienta**

```javascript
const handleGenerateCode = async (propertyId, clientId) => {
  const response = await fetch('/api/access-codes', {
    method: 'POST',
    body: JSON.stringify({
      user_id: clientId,
      entity_type: 'property',
      entity_id: propertyId,
      expires_in_days: 7
    })
  });
  
  const data = await response.json();
  
  // data.code = "AB12CD"
  // data.email_sent = true
  
  // Klient automaticky dostal email s kódem!
  alert(`Kód ${data.code} vygenerován a odeslán klientovi emailem!`);
};
```

### **Scénář 4: Klient používá kód**

```javascript
const handleVerifyCode = async (code) => {
  const response = await fetch(`/api/properties/${propertyId}/verify-code`, {
    method: 'POST',
    body: JSON.stringify({
      code: code.toUpperCase(),
      user_id: currentUser.id
    })
  });
  
  if (response.ok) {
    // Kód je platný, zobrazit detail
    setShowPropertyDetail(true);
  } else {
    const error = await response.json();
    alert(error.error); // "Neplatný nebo expirovaný kód"
  }
};
```

---

## 📱 UI Komponenty k implementaci

### **1. Notifikační zvoneček (horní lišta)**
```jsx
<div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
  <Bell size={24} />
  {unreadCount > 0 && (
    <span className="badge">{unreadCount}</span>
  )}
</div>
```

### **2. Dropdown s notifikacemi**
```jsx
<div className="notifications-dropdown">
  <div className="header">
    <h3>Notifikace</h3>
    <button onClick={markAllAsRead}>Označit vše</button>
  </div>
  
  {notifications.map(notif => (
    <div key={notif.id} className={notif.is_read ? 'read' : 'unread'}>
      <div className="icon">{getIcon(notif.type)}</div>
      <div className="content">
        <h4>{notif.title}</h4>
        <p>{notif.message}</p>
        <span className="time">{formatTime(notif.created_at)}</span>
      </div>
      {notif.action_url && (
        <button onClick={() => navigate(notif.action_url)}>
          Zobrazit
        </button>
      )}
    </div>
  ))}
</div>
```

### **3. Sekce čekající schválení (admin)**
```jsx
<div className="pending-approvals">
  <h2>Čekající schválení ({total})</h2>
  
  <section>
    <h3>Nemovitosti ({properties.length})</h3>
    {properties.map(property => (
      <div key={property.id} className="pending-item">
        <div className="info">
          <h4>{property.title}</h4>
          <p>Agent: {property.agent_name}</p>
          <p>Vytvořeno: {formatDate(property.created_at)}</p>
        </div>
        <div className="actions">
          <button 
            className="approve"
            onClick={() => handleApprove(property.id, 'property', 'active')}
          >
            ✅ Schválit
          </button>
          <button 
            className="reject"
            onClick={() => handleApprove(property.id, 'property', 'rejected')}
          >
            ❌ Zamítnout
          </button>
        </div>
      </div>
    ))}
  </section>
</div>
```

---

## 🔄 Automatické akce (bez zásahu uživatele)

### **Backend automaticky:**
1. ✅ Odesílá emaily při generování kódů
2. ✅ Vytváří notifikace při schvalování
3. ✅ Odesílá emaily při schvalování/zamítání
4. ✅ Loguje všechny akce do audit_logs
5. ✅ Kontroluje expirace kódů

### **Frontend potřebuje:**
1. 📱 Zobrazit notifikační zvoneček
2. 📋 Zobrazit seznam notifikací
3. ⏱️ Polling pro nové notifikace (každých 30s)
4. 🔔 Zvukové/vizuální upozornění na nové notifikace
5. 📊 Dashboard pro admina s čekajícími schváleními

---

## 🎨 Doporučené UX vylepšení

1. **Real-time notifikace** - WebSocket místo pollingu
2. **Toast notifikace** - Malé popup okno při nové notifikaci
3. **Zvukové upozornění** - Ping při nové notifikaci
4. **Badge na tabu** - Počet nepřečtených v názvu stránky
5. **Push notifikace** - Browser push API pro desktop notifikace

Vše je připraveno na backendu! Stačí implementovat UI komponenty. 🚀
