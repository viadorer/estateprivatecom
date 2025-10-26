import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Vytvoření databáze
const db = new Database(join(__dirname, 'realestate.db'));

// Vytvoření tabulek
db.exec(`
  -- Společnosti
  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    ico TEXT UNIQUE,
    dic TEXT,
    address_street TEXT,
    address_city TEXT,
    address_zip TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    description TEXT,
    logo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Uživatelé (admin, agent, client) - ROZŠÍŘENÉ
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Základní údaje
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client',
    
    -- Kontaktní údaje
    phone TEXT,
    phone_secondary TEXT,
    avatar TEXT,
    
    -- Adresa
    address_street TEXT,
    address_city TEXT,
    address_zip TEXT,
    address_country TEXT DEFAULT 'Česká republika',
    
    -- Firemní údaje (pro agenty a klienty-firmy)
    company_id INTEGER,
    company TEXT,
    company_position TEXT,
    ico TEXT,
    dic TEXT,
    
    -- Preference (pro klienty)
    preferred_contact TEXT DEFAULT 'email',
    newsletter_subscribed INTEGER DEFAULT 1,
    
    -- Poznámky (pro agenty)
    notes TEXT,
    
    -- Metadata
    last_login DATETIME,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
  );

  -- Nemovitosti
  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    
    transaction_type TEXT NOT NULL,
    property_type TEXT NOT NULL,
    
    -- Provize a podmínky (nastavuje admin při schvalování)
    commission_rate REAL,
    commission_terms TEXT,
    contract_signed_at DATETIME,
    property_subtype TEXT,
    
    price REAL NOT NULL,
    price_note TEXT,
    
    city TEXT NOT NULL,
    district TEXT,
    street TEXT,
    zip_code TEXT,
    latitude REAL,
    longitude REAL,
    
    area REAL,
    land_area REAL,
    rooms INTEGER,
    floor INTEGER,
    total_floors INTEGER,
    
    building_type TEXT,
    building_condition TEXT,
    ownership TEXT,
    
    furnished TEXT,
    has_balcony INTEGER DEFAULT 0,
    has_loggia INTEGER DEFAULT 0,
    has_terrace INTEGER DEFAULT 0,
    has_cellar INTEGER DEFAULT 0,
    has_garage INTEGER DEFAULT 0,
    has_parking INTEGER DEFAULT 0,
    has_elevator INTEGER DEFAULT 0,
    has_garden INTEGER DEFAULT 0,
    has_pool INTEGER DEFAULT 0,
    
    energy_rating TEXT,
    heating_type TEXT,
    
    is_auction INTEGER DEFAULT 0,
    exclusively_at_rk INTEGER DEFAULT 0,
    attractive_offer INTEGER DEFAULT 0,
    
    agent_id INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    views_count INTEGER DEFAULT 0,
    
    images TEXT,
    main_image TEXT,
    documents TEXT,
    video_url TEXT,
    video_tour_url TEXT,
    matterport_url TEXT,
    floor_plans TEXT,
    website_url TEXT,
    
    is_reserved INTEGER DEFAULT 0,
    reserved_until DATETIME,
    
    sreality_id TEXT UNIQUE,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Registrační žádosti (waitlist)
  CREATE TABLE IF NOT EXISTS registration_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    
    address_street TEXT,
    address_city TEXT,
    address_zip TEXT,
    
    ico TEXT,
    dic TEXT,
    company TEXT,
    company_position TEXT,
    
    requested_role TEXT NOT NULL,
    user_type TEXT NOT NULL,
    demand_description TEXT,
    
    status TEXT DEFAULT 'pending',
    admin_notes TEXT,
    
    approved_by INTEGER,
    approved_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (approved_by) REFERENCES users(id)
  );

  -- Poptávky
  CREATE TABLE IF NOT EXISTS demands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    
    transaction_type TEXT NOT NULL,
    property_type TEXT NOT NULL,
    property_subtype TEXT,
    
    price_min REAL,
    price_max REAL,
    
    cities TEXT,
    districts TEXT,
    
    area_min REAL,
    area_max REAL,
    rooms_min INTEGER,
    rooms_max INTEGER,
    floor_min INTEGER,
    floor_max INTEGER,
    
    required_features TEXT,
    
    -- Provize a podmínky (nastavuje admin při schvalování)
    commission_rate REAL,
    commission_terms TEXT,
    contract_signed_at DATETIME,
    
    status TEXT DEFAULT 'active',
    email_notifications INTEGER DEFAULT 1,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Shody (matches)
  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    demand_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,
    match_score INTEGER,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (demand_id) REFERENCES demands(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  );

  -- Oblíbené
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE(user_id, property_id)
  );

  -- Prohlídky
  CREATE TABLE IF NOT EXISTS viewings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    agent_id INTEGER NOT NULL,
    
    scheduled_at DATETIME NOT NULL,
    duration INTEGER DEFAULT 30,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Audit Log
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Přístupové kódy
  CREATE TABLE IF NOT EXISTS access_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    code TEXT UNIQUE NOT NULL,
    expires_at DATETIME,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Prohlášení agentů
  CREATE TABLE IF NOT EXISTS agent_declarations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    code TEXT UNIQUE NOT NULL,
    declaration_text TEXT NOT NULL,
    expires_at DATETIME,
    is_active INTEGER DEFAULT 1,
    verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Zprostředkovatelské smlouvy
  CREATE TABLE IF NOT EXISTS brokerage_contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    commission_rate REAL NOT NULL,
    code TEXT UNIQUE NOT NULL,
    expires_at DATETIME,
    is_active INTEGER DEFAULT 1,
    signed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- LOI (Letter of Intent) - Záměr spolupráce
  CREATE TABLE IF NOT EXISTS loi_signatures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    match_property_id INTEGER NOT NULL,
    match_demand_id INTEGER NOT NULL,
    code TEXT UNIQUE NOT NULL,
    expires_at DATETIME,
    is_active INTEGER DEFAULT 1,
    signed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (match_property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (match_demand_id) REFERENCES demands(id) ON DELETE CASCADE
  );

  -- Notifikace
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,                           -- approval, rejection, match, message, system
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_type TEXT,                             -- property, demand, match, user
    entity_id INTEGER,
    action_url TEXT,                              -- URL pro akci (např. /properties/123)
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- GDPR Souhlasy
  CREATE TABLE IF NOT EXISTS gdpr_consents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    
    -- Typy souhlasů
    consent_terms INTEGER DEFAULT 0,              -- Souhlas s obchodními podmínkami
    consent_privacy INTEGER DEFAULT 0,            -- Souhlas se zpracováním osobních údajů
    consent_marketing INTEGER DEFAULT 0,          -- Souhlas s marketingovou komunikací
    consent_profiling INTEGER DEFAULT 0,          -- Souhlas s profilováním
    consent_third_party INTEGER DEFAULT 0,        -- Souhlas se sdílením třetím stranám
    consent_cookies_necessary INTEGER DEFAULT 1,  -- Nutné cookies (vždy povoleno)
    consent_cookies_analytics INTEGER DEFAULT 0,  -- Analytické cookies
    consent_cookies_marketing INTEGER DEFAULT 0,  -- Marketingové cookies
    
    -- Metadata
    consent_version TEXT DEFAULT '1.0',           -- Verze podmínek
    consent_language TEXT DEFAULT 'cs',           -- Jazyk souhlasu
    consent_method TEXT,                          -- Způsob udělení (web, email, phone)
    
    -- Časové značky
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    withdrawn_at DATETIME,                        -- Datum odvolání souhlasu
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- GDPR Žádosti (právo na výmaz, export dat, atd.)
  CREATE TABLE IF NOT EXISTS gdpr_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    request_type TEXT NOT NULL,  -- 'export', 'delete', 'rectify', 'restrict', 'object', 'portability'
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
    request_data TEXT,            -- JSON s detaily žádosti
    response_data TEXT,           -- JSON s odpovědí
    processed_by INTEGER,         -- Admin, který žádost zpracoval
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
  );

  -- GDPR Data Breach Log (evidence narušení zabezpečení)
  CREATE TABLE IF NOT EXISTS gdpr_breaches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    breach_type TEXT NOT NULL,    -- 'unauthorized_access', 'data_loss', 'data_leak', 'other'
    severity TEXT NOT NULL,       -- 'low', 'medium', 'high', 'critical'
    affected_users INTEGER,       -- Počet dotčených uživatelů
    description TEXT NOT NULL,
    detected_at DATETIME NOT NULL,
    reported_to_authority INTEGER DEFAULT 0,
    reported_to_users INTEGER DEFAULT 0,
    authority_report_date DATETIME,
    users_notification_date DATETIME,
    mitigation_steps TEXT,
    status TEXT DEFAULT 'open',   -- 'open', 'investigating', 'mitigated', 'closed'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Refresh Tokens (pro JWT autentizaci)
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    revoked INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Password Reset Tokens
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Email Verification Tokens
  CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Vložení ukázkových dat
const insertCompany = db.prepare(`INSERT OR IGNORE INTO companies (
  name, ico, dic, address_street, address_city, address_zip, phone, email, website, description
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const insertUser = db.prepare(`INSERT OR IGNORE INTO users (
  name, email, password, role, phone, phone_secondary, avatar,
  address_street, address_city, address_zip, address_country,
  company_id, company_position, ico, dic, preferred_contact, notes
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const insertProperty = db.prepare(`INSERT OR IGNORE INTO properties (
  title, description, transaction_type, property_type, property_subtype,
  price, price_note, city, district, street, latitude, longitude,
  area, rooms, floor, total_floors, building_type, building_condition,
  furnished, has_balcony, has_elevator, has_parking, agent_id, images, main_image
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const insertDemand = db.prepare(`INSERT OR IGNORE INTO demands (
  client_id, transaction_type, property_type, price_min, price_max,
  cities, area_min, area_max, rooms_min, rooms_max
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

// Kontrola, zda už existují data
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();

if (userCount.count === 0) {
  const hashedPassword = bcrypt.hashSync('heslo123', 10);
  
  // === SPOLEČNOSTI ===
  insertCompany.run(
    'Premium Reality s.r.o.',
    '12345678',
    'CZ12345678',
    'Václavské náměstí 1',
    'Praha 1',
    '110 00',
    '+420 222 333 444',
    'info@premiumreality.cz',
    'www.premiumreality.cz',
    'Realitní kancelář specializující se na luxusní nemovitosti v Praze'
  );
  
  insertCompany.run(
    'City Realty a.s.',
    '87654321',
    'CZ87654321',
    'Masarykova 123',
    'Brno',
    '602 00',
    '+420 543 210 987',
    'kontakt@cityrealty.cz',
    'www.cityrealty.cz',
    'Komplexní realitní služby v Brně a okolí'
  );
  
  insertCompany.run(
    'Stavební firma ALFA s.r.o.',
    '11223344',
    'CZ11223344',
    'Průmyslová 45',
    'Praha 10',
    '100 00',
    '+420 234 567 890',
    'info@alfa-stavby.cz',
    'www.alfa-stavby.cz',
    'Stavební firma hledající pozemky pro výstavbu'
  );
  
  // === UŽIVATELÉ ===
  
  // Admin
  insertUser.run(
    'Admin Systému',
    'admin@realitka.cz',
    hashedPassword,
    'admin',
    '+420 777 111 222',
    '+420 777 111 223',
    '👨‍💼',
    'Hlavní 1',
    'Praha',
    '110 00',
    'Česká republika',
    null, // company_id
    'Administrátor',
    null, // ico
    null, // dic
    'email',
    'Hlavní administrátor systému'
  );
  
  // Agent 1 - Premium Reality
  insertUser.run(
    'Jana Nováková',
    'jana.novakova@realitka.cz',
    hashedPassword,
    'agent',
    '+420 777 333 444',
    '+420 777 333 445',
    '👩‍💼',
    'Václavské náměstí 1',
    'Praha 1',
    '110 00',
    'Česká republika',
    1, // Premium Reality
    'Senior realitní makléř',
    null,
    null,
    'phone',
    'Specialista na luxusní byty v Praze. 10 let zkušeností.'
  );
  
  // Agent 2 - City Realty
  insertUser.run(
    'Petr Svoboda',
    'petr.svoboda@realitka.cz',
    hashedPassword,
    'agent',
    '+420 777 555 666',
    '+420 777 555 667',
    '👨‍💼',
    'Masarykova 123',
    'Brno',
    '602 00',
    'Česká republika',
    2, // City Realty
    'Realitní makléř',
    null,
    null,
    'phone',
    'Zaměření na rodinné domy v Brně a okolí'
  );
  
  // Klient 1 - Fyzická osoba
  insertUser.run(
    'Martin Dvořák',
    'martin.dvorak@email.cz',
    hashedPassword,
    'client',
    '+420 777 777 888',
    null,
    '👤',
    'Dlouhá 234',
    'Praha 5',
    '150 00',
    'Česká republika',
    null,
    null,
    null,
    null,
    'email',
    'Hledá byt 2+kk v Praze pro vlastní bydlení'
  );
  
  // Klient 2 - Fyzická osoba
  insertUser.run(
    'Lucie Černá',
    'lucie.cerna@email.cz',
    hashedPassword,
    'client',
    '+420 777 999 000',
    null,
    '👤',
    'Krátká 56',
    'Brno',
    '602 00',
    'Česká republika',
    null,
    null,
    null,
    null,
    'phone',
    'Hledá pronájem bytu v Brně'
  );
  
  // Klient 3 - Firma (stavební společnost)
  insertUser.run(
    'Ing. Karel Novotný',
    'novotny@alfa-stavby.cz',
    hashedPassword,
    'client',
    '+420 234 567 890',
    '+420 234 567 891',
    '👨‍💼',
    'Průmyslová 45',
    'Praha 10',
    '100 00',
    'Česká republika',
    3, // Stavební firma ALFA
    'Jednatel',
    '11223344',
    'CZ11223344',
    'email',
    'Hledá stavební pozemky pro výstavbu bytových domů'
  );
  
  // Nemovitosti - Prodej bytů
  insertProperty.run(
    'Moderní byt 2+kk v centru Prahy',
    'Krásný světlý byt po kompletní rekonstrukci. Plně vybavená kuchyň, velký balkon s výhledem na park. Výborná dostupnost MHD.',
    'sale', 'flat', '2+kk',
    8500000, null, 'Praha', 'Vinohrady', 'Korunní 1234/56', 50.0755, 14.4378,
    65, 2, 3, 5, 'brick', 'after_reconstruction',
    'furnished', 1, 1, 1, 2,
    '["https://picsum.photos/800/600?random=1","https://picsum.photos/800/600?random=2","https://picsum.photos/800/600?random=3"]',
    'https://picsum.photos/800/600?random=1'
  );
  
  insertProperty.run(
    'Prostorný byt 3+1 Brno-střed',
    'Cihlový byt v klidné lokalitě, blízko centra. Sklep, možnost parkování. Ideální pro rodinu.',
    'sale', 'flat', '3+1',
    6200000, null, 'Brno', 'Brno-střed', 'Hybešova 789/12', 49.1951, 16.6068,
    85, 3, 2, 4, 'brick', 'original',
    'partly_furnished', 0, 0, 1, 2,
    '["https://picsum.photos/800/600?random=4","https://picsum.photos/800/600?random=5"]',
    'https://picsum.photos/800/600?random=4'
  );
  
  insertProperty.run(
    'Luxusní penthouse 4+kk Praha 1',
    'Exkluzivní penthouse s terasou 80 m². Panoramatický výhled na Prahu. Garáž, klimatizace, bezpečnostní systém.',
    'sale', 'flat', '4+kk',
    18900000, null, 'Praha', 'Nové Město', 'Václavské náměstí 1', 50.0813, 14.4264,
    145, 4, 7, 7, 'brick', 'new_building',
    'furnished', 1, 1, 1, 3,
    '["https://picsum.photos/800/600?random=6","https://picsum.photos/800/600?random=7","https://picsum.photos/800/600?random=8"]',
    'https://picsum.photos/800/600?random=6'
  );
  
  // Nemovitosti - Pronájem
  insertProperty.run(
    'Pronájem bytu 2+kk Praha 5',
    'Moderní byt v novostavbě. Plně vybavený, včetně spotřebičů. Parkování v ceně. Dostupné ihned.',
    'rent', 'flat', '2+kk',
    25000, 'Kč/měsíc + energie', 'Praha', 'Smíchov', 'Nádražní 45/67', 50.0707, 14.4041,
    55, 2, 4, 8, 'brick', 'new_building',
    'furnished', 1, 1, 1, 2,
    '["https://picsum.photos/800/600?random=9","https://picsum.photos/800/600?random=10"]',
    'https://picsum.photos/800/600?random=9'
  );
  
  insertProperty.run(
    'Pronájem 1+kk Brno-Žabovřesky',
    'Útulný garsonka pro studenta nebo singles. Nízké náklady, výborná lokalita.',
    'rent', 'flat', '1+kk',
    12000, 'Kč/měsíc + 3000 Kč zálohy', 'Brno', 'Žabovřesky', 'Studentská 123', 49.2108, 16.5988,
    28, 1, 1, 3, 'panel', 'original',
    'partly_furnished', 0, 0, 0, 3,
    '["https://picsum.photos/800/600?random=11"]',
    'https://picsum.photos/800/600?random=11'
  );
  
  // Rodinné domy
  insertProperty.run(
    'Rodinný dům 5+1 Praha-západ',
    'Prostorný rodinný dům s garáží a zahradou 800 m². Klidná lokalita, výborná dostupnost do Prahy.',
    'sale', 'house', '5+1',
    12500000, null, 'Černošice', null, 'Zahradní 234', 49.9608, 14.3189,
    180, 5, null, 2, 'brick', 'after_reconstruction',
    'partly_furnished', 0, 0, 1, 2,
    '["https://picsum.photos/800/600?random=12","https://picsum.photos/800/600?random=13","https://picsum.photos/800/600?random=14"]',
    'https://picsum.photos/800/600?random=12'
  );
  
  // Komerční nemovitost
  insertProperty.run(
    'Kancelářské prostory 200 m² Praha 4',
    'Moderní kancelářské prostory v administrativní budově. Recepce, parkování, klimatizace.',
    'rent', 'commercial', 'office',
    85000, 'Kč/měsíc + služby', 'Praha', 'Nusle', 'Budějovická 1667/64', 50.0617, 14.4418,
    200, null, 3, 6, 'brick', 'after_reconstruction',
    'not_furnished', 0, 1, 1, 3,
    '["https://picsum.photos/800/600?random=15","https://picsum.photos/800/600?random=16"]',
    'https://picsum.photos/800/600?random=15'
  );
  
  // === POPTÁVKY ===
  
  // Poptávka 1: Martin Dvořák - Byt na prodej v Praze
  insertDemand.run(
    4, // Martin Dvořák
    'sale',
    'flat',
    5000000,
    8500000,
    '["Praha"]',
    60,
    80,
    2,
    2
  );
  
  // Poptávka 2: Lucie Černá - Pronájem bytu v Brně
  insertDemand.run(
    5, // Lucie Černá
    'rent',
    'flat',
    10000,
    15000,
    '["Brno"]',
    25,
    40,
    1,
    2
  );
  
  // Poptávka 3: Stavební firma - Pozemky v Praze
  insertDemand.run(
    6, // Ing. Karel Novotný (stavební firma)
    'sale',
    'land',
    5000000,
    20000000,
    '["Praha","Černošice","Říčany"]',
    500,
    2000,
    null,
    null
  );
  
  console.log('✅ Realitní databáze vytvořena');
  console.log('');
  console.log('🏢 Vytvořeny 3 společnosti');
  console.log('👥 Vytvořeno 6 uživatelů:');
  console.log('   👑 Admin: admin@realitka.cz / heslo123');
  console.log('   🏢 Agent: jana.novakova@realitka.cz / heslo123 (Premium Reality)');
  console.log('   🏢 Agent: petr.svoboda@realitka.cz / heslo123 (City Realty)');
  console.log('   👤 Klient: martin.dvorak@email.cz / heslo123 (fyzická osoba)');
  console.log('   👤 Klient: lucie.cerna@email.cz / heslo123 (fyzická osoba)');
  console.log('   👤 Klient: novotny@alfa-stavby.cz / heslo123 (firma ALFA)');
  console.log('');
  console.log('🏠 Vytvořeno 7 nemovitostí');
  console.log('🔍 Vytvořeny 3 poptávky');
  console.log('');
  console.log('📊 Struktura:');
  console.log('   - Každý uživatel má kompletní údaje (jméno, email, telefon, adresa)');
  console.log('   - Agenti jsou napojeni na společnosti');
  console.log('   - Klienti mají vyplněné preference a poznámky');
  console.log('   - Poptávky jsou připraveny pro automatické párování');
}

console.log('✅ Databáze inicializována');

export default db;
