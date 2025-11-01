-- Estate Private - Row Level Security Policies
-- Migration: 00003_rls_policies
-- Created: 2025-11-01

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokerage_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loi_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_breaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::INTEGER 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is agent
CREATE OR REPLACE FUNCTION is_agent()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::INTEGER 
    AND role IN ('agent', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Companies policies
CREATE POLICY "Companies are viewable by everyone"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert companies"
  ON companies FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update companies"
  ON companies FOR UPDATE
  USING (is_admin());

-- Users policies
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (id = auth.uid()::INTEGER OR is_admin());

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (id = auth.uid()::INTEGER OR is_admin());

CREATE POLICY "Only admins can insert users"
  ON users FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete users"
  ON users FOR DELETE
  USING (is_admin());

-- Properties policies
CREATE POLICY "Active properties are viewable by authenticated users"
  ON properties FOR SELECT
  USING (
    status = 'active' 
    OR agent_id = auth.uid()::INTEGER 
    OR is_admin()
  );

CREATE POLICY "Agents can insert their own properties"
  ON properties FOR INSERT
  WITH CHECK (
    is_agent() 
    AND agent_id = auth.uid()::INTEGER
  );

CREATE POLICY "Agents can update their own properties"
  ON properties FOR UPDATE
  USING (
    agent_id = auth.uid()::INTEGER 
    OR is_admin()
  );

CREATE POLICY "Only admins can delete properties"
  ON properties FOR DELETE
  USING (is_admin());

-- Demands policies
CREATE POLICY "Clients can view their own demands"
  ON demands FOR SELECT
  USING (
    client_id = auth.uid()::INTEGER 
    OR is_agent()
  );

CREATE POLICY "Clients can insert their own demands"
  ON demands FOR INSERT
  WITH CHECK (client_id = auth.uid()::INTEGER);

CREATE POLICY "Clients can update their own demands"
  ON demands FOR UPDATE
  USING (
    client_id = auth.uid()::INTEGER 
    OR is_admin()
  );

CREATE POLICY "Clients can delete their own demands"
  ON demands FOR DELETE
  USING (
    client_id = auth.uid()::INTEGER 
    OR is_admin()
  );

-- Matches policies
CREATE POLICY "Users can view matches related to their properties or demands"
  ON matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = matches.property_id 
      AND agent_id = auth.uid()::INTEGER
    )
    OR EXISTS (
      SELECT 1 FROM demands 
      WHERE id = matches.demand_id 
      AND client_id = auth.uid()::INTEGER
    )
    OR is_admin()
  );

CREATE POLICY "Only system can insert matches"
  ON matches FOR INSERT
  WITH CHECK (is_admin());

-- Favorites policies
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (user_id = auth.uid()::INTEGER);

CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (user_id = auth.uid()::INTEGER);

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (user_id = auth.uid()::INTEGER);

-- Viewings policies
CREATE POLICY "Users can view their related viewings"
  ON viewings FOR SELECT
  USING (
    client_id = auth.uid()::INTEGER 
    OR agent_id = auth.uid()::INTEGER 
    OR is_admin()
  );

CREATE POLICY "Agents and clients can insert viewings"
  ON viewings FOR INSERT
  WITH CHECK (
    client_id = auth.uid()::INTEGER 
    OR agent_id = auth.uid()::INTEGER
  );

CREATE POLICY "Agents and clients can update their viewings"
  ON viewings FOR UPDATE
  USING (
    client_id = auth.uid()::INTEGER 
    OR agent_id = auth.uid()::INTEGER 
    OR is_admin()
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid()::INTEGER);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid()::INTEGER);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (is_admin());

-- Audit logs policies
CREATE POLICY "Only admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (is_admin());

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Access codes policies
CREATE POLICY "Users can view their own access codes"
  ON access_codes FOR SELECT
  USING (
    user_id = auth.uid()::INTEGER 
    OR is_admin()
  );

CREATE POLICY "System can manage access codes"
  ON access_codes FOR ALL
  USING (is_admin());

-- Agent declarations policies
CREATE POLICY "Agents can view their own declarations"
  ON agent_declarations FOR SELECT
  USING (
    user_id = auth.uid()::INTEGER 
    OR is_admin()
  );

CREATE POLICY "Agents can insert their own declarations"
  ON agent_declarations FOR INSERT
  WITH CHECK (user_id = auth.uid()::INTEGER);

-- Brokerage contracts policies
CREATE POLICY "Users can view their own contracts"
  ON brokerage_contracts FOR SELECT
  USING (
    user_id = auth.uid()::INTEGER 
    OR is_admin()
  );

CREATE POLICY "System can manage contracts"
  ON brokerage_contracts FOR ALL
  USING (is_admin());

-- LOI signatures policies
CREATE POLICY "Users can view their own LOI signatures"
  ON loi_signatures FOR SELECT
  USING (
    user_id = auth.uid()::INTEGER 
    OR is_admin()
  );

CREATE POLICY "Users can insert their own LOI signatures"
  ON loi_signatures FOR INSERT
  WITH CHECK (user_id = auth.uid()::INTEGER);

-- GDPR policies
CREATE POLICY "Users can view their own GDPR data"
  ON gdpr_consents FOR SELECT
  USING (
    user_id = auth.uid()::INTEGER 
    OR is_admin()
  );

CREATE POLICY "Users can insert their own GDPR consents"
  ON gdpr_consents FOR INSERT
  WITH CHECK (user_id = auth.uid()::INTEGER);

CREATE POLICY "Users can view their own GDPR requests"
  ON gdpr_requests FOR SELECT
  USING (
    user_id = auth.uid()::INTEGER 
    OR is_admin()
  );

CREATE POLICY "Users can insert their own GDPR requests"
  ON gdpr_requests FOR INSERT
  WITH CHECK (user_id = auth.uid()::INTEGER);

CREATE POLICY "Only admins can view GDPR breaches"
  ON gdpr_breaches FOR SELECT
  USING (is_admin());

-- Tokens policies
CREATE POLICY "Users can view their own refresh tokens"
  ON refresh_tokens FOR SELECT
  USING (user_id = auth.uid()::INTEGER);

CREATE POLICY "System can manage tokens"
  ON refresh_tokens FOR ALL
  USING (true);

CREATE POLICY "System can manage password reset tokens"
  ON password_reset_tokens FOR ALL
  USING (true);

CREATE POLICY "System can manage email verification tokens"
  ON email_verification_tokens FOR ALL
  USING (true);

-- Import policies
CREATE POLICY "Agents can view their own import logs"
  ON import_logs FOR SELECT
  USING (
    user_id = auth.uid()::INTEGER 
    OR is_admin()
  );

CREATE POLICY "Agents can insert import logs"
  ON import_logs FOR INSERT
  WITH CHECK (user_id = auth.uid()::INTEGER);

CREATE POLICY "Agents can view their own import mappings"
  ON import_mappings FOR SELECT
  USING (
    user_id = auth.uid()::INTEGER 
    OR is_admin()
  );

CREATE POLICY "Agents can manage their own import mappings"
  ON import_mappings FOR ALL
  USING (user_id = auth.uid()::INTEGER);

-- Templates policies (read-only for all authenticated users)
CREATE POLICY "Email templates are viewable by authenticated users"
  ON email_templates FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage email templates"
  ON email_templates FOR ALL
  USING (is_admin());

CREATE POLICY "Contract templates are viewable by authenticated users"
  ON contract_templates FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage contract templates"
  ON contract_templates FOR ALL
  USING (is_admin());

-- Registration requests policies
CREATE POLICY "Users can view their own registration requests"
  ON registration_requests FOR SELECT
  USING (
    email = auth.jwt()->>'email' 
    OR is_admin()
  );

CREATE POLICY "Anyone can insert registration requests"
  ON registration_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can update registration requests"
  ON registration_requests FOR UPDATE
  USING (is_admin());
