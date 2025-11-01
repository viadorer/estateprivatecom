-- Estate Private - Row Level Security Policies (FIXED)
-- Migration: 00003_rls_policies_fixed
-- Created: 2025-11-01
-- 
-- POZNÁMKA: Tato verze je pro použití s vlastní autentizací (JWT tokeny)
-- Pokud používáte vlastní autentizaci místo Supabase Auth, RLS politiky
-- budou fungovat pouze s service_role key (admin přístup).
-- 
-- Pro plnou funkcionalitu RLS s vlastní autentizací byste museli:
-- 1. Použít Supabase Auth místo vlastní autentizace
-- 2. Nebo implementovat custom claims v JWT tokenech
-- 3. Nebo vypnout RLS a zabezpečit přístup na úrovni aplikace

-- VAROVÁNÍ: Tato migrace VYPÍNÁ RLS pro všechny tabulky
-- Zabezpečení musí být implementováno na úrovni backendu!

-- Disable RLS on all tables (protože používáte vlastní autentizaci)
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE registration_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE demands DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE viewings DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_declarations DISABLE ROW LEVEL SECURITY;
ALTER TABLE brokerage_contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE loi_signatures DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_consents DISABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_breaches DISABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE import_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE import_mappings DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON companies;
DROP POLICY IF EXISTS "Only admins can insert companies" ON companies;
DROP POLICY IF EXISTS "Only admins can update companies" ON companies;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Only admins can insert users" ON users;
DROP POLICY IF EXISTS "Only admins can delete users" ON users;

-- Drop helper functions if exist
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_agent();

-- Create comment explaining the security model
COMMENT ON TABLE users IS 'RLS disabled - security handled by backend application layer with JWT tokens';
COMMENT ON TABLE properties IS 'RLS disabled - security handled by backend application layer';
COMMENT ON TABLE demands IS 'RLS disabled - security handled by backend application layer';

-- POZNÁMKA PRO BUDOUCNOST:
-- Pokud chcete použít RLS s vlastní autentizací, můžete:
-- 
-- 1. Přidat sloupec auth_user_id UUID do users tabulky
-- 2. Vytvořit Supabase Auth uživatele pro každého uživatele
-- 3. Propojit auth.users.id s users.auth_user_id
-- 4. Pak můžete použít RLS politiky jako:
--    CREATE POLICY "Users can view own data" ON users
--      FOR SELECT USING (auth.uid() = auth_user_id);
