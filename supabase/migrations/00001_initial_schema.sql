-- Estate Private - Initial Database Schema for Supabase (PostgreSQL)
-- Migration: 00001_initial_schema
-- Created: 2025-11-01

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    
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
    
    -- Firemní údaje
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    company TEXT,
    company_position TEXT,
    ico TEXT,
    dic TEXT,
    
    -- Preference
    preferred_contact TEXT DEFAULT 'email',
    newsletter_subscribed INTEGER DEFAULT 1,
    
    -- Poznámky
    notes TEXT,
    
    -- Import API
    api_key TEXT UNIQUE,
    rate_limit INTEGER DEFAULT 100,
    
    -- Metadata
    last_login TIMESTAMPTZ,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    verified_agent INTEGER DEFAULT 0,
    notify_new_properties INTEGER DEFAULT 1,
    notify_new_demands INTEGER DEFAULT 1,
    notification_frequency TEXT DEFAULT 'immediate',
    min_match_score INTEGER DEFAULT 70
);

-- Properties table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    
    transaction_type TEXT NOT NULL,
    property_type TEXT NOT NULL,
    property_subtype TEXT,
    
    -- Provize a podmínky
    commission_rate REAL,
    commission_terms TEXT,
    contract_signed_at TIMESTAMPTZ,
    
    price REAL NOT NULL,
    price_note TEXT,
    price_on_request INTEGER DEFAULT 0,
    
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
    
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    reserved_until TIMESTAMPTZ,
    
    sreality_id TEXT UNIQUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    last_confirmed_at TIMESTAMPTZ,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMPTZ
);

-- Registration requests table
CREATE TABLE registration_requests (
    id SERIAL PRIMARY KEY,
    
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
    
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Demands table
CREATE TABLE demands (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
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
    
    -- Nová flexibilní struktura
    property_requirements TEXT,
    common_filters TEXT,
    locations TEXT,
    
    -- Provize a podmínky
    commission_rate REAL,
    commission_terms TEXT,
    contract_signed_at TIMESTAMPTZ,
    
    status TEXT DEFAULT 'active',
    email_notifications INTEGER DEFAULT 1,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    last_confirmed_at TIMESTAMPTZ
);

-- Matches table
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    demand_id INTEGER NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    match_score INTEGER,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites table
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Viewings table
CREATE TABLE viewings (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration INTEGER DEFAULT 30,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Access codes table
CREATE TABLE access_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    code TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent declarations table
CREATE TABLE agent_declarations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    declaration_text TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    is_active INTEGER DEFAULT 1,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brokerage contracts table
CREATE TABLE brokerage_contracts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    commission_rate REAL NOT NULL,
    code TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ,
    is_active INTEGER DEFAULT 1,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOI signatures table
CREATE TABLE loi_signatures (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    match_demand_id INTEGER NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ,
    is_active INTEGER DEFAULT 1,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    contract_text TEXT,
    contract_hash TEXT,
    ip_address TEXT,
    verification_code TEXT
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    action_url TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GDPR consents table
CREATE TABLE gdpr_consents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    
    consent_terms INTEGER DEFAULT 0,
    consent_privacy INTEGER DEFAULT 0,
    consent_marketing INTEGER DEFAULT 0,
    consent_profiling INTEGER DEFAULT 0,
    consent_third_party INTEGER DEFAULT 0,
    consent_cookies_necessary INTEGER DEFAULT 1,
    consent_cookies_analytics INTEGER DEFAULT 0,
    consent_cookies_marketing INTEGER DEFAULT 0,
    
    consent_version TEXT DEFAULT '1.0',
    consent_language TEXT DEFAULT 'cs',
    consent_method TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    withdrawn_at TIMESTAMPTZ
);

-- GDPR requests table
CREATE TABLE gdpr_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    request_data TEXT,
    response_data TEXT,
    processed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GDPR breaches table
CREATE TABLE gdpr_breaches (
    id SERIAL PRIMARY KEY,
    breach_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    affected_users INTEGER,
    description TEXT NOT NULL,
    detected_at TIMESTAMPTZ NOT NULL,
    reported_to_authority INTEGER DEFAULT 0,
    reported_to_users INTEGER DEFAULT 0,
    authority_report_date TIMESTAMPTZ,
    users_notification_date TIMESTAMPTZ,
    mitigation_steps TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email verification tokens table
CREATE TABLE email_verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Import logs table
CREATE TABLE import_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    external_id TEXT,
    status TEXT NOT NULL,
    error_message TEXT,
    request_data TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Import mappings table
CREATE TABLE import_mappings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    internal_id INTEGER NOT NULL,
    entity_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, external_id, entity_type)
);

-- Email templates table
CREATE TABLE email_templates (
    id SERIAL PRIMARY KEY,
    template_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    html_content TEXT NOT NULL,
    variables TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contract templates table
CREATE TABLE contract_templates (
    id SERIAL PRIMARY KEY,
    template_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    template_content TEXT NOT NULL,
    variables TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_properties_agent ON properties(agent_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_demands_client ON demands(client_id);
CREATE INDEX idx_matches_demand ON matches(demand_id);
CREATE INDEX idx_matches_property ON matches(property_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at);
CREATE INDEX idx_import_logs_user ON import_logs(user_id, created_at);
CREATE INDEX idx_import_mappings_lookup ON import_mappings(user_id, external_id, entity_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demands_updated_at BEFORE UPDATE ON demands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registration_requests_updated_at BEFORE UPDATE ON registration_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gdpr_consents_updated_at BEFORE UPDATE ON gdpr_consents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gdpr_breaches_updated_at BEFORE UPDATE ON gdpr_breaches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_import_mappings_updated_at BEFORE UPDATE ON import_mappings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_templates_updated_at BEFORE UPDATE ON contract_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
