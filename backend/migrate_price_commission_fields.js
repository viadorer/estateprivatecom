import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'realestate.db'));

const ensureColumn = (table, column, definition) => {
  const info = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = info.some(col => col.name === column);
  if (!exists) {
    console.log(`➕ Přidávám sloupec ${column} do tabulky ${table}`);
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${definition}`).run();
  } else {
    console.log(`✅ Sloupec ${column} v tabulce ${table} již existuje`);
  }
};

try {
  console.log('🚀 Spouštím migraci pro cenu a provize...');

  // Properties pricing columns
  ensureColumn('properties', 'price_currency', "TEXT DEFAULT 'CZK'");
  ensureColumn('properties', 'price_unit', "TEXT DEFAULT 'total'");
  ensureColumn('properties', 'price_total', 'REAL');

  // Properties commission columns
  ensureColumn('properties', 'commission_type', 'TEXT');
  ensureColumn('properties', 'commission_value', 'REAL');
  ensureColumn('properties', 'commission_currency', 'TEXT');
  ensureColumn('properties', 'commission_payer', 'TEXT');
  ensureColumn('properties', 'commission_vat', 'TEXT');
  ensureColumn('properties', 'commission_base_amount', 'REAL');

  // Demands commission columns (share schema)
  ensureColumn('demands', 'commission_type', 'TEXT');
  ensureColumn('demands', 'commission_value', 'REAL');
  ensureColumn('demands', 'commission_currency', 'TEXT');
  ensureColumn('demands', 'commission_payer', 'TEXT');
  ensureColumn('demands', 'commission_vat', 'TEXT');
  ensureColumn('demands', 'commission_base_amount', 'REAL');

  console.log('🎉 Migrace byla úspěšně dokončena.');
} catch (error) {
  console.error('❌ Chyba při migraci:', error);
  process.exitCode = 1;
} finally {
  db.close();
}
