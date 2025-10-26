import Database from 'better-sqlite3';

const db = new Database('realestate.db');

const templates = [
  {
    template_key: 'registration_approval',
    name: 'Schválení registrace',
    subject: 'Vaše registrace byla schválena',
    description: 'Email odeslaný po schválení registrace uživatele',
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
    .code-box { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0; }
    .code { font-size: 32px; font-weight: 700; color: #3182ce; letter-spacing: 4px; }
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
      <p>Vaše registrace byla úspěšně schválena. Nyní máte přístup k platformě Estate Private.</p>
      
      <div class="code-box">
        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Váš přístupový kód:</p>
        <div class="code">{{accessCode}}</div>
      </div>
      
      <p>Typ smlouvy: <strong>{{contractType}}</strong></p>
      
      <p>Přihlaste se na platformě a začněte využívat všechny funkce.</p>
      
      <center>
        <a href="http://localhost:3000" class="button">Přejít na platformu</a>
      </center>
    </div>
    <div class="footer">
      <p>Estate Private - Realitní platforma</p>
      <p>Tento email byl odeslán automaticky, neodpovídejte na něj.</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: JSON.stringify(['recipientName', 'accessCode', 'contractType']),
    is_active: 1
  },
  {
    template_key: 'access_code',
    name: 'Přístupový kód k nemovitosti',
    subject: 'Přístupový kód k {{entityType}}',
    description: 'Email s přístupovým kódem k nemovitosti nebo poptávce',
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
    .code-box { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0; }
    .code { font-size: 32px; font-weight: 700; color: #3182ce; letter-spacing: 4px; }
    .info-box { background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; margin: 20px 0; }
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
      <p>Byl vám vygenerován přístupový kód k: <strong>{{entityTitle}}</strong></p>
      
      <div class="code-box">
        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Váš kód:</p>
        <div class="code">{{code}}</div>
      </div>
      
      <div class="info-box">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>Platnost:</strong> Kód je platný do {{expiresAt}}
        </p>
      </div>
      
      <p>Tento kód použijte pro přístup k detailním informacím.</p>
    </div>
    <div class="footer">
      <p>Estate Private - Realitní platforma</p>
      <p>Tento email byl odeslán automaticky, neodpovídejte na něj.</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: JSON.stringify(['recipientName', 'code', 'entityType', 'entityTitle', 'expiresAt']),
    is_active: 1
  },
  {
    template_key: 'welcome',
    name: 'Uvítací email',
    subject: 'Vítejte v Estate Private',
    description: 'Uvítací email pro nové uživatele',
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
      <h2>Vítejte, {{recipientName}}!</h2>
      <p>Váš účet byl úspěšně vytvořen. Níže najdete přihlašovací údaje:</p>
      
      <div class="credentials">
        <p style="margin: 0 0 10px 0;"><strong>Email:</strong> {{email}}</p>
        <p style="margin: 0;"><strong>Dočasné heslo:</strong> {{temporaryPassword}}</p>
      </div>
      
      <p><strong>Důležité:</strong> Po prvním přihlášení si prosím změňte heslo.</p>
      
      <center>
        <a href="http://localhost:3000" class="button">Přihlásit se</a>
      </center>
    </div>
    <div class="footer">
      <p>Estate Private - Realitní platforma</p>
      <p>Tento email byl odeslán automaticky, neodpovídejte na něj.</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: JSON.stringify(['recipientName', 'email', 'temporaryPassword']),
    is_active: 1
  },
  {
    template_key: 'match_notification',
    name: 'Notifikace o shodě',
    subject: 'Našli jsme shodu s vaší poptávkou',
    description: 'Email odeslaný při nalezení shody mezi poptávkou a nabídkou',
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
      <p>Máme pro vás dobrou zprávu. Našli jsme nemovitost, která odpovídá vaší poptávce.</p>
      
      <div class="property-box">
        <h3 style="margin: 0 0 15px 0; color: #111827;">{{propertyTitle}}</h3>
        <p style="margin: 0 0 8px 0;"><strong>Lokalita:</strong> {{propertyLocation}}</p>
        <p style="margin: 0 0 8px 0;"><strong>Cena:</strong> {{propertyPrice}}</p>
        <p style="margin: 0;"><strong>Shoda:</strong> {{matchScore}}%</p>
      </div>
      
      <p>Přihlaste se na platformu pro zobrazení všech detailů.</p>
      
      <center>
        <a href="http://localhost:3000" class="button">Zobrazit detail</a>
      </center>
    </div>
    <div class="footer">
      <p>Estate Private - Realitní platforma</p>
      <p>Tento email byl odeslán automaticky, neodpovídejte na něj.</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: JSON.stringify(['recipientName', 'propertyTitle', 'propertyLocation', 'propertyPrice', 'matchScore']),
    is_active: 1
  },
  {
    template_key: 'contract_reminder',
    name: 'Připomínka smlouvy',
    subject: 'Připomínka - Smlouva vyžaduje pozornost',
    description: 'Připomínka o smlouvě, která vyžaduje akci',
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
    .warning-box { background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 25px 0; }
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
      <p>Upozorňujeme vás na smlouvu, která vyžaduje vaši pozornost.</p>
      
      <div class="warning-box">
        <p style="margin: 0 0 10px 0; color: #92400e;"><strong>{{contractType}}</strong></p>
        <p style="margin: 0; color: #92400e;">{{reminderMessage}}</p>
      </div>
      
      <p>Přihlaste se na platformu pro více informací.</p>
      
      <center>
        <a href="http://localhost:3000" class="button">Přejít na platformu</a>
      </center>
    </div>
    <div class="footer">
      <p>Estate Private - Realitní platforma</p>
      <p>Tento email byl odeslán automaticky, neodpovídejte na něj.</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: JSON.stringify(['recipientName', 'contractType', 'reminderMessage']),
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

console.log(`\nCelkem pridano ${count} emailovych sablon`);

db.close();
