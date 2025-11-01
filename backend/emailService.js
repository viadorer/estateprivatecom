import nodemailer from 'nodemailer';
import db from './database.js';
import dotenv from 'dotenv';

// Helper pro uložení odeslaného emailu do sent_emails tabulky
const logSentEmail = (data) => {
  const {
    templateId = null,
    templateKey = null,
    userId = null,
    recipientEmail,
    subject,
    content,
    status = 'sent',
    messageId = null,
    entityType = null,
    entityId = null,
    metadata = null
  } = data;

  try {
    db.prepare(`
      INSERT INTO sent_emails (
        template_key,
        template_id,
        user_id,
        recipient_email,
        subject,
        content,
        status,
        message_id,
        entity_type,
        entity_id,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      templateKey,
      templateId,
      userId,
      recipientEmail,
      subject,
      content,
      status,
      messageId,
      entityType,
      entityId,
      metadata ? JSON.stringify(metadata) : null
    );
  } catch (error) {
    console.error('Chyba při ukládání odeslaného emailu:', error);
  }
};

dotenv.config();

const resolveLogoUrl = () => {
  const fromEnv = process.env.EMAIL_LOGO_URL;
  const baseUrl = (process.env.FRONTEND_URL || 'https://estateprivate.com').replace(/\/$/, '');

  if (fromEnv) {
    if (/^https?:\/\//i.test(fromEnv)) {
      return fromEnv;
    }
    return `${baseUrl}/${fromEnv.replace(/^\/+/, '')}`;
  }

  return `${baseUrl}/logo.png`;
};

const EMAIL_LOGO_URL = resolveLogoUrl();

const EMAIL_BRAND_BLOCK = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" data-branding="estate-private" style="margin:0 0 24px 0;">
    <tr>
      <td align="center" style="padding:16px 12px;background:#f8fafc;border-radius:16px;">
        <img src="${EMAIL_LOGO_URL}" alt="Estate Private" style="height:40px;width:auto;margin-bottom:8px;" />
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;font-weight:600;color:#475569;">EstatePrivate.com</div>
      </td>
    </tr>
  </table>
`;

const injectBranding = (html = '') => {
  if (!html || html.includes('data-branding="estate-private"')) return html;
  if (html.includes('<body')) {
    return html.replace('<body>', `<body>${EMAIL_BRAND_BLOCK}`);
  }
  return `${EMAIL_BRAND_BLOCK}${html}`;
};

const appendBrandingText = (text = '') => {
  const signature = '\n\n—\nEstate Private\ninfo@ptf.cz | estateprivate.com';
  return text && !text.includes('Estate Private') ? `${text}${signature}` : text;
};

const buildMinimalEmail = ({
  title,
  description = '',
  contentHtml,
  preheader = '',
  footerLines = ['Estate Private', 'Dřevěná 99/3, 301 00 Plzeň', 'info@ptf.cz | estateprivate.com']
}) => {
  const footerHtml = footerLines
    .filter(Boolean)
    .map(line => `<div style="margin:0;color:#94a3b8;font-size:12px;line-height:18px;">${line}</div>`)
    .join('');

  return `<!DOCTYPE html>
  <html lang="cs" data-branding="estate-private">
    <head>
      <meta charSet="utf-8" />
      <meta http-equiv="x-ua-compatible" content="ie=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title}</title>
      <style>
        @media (prefers-color-scheme: dark) {
          body { background-color: #0f172a !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:40px;background:#eef2ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;">
      <span style="display:none;font-size:0;line-height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;">
              <tr>
                <td style="padding:0 24px 24px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.95);border-radius:28px;box-shadow:0 20px 40px rgba(15,23,42,0.08);overflow:hidden;">
                    <tr>
                      <td align="center" style="padding:36px 32px 28px;background:linear-gradient(135deg,rgba(102,126,234,0.15) 0%,rgba(118,75,162,0.12) 100%);border-bottom:1px solid rgba(99,102,241,0.12);">
                        <img src="${EMAIL_LOGO_URL}" alt="Estate Private" style="height:44px;width:auto;margin-bottom:16px;" />
                        <h1 style="margin:0;font-size:24px;line-height:32px;color:#1e293b;font-weight:700;">${title}</h1>
                        ${description ? `<p style="margin:12px 0 0;font-size:15px;line-height:22px;color:#475569;">${description}</p>` : ''}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px 32px 40px;">
                        ${contentHtml}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:24px 32px;background:rgba(248,250,252,0.9);border-top:1px solid rgba(148,163,184,0.2);">
                        ${footerHtml}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
};

const getDefaultFrom = () => {
  if (process.env.EMAIL_FROM && process.env.EMAIL_FROM.trim().length > 0) {
    return process.env.EMAIL_FROM.trim();
  }

  const fallbackUser = process.env.EMAIL_USER || 'info@ptf.cz';
  return `Estate Private <${fallbackUser}>`;
};

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

const sendEmail = async (arg1, arg2, arg3) => {
  const transporter = createTransporter();

  let mailOptions = {};
  if (typeof arg1 === 'object' && arg1 !== null && !Array.isArray(arg1)) {
    mailOptions = { ...arg1 };
  } else {
    mailOptions = {
      to: arg1,
      subject: arg2,
      html: arg3
    };
  }

  if (!mailOptions.to) {
    throw new Error('Chybí příjemce emailu ("to")');
  }

  if (!mailOptions.subject) {
    throw new Error('Chybí předmět emailu');
  }

  mailOptions.from = mailOptions.from || getDefaultFrom();

  if (mailOptions.html) {
    mailOptions.html = injectBranding(mailOptions.html);
  }

  if (mailOptions.text) {
    mailOptions.text = appendBrandingText(mailOptions.text);
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email odeslán:', info.messageId);

    logSentEmail({
      recipientEmail: Array.isArray(mailOptions.to) ? mailOptions.to.join(',') : mailOptions.to,
      subject: mailOptions.subject,
      content: mailOptions.html || mailOptions.text || '',
      status: 'sent',
      messageId: info.messageId,
      metadata: {
        type: 'direct_send',
        hasHtml: Boolean(mailOptions.html),
        hasText: Boolean(mailOptions.text)
      }
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Chyba při odesílání emailu:', error);
    throw error;
  }
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
    const htmlContent = injectBranding(replaceVariables(template.html_content, variables));

    const transporter = createTransporter();

    const mailOptions = {
      from: getDefaultFrom(),
      to: recipientEmail,
      subject: subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email odeslan (${templateKey}):`, info.messageId);

    // Uložit do sent_emails
    logSentEmail({
      templateId: template.id,
      templateKey,
      userId,
      recipientEmail,
      subject,
      content: htmlContent,
      status: 'sent',
      messageId: info.messageId,
      metadata: { variables }
    });

    // Zaznamenat do audit logu (původní behavior)
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

  const htmlContent = buildMinimalEmail({
    title: emailHeading,
    description: entityTitle && entityType !== 'agent_declaration' ? entityTitle : description,
    preheader: `${emailHeading} pro ${recipientName}`,
    contentHtml: `
      <p style="margin:0 0 16px;font-size:15px;line-height:22px;color:#1f2937;">Dobrý den, <strong>${recipientName}</strong>,</p>
      <p style="margin:0 0 20px;font-size:15px;line-height:22px;color:#475569;">${emailDescription}</p>
      <div style="margin:24px 0;padding:24px;border:1px solid rgba(99,102,241,0.18);border-radius:16px;background:rgba(129,140,248,0.08);text-align:center;">
        <div style="font-size:12px;letter-spacing:0.32em;text-transform:uppercase;color:#6366f1;font-weight:600;margin-bottom:8px;">Kód</div>
        <div style="font-size:32px;font-weight:700;color:#1e1b4b;letter-spacing:0.3em;font-family:'Courier New',monospace;">${code}</div>
        <div style="margin-top:12px;font-size:12px;color:#64748b;">Platnost do ${expirationText}</div>
      </div>
      <div style="margin:0 0 20px;font-size:14px;color:#1f2937;font-weight:600;">Jak použít kód:</div>
      <ol style="margin:0 0 24px 20px;padding:0;font-size:14px;line-height:22px;color:#475569;">
        ${entityType === 'agent_declaration'
          ? `<li>Vraťte se do formuláře Prohlášení agenta.</li>
             <li>Zadejte výše uvedený 6místný kód.</li>
             <li>Po ověření můžete dokončit vytvoření nabídky.</li>`
          : `<li>Přihlaste se do systému Estate Private.</li>
             <li>Otevřete detail vybrané ${entityTypeText}.</li>
             <li>Stiskněte „Zadat kód" a vložte kód z emailu.</li>
             <li>Po potvrzení získáte přístup k detailům.</li>`}
      </ol>
      <div style="margin:0 0 24px;padding:16px;border-radius:14px;background:#f8fafc;border:1px solid rgba(148,163,184,0.3);font-size:13px;color:#475569;">
        <strong style="display:block;margin-bottom:6px;color:#0f172a;">Bezpečnost</strong>
        Tento kód je určen pouze vám. Nesdílejte ho s nikým dalším – každé použití evidujeme.
      </div>
      <p style="margin:0;font-size:15px;line-height:22px;color:#1f2937;">S pozdravem,<br><strong>Tým Estate Private</strong></p>
    `
  });

  const mailOptions = {
    from: getDefaultFrom(),
    to: recipientEmail,
    subject: emailSubject,
    html: htmlContent,
    text: appendBrandingText(`
Dobrý den, ${recipientName},

byl vám vygenerován přístupový kód pro zobrazení detailu ${entityTypeText}.

Kód: ${code}
Platnost: ${expirationText}

Jak kód použít:
${entityType === 'agent_declaration'
      ? `1) Otevřete formulář Prohlášení agenta.
2) Zadejte 6místný kód.
3) Dokončete vytvoření nabídky.`
      : `1) Přihlaste se do systému Estate Private.
2) Otevřete detail ${entityTypeText}.
3) Zvolte „Zadat kód" a vložte ho.
4) Po potvrzení získáte plný přístup.`}
    `)
  };

  mailOptions.html = injectBranding(mailOptions.html);
  mailOptions.text = appendBrandingText(mailOptions.text);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email odeslán:', info.messageId);

    // Uložit do sent_emails (bez template)
    logSentEmail({
      recipientEmail,
      subject: emailSubject,
      content: mailOptions.html,
      status: 'sent',
      messageId: info.messageId,
      metadata: {
        entityType,
        entityTitle,
        code,
        expiresAt
      }
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Chyba při odesílání emailu:', error);
    throw error;
  }
};

// Odeslání uvítacího emailu novému uživateli
const sendWelcomeEmail = async (recipientEmail, recipientName, temporaryPassword) => {
  const transporter = createTransporter();

  const htmlContent = buildMinimalEmail({
    title: 'Vítejte v Estate Private',
    description: 'Účet byl úspěšně vytvořen.',
    preheader: `Přístup do systému Estate Private pro ${recipientName}`,
    contentHtml: `
      <p style="margin:0 0 20px;font-size:15px;line-height:22px;color:#1f2937;">Dobrý den, <strong>${recipientName}</strong>,</p>
      <p style="margin:0 0 24px;font-size:15px;line-height:22px;color:#475569;">v systému Estate Private jsme pro vás založili nový účet. Přihlaste se prosím pomocí níže uvedených údajů.</p>
      <div style="margin:0 0 24px;padding:20px;border-radius:16px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.18);">
        <div style="display:flex;flex-direction:column;gap:10px;font-size:14px;color:#1e293b;">
          <div><strong>Email:</strong> ${recipientEmail}</div>
          <div><strong>Dočasné heslo:</strong> ${temporaryPassword}</div>
        </div>
      </div>
      <div style="margin:0 0 24px;padding:16px;border-radius:14px;background:#f8fafc;border:1px solid rgba(148,163,184,0.3);font-size:13px;color:#475569;">
        <strong style="display:block;margin-bottom:6px;color:#0f172a;">Důležité</strong>
        Po prvním přihlášení si heslo okamžitě změňte. Pokud jste o účet nežádali, kontaktujte náš tým na info@ptf.cz.
      </div>
      <p style="margin:0;font-size:15px;line-height:22px;color:#1f2937;">Těšíme se na spolupráci,<br><strong>Tým Estate Private</strong></p>
    `
  });

  const mailOptions = {
    from: getDefaultFrom(),
    to: recipientEmail,
    subject: 'Vítejte na Estate Private',
    html: htmlContent,
    text: appendBrandingText(`
Dobrý den, ${recipientName},

v systému Estate Private byl založen váš účet.

Přihlašovací údaje:
Email: ${recipientEmail}
Dočasné heslo: ${temporaryPassword}

Po prvním přihlášení si prosím heslo změňte.

Tým Estate Private
    `)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Uvítací email odeslán:', info.messageId);

    logSentEmail({
      recipientEmail,
      subject: 'Vítejte v Estate Private',
      content: mailOptions.html,
      status: 'sent',
      messageId: info.messageId,
      metadata: { temporaryPassword }
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Chyba při odesílání uvítacího emailu:', error);
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
