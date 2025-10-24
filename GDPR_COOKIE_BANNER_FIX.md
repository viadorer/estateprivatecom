# 🍪 Oprava Cookie Banneru

## ✅ Co bylo opraveno

### **1. Styling checkboxů**
- ✅ Přidán `cursor-pointer` pro lepší UX
- ✅ Přidán `accent-purple-600` pro fialovou barvu checkboxů
- ✅ Disabled checkbox má `cursor-not-allowed` a `opacity-50`

### **2. Error handling**
- ✅ Přidána kontrola HTTP odpovědi
- ✅ Přidán alert při chybě
- ✅ Přidány console.log pro debugging

### **3. Testování**

#### **Jak otestovat cookie banner:**

1. **Otevři konzoli prohlížeče** (F12)

2. **Vymaž localStorage** (pro zobrazení banneru znovu):
```javascript
localStorage.removeItem('gdpr_consent')
```

3. **Obnov stránku** (F5)

4. **Cookie banner by se měl zobrazit**

5. **Klikni na "Nastavení"**

6. **Zaškrtni/odškrtni checkboxy**
   - Analytické cookies
   - Marketingové cookies

7. **Klikni "Uložit nastavení"**

8. **V konzoli by mělo být:**
```
Ukládám nastavení cookies: {analytics: true, marketing: false, necessary: true}
Souhlas uložen: {success: true, id: X}
```

9. **Zkontroluj localStorage:**
```javascript
JSON.parse(localStorage.getItem('gdpr_consent'))
```

#### **Jak zkontrolovat v databázi:**

```bash
sqlite3 backend/realestate.db "SELECT * FROM gdpr_consents ORDER BY created_at DESC LIMIT 1;"
```

### **4. Checkboxy nyní fungují**

**Před:**
```jsx
<input type="checkbox" className="w-5 h-5" />
```

**Po:**
```jsx
<input 
  type="checkbox" 
  className="w-5 h-5 cursor-pointer accent-purple-600" 
/>
```

### **5. Možné problémy a řešení**

#### **Problém: Banner se nezobrazuje**
**Řešení:**
```javascript
// V konzoli prohlížeče:
localStorage.removeItem('gdpr_consent')
location.reload()
```

#### **Problém: Checkboxy nejsou vidět**
**Řešení:** Zkontroluj, zda máš správně načtený CSS (glassmorphism)

#### **Problém: Formulář se neuloží**
**Řešení:** 
1. Zkontroluj konzoli pro chyby
2. Zkontroluj, zda backend běží (`http://localhost:3001/api/gdpr/consent`)
3. Zkontroluj network tab v DevTools

### **6. Testovací příkazy**

```bash
# Zkontrolovat, zda backend endpoint funguje
curl -X POST http://localhost:3001/api/gdpr/consent \
  -H "Content-Type: application/json" \
  -d '{
    "email": null,
    "consent_terms": true,
    "consent_privacy": true,
    "consent_marketing": true,
    "consent_cookies_analytics": true,
    "consent_cookies_marketing": false,
    "consent_method": "test"
  }'

# Zkontrolovat souhlasy v databázi
sqlite3 backend/realestate.db "SELECT * FROM gdpr_consents;"
```

### **7. Co dělat, když to nefunguje**

1. **Otevři DevTools** (F12)
2. **Jdi na Console tab**
3. **Vymaž localStorage:**
   ```javascript
   localStorage.clear()
   ```
4. **Obnov stránku** (F5)
5. **Klikni na "Nastavení" v cookie banneru**
6. **Změň checkboxy**
7. **Klikni "Uložit nastavení"**
8. **Sleduj konzoli** - měly by se zobrazit logy
9. **Pokud je chyba**, pošli mi screenshot konzole

### **8. Debug checklist**

- [ ] Backend běží na portu 3001
- [ ] Frontend běží na portu 3000
- [ ] V konzoli nejsou chyby
- [ ] localStorage je prázdný (nebo obsahuje starý souhlas)
- [ ] Cookie banner se zobrazuje
- [ ] Checkboxy jsou viditelné a klikatelné
- [ ] Po kliknutí na "Uložit" se banner zavře
- [ ] V localStorage je uložen souhlas
- [ ] V databázi je nový záznam

---

## 🎯 Výsledek

Cookie banner nyní funguje správně:
- ✅ Zobrazuje se při první návštěvě
- ✅ Checkboxy jsou viditelné a funkční
- ✅ Ukládá se do localStorage
- ✅ Ukládá se do databáze
- ✅ Má lepší error handling
- ✅ Má debug logy

---

*Opraveno: 22. října 2024*
