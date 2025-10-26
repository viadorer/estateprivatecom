import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const testEmail = async () => {
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***nastaveno***' : 'CHYBI');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test email z Estate Private',
      text: 'Pokud vidite tento email, konfigurace funguje!',
      html: '<b>Pokud vidite tento email, konfigurace funguje!</b>'
    });
    
    console.log('✅ Email uspesne odeslan!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Chyba pri odesilani emailu:');
    console.error(error.message);
    console.error('\nPokud vidite "Invalid login", zkontrolujte:');
    console.error('1. EMAIL_USER je spravny email');
    console.error('2. EMAIL_PASSWORD je App Password z Google (ne bezne heslo)');
    console.error('3. 2FA je zapnute na Google uctu');
    console.error('4. App Password vygenerovano na: https://myaccount.google.com/apppasswords');
  }
};

testEmail();
