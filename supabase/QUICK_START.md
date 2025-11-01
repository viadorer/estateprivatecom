# Estate Private → Supabase - Rychlý průvodce

## 🎯 Co potřebujete

1. **Supabase účet** (zdarma na [supabase.com](https://supabase.com))
2. **Supabase CLI** (`brew install supabase/tap/supabase`)
3. **Aktuální SQLite databáze** (`backend/realestate.db`)

## 📋 Postup v 5 krocích

### Krok 1: Vytvoření projektu na Supabase

```
1. Přihlaste se na supabase.com
2. Klikněte na "New Project"
3. Vyplňte:
   - Name: Estate Private
   - Database Password: [silné heslo]
   - Region: Europe (Frankfurt)
4. Počkejte na vytvoření (~2 minuty)
5. Poznamenejte si:
   ✓ Project URL
   ✓ API Keys (anon/public)
   ✓ Database Password
```

### Krok 2: Aplikace databázového schématu

**Možnost A - Přes Dashboard (jednodušší):**
```
1. Otevřete Supabase Dashboard → SQL Editor
2. Zkopírujte obsah migrations/00001_initial_schema.sql
3. Klikněte "Run"
4. Zkopírujte obsah migrations/00002_seed_templates.sql
5. Klikněte "Run"
6. (Volitelně) Zkopírujte 00003_rls_policies.sql a spusťte
```

**Možnost B - Přes CLI:**
```bash
cd /Users/david/Cascade\ projekty/reactrealprojekt
supabase login
supabase link --project-ref [VÁŠ_PROJECT_REF]
supabase db push
```

### Krok 3: Export dat ze SQLite

```bash
cd supabase
./export_data.sh
```

Výsledek: Data v `supabase/exports/` (CSV soubory)

### Krok 4: Import dat do Supabase

**Pro každou tabulku s daty:**
```
1. Supabase Dashboard → Table Editor
2. Vyberte tabulku (např. "users")
3. Klikněte "Insert" → "Import from CSV"
4. Nahrajte soubor z exports/ (např. users.csv)
5. Klikněte "Import"
6. Opakujte pro všechny tabulky s daty
```

**Důležité tabulky k importu:**
- ✅ companies
- ✅ users
- ✅ properties
- ✅ demands
- ✅ matches
- ✅ favorites
- ✅ audit_logs

### Krok 5: Aktualizace aplikace

**Backend `.env`:**
```env
# Přidejte tyto řádky:
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_KEY=[SERVICE_KEY]
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# Zakomentujte staré:
# DATABASE_PATH=./realestate.db
```

**Instalace závislostí:**
```bash
cd backend
npm install @supabase/supabase-js pg

cd ../frontend
npm install @supabase/supabase-js
```

## ✅ Ověření

### 1. Kontrola tabulek
```sql
-- V Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Měli byste vidět 24 tabulek.

### 2. Kontrola dat
```sql
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM properties) as properties,
  (SELECT COUNT(*) FROM demands) as demands;
```

### 3. Test aplikace
```bash
cd backend && npm start
cd frontend && npm start
```

Otestujte:
- ✓ Přihlášení
- ✓ Zobrazení nemovitostí
- ✓ Vytvoření poptávky

## 🚨 Časté problémy

### "relation already exists"
```sql
-- Smazat a začít znovu
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

### "permission denied"
- Použijte SERVICE_KEY místo ANON_KEY pro admin operace

### CSV import selhává
- Zkontrolujte UTF-8 encoding
- Ověřte, že CSV má správné hlavičky

## 📊 Databázové schéma

```
Estate Private Database (PostgreSQL)
│
├── 👥 Uživatelé
│   ├── companies (realitní kanceláře)
│   ├── users (admin, agent, client)
│   └── registration_requests (žádosti o registraci)
│
├── 🏠 Nemovitosti
│   ├── properties (nabídky)
│   ├── demands (poptávky)
│   ├── matches (automatické matchování)
│   ├── favorites (oblíbené)
│   └── viewings (prohlídky)
│
├── 📄 Smlouvy
│   ├── contract_templates (šablony)
│   ├── loi_signatures (LOI podpisy)
│   ├── brokerage_contracts (zprostředkovatelské)
│   ├── agent_declarations (prohlášení)
│   └── access_codes (přístupové kódy)
│
├── 🔔 Komunikace
│   ├── notifications (notifikace)
│   └── email_templates (email šablony)
│
├── 🔒 GDPR & Bezpečnost
│   ├── gdpr_consents (souhlasy)
│   ├── gdpr_requests (žádosti)
│   ├── gdpr_breaches (incidenty)
│   └── audit_logs (audit)
│
├── 🔑 Autentizace
│   ├── refresh_tokens
│   ├── password_reset_tokens
│   └── email_verification_tokens
│
└── 📥 Import
    ├── import_logs
    └── import_mappings
```

## 🎁 Bonusy Supabase

### Realtime updates
```javascript
supabase
  .channel('properties')
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'properties' 
  }, payload => {
    console.log('Nová nemovitost!', payload)
  })
  .subscribe()
```

### Storage pro obrázky
```javascript
const { data, error } = await supabase.storage
  .from('property-images')
  .upload(`${propertyId}/main.jpg`, file)
```

### Edge Functions
```bash
supabase functions new send-notification
supabase functions deploy send-notification
```

## 📚 Další zdroje

- **Detailní dokumentace**: `supabase/README.md`
- **Kompletní přehled**: `SUPABASE_MIGRATION.md`
- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

## 💡 Tipy

1. **Začněte s testovacím projektem** - Vyzkoušejte migraci nejdřív na testovacích datech
2. **Zálohujte SQLite** - Před migrací: `cp realestate.db realestate.db.backup`
3. **Používejte RLS** - Aktivujte Row Level Security pro bezpečnost
4. **Monitorujte výkon** - Sledujte Dashboard → Database → Query Performance
5. **Nastavte backupy** - Supabase zálohuje automaticky, ale mějte i vlastní

## ✨ Hotovo!

Po dokončení máte:
- ✅ Škálovatelnou PostgreSQL databázi
- ✅ Automatické backupy
- ✅ Realtime capabilities
- ✅ Integrované storage
- ✅ Row Level Security
- ✅ Přehledný dashboard

**Gratulujeme k úspěšné migraci! 🎉**
