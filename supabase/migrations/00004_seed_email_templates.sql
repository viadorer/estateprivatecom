-- Estate Private - Seed Email Templates
-- Migration: 00004_seed_email_templates
-- Created: 2025-11-01
-- 
-- POZNÁMKA: Email templates pro notifikace a komunikaci s uživateli

-- Delete existing templates if any
DELETE FROM email_templates;

-- Reset sequence
ALTER SEQUENCE email_templates_id_seq RESTART WITH 1;

-- Insert email templates
-- 1. Registration Approval
INSERT INTO email_templates (template_key, name, subject, description, html_content, variables, is_active) VALUES
('registration_approval', 'Schválení registrace', 'Vaše registrace byla schválena', 'Email odeslaný po schválení registrace administrátorem',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .content h2 { color: #111827; font-size: 20px; margin: 0 0 20px 0; }
    .content p { color: #4b5563; margin: 0 0 15px 0; }
    .credentials { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }
    .button { display: inline-block; background: #3182ce; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 500; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Estate Private</h1>
    </div>
    <div class="content">
      <h2>Vaše registrace byla schválena!</h2>
      <p>Dobrý den, {{recipientName}},</p>
      <p>Vaše žádost o registraci byla schválena. Nyní se můžete přihlásit do systému.</p>
      
      <div class="credentials">
        <p style="margin: 0 0 10px 0;"><strong>Email:</strong> {{email}}</p>
        <p style="margin: 0;"><strong>Dočasné heslo:</strong> {{temporaryPassword}}</p>
      </div>
      
      <p><strong>Důležité:</strong> Po prvním přihlášení si prosím změňte heslo.</p>
      <center>
        <a href="https://aanxxeyysqtpdcrrwnhm.supabase.co" class="button">Přihlásit se</a>
      </center>
    </div>
    <div class="footer">
      <p>Estate Private - Realitní platforma</p>
      <p>Tento email byl odeslán automaticky, neodpovídejte na něj.</p>
    </div>
  </div>
</body>
</html>',
'["recipientName","email","temporaryPassword"]', 1);

-- 2. Access Code
INSERT INTO email_templates (template_key, name, subject, description, html_content, variables, is_active) VALUES
('access_code', 'Přístupový kód k nemovitosti', 'Přístupový kód k {{entityType}}', 'Email s přístupovým kódem k detailům nemovitosti nebo poptávky',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .code-box { background: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px; padding: 30px; margin: 25px 0; text-align: center; }
    .code { font-size: 32px; font-weight: 700; color: #92400e; letter-spacing: 4px; margin: 10px 0; }
    .button { display: inline-block; background: #3182ce; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 500; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Estate Private</h1>
    </div>
    <div class="content">
      <h2>Přístupový kód</h2>
      <p>Dobrý den, {{recipientName}},</p>
      <p>Zde je váš přístupový kód k detailním informacím:</p>
      
      <div class="code-box">
        <p style="margin: 0; color: #92400e; font-weight: 600;">Váš přístupový kód:</p>
        <div class="code">{{accessCode}}</div>
        <p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px;">Platnost: {{expiresAt}}</p>
      </div>
      
      <p>Tento kód použijte pro přístup k důvěrným informacím.</p>
      <center>
        <a href="{{accessUrl}}" class="button">Zobrazit detail</a>
      </center>
    </div>
    <div class="footer">
      <p>Estate Private - Realitní platforma</p>
      <p>Tento email byl odeslán automaticky, neodpovídejte na něj.</p>
    </div>
  </div>
</body>
</html>',
'["recipientName","accessCode","expiresAt","accessUrl","entityType"]', 1);

-- 3. Welcome Email
INSERT INTO email_templates (template_key, name, subject, description, html_content, variables, is_active) VALUES
('welcome', 'Uvítací email', 'Vítejte v Estate Private', 'Uvítací email pro nové uživatele',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: #3182ce; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 500; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Estate Private</h1>
    </div>
    <div class="content">
      <h2>Vítejte, {{recipientName}}!</h2>
      <p>Váš účet byl úspěšně vytvořen.</p>
      <center>
        <a href="https://aanxxeyysqtpdcrrwnhm.supabase.co" class="button">Přihlásit se</a>
      </center>
    </div>
    <div class="footer">
      <p>Estate Private - Realitní platforma</p>
    </div>
  </div>
</body>
</html>',
'["recipientName","email","temporaryPassword"]', 1);

-- 4. Match Notification
INSERT INTO email_templates (template_key, name, subject, description, html_content, variables, is_active) VALUES
('match_notification', 'Notifikace o shodě', 'Našli jsme shodu s vaší poptávkou', 'Email odeslaný při nalezení shody mezi nabídkou a poptávkou',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .match-box { background: #dbeafe; border: 1px solid #93c5fd; border-radius: 8px; padding: 20px; margin: 25px 0; }
    .button { display: inline-block; background: #3182ce; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 500; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Estate Private</h1>
    </div>
    <div class="content">
      <h2>Našli jsme shodu!</h2>
      <p>Dobrý den, {{recipientName}},</p>
      <p>Máme pro vás skvělou zprávu - našli jsme nemovitost, která odpovídá vaší poptávce.</p>
      
      <div class="match-box">
        <h3 style="margin: 0 0 10px 0; color: #1e40af;">{{propertyTitle}}</h3>
        <p style="margin: 0; color: #1e40af;">Shoda: {{matchScore}}%</p>
      </div>
      
      <center>
        <a href="{{matchUrl}}" class="button">Zobrazit detail</a>
      </center>
    </div>
    <div class="footer">
      <p>Estate Private - Realitní platforma</p>
    </div>
  </div>
</body>
</html>',
'["recipientName","propertyTitle","matchScore","matchUrl"]', 1);

-- 5. Contract Reminder
INSERT INTO email_templates (template_key, name, subject, description, html_content, variables, is_active) VALUES
('contract_reminder', 'Připomínka smlouvy', 'Připomínka - Smlouva vyžaduje pozornost', 'Připomínka o smlouvě, která vyžaduje akci',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .warning-box { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 25px 0; }
    .button { display: inline-block; background: #3182ce; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 500; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Estate Private</h1>
    </div>
    <div class="content">
      <h2>Připomínka smlouvy</h2>
      <p>Dobrý den, {{recipientName}},</p>
      <p>Připomínáme vám, že smlouva vyžaduje vaši pozornost.</p>
      
      <div class="warning-box">
        <p style="margin: 0; color: #92400e;"><strong>{{contractType}}</strong></p>
        <p style="margin: 5px 0 0 0; color: #92400e;">{{reminderMessage}}</p>
      </div>
      
      <center>
        <a href="{{contractUrl}}" class="button">Zobrazit smlouvu</a>
      </center>
    </div>
    <div class="footer">
      <p>Estate Private - Realitní platforma</p>
    </div>
  </div>
</body>
</html>',
'["recipientName","contractType","reminderMessage","contractUrl"]', 1);

-- 6. New Property Match
INSERT INTO email_templates (template_key, name, subject, description, html_content, variables, is_active) VALUES
('new_property_match', 'Nova nabidka odpovida vasi poptavce', 'Nasli jsme nemovitost pro vas - {{matchScore}}% shoda', 'Email odeslaný klientovi při nalezení nové nabídky odpovídající jeho poptávce',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .property-card { background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 25px 0; }
    .button { display: inline-block; background: #3182ce; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 500; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Estate Private</h1>
    </div>
    <div class="content">
      <h2>Nová nabídka pro vás!</h2>
      <p>Dobrý den, {{recipientName}},</p>
      <p>Našli jsme novou nemovitost, která odpovídá vaší poptávce se shodou {{matchScore}}%.</p>
      
      <div class="property-card">
        <h3 style="margin: 0 0 10px 0;">{{propertyTitle}}</h3>
        <p style="margin: 0;">{{propertyDescription}}</p>
      </div>
      
      <center>
        <a href="{{propertyUrl}}" class="button">Zobrazit detail</a>
      </center>
    </div>
    <div class="footer">
      <p>Estate Private - Realitní platforma</p>
    </div>
  </div>
</body>
</html>',
'["recipientName","matchScore","propertyTitle","propertyDescription","propertyUrl"]', 1);

-- 7. New Demand Match
INSERT INTO email_templates (template_key, name, subject, description, html_content, variables, is_active) VALUES
('new_demand_match', 'Nova poptavka odpovida vasi nabidce', 'Novy zajem o vasi nemovitost - {{matchScore}}% shoda', 'Email odeslaný agentovi při nalezení nové poptávky odpovídající jeho nabídce',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .demand-card { background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 25px 0; }
    .button { display: inline-block; background: #3182ce; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 500; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Estate Private</h1>
    </div>
    <div class="content">
      <h2>Nový zájem o vaši nemovitost!</h2>
      <p>Dobrý den, {{recipientName}},</p>
      <p>Máme novou poptávku, která odpovídá vaší nabídce se shodou {{matchScore}}%.</p>
      
      <div class="demand-card">
        <h3 style="margin: 0 0 10px 0;">{{propertyTitle}}</h3>
        <p style="margin: 0;">Nový potenciální klient hledá podobnou nemovitost.</p>
      </div>
      
      <center>
        <a href="{{matchUrl}}" class="button">Zobrazit detail</a>
      </center>
    </div>
    <div class="footer">
      <p>Estate Private - Realitní platforma</p>
    </div>
  </div>
</body>
</html>',
'["recipientName","matchScore","propertyTitle","matchUrl"]', 1);

-- 8. Property Approved
INSERT INTO email_templates (template_key, name, subject, description, html_content, variables, is_active) VALUES
('property_approved', 'Vaše nabídka byla schválena', 'Vaše nabídka byla schválena a zveřejněna', 'Email odeslaný agentovi po schválení jeho nabídky administrátorem',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .success-box { background: #d1fae5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center; }
    .button { display: inline-block; background: #3182ce; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 500; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Estate Private</h1>
    </div>
    <div class="content">
      <h2>Nabídka byla schválena!</h2>
      <p>Dobrý den, {{recipientName}},</p>
      <p>Vaše nabídka byla úspěšně schválena a zveřejněna na platformě.</p>

      <div class="success-box">
        <h3 style="margin: 0 0 10px 0; color: #065f46;">{{propertyTitle}}</h3>
        <p style="margin: 0; color: #065f46;">Nabídka je nyní viditelná pro ostatní uživatele</p>
      </div>

      <p>{{matchCount}} klientů s odpovídajícími poptávkami bylo automaticky informováno.</p>
      <center>
        <a href="https://aanxxeyysqtpdcrrwnhm.supabase.co" class="button">Zobrazit nabídku</a>
      </center>
    </div>
    <div class="footer">
      <p>Estate Private - Realitní platforma</p>
      <p>Tento email byl odeslán automaticky, neodpovídejte na něj.</p>
    </div>
  </div>
</body>
</html>',
'["recipientName","propertyTitle","matchCount"]', 1);

-- 9. Demand Approved
INSERT INTO email_templates (template_key, name, subject, description, html_content, variables, is_active) VALUES
('demand_approved', 'Vaše poptávka byla schválena', 'Vaše poptávka byla schválena', 'Email odeslaný klientovi po schválení jeho poptávky administrátorem',
'<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .success-box { background: #e0f2fe; border: 1px solid #93c5fd; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center; }
    .button { display: inline-block; background: #3182ce; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 500; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Estate Private</h1>
    </div>
    <div class="content">
      <h2>Poptávka byla schválena!</h2>
      <p>Dobrý den, {{recipientName}},</p>
      <p>Vaše poptávka byla úspěšně schválena.</p>

      <div class="success-box">
        <h3 style="margin: 0 0 10px 0; color: #1d4ed8;">Aktivní poptávka</h3>
        <p style="margin: 0; color: #1d4ed8;">Budeme vás automaticky informovat o nových nabídkách</p>
      </div>

      <p>{{matchCount}} aktuálních nabídek odpovídá vašim požadavkům. Podívejte se na ně v platformě.</p>
      <center>
        <a href="https://aanxxeyysqtpdcrrwnhm.supabase.co" class="button">Zobrazit shody</a>
      </center>
    </div>
    <div class="footer">
      <p>Estate Private - Realitní platforma</p>
      <p>Tento email byl odeslán automaticky, neodpovídejte na něj.</p>
    </div>
  </div>
</body>
</html>',
'["recipientName","matchCount"]', 1);
