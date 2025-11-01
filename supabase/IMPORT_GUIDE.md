# Estate Private - Průvodce importem dat

## ✅ Export dokončen!

Data jsou připravena v `supabase/exports/`

## 📊 Co importovat (v tomto pořadí):

### 🔴 POVINNÉ (Hlavní data):

1. **companies.csv** (3 záznamy)
2. **users.csv** (22 záznamů)
3. **properties.csv** (208 záznamů)
4. **demands.csv** (102 záznamy)

### 🟡 DOPORUČENÉ:

5. **agent_declarations.csv** (17 záznamů)
6. **loi_signatures.csv** (17 záznamů)
7. **access_codes.csv** (3 záznamy)
8. **notifications.csv** (1 záznam)

### 🟢 VOLITELNÉ:

9. **audit_logs.csv** (296 záznamů) - můžete začít s čistým auditem
10. **refresh_tokens.csv** (72 záznamů) - regenerují se při přihlášení

### ⚪ PŘESKOČIT (prázdné tabulky):

- matches, favorites, viewings
- registration_requests
- brokerage_contracts
- gdpr_* tabulky
- *_tokens tabulky
- import_* tabulky

### ✅ UŽ MÁTE (z migrací):

- **contract_templates** (3) - z migrace 00002
- **email_templates** (9) - z migrace 00004

---

## 🚀 JAK IMPORTOVAT:

### Metoda 1: Supabase Dashboard (DOPORUČENO)

Pro každý CSV soubor:

1. Otevřít [Supabase Dashboard](https://supabase.com/dashboard/project/aanxxeyysqtpdcrrwnhm)
2. Kliknout na **Table Editor** v levém menu
3. Vybrat tabulku (např. "companies")
4. Kliknout **Insert** → **Import from CSV**
5. Nahrát soubor z `exports/` (např. `companies.csv`)
6. Kliknout **Import**
7. Počkat na dokončení
8. Opakovat pro další tabulky

### Metoda 2: psql (Pro pokročilé)

```bash
# Připojení k databázi
psql "postgresql://postgres:vApgog-cemfoc-kembu7@db.aanxxeyysqtpdcrrwnhm.supabase.co:5432/postgres"

# Import (příklad pro companies)
\copy companies FROM 'exports/companies.csv' WITH (FORMAT csv, HEADER true);
```

---

## ⚠️ DŮLEŽITÉ:

### Pořadí importu (kvůli foreign keys):

```
1. companies      (žádné závislosti)
2. users          (závisí na: companies)
3. properties     (závisí na: users)
4. demands        (závisí na: users)
5. agent_declarations (závisí na: users)
6. loi_signatures (závisí na: users, properties, demands)
7. access_codes   (závisí na: users)
8. notifications  (závisí na: users)
9. audit_logs     (závisí na: users)
```

### Pokud import selže:

1. **"duplicate key value"** - Tabulka už obsahuje data, nejdřív smazat:
   ```sql
   DELETE FROM table_name;
   ```

2. **"foreign key constraint"** - Importovat závislé tabulky v správném pořadí

3. **"invalid input syntax"** - Zkontrolovat UTF-8 encoding CSV souboru

---

## ✅ KONTROLA PO IMPORTU:

V Supabase SQL Editor spusťte:

```sql
-- Kontrola počtu záznamů
SELECT 
  (SELECT COUNT(*) FROM companies) as companies,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM properties) as properties,
  (SELECT COUNT(*) FROM demands) as demands,
  (SELECT COUNT(*) FROM contract_templates) as contract_templates,
  (SELECT COUNT(*) FROM email_templates) as email_templates;
```

**Očekávaný výsledek:**
```
companies: 3
users: 22
properties: 208
demands: 102
contract_templates: 3
email_templates: 9
```

---

## 📋 CHECKLIST:

```
[ ] companies.csv importován (3 záznamy)
[ ] users.csv importován (22 záznamů)
[ ] properties.csv importován (208 záznamů)
[ ] demands.csv importován (102 záznamů)
[ ] agent_declarations.csv importován (17 záznamů)
[ ] loi_signatures.csv importován (17 záznamů)
[ ] access_codes.csv importován (3 záznamy)
[ ] notifications.csv importován (1 záznam)
[ ] Kontrolní SQL dotaz spuštěn
[ ] Počty záznamů souhlasí
```

---

## 🎯 DALŠÍ KROK:

Po dokončení importu pokračujte na **Krok 3** v hlavním průvodci:
- Aktualizace backend/.env
- Aktualizace frontend/.env
- Instalace dependencies
- Test aplikace

---

**Připraveno k importu!** 🚀

Otevřete [Supabase Dashboard](https://supabase.com/dashboard/project/aanxxeyysqtpdcrrwnhm) a začněte s `companies.csv`
