# Estate Private - Migrace na Supabase

## Shrnutí

Projekt Estate Private je připraven k migraci z SQLite na Supabase (PostgreSQL). Všechny migrační soubory jsou připraveny v adresáři `/supabase/migrations/`.

## Co bylo připraveno

### 1. Migrační soubory

```
supabase/
├── migrations/
│   ├── 00001_initial_schema.sql    # Kompletní databázové schéma
│   ├── 00002_seed_templates.sql    # Šablony smluv (LOI, brokerage, agent)
│   └── 00003_rls_policies.sql      # Row Level Security politiky
├── config.toml                      # Konfigurace Supabase projektu
├── export_data.sh                   # Skript pro export dat ze SQLite
├── .env.example                     # Příklad environment variables
├── .gitignore                       # Git ignore pro Supabase
└── README.md                        # Detailní dokumentace
```

### 2. Hlavní změny SQLite → PostgreSQL

- **Auto-increment**: `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
- **Časové značky**: `DATETIME` → `TIMESTAMPTZ` (s timezone)
- **Funkce**: `CURRENT_TIMESTAMP` → `NOW()`
- **Triggery**: Přidány PostgreSQL funkce pro auto-update `updated_at`
- **Indexy**: Zachovány všechny důležité indexy

### 3. Databázové tabulky (24 tabulek)

**Hlavní tabulky:**
- `companies` - Realitní kanceláře
- `users` - Uživatelé (admin, agent, client)
- `properties` - Nabídky nemovitostí
- `demands` - Poptávky klientů
- `matches` - Automatické matchování

**Smlouvy a dokumenty:**
- `contract_templates` - Šablony smluv (LOI, brokerage, agent_cooperation)
- `loi_signatures` - Podpisy LOI
- `brokerage_contracts` - Zprostředkovatelské smlouvy
- `agent_declarations` - Prohlášení agentů
- `access_codes` - Přístupové kódy

**Uživatelská aktivita:**
- `favorites` - Oblíbené nemovitosti
- `viewings` - Prohlídky
- `notifications` - Notifikace

**GDPR a compliance:**
- `gdpr_consents` - Souhlasy
- `gdpr_requests` - Žádosti o data
- `gdpr_breaches` - Incidenty

**Autentizace:**
- `refresh_tokens`
- `password_reset_tokens`
- `email_verification_tokens`

**Import a audit:**
- `import_logs` - Logy importů
- `import_mappings` - Mapování externích ID
- `audit_logs` - Audit všech akcí

**Ostatní:**
- `registration_requests` - Žádosti o registraci
- `email_templates` - Šablony emailů

## Rychlý start

### 1. Vytvoření Supabase projektu

```bash
# Přihlášení na supabase.com
# Vytvoření nového projektu
# Poznamenat si: Project URL, API Keys, Database Password
```

### 2. Instalace Supabase CLI

```bash
brew install supabase/tap/supabase
supabase login
```

### 3. Propojení projektu

```bash
cd /Users/david/Cascade\ projekty/reactrealprojekt
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Aplikace migrací

```bash
# Aplikace všech migrací
supabase db push

# Nebo manuálně v Supabase Dashboard → SQL Editor:
# 1. Spustit 00001_initial_schema.sql
# 2. Spustit 00002_seed_templates.sql
# 3. Spustit 00003_rls_policies.sql (volitelné, pro zabezpečení)
```

### 5. Export dat ze SQLite

```bash
cd supabase
./export_data.sh
```

Data budou exportována do `supabase/exports/`:
- CSV soubory pro každou tabulku
- `schema.sql` - Schéma databáze
- `full_dump.sql` - Kompletní dump

### 6. Import dat do Supabase

**Možnost A: Přes Supabase Dashboard**
1. Table Editor → Vybrat tabulku → Insert → Import from CSV
2. Nahrát příslušný CSV soubor z `exports/`

**Možnost B: Přes psql**
```bash
# Připojení k databázi
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Import dat (po úpravě syntaxe)
\i exports/full_dump.sql
```

### 7. Aktualizace aplikace

**Backend `.env`:**
```env
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_KEY=[YOUR_SERVICE_KEY]
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**Frontend `.env`:**
```env
REACT_APP_SUPABASE_URL=https://[PROJECT_REF].supabase.co
REACT_APP_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
```

### 8. Instalace Supabase klienta

```bash
# Backend
cd backend
npm install @supabase/supabase-js pg

# Frontend
cd frontend
npm install @supabase/supabase-js
```

## Row Level Security (RLS)

Migrace `00003_rls_policies.sql` obsahuje kompletní RLS politiky:

- **Admini**: Přístup ke všemu
- **Agenti**: Přístup k vlastním nemovitostem a všem poptávkám
- **Klienti**: Přístup k vlastním poptávkám a aktivním nemovitostem
- **Veřejnost**: Žádný přístup (vyžaduje autentizaci)

## Výhody Supabase

1. **Škálovatelnost**: PostgreSQL zvládne miliony záznamů
2. **Realtime**: Live updates pomocí WebSocket
3. **Storage**: Integrované úložiště pro obrázky a dokumenty
4. **Auth**: Vestavěná autentizace (volitelné)
5. **Edge Functions**: Serverless funkce
6. **Backupy**: Automatické zálohy
7. **Dashboard**: Přehledné administrační rozhraní

## Bezpečnost

- ✅ Row Level Security (RLS) politiky
- ✅ Šifrované spojení (SSL)
- ✅ Automatické backupy
- ✅ Audit logy
- ✅ GDPR compliance

## Monitoring

Po migraci můžete sledovat:
- Počet dotazů (Dashboard → Database → Query Performance)
- Velikost databáze (Dashboard → Database → Database Size)
- API usage (Dashboard → Settings → API)
- Logy (Dashboard → Logs)

## Troubleshooting

### Chyba: "relation already exists"
```sql
-- Smazat všechny tabulky a začít znovu
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### Chyba s foreign keys
- Zkontrolovat pořadí vytváření tabulek
- Ujistit se, že referenční tabulky existují

### Problémy s daty
- Zkontrolovat formát CSV (UTF-8)
- Ověřit, že ID jsou správně mapována

## Další kroky po migraci

1. **Přesun obrázků do Supabase Storage**
   ```javascript
   const { data, error } = await supabase.storage
     .from('property-images')
     .upload('image.jpg', file)
   ```

2. **Realtime subscriptions**
   ```javascript
   supabase
     .channel('properties')
     .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, 
       payload => console.log(payload))
     .subscribe()
   ```

3. **Edge Functions** pro složitější logiku
   ```bash
   supabase functions new match-properties
   ```

## Kontakt a podpora

- Dokumentace: `supabase/README.md`
- Supabase Docs: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/

## Checklist před produkcí

- [ ] Všechny migrace aplikovány
- [ ] Data importována a ověřena
- [ ] RLS politiky aktivní
- [ ] Environment variables nastaveny
- [ ] Aplikace testována s Supabase
- [ ] Backupy nakonfigurovány
- [ ] Monitoring nastaven
- [ ] SSL certifikáty platné
- [ ] API rate limity nastaveny
