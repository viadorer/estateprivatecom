CREATE TABLE companies (
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
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE users (
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
    
    -- Import API (pro agenty)
    api_key TEXT UNIQUE,
    rate_limit INTEGER DEFAULT 100,
    
    -- Metadata
    last_login DATETIME,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, verified_agent INTEGER DEFAULT 0, notify_new_properties INTEGER DEFAULT 1, notify_new_demands INTEGER DEFAULT 1, notification_frequency TEXT DEFAULT "immediate", min_match_score INTEGER DEFAULT 70,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
  );
CREATE TABLE properties (
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, valid_until DATETIME, price_on_request INTEGER DEFAULT 0, last_confirmed_at DATETIME, approved_by INTEGER, approved_at DATETIME,
    
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE
  );
CREATE TABLE registration_requests (
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
CREATE TABLE demands (
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, property_requirements TEXT, common_filters TEXT, locations TEXT, valid_until DATETIME, last_confirmed_at DATETIME,
    
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
  );
CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    demand_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,
    match_score INTEGER,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (demand_id) REFERENCES demands(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  );
CREATE TABLE favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE(user_id, property_id)
  );
CREATE TABLE viewings (
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
CREATE TABLE audit_logs (
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
CREATE TABLE access_codes (
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
CREATE TABLE agent_declarations (
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
CREATE TABLE brokerage_contracts (
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
CREATE TABLE loi_signatures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    match_property_id INTEGER NOT NULL,
    match_demand_id INTEGER NOT NULL,
    code TEXT UNIQUE NOT NULL,
    expires_at DATETIME,
    is_active INTEGER DEFAULT 1,
    signed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, contract_text TEXT, contract_hash TEXT, ip_address TEXT, verification_code TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (match_property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (match_demand_id) REFERENCES demands(id) ON DELETE CASCADE
  );
CREATE TABLE notifications (
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
CREATE TABLE gdpr_consents (
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
CREATE TABLE gdpr_requests (
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
CREATE TABLE gdpr_breaches (
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
CREATE TABLE refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    revoked INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
CREATE TABLE password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
CREATE TABLE email_verification_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
CREATE TABLE import_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    external_id TEXT,
    status TEXT NOT NULL,
    error_message TEXT,
    request_data TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
CREATE TABLE import_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    external_id TEXT NOT NULL,
    internal_id INTEGER NOT NULL,
    entity_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, external_id, entity_type)
  );
CREATE INDEX idx_import_logs_user ON import_logs(user_id, created_at);
CREATE INDEX idx_import_mappings_lookup ON import_mappings(user_id, external_id, entity_type);
CREATE TABLE email_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  html_content TEXT NOT NULL,
  variables TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE contract_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    template_content TEXT NOT NULL,
    variables TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
