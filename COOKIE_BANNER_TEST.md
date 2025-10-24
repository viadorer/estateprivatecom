# 🍪 Cookie Banner - Test Tlačítek

## ✅ Přidány Debug Logy

Všechna tlačítka nyní mají console.log pro sledování funkčnosti.

### **Console logy:**

| Tlačítko | Console log |
|----------|-------------|
| Přijmout vše | 🍪 Kliknuto na "Přijmout vše" |
| Pouze nezbytné | 🍪 Kliknuto na "Pouze nezbytné" |
| Nastavení | ⚙️ Otevírám nastavení cookies |
| Uložit nastavení | Ukládám nastavení cookies: {...} |
| Zpět | (zavře nastavení) |
| Zavření banneru | ✅ Banner se zavírá |

---

## 🧪 Testovací Postup

### **1. Příprava**

```javascript
// V konzoli prohlížeče (F12):
localStorage.removeItem('gdpr_consent')
location.reload()
```

### **2. Test tlačítka "Přijmout vše"**

1. ✅ Otevři stránku
2. ✅ Cookie banner by se měl zobrazit
3. ✅ Klikni na "Přijmout vše"
4. ✅ V konzoli by mělo být:
   ```
   🍪 Kliknuto na "Přijmout vše"
   ✅ Banner se zavírá (Přijmout vše)
   ```
5. ✅ Banner by se měl zavřít
6. ✅ Zkontroluj localStorage:
   ```javascript
   JSON.parse(localStorage.getItem('gdpr_consent'))
   ```
   Mělo by obsahovat:
   ```json
   {
     "consent_marketing": true,
     "consent_cookies_analytics": true,
     "consent_cookies_marketing": true,
     ...
   }
   ```

### **3. Test tlačítka "Pouze nezbytné"**

1. ✅ Vymaž localStorage a obnov stránku
2. ✅ Klikni na "Pouze nezbytné"
3. ✅ V konzoli by mělo být:
   ```
   🍪 Kliknuto na "Pouze nezbytné"
   ✅ Banner se zavírá (Pouze nezbytné)
   ```
4. ✅ Banner by se měl zavřít
5. ✅ Zkontroluj localStorage - všechny volitelné souhlasy by měly být `false`

### **4. Test tlačítka "Nastavení"**

1. ✅ Vymaž localStorage a obnov stránku
2. ✅ Klikni na "Nastavení"
3. ✅ V konzoli by mělo být:
   ```
   ⚙️ Otevírám nastavení cookies
   ```
4. ✅ Měl by se zobrazit formulář s checkboxy
5. ✅ Zkontroluj, že jsou vidět 3 sekce:
   - Nezbytné cookies (disabled, checked)
   - Analytické cookies (enabled, unchecked)
   - Marketingové cookies (enabled, unchecked)

### **5. Test checkboxů**

1. ✅ Klikni na checkbox "Analytické cookies"
2. ✅ Měl by se zaškrtnout (fialová barva)
3. ✅ Klikni na checkbox "Marketingové cookies"
4. ✅ Měl by se zaškrtnout
5. ✅ Odškrtni "Analytické cookies"
6. ✅ Měl by se odškrtnout

### **6. Test tlačítka "Uložit nastavení"**

1. ✅ Nastav checkboxy (např. analytics: true, marketing: false)
2. ✅ Klikni na "Uložit nastavení"
3. ✅ V konzoli by mělo být:
   ```
   Ukládám nastavení cookies: {analytics: true, marketing: false, necessary: true}
   Souhlas uložen: {success: true, id: X}
   ```
4. ✅ Banner by se měl zavřít
5. ✅ Zkontroluj localStorage - mělo by odpovídat tvému nastavení

### **7. Test tlačítka "Zpět"**

1. ✅ Vymaž localStorage a obnov stránku
2. ✅ Klikni na "Nastavení"
3. ✅ Klikni na "Zpět"
4. ✅ Měl by se zobrazit hlavní banner (ne nastavení)

### **8. Test tlačítka "X" (zavřít nastavení)**

1. ✅ Otevři nastavení
2. ✅ Klikni na "X" v pravém horním rohu
3. ✅ Měl by se zobrazit hlavní banner

---

## 🔍 Kontrola v Databázi

```bash
# Zkontroluj, zda se souhlasy ukládají do databáze
sqlite3 backend/realestate.db "SELECT * FROM gdpr_consents ORDER BY created_at DESC LIMIT 1;"
```

**Očekávaný výstup:**
```
1|NULL|NULL|::1|Mozilla/5.0...|1|1|1|0|0|1|1|1|1.0|cs|web_banner|2024-10-22 13:50:00|2024-10-22 13:50:00|NULL
```

---

## 🐛 Možné Problémy

### **Problém: Tlačítka nereagují**

**Možné příčiny:**
1. JavaScript chyba v konzoli
2. Overlay blokuje kliknutí
3. CSS z-index problém

**Řešení:**
```javascript
// Zkontroluj z-index
// Overlay: z-[9998]
// Banner: z-[9999]
```

### **Problém: Banner se nezavírá**

**Možné příčiny:**
1. Chyba při ukládání do localStorage
2. Chyba při API volání
3. State se neaktualizuje

**Řešení:**
- Zkontroluj konzoli pro chyby
- Zkontroluj network tab v DevTools
- Zkontroluj, zda backend běží

### **Problém: Checkboxy nejsou vidět**

**Možné příčiny:**
1. CSS problém
2. Špatný styling

**Řešení:**
```css
/* Checkboxy by měly mít: */
.w-5 .h-5 .cursor-pointer .accent-purple-600
```

---

## ✅ Checklist Funkčnosti

- [ ] Banner se zobrazuje při první návštěvě
- [ ] Tlačítko "Přijmout vše" funguje
- [ ] Tlačítko "Pouze nezbytné" funguje
- [ ] Tlačítko "Nastavení" otevírá formulář
- [ ] Checkboxy jsou viditelné
- [ ] Checkboxy jsou klikatelné
- [ ] Checkbox "Nezbytné" je disabled
- [ ] Checkboxy mění stav při kliknutí
- [ ] Tlačítko "Uložit nastavení" funguje
- [ ] Tlačítko "Zpět" funguje
- [ ] Tlačítko "X" funguje
- [ ] Banner se zavírá po uložení
- [ ] Data se ukládají do localStorage
- [ ] Data se ukládají do databáze
- [ ] Console logy se zobrazují
- [ ] Žádné chyby v konzoli

---

## 📊 Očekávané Console Logy

### **Scénář 1: Přijmout vše**
```
🍪 Kliknuto na "Přijmout vše"
✅ Banner se zavírá (Přijmout vše)
```

### **Scénář 2: Pouze nezbytné**
```
🍪 Kliknuto na "Pouze nezbytné"
✅ Banner se zavírá (Pouze nezbytné)
```

### **Scénář 3: Vlastní nastavení**
```
⚙️ Otevírám nastavení cookies
Ukládám nastavení cookies: {analytics: true, marketing: false, necessary: true}
Souhlas uložen: {success: true, id: 1}
```

---

## 🎯 Výsledek

Všechna tlačítka by nyní měla fungovat správně s debug logy v konzoli.

Pokud nějaké tlačítko nefunguje, pošli mi screenshot konzole s chybou.

---

*Vytvořeno: 22. října 2024*
