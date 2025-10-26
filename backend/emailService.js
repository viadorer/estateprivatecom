import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import db from './database.js';

dotenv.config();

// Konfigurace email transportu pro Google Workspace
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true pro port 465, false pro port 587
    auth: {
      user: process.env.EMAIL_USER || 'info@ptf.cz',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  });
};

// Nahrazení proměnných v šabloně
const replaceVariables = (template, variables) => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }
  return result;
};

// Odeslání emailu ze šablony
const sendEmailFromTemplate = async (templateKey, recipientEmail, variables, userId = null) => {
  try {
    // Načíst šablonu z databáze
    const template = db.prepare('SELECT * FROM email_templates WHERE template_key = ? AND is_active = 1').get(templateKey);
    
    if (!template) {
      throw new Error(`Emailová šablona '${templateKey}' nebyla nalezena nebo není aktivní`);
    }

    // Nahradit proměnné v předmětu a obsahu
    const subject = replaceVariables(template.subject, variables);
    const htmlContent = replaceVariables(template.html_content, variables);

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'Estate Private',
        address: process.env.EMAIL_USER || 'info@ptf.cz'
      },
      to: recipientEmail,
      subject: subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email odeslan (${templateKey}):`, info.messageId);

    // Zaznamenat do audit logu
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
        VALUES (?, 'email_sent', 'email_template', ?, ?)
      `).run(
        userId,
        template.id,
        JSON.stringify({
          template_key: templateKey,
          recipient: recipientEmail,
          subject: subject,
          message_id: info.messageId,
          variables: variables
        })
      );
    } catch (logError) {
      console.error('Chyba pri logovani emailu:', logError);
      // Pokračujeme i když logování selže
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Chyba pri odesilani emailu (${templateKey}):`, error);
    throw error;
  }
};

// Odeslání přístupového kódu emailem
const sendAccessCode = async (recipientEmail, recipientName, code, entityType, entityTitle, expiresAt) => {
  // Import DEV_CONFIG
  let DEV_CONFIG;
  try {
    DEV_CONFIG = (await import('./devConfig.js')).default;
  } catch (e) {
    DEV_CONFIG = { email: { sendEmails: true, showCodeInConsole: false } };
  }

  const expirationText = expiresAt 
    ? `Kód je platný do: ${new Date(expiresAt).toLocaleString('cs-CZ')}`
    : 'Kód nemá omezenou platnost.';

  // Určit typ entity a text podle entityType
  let entityTypeText, emailSubject, emailHeading, emailDescription;
  
  if (entityType === 'agent_declaration') {
    entityTypeText = 'Prohlášení agenta';
    emailSubject = 'Ověřovací kód pro vytvoření nabídky';
    emailHeading = 'Ověřovací kód';
    emailDescription = 'Byl vám vygenerován ověřovací kód pro potvrzení Prohlášení agenta a vytvoření nové nabídky nemovitosti.';
  } else if (entityType === 'property') {
    entityTypeText = 'nemovitosti';
    emailSubject = 'Přístupový kód k nemovitosti';
    emailHeading = 'Přístupový kód';
    emailDescription = 'Byl vám vygenerován přístupový kód pro zobrazení detailu nemovitosti:';
  } else {
    entityTypeText = 'poptávky';
    emailSubject = 'Přístupový kód k poptávce';
    emailHeading = 'Přístupový kód';
    emailDescription = 'Byl vám vygenerován přístupový kód pro zobrazení detailu poptávky:';
  }
  
  // V dev režimu zobrazit kód v konzoli
  if (DEV_CONFIG.email.showCodeInConsole) {
    console.log('\n=== PRISTUPOVY KOD ===');
    console.log(`Email: ${recipientEmail}`);
    console.log(`Jmeno: ${recipientName}`);
    console.log(`KOD: ${code}`);
    console.log(`Typ: ${entityTypeText}`);
    console.log(`Expirace: ${expirationText}`);
    console.log('======================\n');
  }
  
  // Pokud je vypnuto odesílání emailů, jen logovat
  if (!DEV_CONFIG.email.sendEmails) {
    console.log(`[DEV] Email by byl odeslan na ${recipientEmail} s kodem: ${code}`);
    return { success: true, messageId: 'dev-mode-no-email' };
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: {
      name: 'Estate Private',
      address: process.env.EMAIL_USER || 'info@ptf.cz'
    },
    to: recipientEmail,
    subject: emailSubject,
    html: `
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
          .code { font-size: 32px; font-weight: 700; color: #3182ce; letter-spacing: 4px; font-family: 'Courier New', monospace; }
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
            <h2>${emailHeading}</h2>
            <p>Dobrý den, <strong>${recipientName}</strong>,</p>
            <p>${emailDescription}</p>
            ${entityTitle && entityType !== 'agent_declaration' ? `<p style="font-size: 16px; font-weight: 600; color: #111827; margin: 20px 0;">${entityTitle}</p>` : ''}
            
            <div class="code-box">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Váš kód:</p>
              <div class="code">${code}</div>
            </div>
            
            ${entityType === 'agent_declaration' ? `
            <div class="info-box">
              <p style="margin: 0 0 10px 0; color: #92400e; font-weight: 600;">Jak použít kód:</p>
              <ol style="margin: 0; padding-left: 20px; color: #92400e;">
                <li>Vraťte se do formuláře Prohlášení agenta</li>
                <li>Zadejte tento 6-místný kód</li>
                <li>Po ověření můžete pokračovat ve vytváření nabídky</li>
              </ol>
            </div>
            ` : `
            <div class="info-box">
              <p style="margin: 0 0 10px 0; color: #92400e; font-weight: 600;">Jak použít kód:</p>
              <ol style="margin: 0; padding-left: 20px; color: #92400e;">
                <li>Přihlaste se do systému Estate Private</li>
                <li>Najděte požadovanou ${entityTypeText}</li>
                <li>Klikněte na "Zobrazit detail"</li>
                <li>Zadejte tento kód</li>
              </ol>
            </div>
            `}
            
            <p style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>Platnost:</strong> ${expirationText}
            </p>
            
            <p style="color: #6b7280; font-size: 14px; border-left: 3px solid #e5e7eb; padding-left: 15px;">
              <strong>Bezpečnost:</strong> Tento kód je určen pouze pro vás. Nesdílejte ho s nikým dalším. Každé použití kódu je zaznamenáno.
            </p>
            
            <p>S pozdravem,<br><strong>Tým Estate Private</strong></p>
          </div>
          <div class="footer">
            <p>Estate Private - Realitní platforma</p>
            <p>Tento email byl odeslán automaticky, neodpovídejte na něj.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Dobrý den, ${recipientName},

byl Vám vygenerován přístupový kód pro zobrazení detailu ${entityTypeText}:

${entityTitle}

VÁŠ PŘÍSTUPOVÝ KÓD: ${code}

Jak použít kód:
1. Přihlaste se do realitního systému
2. Najděte požadovanou ${entityTypeText}
3. Klikněte na "Zobrazit detail"
4. Zadejte tento kód

Platnost: ${expirationText}

BEZPEČNOST: Tento kód je určen pouze pro Vás. Nesdílejte ho s nikým dalším.

S pozdravem,
Tým Estate Private
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email odeslán:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Chyba při odesílání emailu:', error);
    throw error;
  }
};

// Odeslání uvítacího emailu novému uživateli
const sendWelcomeEmail = async (recipientEmail, recipientName, temporaryPassword) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: {
      name: 'Estate Private',
      address: process.env.EMAIL_USER || 'info@ptf.cz'
    },
    to: recipientEmail,
    subject: 'Vítejte na Estate Private',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .credentials {
            background: white;
            border: 2px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>👋 Vítejte v realitním systému!</h1>
        </div>
        
        <div class="content">
          <p>Dobrý den, <strong>${recipientName}</strong>,</p>
          
          <p>byl Vám vytvořen účet v našem realitním systému.</p>
          
          <div class="credentials">
            <p><strong>📧 Email:</strong> ${recipientEmail}</p>
            <p><strong>🔑 Dočasné heslo:</strong> ${temporaryPassword}</p>
          </div>
          
          <p><strong>⚠️ Důležité:</strong> Po prvním přihlášení si prosím změňte heslo.</p>
          
          <p>S pozdravem,<br>
          <strong>Tým Estate Private</strong></p>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Realitní systém</p>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Uvítací email odeslán:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Chyba při odesílání uvítacího emailu:', error);
    throw error;
  }
};

// Obecná funkce pro odeslání emailu
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: {
      name: 'PTF reality',
      address: process.env.EMAIL_USER || 'info@ptf.cz'
    },
    to,
    subject,
    html,
    text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email odeslán:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Chyba při odesílání emailu:', error);
    throw error;
  }
};

// Odeslání schvalovacího emailu s přístupovým kódem
const sendRegistrationApproval = async (recipientEmail, recipientName, accessCode, contractType, userId = null) => {
  const contractTypeText = {
    'cooperation_client': 'Smlouva o spolupráci - Klient',
    'cooperation_client_commission': 'Smlouva o spolupráci - Klient s provizí',
    'cooperation_agent': 'Smlouva o spolupráci - Agent'
  }[contractType] || 'Smlouva o spolupráci';

  return sendEmailFromTemplate('registration_approval', recipientEmail, {
    recipientName,
    accessCode,
    contractType: contractTypeText
  }, userId);
};

export {
  sendAccessCode,
  sendWelcomeEmail,
  sendEmail,
  sendRegistrationApproval,
  sendEmailFromTemplate
};
