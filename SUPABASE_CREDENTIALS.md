# Estate Private - Supabase Credentials

## Database Password
```
vApgog-cemfoc-kembu7
```

## ✅ AKTUÁLNÍ KONFIGURACE

### Backend .env
```env
# Supabase
SUPABASE_URL=https://aanxxeyysqtpdcrrwnhm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbnh4ZXl5c3F0cGRjcnJ3bmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDk1NDksImV4cCI6MjA3NzU4NTU0OX0.Zm2B5i98BILRgn_VsqwLTYUSWsMb9bs_TW0TkCNsaUo
SUPABASE_SERVICE_KEY=[NAJDETE_V_DASHBOARD_SETTINGS_API]

# Database
DATABASE_URL=postgresql://postgres:vApgog-cemfoc-kembu7@db.aanxxeyysqtpdcrrwnhm.supabase.co:5432/postgres

# Zakomentovat staré SQLite
# DATABASE_PATH=./realestate.db
```

### Frontend .env
```env
REACT_APP_SUPABASE_URL=https://aanxxeyysqtpdcrrwnhm.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbnh4ZXl5c3F0cGRjcnJ3bmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDk1NDksImV4cCI6MjA3NzU4NTU0OX0.Zm2B5i98BILRgn_VsqwLTYUSWsMb9bs_TW0TkCNsaUo
```

## Kde najít údaje v Supabase Dashboard

1. **Project URL & API Keys**:
   - Dashboard → Settings → API
   - Project URL: `https://[PROJECT_REF].supabase.co`
   - anon/public key: `eyJ...` (použít pro frontend)
   - service_role key: `eyJ...` (použít pro backend admin operace)

2. **Database Password**:
   - Již máte: `vApgog-cemfoc-kembu7`

3. **Project Reference**:
   - Dashboard → Settings → General
   - Reference ID: `aanxxeyysqtpdcrrwnhm`

## Připojení k databázi

### Přes psql
```bash
psql "postgresql://postgres:vApgog-cemfoc-kembu7@db.aanxxeyysqtpdcrrwnhm.supabase.co:5432/postgres"
```

### Přes Supabase CLI
```bash
supabase link --project-ref aanxxeyysqtpdcrrwnhm
# Heslo: vApgog-cemfoc-kembu7
```

## Bezpečnost

⚠️ **DŮLEŽITÉ:**
- Tento soubor NENÍ v .gitignore - NESDÍLEJTE ho!
- Heslo je pouze pro databázi, ne pro Supabase účet
- Pro produkci zvažte použití environment variables
- Service role key NIKDY nepoužívejte na frontendu

## Checklist po nastavení

- [ ] Supabase projekt vytvořen
- [ ] Project URL a API keys zkopírovány
- [ ] Backend .env aktualizován
- [ ] Frontend .env aktualizován
- [ ] Migrace aplikovány (supabase db push)
- [ ] Data importována
- [ ] Aplikace testována
- [ ] Tento soubor SMAZÁN nebo přesunut mimo git!

## Další kroky

1. Vytvořte projekt na supabase.com
2. Zkopírujte Project URL a API keys
3. Aktualizujte .env soubory
4. Spusťte migrace: `supabase db push`
5. Exportujte data: `cd supabase && ./export_data.sh`
6. Importujte data přes Dashboard
7. Testujte aplikaci

---

**Poznámka**: Po dokončení migrace doporučuji tento soubor smazat a heslo uložit do password manageru.
