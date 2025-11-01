# Estate Private - Supabase Migration Guide

## Přehled

Tento adresář obsahuje migrační soubory pro přesun Estate Private databáze z SQLite na Supabase (PostgreSQL).

## Struktura

```
supabase/
├── config.toml                    # Konfigurace Supabase projektu
├── migrations/
│   ├── 00001_initial_schema.sql   # Základní schéma databáze
│   └── 00002_seed_templates.sql   # Šablony smluv a emailů
└── README.md                      # Tento soubor
```

## Hlavní rozdíly SQLite vs PostgreSQL

### 1. Datové typy
- `INTEGER` → `SERIAL` pro auto-increment primary keys
- `DATETIME` → `TIMESTAMPTZ` (timestamp with timezone)
- `CURRENT_TIMESTAMP` → `NOW()`

### 2. Boolean hodnoty
- SQLite používá `INTEGER` (0/1)
- PostgreSQL má nativní `BOOLEAN`, ale pro zpětnou kompatibilitu ponechány `INTEGER`

### 3. Auto-increment
- SQLite: `AUTOINCREMENT`
- PostgreSQL: `SERIAL` nebo `BIGSERIAL`

### 4. Triggery
- PostgreSQL vyžaduje funkce pro triggery
- Vytvořena funkce `update_updated_at_column()` pro automatickou aktualizaci `updated_at`

## Postup migrace

### 1. Vytvoření Supabase projektu

1. Přihlaste se na [supabase.com](https://supabase.com)
2. Vytvořte nový projekt
3. Poznamenejte si:
   - Project URL
   - API Key (anon/public)
   - Database Password

### 2. Nastavení Supabase CLI

```bash
# Instalace Supabase CLI
brew install supabase/tap/supabase

# Přihlášení
supabase login

# Inicializace projektu (pokud ještě není)
cd /Users/david/Cascade\ projekty/reactrealprojekt
supabase init

# Propojení s projektem
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Spuštění migrací

```bash
# Lokální vývoj (volitelné)
supabase start

# Aplikace migrací na produkční databázi
supabase db push

# Nebo manuálně přes SQL Editor v Supabase Dashboard:
# 1. Otevřete SQL Editor
# 2. Zkopírujte obsah 00001_initial_schema.sql
# 3. Spusťte
# 4. Zkopírujte obsah 00002_seed_templates.sql
# 5. Spusťte
```

### 4. Export dat ze SQLite

```bash
cd backend

# Export všech dat
sqlite3 realestate.db .dump > data_export.sql

# Nebo export po tabulkách
sqlite3 realestate.db "SELECT * FROM users;" > users_export.csv
sqlite3 realestate.db "SELECT * FROM properties;" > properties_export.csv
# atd...
```

### 5. Import dat do Supabase

Data je potřeba upravit pro PostgreSQL syntaxi:

```bash
# Nahradit SQLite specifické příkazy
sed -i '' 's/AUTOINCREMENT/SERIAL/g' data_export.sql
sed -i '' 's/DATETIME DEFAULT CURRENT_TIMESTAMP/TIMESTAMPTZ DEFAULT NOW()/g' data_export.sql

# Import přes psql
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" < data_export.sql
```

**Nebo použijte Supabase Dashboard:**
1. Otevřete Table Editor
2. Pro každou tabulku použijte "Insert" → "Import from CSV"

### 6. Aktualizace aplikace

Aktualizujte connection string v `.env`:

```env
# Staré (SQLite)
# DATABASE_URL=./realestate.db

# Nové (Supabase)
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_KEY=[YOUR_SERVICE_KEY]
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### 7. Instalace Supabase klienta

```bash
cd frontend
npm install @supabase/supabase-js

cd ../backend
npm install @supabase/supabase-js
```

## Ověření migrace

### 1. Kontrola schématu

```sql
-- V Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Měli byste vidět všechny tabulky:
- companies
- users
- properties
- demands
- matches
- favorites
- viewings
- audit_logs
- access_codes
- agent_declarations
- brokerage_contracts
- loi_signatures
- notifications
- gdpr_consents
- gdpr_requests
- gdpr_breaches
- refresh_tokens
- password_reset_tokens
- email_verification_tokens
- import_logs
- import_mappings
- email_templates
- contract_templates

### 2. Kontrola dat

```sql
-- Počet záznamů v hlavních tabulkách
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM properties) as properties,
  (SELECT COUNT(*) FROM demands) as demands,
  (SELECT COUNT(*) FROM matches) as matches;
```

### 3. Test aplikace

1. Spusťte backend: `cd backend && npm start`
2. Spusťte frontend: `cd frontend && npm start`
3. Otestujte:
   - Přihlášení
   - Zobrazení nemovitostí
   - Vytvoření poptávky
   - Matchování

## Row Level Security (RLS)

Po migraci doporučuji nastavit RLS politiky pro zabezpečení:

```sql
-- Příklad: Uživatelé vidí pouze své vlastní záznamy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id::text);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id::text);
```

## Backup strategie

Supabase automaticky zálohuje databázi, ale doporučuji:

```bash
# Pravidelný export
supabase db dump -f backup_$(date +%Y%m%d).sql

# Nebo přes pg_dump
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" > backup.sql
```

## Troubleshooting

### Chyba: "relation already exists"
- Smažte existující tabulky nebo použijte `DROP TABLE IF EXISTS`

### Chyba: "permission denied"
- Zkontrolujte, že používáte service_role key pro admin operace

### Chyba s časovými zónami
- Ujistěte se, že používáte `TIMESTAMPTZ` místo `TIMESTAMP`

### Problémy s foreign keys
- Zkontrolujte pořadí vytváření tabulek v migraci

## Další kroky

1. **Realtime subscriptions**: Využijte Supabase Realtime pro live updates
2. **Storage**: Přesuňte obrázky do Supabase Storage
3. **Edge Functions**: Přesuňte některé backend funkce do Edge Functions
4. **Auth**: Zvažte použití Supabase Auth místo vlastní implementace

## Kontakt

Pro otázky nebo problémy vytvořte issue v repozitáři.
