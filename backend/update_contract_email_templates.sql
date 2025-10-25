-- Emailové šablony pro podepsané smlouvy

-- 1. LOI podepsán
UPDATE email_templates 
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 3px solid #10b981; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
    .success-icon { font-size: 48px; margin: 20px 0; }
    h1 { color: #10b981; margin: 0; font-size: 24px; }
    .info-box { background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e5e5; }
    .button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">PrivateEstate</div>
      <div class="success-icon">✓</div>
      <h1>Letter of Intent byl podepsán</h1>
    </div>
    <p>Vážený/á {{recipientName}},</p>
    <p>Potvrzujeme, že <strong>Letter of Intent</strong> byl úspěšně podepsán.</p>
    <div class="info-box">
      <div class="detail-row">
        <strong>Nemovitost:</strong>
        <span>{{propertyTitle}}</span>
      </div>
      <div class="detail-row">
        <strong>Datum podpisu:</strong>
        <span>{{signedAt}}</span>
      </div>
    </div>
    <p>Dokument je nyní právně závazný a byl uložen do systému. Můžete jej kdykoli zobrazit ve své sekci dokumentů.</p>
    <div style="text-align: center;">
      <a href="https://estateprivate.com/documents" class="button">Zobrazit dokumenty</a>
    </div>
    <p>V případě dotazů nás neváhejte kontaktovat.</p>
    <div class="footer">
      <strong>Estateprivate.com</strong><br>
      Exkluzivní realitní platforma<br>
      <a href="mailto:info@ptf.cz">info@ptf.cz</a>
    </div>
  </div>
</body>
</html>'
WHERE template_key = 'loi_signed';

-- 2. Zprostředkovatelská smlouva podepsána
UPDATE email_templates 
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 3px solid #10b981; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
    .success-icon { font-size: 48px; margin: 20px 0; }
    h1 { color: #10b981; margin: 0; font-size: 24px; }
    .info-box { background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e5e5; }
    .button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">PrivateEstate</div>
      <div class="success-icon">✓</div>
      <h1>Zprostředkovatelská smlouva podepsána</h1>
    </div>
    <p>Vážený/á {{recipientName}},</p>
    <p>Potvrzujeme, že <strong>zprostředkovatelská smlouva</strong> byla úspěšně podepsána.</p>
    <div class="info-box">
      <div class="detail-row">
        <strong>{{entityType}}:</strong>
        <span>{{entityTitle}}</span>
      </div>
      <div class="detail-row">
        <strong>Provize:</strong>
        <span>{{commissionRate}}%</span>
      </div>
      <div class="detail-row">
        <strong>Datum podpisu:</strong>
        <span>{{signedAt}}</span>
      </div>
    </div>
    <p>Smlouva je nyní platná a byla uložena do systému. Od této chvíle můžete začít aktivně pracovat na zprostředkování.</p>
    <div style="text-align: center;">
      <a href="https://estateprivate.com/documents" class="button">Zobrazit dokumenty</a>
    </div>
    <p>Děkujeme za důvěru a těšíme se na úspěšnou spolupráci!</p>
    <div class="footer">
      <strong>Estateprivate.com</strong><br>
      Exkluzivní realitní platforma<br>
      <a href="mailto:info@ptf.cz">info@ptf.cz</a>
    </div>
  </div>
</body>
</html>'
WHERE template_key = 'brokerage_contract_signed';

-- 3. Smlouva o spolupráci podepsána
UPDATE email_templates 
SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 3px solid #10b981; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
    .success-icon { font-size: 48px; margin: 20px 0; }
    h1 { color: #10b981; margin: 0; font-size: 24px; }
    .info-box { background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e5e5; }
    .button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">PrivateEstate</div>
      <div class="success-icon">✓</div>
      <h1>Smlouva o spolupráci podepsána</h1>
    </div>
    <p>Vážený/á {{recipientName}},</p>
    <p>Gratulujeme! Vaše <strong>smlouva o spolupráci</strong> byla úspěšně podepsána a Váš účet je nyní plně aktivní.</p>
    <div class="info-box">
      <div class="detail-row">
        <strong>Typ smlouvy:</strong>
        <span>{{contractType}}</span>
      </div>
      <div class="detail-row">
        <strong>Datum podpisu:</strong>
        <span>{{signedAt}}</span>
      </div>
    </div>
    <p>Nyní máte plný přístup ke všem funkcím platformy Estateprivate.com. Můžete začít přidávat nemovitosti, vytvářet poptávky a využívat všechny výhody naší platformy.</p>
    <div style="text-align: center;">
      <a href="https://estateprivate.com/dashboard" class="button">Přejít na platformu</a>
    </div>
    <p>Těšíme se na úspěšnou spolupráci!</p>
    <div class="footer">
      <strong>Estateprivate.com</strong><br>
      Exkluzivní realitní platforma<br>
      <a href="mailto:info@ptf.cz">info@ptf.cz</a>
    </div>
  </div>
</body>
</html>'
WHERE template_key = 'cooperation_contract_signed';
