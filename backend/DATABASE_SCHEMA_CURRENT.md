# Aktuální schéma databáze Estate Private

**Datum:** 26.10.2025
**Verze:** 1.0

## Důležité poznámky

- **VŽDY** před smazáním databáze vytvořte backup: `sqlite3 realestate.db .dump > backup_$(date +%Y%m%d_%H%M%S).sql`
- Schéma je definováno v `database.js`
- Kompletní backup je v `database_full_backup.sql`
- Pouze schéma je v `database_schema_backup.sql`

## Tabulky

### 1. users
- Uživatelé systému (admin, agent, client)
- Obsahuje: jméno, email, heslo (hash), role, společnost, IČO, telefon

### 2. properties
- Nabídky nemovitostí
- Obsahuje: všechny detaily nemovitosti, agent_id, status, valid_until

### 3. demands
- Poptávky klientů
- **NOVÁ STRUKTURA:**
  - `property_requirements` (JSON) - pole s různými typy nemovitostí
  - `common_filters` (JSON) - společné filtry (cena)
  - `locations` (JSON) - pole lokalit
  - `valid_until` - datum platnosti
  - `last_confirmed_at` - datum posledního potvrzení
- **STARÁ STRUKTURA:** (zpětná kompatibilita)
  - `cities`, `districts`, `required_features` (JSON)

### 4. contract_templates
**DŮLEŽITÉ:** Sloupec je `template_key`, NE `template_type`!

Šablony smluv:
- `loi` - Letter of Intent (Dohoda o záměru)
- `brokerage_contract` - Zprostředkovatelská smlouva
- `agent_cooperation` - Smlouva o spolupráci s agentem

Sloupce:
- `template_key` (TEXT, UNIQUE) - klíč šablony
- `name` (TEXT) - název
- `description` (TEXT) - popis
- `template_content` (TEXT) - obsah smlouvy s placeholdery
- `variables` (TEXT, JSON) - pole proměnných
- `is_active` (INTEGER) - aktivní/neaktivní

### 5. loi_signatures
Podpisy LOI smluv

**DŮLEŽITÉ SLOUPCE:**
- `contract_text` (TEXT) - plný text podepsané smlouvy
- `contract_hash` (TEXT) - hash pro ověření integrity
- `ip_address` (TEXT) - IP adresa při podpisu
- `verification_code` (TEXT) - ověřovací kód

### 6. access_codes
Přístupové kódy pro zobrazení detailů
- Pro properties i demands
- `entity_type`: 'property', 'demand', 'agent_declaration'

### 7. agent_declarations
Prohlášení agenta při vytváření nabídky

### 8. brokerage_contracts
Zprostředkovatelské smlouvy

### 9. matches
Automatické matchování nabídek a poptávek

### 10. notifications
Notifikace pro uživatele

### 11. audit_logs
Audit log všech akcí v systému

### 12. gdpr_consents, gdpr_requests, gdpr_breaches
GDPR compliance

### 13. email_templates
Šablony emailů

### 14. password_reset_tokens, email_verification_tokens, refresh_tokens
Tokeny pro autentizaci

### 15. registration_requests
Žádosti o registraci

### 16. companies
Realitní kanceláře

### 17. favorites
Oblíbené nemovitosti

### 18. viewings
Prohlídky nemovitostí

### 19. import_logs, import_mappings
Import z externích zdrojů (Sreality)

## Časté chyby a řešení

### "no such column: contract_text"
- Chybí sloupce v `loi_signatures`
- Řešení: Přidat sloupce pomocí ALTER TABLE (viz výše)

### "no such column: template_type"
- Správný sloupec je `template_key`
- Řešení: Opravit všechny SQL dotazy

### "no such column: property_requirements"
- Chybí nové sloupce v `demands`
- Řešení: Přidat sloupce pomocí ALTER TABLE

## Backup a restore

### Vytvoření backupu
```bash
# Kompletní backup (schéma + data)
sqlite3 realestate.db .dump > backup_full.sql

# Pouze schéma
sqlite3 realestate.db .schema > backup_schema.sql
```

### Obnovení z backupu
```bash
# Smazat starou databázi
rm realestate.db

# Obnovit z backupu
sqlite3 realestate.db < backup_full.sql
```

## Migrace

Pokud přidáváte nové sloupce:

1. Přidejte sloupec do databáze:
```bash
sqlite3 realestate.db "ALTER TABLE table_name ADD COLUMN column_name TYPE;"
```

2. Aktualizujte `database.js`

3. Vytvořte nový backup

4. Commitněte změny do gitu
