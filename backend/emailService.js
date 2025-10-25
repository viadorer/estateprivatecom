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
  const transporter = createTransporter();

  const expirationText = expiresAt 
    ? `Kód je platný do: ${new Date(expiresAt).toLocaleString('cs-CZ')}`
    : 'Kód nemá omezenou platnost.';

  const entityTypeText = entityType === 'property' ? 'nemovitosti' : 'poptávky';

  const mailOptions = {
    from: {
      name: 'Estateprivate.com',
      address: process.env.EMAIL_USER || 'info@ptf.cz'
    },
    to: recipientEmail,
    subject: `🔐 Přístupový kód k ${entityTypeText}`,
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
          .code-box {
            background: white;
            border: 3px dashed #667eea;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            border-radius: 8px;
          }
          .code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #667eea;
            font-family: 'Courier New', monospace;
          }
          .info-box {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏠 Přístupový kód k ${entityTypeText}</h1>
        </div>
        
        <div class="content">
          <p>Dobrý den, <strong>${recipientName}</strong>,</p>
          
          <p>byl Vám vygenerován přístupový kód pro zobrazení detailu ${entityTypeText}:</p>
          
          <p><strong>${entityTitle}</strong></p>
          
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          
          <div class="info-box">
            <p style="margin: 0;"><strong>ℹ️ Jak použít kód:</strong></p>
            <ol style="margin: 10px 0;">
              <li>Přihlaste se do realitního systému</li>
              <li>Najděte požadovanou ${entityTypeText}</li>
              <li>Klikněte na "Zobrazit detail"</li>
              <li>Zadejte tento kód</li>
            </ol>
          </div>
          
          <p><strong>⏰ Platnost:</strong> ${expirationText}</p>
          
          <p style="color: #6b7280; font-size: 14px;">
            <strong>🔒 Bezpečnost:</strong> Tento kód je určen pouze pro Vás. 
            Nesdílejte ho s nikým dalším. Každé použití kódu je zaznamenáno.
          </p>
          
          <p>Pokud máte jakékoliv dotazy, neváhejte nás kontaktovat.</p>
          
          <p>S pozdravem,<br>
          <strong>Tým Estate Private</strong></p>
        </div>
        
        <div class="footer">
          <p>Tento email byl odeslán automaticky. Prosím neodpovídejte na něj.</p>
          <p>&copy; ${new Date().getFullYear()} Realitní systém. Všechna práva vyhrazena.</p>
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
