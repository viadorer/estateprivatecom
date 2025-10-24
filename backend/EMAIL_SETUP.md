# 📧 Nastavení emailu (Nodemailer + Gmail)

## 🚀 Rychlý start

### 1. Vytvořte `.env` soubor v `/backend` složce

```bash
cd backend
cp .env.example .env
```

### 2. Získejte Gmail App Password

**DŮLEŽITÉ:** Pro Gmail **NEMŮŽETE** použít běžné heslo! Musíte vytvořit "App Password".

#### Krok za krokem:

1. **Přihlaste se** do svého Google účtu na https://myaccount.google.com

2. **Zapněte 2-Step Verification** (pokud ještě není zapnutá):
   - Jděte na https://myaccount.google.com/security
   - Najděte "2-Step Verification" a zapněte ji
   - Postupujte podle instrukcí (ověření telefonem)

3. **Vytvořte App Password**:
   - Jděte na https://myaccount.google.com/apppasswords
   - Nebo: Security → 2-Step Verification → App passwords (dole na stránce)
   
4. **Vygenerujte heslo**:
   - Vyberte "Mail" jako aplikaci
   - Vyberte "Other (Custom name)" jako zařízení
   - Zadejte název: "Realitní systém"
   - Klikněte na "Generate"

5. **Zkopírujte heslo**:
   - Google vygeneruje 16-znakové heslo (např. `abcd efgh ijkl mnop`)
   - **DŮLEŽITÉ:** Zkopírujte ho BEZ MEZER: `abcdefghijklmnop`

### 3. Upravte `.env` soubor

Otevřete `/backend/.env` a vyplňte:

```env
EMAIL_USER=vas-email@gmail.com
EMAIL_PASSWORD=vase16znakoveheslo
```

**Příklad:**
```env
EMAIL_USER=realitka@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

### 4. Restartujte backend server

```bash
npm start
```

## ✅ Testování

### Test 1: Vygenerování kódu s emailem

```bash
curl -X POST http://localhost:3001/api/access-codes \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 4,
    "entity_type": "property",
    "entity_id": 1,
    "expires_in_days": 7,
    "send_email": true
  }'
```

Pokud vše funguje, měli byste vidět:
```json
{
  "id": 1,
  "code": "ABC123",
  "expires_at": "2025-10-29T...",
  "message": "Kód úspěšně vygenerován",
  "email_sent": true
}
```

A v konzoli:
```
📧 Email s kódem odeslán na martin.dvorak@email.cz
```

### Test 2: Zkontrolujte email

Přihlaste se do emailu klienta a zkontrolujte, zda přišel email s přístupovým kódem.

## 🔧 Řešení problémů

### Chyba: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Příčina:** Používáte běžné heslo místo App Password

**Řešení:** 
1. Zkontrolujte, že máte zapnutou 2-Step Verification
2. Vytvořte nové App Password (viz instrukce výše)
3. Použijte App Password v `.env` souboru

### Chyba: "Missing credentials for 'PLAIN'"

**Příčina:** `.env` soubor není správně načten nebo chybí údaje

**Řešení:**
1. Zkontrolujte, že `.env` soubor existuje v `/backend` složce
2. Zkontrolujte, že obsahuje `EMAIL_USER` a `EMAIL_PASSWORD`
3. Restartujte server

### Email se neposílá, ale kód se vytvoří

**Příčina:** Email služba selhala, ale kód byl úspěšně vygenerován

**Řešení:**
1. Zkontrolujte konzoli serveru pro chybové hlášky
2. Zkontrolujte `.env` konfiguraci
3. Zkuste test curl s `"send_email": true`

## 📝 Poznámky

- **Bezpečnost:** Nikdy nesdílejte App Password! Je stejně důležité jako vaše hlavní heslo.
- **Limit:** Gmail má limit 500 emailů/den pro běžné účty
- **Alternativa:** Pro produkci zvažte použití profesionální email služby (SendGrid, AWS SES, atd.)

## 🎯 Co se odesílá

Když se vygeneruje přístupový kód, klient automaticky dostane email s:

- ✅ Přístupovým kódem (6 znaků)
- ✅ Názvem nemovitosti/poptávky
- ✅ Datem expirace (pokud je nastaveno)
- ✅ Instrukcemi jak kód použít
- ✅ Bezpečnostními upozorněními

Email je plně formátovaný v HTML s moderním designem! 🎨
