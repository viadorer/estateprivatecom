#!/bin/bash

# Estate Private - Export dat ze SQLite pro Supabase
# Použití: ./export_data.sh

set -e

BACKEND_DIR="../backend"
DB_FILE="$BACKEND_DIR/realestate.db"
EXPORT_DIR="./exports"

# Vytvoření adresáře pro exporty
mkdir -p "$EXPORT_DIR"

echo "🚀 Export dat z Estate Private SQLite databáze"
echo "================================================"
echo ""

# Kontrola existence databáze
if [ ! -f "$DB_FILE" ]; then
    echo "❌ Databáze nenalezena: $DB_FILE"
    exit 1
fi

echo "📊 Databáze nalezena: $DB_FILE"
echo ""

# Seznam tabulek
TABLES=(
    "companies"
    "users"
    "properties"
    "registration_requests"
    "demands"
    "matches"
    "favorites"
    "viewings"
    "audit_logs"
    "access_codes"
    "agent_declarations"
    "brokerage_contracts"
    "loi_signatures"
    "notifications"
    "gdpr_consents"
    "gdpr_requests"
    "gdpr_breaches"
    "refresh_tokens"
    "password_reset_tokens"
    "email_verification_tokens"
    "import_logs"
    "import_mappings"
    "email_templates"
    "contract_templates"
)

# Export každé tabulky
echo "📦 Export tabulek..."
echo ""

for table in "${TABLES[@]}"; do
    echo -n "  ├─ $table ... "
    
    # Počet záznamů
    count=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM $table;")
    
    if [ "$count" -gt 0 ]; then
        # Export do CSV
        sqlite3 -header -csv "$DB_FILE" "SELECT * FROM $table;" > "$EXPORT_DIR/${table}.csv"
        echo "✅ ($count záznamů)"
    else
        echo "⊘ (prázdná)"
    fi
done

echo ""
echo "📄 Export kompletního schématu..."
sqlite3 "$DB_FILE" .schema > "$EXPORT_DIR/schema.sql"
echo "  ✅ schema.sql"

echo ""
echo "📄 Export kompletního dumpu..."
sqlite3 "$DB_FILE" .dump > "$EXPORT_DIR/full_dump.sql"
echo "  ✅ full_dump.sql"

echo ""
echo "✨ Export dokončen!"
echo ""
echo "📁 Exportované soubory jsou v: $EXPORT_DIR"
echo ""
echo "📋 Další kroky:"
echo "  1. Zkontrolujte exportované soubory"
echo "  2. Spusťte migrace na Supabase: supabase db push"
echo "  3. Importujte data přes Supabase Dashboard nebo psql"
echo ""
