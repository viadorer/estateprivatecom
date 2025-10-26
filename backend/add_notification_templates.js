import Database from 'better-sqlite3';

const db = new Database('realestate.db');

const templates = [
  {
    template_key: 'new_property_match',
    name: 'Nova nabidka odpovida vasi poptavce',
    subject: 'Nasli jsme nemovitost pro vas - {{matchScore}}% shoda',
    description: 'Email odeslany klientovi kdyz nova nabidka odpovida jeho poptavce',
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .content h2 { color: #111827; font-size: 20px; margin: 0 0 20px 0; }
    .content p { color: #4b5563; margin: 0 0 15px 0; }
    .property-box { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }
    .property-box h3 { margin: 0 0 15px 0; color: #111827; font-size: 18px; }
    .property-detail { margin: 8px 0; color: #4b5563; font-size: 14px; }
    .match-badge { background: #10b981; color: white; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; display: inline-block; margin-bottom: 15px; }
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
      <h2>Nasli jsme shodu!</h2>
      <p>Dobry den, {{recipientName}},</p>
      <p>Mame pro vas dobrou zpravu. Nova nabidka odpovida vasi poptavce.</p>
      
      <div class="property-box">
        <div class="match-badge">Shoda: {{matchScore}}%</div>
        <h3>{{propertyTitle}}</h3>
        <div class="property-detail"><strong>Lokalita:</strong> {{propertyLocation}}</div>
        <div class="property-detail"><strong>Cena:</strong> {{propertyPrice}}</div>
        <div class="property-detail"><strong>Plocha:</strong> {{propertyArea}} m2</div>
        <div class="property-detail"><strong>Typ:</strong> {{propertyType}}</div>
      </div>
      
      <p>Pro zobrazeni vsech detailu a kontaktu na agenta pouzijte pristupovy kod:</p>
      <div style="background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
        <div style="font-size: 24px; font-weight: 700; color: #3182ce; letter-spacing: 3px;">{{accessCode}}</div>
      </div>
      
      <center>
        <a href="http://localhost:3000" class="button">Zobrazit detail</a>
      </center>
    </div>
    <div class="footer">
      <p>Estate Private - Realitni platforma</p>
      <p>Tento email byl odeslan automaticky, neodpovidejte na nej.</p>
      <p><a href="http://localhost:3000/settings" style="color: #6b7280;">Nastaveni notifikaci</a></p>
    </div>
  </div>
</body>
</html>
    `,
    variables: JSON.stringify(['recipientName', 'propertyTitle', 'propertyLocation', 'propertyPrice', 'propertyArea', 'propertyType', 'matchScore', 'accessCode']),
    is_active: 1
  },
  {
    template_key: 'new_demand_match',
    name: 'Nova poptavka odpovida vasi nabidce',
    subject: 'Novy zajem o vasi nemovitost - {{matchScore}}% shoda',
    description: 'Email odeslany agentovi kdyz nova poptavka odpovida jeho nabidce',
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .content h2 { color: #111827; font-size: 20px; margin: 0 0 20px 0; }
    .content p { color: #4b5563; margin: 0 0 15px 0; }
    .demand-box { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }
    .demand-box h3 { margin: 0 0 15px 0; color: #111827; font-size: 18px; }
    .demand-detail { margin: 8px 0; color: #4b5563; font-size: 14px; }
    .match-badge { background: #10b981; color: white; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; display: inline-block; margin-bottom: 15px; }
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
      <h2>Novy zajem o vasi nemovitost!</h2>
      <p>Dobry den, {{recipientName}},</p>
      <p>Nova poptavka odpovida vasi nabidce: <strong>{{propertyTitle}}</strong></p>
      
      <div class="demand-box">
        <div class="match-badge">Shoda: {{matchScore}}%</div>
        <h3>Parametry poptavky</h3>
        <div class="demand-detail"><strong>Typ:</strong> {{demandType}}</div>
        <div class="demand-detail"><strong>Cenove rozpeti:</strong> {{demandPriceRange}}</div>
        <div class="demand-detail"><strong>Plocha:</strong> {{demandAreaRange}} m2</div>
        <div class="demand-detail"><strong>Lokality:</strong> {{demandLocations}}</div>
      </div>
      
      <p><strong>Kontakt na klienta:</strong></p>
      <div style="background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <div style="margin: 5px 0;"><strong>Jmeno:</strong> {{clientName}}</div>
        <div style="margin: 5px 0;"><strong>Email:</strong> {{clientEmail}}</div>
        <div style="margin: 5px 0;"><strong>Telefon:</strong> {{clientPhone}}</div>
      </div>
      
      <center>
        <a href="http://localhost:3000" class="button">Zobrazit detail</a>
      </center>
    </div>
    <div class="footer">
      <p>Estate Private - Realitni platforma</p>
      <p>Tento email byl odeslan automaticky, neodpovidejte na nej.</p>
      <p><a href="http://localhost:3000/settings" style="color: #6b7280;">Nastaveni notifikaci</a></p>
    </div>
  </div>
</body>
</html>
    `,
    variables: JSON.stringify(['recipientName', 'propertyTitle', 'demandType', 'demandPriceRange', 'demandAreaRange', 'demandLocations', 'matchScore', 'clientName', 'clientEmail', 'clientPhone']),
    is_active: 1
  },
  {
    template_key: 'property_approved',
    name: 'Vase nabidka byla schvalena',
    subject: 'Vase nabidka byla schvalena a zverejnena',
    description: 'Email odeslany agentovi po schvaleni jeho nabidky adminem',
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .content h2 { color: #111827; font-size: 20px; margin: 0 0 20px 0; }
    .content p { color: #4b5563; margin: 0 0 15px 0; }
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
      <h2>Nabidka schvalena!</h2>
      <p>Dobry den, {{recipientName}},</p>
      <p>Vase nabidka byla uspesne schvalena a zverejnena na platforme.</p>
      
      <div class="success-box">
        <h3 style="margin: 0 0 10px 0; color: #065f46;">{{propertyTitle}}</h3>
        <p style="margin: 0; color: #065f46;">Nabidka je nyni viditelna pro vsechny uzivatele</p>
      </div>
      
      <p>{{matchCount}} klientu s odpovida jicimi poptavkami bylo automaticky informovano.</p>
      
      <center>
        <a href="http://localhost:3000" class="button">Zobrazit nabidku</a>
      </center>
    </div>
    <div class="footer">
      <p>Estate Private - Realitni platforma</p>
      <p>Tento email byl odeslan automaticky, neodpovidejte na nej.</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: JSON.stringify(['recipientName', 'propertyTitle', 'matchCount']),
    is_active: 1
  },
  {
    template_key: 'demand_approved',
    name: 'Vase poptavka byla schvalena',
    subject: 'Vase poptavka byla schvalena',
    description: 'Email odeslany klientovi po schvaleni jeho poptavky adminem',
    html_content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .content h2 { color: #111827; font-size: 20px; margin: 0 0 20px 0; }
    .content p { color: #4b5563; margin: 0 0 15px 0; }
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
      <h2>Poptavka schvalena!</h2>
      <p>Dobry den, {{recipientName}},</p>
      <p>Vase poptavka byla uspesne schvalena.</p>
      
      <div class="success-box">
        <h3 style="margin: 0 0 10px 0; color: #065f46;">Aktivni poptavka</h3>
        <p style="margin: 0; color: #065f46;">Budete automaticky informovani o novych nabidkach</p>
      </div>
      
      <p>{{matchCount}} aktualnich nabidek odpovida vasim pozadavkum. Podivejte se na ne v platforme.</p>
      
      <center>
        <a href="http://localhost:3000" class="button">Zobrazit shody</a>
      </center>
    </div>
    <div class="footer">
      <p>Estate Private - Realitni platforma</p>
      <p>Tento email byl odeslan automaticky, neodpovidejte na nej.</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: JSON.stringify(['recipientName', 'matchCount']),
    is_active: 1
  }
];

const insertTemplate = db.prepare(`
  INSERT INTO email_templates (template_key, name, subject, description, html_content, variables, is_active)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

let count = 0;

templates.forEach(template => {
  try {
    insertTemplate.run(
      template.template_key,
      template.name,
      template.subject,
      template.description,
      template.html_content,
      template.variables,
      template.is_active
    );
    count++;
    console.log(`Pridana sablona: ${template.name}`);
  } catch (error) {
    console.error(`Chyba pri pridavani sablony ${template.name}:`, error.message);
  }
});

console.log(`\nCelkem pridano ${count} notifikacnich sablon`);

db.close();
