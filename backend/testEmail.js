import { sendAccessCode } from './emailService.js';

const sendTestEmail = async () => {
  // Použijeme existující funkci pro odeslání přístupového kódu jako test
  try {
    const result = await sendAccessCode(
      'david@ptf.cz',
      'David',
      'TEST123',
      'property',
      'Zkušební nemovitost - Test emailového systému Estateprivate.com',
      null // bez expirace
    );
    
    console.log('✅ Zkušební email úspěšně odeslán!');
    console.log('📧 Email ID:', result.messageId);
    console.log('📬 Příjemce: david@ptf.cz');
    console.log('🎯 Projekt: Estateprivate.com');
    return result;
  } catch (error) {
    console.error('❌ Chyba při odesílání zkušebního emailu:', error);
    throw error;
  }
};

// Alternativní test - přímý nodemailer
const sendDirectTestEmail = async () => {
  const nodemailer = await import('nodemailer');
  const dotenv = await import('dotenv');
  dotenv.default.config();
  
  const transporter = nodemailer.default.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: {
      name: 'Estateprivate.com',
      address: process.env.EMAIL_USER || 'info@ptf.cz'
    },
    to: 'david@ptf.cz',
    subject: '🏠 Zkušební email - Estateprivate.com',
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
          .success-box {
            background: #d1fae5;
            border-left: 4px solid #10b981;
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
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏠 Estateprivate.com</h1>
          <p style="margin: 0; font-size: 18px;">Zkušební email</p>
        </div>
        
        <div class="content">
          <h2>Dobrý den!</h2>
          
          <p>Toto je zkušební email z nového realitního systému <strong>Estateprivate.com</strong>.</p>
          
          <div class="success-box">
            <p style="margin: 0;"><strong>✅ Email systém funguje správně!</strong></p>
          </div>
          
          <p><strong>Konfigurace:</strong></p>
          <ul>
            <li>📧 Email: ${process.env.EMAIL_USER}</li>
            <li>🔐 Gmail App Password: Nakonfigurováno</li>
            <li>🎯 Odesílatel: Estateprivate.com</li>
          </ul>
          
          <p><strong>Funkce:</strong></p>
          <ul>
            <li>✅ Přístupové kódy pro nemovitosti</li>
            <li>✅ Notifikace o schválení/zamítnutí</li>
            <li>✅ Uvítací emaily pro nové uživatele</li>
            <li>✅ Notifikace o nových shodách</li>
          </ul>
          
          <p>Pokud vidíte tento email, znamená to, že emailový systém je plně funkční a připravený k použití! 🎉</p>
          
          <p>S pozdravem,<br>
          <strong>Tým Estateprivate.com</strong></p>
        </div>
        
        <div class="footer">
          <p>Tento email byl odeslán automaticky jako test.</p>
          <p>&copy; ${new Date().getFullYear()} Estateprivate.com. Všechna práva vyhrazena.</p>
        </div>
      </body>
      </html>
    `,
    text: `
Zkušební email - Estateprivate.com

Dobrý den!

Toto je zkušební email z nového realitního systému Estateprivate.com.

✅ Email systém funguje správně!

Konfigurace:
- Email: ${process.env.EMAIL_USER}
- Gmail App Password: Nakonfigurováno
- Odesílatel: Estateprivate.com

Funkce:
- Přístupové kódy pro nemovitosti
- Notifikace o schválení/zamítnutí
- Uvítací emaily pro nové uživatele
- Notifikace o nových shodách

Pokud vidíte tento email, znamená to, že emailový systém je plně funkční a připravený k použití! 🎉

S pozdravem,
Tým Estateprivate.com
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Zkušební email úspěšně odeslán!');
    console.log('📧 Email ID:', info.messageId);
    console.log('📬 Příjemce: david@ptf.cz');
    console.log('🎯 Odesílatel:', process.env.EMAIL_USER);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Chyba při odesílání zkušebního emailu:', error);
    throw error;
  }
};

// Spustit test
sendTestEmail()
  .then(() => {
    console.log('\n🎉 Test dokončen!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test selhal:', error.message);
    process.exit(1);
  });
