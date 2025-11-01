# Estate Private - Kompletní Migrační Checklist

## ✅ Přehled migrací

### Migrace v pořadí:

1. **00001_initial_schema.sql** - Databázové schéma (24 tabulek)
2. **00002_seed_templates.sql** - Contract templates (3 šablony smluv)
3. **00003_rls_policies_fixed.sql** - RLS vypnuté (zabezpečení na backendu)
4. **00004_seed_email_templates.sql** - Email templates (9 šablon)

## 📊 Databázové tabulky (24)

### Hlavní tabulky
- [x] companies (3 záznamy)
- [x] users (22 záznamů)
- [x] properties (208 záznamů)
- [x] demands (102 záznamů)
- [x] registration_requests

### Matchování a aktivity
- [x] matches
- [x] favorites
- [x] viewings
- [x] notifications

### Smlouvy a dokumenty
- [x] contract_templates (3 šablony: LOI, brokerage, agent_cooperation)
- [x] loi_signatures
- [x] brokerage_contracts
- [x] agent_declarations
- [x] access_codes

### Komunikace
- [x] email_templates (9 šablon)

### GDPR a compliance
- [x] gdpr_consents
- [x] gdpr_requests
- [x] gdpr_breaches
- [x] audit_logs

### Autentizace
- [x] refresh_tokens
- [x] password_reset_tokens
- [x] email_verification_tokens

### Import
- [x] import_logs
- [x] import_mappings

## 🎯 Postup migrace

### Krok 1: Aplikace schématu ✅
```sql
-- V Supabase SQL Editor spusťte:
-- Zkopírujte a spusťte: supabase/migrations/00001_initial_schema.sql
```

**Výsledek:** 24 tabulek vytvořeno

### Krok 2: Seed contract templates ✅
```sql
-- Zkopírujte a spusťte: supabase/migrations/00002_seed_templates.sql
```

**Výsledek:** 3 šablony smluv (LOI, brokerage_contract, agent_cooperation)

### Krok 3: Vypnutí RLS ✅
```sql
-- Zkopírujte a spusťte: supabase/migrations/00003_rls_policies_fixed.sql
```

**Výsledek:** RLS disabled, zabezpečení na úrovni backendu

### Krok 4: Seed email templates ✅
```sql
-- Zkopírujte a spusťte: supabase/migrations/00004_seed_email_templates.sql
```

**Výsledek:** 9 email šablon

### Krok 5: Export dat ze SQLite
```bash
cd supabase
./export_data.sh
```

**Výsledek:** CSV soubory v `supabase/exports/`

### Krok 6: Import dat do Supabase

**Pro každou tabulku s daty:**

1. **companies** (3 záznamy)
   - Dashboard → Table Editor → companies → Insert → Import CSV
   - Nahrát: `exports/companies.csv`

2. **users** (22 záznamů)
   - Dashboard → Table Editor → users → Insert → Import CSV
   - Nahrát: `exports/users.csv`

3. **properties** (208 záznamů)
   - Dashboard → Table Editor → properties → Insert → Import CSV
   - Nahrát: `exports/properties.csv`

4. **demands** (102 záznamů)
   - Dashboard → Table Editor → demands → Insert → Import CSV
   - Nahrát: `exports/demands.csv`

5. **Ostatní tabulky** (pokud mají data)
   - matches
   - favorites
   - audit_logs
   - atd.

## 🔍 Kontrola po migraci

### 1. Kontrola tabulek
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Očekávaný výsledek:** 24 tabulek

### 2. Kontrola contract templates
```sql
SELECT template_key, name FROM contract_templates;
```

**Očekávaný výsledek:**
- loi | Letter of Intent (LOI)
- brokerage_contract | Zprostředkovatelská smlouva
- agent_cooperation | Smlouva o spolupráci s agentem

### 3. Kontrola email templates
```sql
SELECT template_key, name FROM email_templates;
```

**Očekávaný výsledek:** 9 šablon
- registration_approval
- access_code
- welcome
- match_notification
- contract_reminder
- new_property_match
- new_demand_match
- property_approved
- demand_approved

### 4. Kontrola dat
```sql
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM properties) as properties,
  (SELECT COUNT(*) FROM demands) as demands,
  (SELECT COUNT(*) FROM companies) as companies;
```

**Očekávaný výsledek:**
- users: 22
- properties: 208
- demands: 102
- companies: 3

### 5. Kontrola RLS
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**Očekávaný výsledek:** Všechny tabulky mají `rowsecurity = false`

## 🔧 Konfigurace aplikace

### Backend .env
```env
# Supabase
SUPABASE_URL=https://aanxxeyysqtpdcrrwnhm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbnh4ZXl5c3F0cGRjcnJ3bmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDk1NDksImV4cCI6MjA3NzU4NTU0OX0.Zm2B5i98BILRgn_VsqwLTYUSWsMb9bs_TW0TkCNsaUo
SUPABASE_SERVICE_KEY=[NAJDETE_V_DASHBOARD_SETTINGS_API]

# Database
DATABASE_URL=postgresql://postgres:vApgog-cemfoc-kembu7@db.aanxxeyysqtpdcrrwnhm.supabase.co:5432/postgres

# Zakomentovat staré
# DATABASE_PATH=./realestate.db
```

### Frontend .env
```env
REACT_APP_SUPABASE_URL=https://aanxxeyysqtpdcrrwnhm.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbnh4ZXl5c3F0cGRjcnJ3bmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDk1NDksImV4cCI6MjA3NzU4NTU0OX0.Zm2B5i98BILRgn_VsqwLTYUSWsMb9bs_TW0TkCNsaUo
```

## 🧪 Testování

### 1. Backend test
```bash
cd backend
npm install @supabase/supabase-js pg
npm start
```

### 2. Frontend test
```bash
cd frontend
npm install @supabase/supabase-js
npm start
```

### 3. Funkční testy
- [ ] Přihlášení uživatele
- [ ] Zobrazení nemovitostí
- [ ] Vytvoření nové nemovitosti (agent)
- [ ] Vytvoření poptávky (client)
- [ ] Matchování nabídek a poptávek
- [ ] Schvalování nabídek (admin)
- [ ] Odesílání emailů

## ⚠️ Důležité poznámky

1. **SERVICE_ROLE key** - Najdete v Dashboard → Settings → API
   - Použít POUZE v backendu
   - NIKDY ne na frontendu

2. **RLS je vypnuté** - Zabezpečení je na úrovni backendu
   - Backend middleware kontroluje JWT tokeny
   - Role-based access control

3. **Email templates** - Obsahují URL `https://aanxxeyysqtpdcrrwnhm.supabase.co`
   - Po nasazení na produkci změňte na vaši doménu

4. **Backup** - Před migrací zálohujte SQLite databázi
   ```bash
   cp backend/realestate.db backend/realestate.db.backup
   ```

## 📚 Dokumentace

- **QUICK_START.md** - Rychlý průvodce
- **README.md** - Detailní dokumentace
- **SUPABASE_MIGRATION.md** - Kompletní přehled
- **SUPABASE_CREDENTIALS.md** - Přihlašovací údaje
- **RLS_EXPLANATION.md** - Vysvětlení RLS

## ✅ Finální checklist

- [ ] Všechny 4 migrace aplikovány
- [ ] Contract templates (3) importovány
- [ ] Email templates (9) importovány
- [ ] Data exportována ze SQLite
- [ ] Data importována do Supabase
- [ ] Backend .env aktualizován
- [ ] Frontend .env aktualizován
- [ ] Backend dependencies nainstalovány
- [ ] Frontend dependencies nainstalovány
- [ ] Backend běží bez chyb
- [ ] Frontend běží bez chyb
- [ ] Přihlášení funguje
- [ ] Zobrazení dat funguje
- [ ] Vytváření záznamů funguje
- [ ] Matchování funguje
- [ ] Emaily se odesílají

## 🎉 Hotovo!

Po dokončení všech kroků máte:
- ✅ Škálovatelnou PostgreSQL databázi
- ✅ Všechny tabulky a data migrována
- ✅ Contract a email templates
- ✅ Funkční aplikaci na Supabase
- ✅ Automatické backupy
- ✅ Monitoring v Dashboardu
