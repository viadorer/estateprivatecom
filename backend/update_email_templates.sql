-- Aktualizace emailových šablon s kompletním HTML obsahem

-- 1. Schválení registrace
UPDATE email_templates 
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 3px solid #7c3aed; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
    .success-icon { font-size: 48px; margin: 20px 0; }
    h1 { color: #7c3aed; margin: 0; font-size: 24px; }
    .code-box { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 25px; border-radius: 10px; text-align: center; margin: 30px 0; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3); }
    .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: "Courier New", monospace; margin: 10px 0; }
    .info-box { background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .step { padding: 15px; margin: 10px 0; background-color: #fafafa; border-radius: 8px; border-left: 3px solid #7c3aed; }
    .step-number { display: inline-block; background: #7c3aed; color: white; width: 30px; height: 30px; border-radius: 50%; text-align: center; line-height: 30px; margin-right: 10px; font-weight: bold; }
    .button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3); }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">PrivateEstate</div>
      <div class="success-icon">✅</div>
      <h1>Gratulujeme! Vaše registrace byla schválena</h1>
    </div>
    <p>Vážený/á {{recipientName}},</p>
    <p>S radostí Vám oznamujeme, že <strong>Vaše žádost o přístup na platformu Estateprivate.com byla schválena</strong>!</p>
    <div class="info-box"><strong>Typ smlouvy:</strong> {{contractType}}</div>
    <p>Pro dokončení registrace a aktivaci Vašeho účtu prosím postupujte podle následujících kroků:</p>
    <div class="steps">
      <div class="step"><span class="step-number">1</span><strong>Použijte přístupový kód níže</strong> pro vstup na platformu</div>
      <div class="step"><span class="step-number">2</span><strong>Přečtěte si a podepište smlouvu</strong> o spolupráci</div>
      <div class="step"><span class="step-number">3</span><strong>Nastavte si heslo</strong> pro přístup do systému</div>
    </div>
    <div class="code-box">
      <div style="font-size: 14px; margin-bottom: 10px;">Váš přístupový kód:</div>
      <div class="code">{{accessCode}}</div>
      <div style="font-size: 12px; margin-top: 10px; opacity: 0.9;">Tento kód je určen pouze pro Vás. Nikomu jej nesdělujte.</div>
    </div>
    <div style="text-align: center;">
      <a href="https://estateprivate.com/activate?code={{accessCode}}" class="button">Aktivovat účet</a>
    </div>
    <div class="info-box">
      <strong>Důležité informace:</strong><br>
      • Kód je platný po dobu 7 dní<br>
      • Po aktivaci získáte plný přístup k platformě<br>
      • V případě problémů nás kontaktujte na info@ptf.cz
    </div>
    <p>Těšíme se na spolupráci s Vámi!</p>
    <div class="footer">
      <strong>Estateprivate.com</strong><br>
      Exkluzivní realitní platforma<br>
      <a href="mailto:info@ptf.cz">info@ptf.cz</a>
    </div>
  </div>
</body>
</html>'
WHERE template_key = 'registration_approval';

-- 2. Zamítnutí registrace
UPDATE email_templates 
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 3px solid #ef4444; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
    h1 { color: #ef4444; margin: 0; font-size: 24px; }
    .info-box { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">PrivateEstate</div>
      <h1>Informace o Vaší registraci</h1>
    </div>
    <p>Vážený/á {{recipientName}},</p>
    <p>Děkujeme za Váš zájem o platformu Estateprivate.com.</p>
    <p>Bohužel Vaše žádost o registraci nemohla být v tuto chvíli schválena.</p>
    <div class="info-box">
      <strong>Důvod:</strong><br>
      {{reason}}
    </div>
    <p>V případě dotazů nás prosím kontaktujte na <a href="mailto:info@ptf.cz">info@ptf.cz</a>.</p>
    <div class="footer">
      <strong>Estateprivate.com</strong><br>
      Exkluzivní realitní platforma<br>
      <a href="mailto:info@ptf.cz">info@ptf.cz</a>
    </div>
  </div>
</body>
</html>'
WHERE template_key = 'registration_rejection';

-- 3. Nová registrace (notifikace pro admina)
UPDATE email_templates 
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 3px solid #7c3aed; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
    h1 { color: #7c3aed; margin: 0; font-size: 24px; }
    .info-box { background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">PrivateEstate</div>
      <h1>Nová žádost o registraci</h1>
    </div>
    <p>Nová žádost o registraci čeká na schválení.</p>
    <div class="info-box">
      <strong>Jméno:</strong> {{userName}}<br>
      <strong>Email:</strong> {{userEmail}}<br>
      <strong>Typ:</strong> {{userType}}
    </div>
    <div style="text-align: center;">
      <a href="https://estateprivate.com/admin/registrations" class="button">Zobrazit žádost</a>
    </div>
    <div class="footer">
      <strong>Estateprivate.com</strong><br>
      Admin notifikace
    </div>
  </div>
</body>
</html>'
WHERE template_key = 'new_registration_admin';
