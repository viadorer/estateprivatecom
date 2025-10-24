import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'database.sqlite'));

try {
  console.log('🔄 Přidávám sloupec documents do tabulky properties...');
  
  // Zkontroluj, jestli sloupec už existuje
  const tableInfo = db.prepare("PRAGMA table_info(properties)").all();
  const hasDocuments = tableInfo.some(col => col.name === 'documents');
  
  if (hasDocuments) {
    console.log('✅ Sloupec documents už existuje');
  } else {
    // Přidej sloupec
    db.prepare('ALTER TABLE properties ADD COLUMN documents TEXT').run();
    console.log('✅ Sloupec documents byl úspěšně přidán');
  }
  
  console.log('🎉 Migrace dokončena!');
} catch (error) {
  console.error('❌ Chyba při migraci:', error);
} finally {
  db.close();
}
