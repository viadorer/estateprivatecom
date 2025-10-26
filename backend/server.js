import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import db from './database.js';
import { sendAccessCode, sendWelcomeEmail, sendEmail, sendRegistrationApproval } from './emailService.js';
import { 
  notifyPropertyApproved, 
  notifyPropertyRejected, 
  notifyDemandApproved, 
  notifyDemandRejected,
  notifyAgentContractRequired,
  notifyNewMatch 
} from './notificationService.js';
import { 
  authenticateImportSource, 
  importRateLimiter, 
  logImportRequest 
} from './importMiddleware.js';
import { 
  importProperty, 
  deleteImportedProperty, 
  listImportedProperties,
  getImportStats
} from './importController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// JWT Secret - vygeneruj novy pokud neni v .env
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(32).toString('hex');

if (!process.env.JWT_SECRET) {
  console.warn('VAROVÁNÍ: JWT_SECRET není nastaven v .env! Používám dočasný klíč.');
  console.warn('Pro produkci přidej do .env: JWT_SECRET=' + JWT_SECRET);
}

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Vypnuto kvuli inline styles, v produkci zapnout
}));

// CORS s credentials
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 100, // max 100 requestu
  message: 'Příliš mnoho požadavků, zkuste to později'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // max 5 pokusů o přihlášení
  message: 'Příliš mnoho pokusů o přihlášení, zkuste to za 15 minut'
});

app.use('/api/', limiter);

// ==================== MULTER CONFIG ====================

// Konfigurace multer pro upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads', req.params.type || 'properties');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Pouze obrázky jsou povoleny (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Konfigurace multer pro dokumenty
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads', 'documents');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadDocuments = multer({
  storage: documentStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit pro dokumenty
  fileFilter: (req, file, cb) => {
    console.log('[UPLOAD] Kontrola dokumentu:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      extension: path.extname(file.originalname).toLowerCase()
    });
    
    const allowedTypes = /pdf|doc|docx|xls|xlsx|txt|odt|ods|rtf|png|jpg|jpeg|gif|webp/i;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/rtf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/webp',
      'application/octet-stream' // Fallback pro některé soubory
    ];
    const mimetype = allowedMimeTypes.includes(file.mimetype);
    
    // Povolit soubor pokud má správnou příponu NEBO správný MIME type
    if (mimetype || extname) {
      console.log('[UPLOAD] Dokument povolen');
      return cb(null, true);
    } else {
      console.log('[UPLOAD] Dokument odmítnut');
      cb(new Error(`Nepodporovaný typ souboru: ${file.mimetype} (${path.extname(file.originalname)})`));
    }
  }
});

// ==================== JWT MIDDLEWARE ====================

// Middleware pro ověření JWT tokenu
const authenticateToken = (req, res, next) => {
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ error: 'Nepřihlášen' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token vypršel', expired: true });
    }
    return res.status(403).json({ error: 'Neplatný token' });
  }
};

// Middleware pro kontrolu role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Nepřihlášen' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    
    next();
  };
};

// Helper funkce pro vytvoření tokenů
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '15m' } // 15 minut
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // 7 dní
  );
  
  return { accessToken, refreshToken };
};

// ==================== AUDIT LOG ====================

function logAction(userId, action, entityType, entityId, details, req) {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, action, entityType, entityId, details, ip, userAgent);
  } catch (error) {
    console.error('Chyba při logování:', error);
  }
}

// ==================== AUTH ====================

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email a heslo jsou povinné' });
    }
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Neplatné přihlašovací údaje' });
    }
    
    // Kontrola zda je uživatel aktivní
    if (!user.is_active) {
      return res.status(401).json({ error: 'Účet není aktivní. Zkontrolujte email pro ověření.' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Neplatné přihlašovací údaje' });
    }
    
    // Vygenerovat JWT tokeny
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Uložit refresh token do databáze
    try {
      db.prepare(`
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES (?, ?, datetime('now', '+7 days'))
      `).run(user.id, refreshToken);
    } catch (dbError) {
      console.error('Chyba při ukládání refresh tokenu:', dbError);
    }
    
    // Nastavit cookies
    res.cookie('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minut
    });
    
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dní
    });
    
    const { password: _, ...userWithoutPassword } = user;
    
    // Log přihlášení
    logAction(user.id, 'login', 'user', user.id, `Přihlášení uživatele ${user.email}`, req);
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Chyba při přihlášení:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pro ověření aktuální session
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, name, email, role, phone, company, is_active, created_at
      FROM users WHERE id = ?
    `).get(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh token endpoint
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Chybí refresh token' });
    }
    
    // Ověřit refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(403).json({ error: 'Neplatný refresh token' });
    }
    
    // Zkontrolovat v databázi
    const tokenInDb = db.prepare(`
      SELECT * FROM refresh_tokens 
      WHERE token = ? AND user_id = ? AND revoked = 0
      AND expires_at > datetime('now')
    `).get(refreshToken, decoded.userId);
    
    if (!tokenInDb) {
      return res.status(403).json({ error: 'Refresh token není platný' });
    }
    
    // Získat uživatele
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(403).json({ error: 'Uživatel není aktivní' });
    }
    
    // Vytvořit nový access token
    const { accessToken } = generateTokens(user);
    
    res.cookie('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Chyba při refresh:', error);
    res.status(500).json({ error: error.message });
  }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    
    // Revokovat refresh token
    if (refreshToken) {
      db.prepare(`
        UPDATE refresh_tokens 
        SET revoked = 1 
        WHERE token = ?
      `).run(refreshToken);
    }
    
    // Smazat cookies
    res.clearCookie('auth_token');
    res.clearCookie('refresh_token');
    
    // Log odhlášení
    logAction(req.user.userId, 'logout', 'user', req.user.userId, 'Odhlášení uživatele', req);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PASSWORD RESET ====================

// Požádat o reset hesla
app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email je povinný' });
    }
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    // Bezpečnostní best practice: Neříkat, že email neexistuje
    if (!user) {
      return res.json({ 
        success: true, 
        message: 'Pokud email existuje v systému, byl odeslán link pro reset hesla' 
      });
    }
    
    // Vygenerovat reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Uložit do DB s expirací 1 hodina
    db.prepare(`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (?, ?, datetime('now', '+1 hour'))
    `).run(user.id, resetTokenHash);
    
    // Odeslat email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    try {
      await sendEmail(
        user.email,
        'Reset hesla - Estate Private',
        `
        Dobrý den ${user.name},
        
        Obdrželi jsme žádost o reset hesla pro váš účet.
        
        Pro reset hesla klikněte na následující link:
        ${resetUrl}
        
        Link vyprší za 1 hodinu.
        
        Pokud jste o reset hesla nežádali, ignorujte tento email.
        
        S pozdravem,
        Estate Private tým
        `
      );
      
      console.log(`Reset hesla požadován pro: ${user.email}`);
      console.log(`Reset URL: ${resetUrl}`);
    } catch (emailError) {
      console.error('Chyba při odesílání emailu:', emailError);
      // V produkci bychom neměli prozradit, že email selhal
    }
    
    res.json({ 
      success: true, 
      message: 'Pokud email existuje v systému, byl odeslán link pro reset hesla' 
    });
  } catch (error) {
    console.error('Chyba při reset hesla:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reset hesla s tokenem
app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token a nové heslo jsou povinné' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Heslo musí mít alespoň 6 znaků' });
    }
    
    // Hash tokenu
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Najít platný token
    const resetToken = db.prepare(`
      SELECT * FROM password_reset_tokens 
      WHERE token = ? 
      AND expires_at > datetime('now')
      AND used = 0
    `).get(tokenHash);
    
    if (!resetToken) {
      return res.status(400).json({ error: 'Neplatný nebo vypršelý token' });
    }
    
    // Nastavit nové heslo
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.prepare(`
      UPDATE users 
      SET password = ?
      WHERE id = ?
    `).run(hashedPassword, resetToken.user_id);
    
    // Označit token jako použitý
    db.prepare(`
      UPDATE password_reset_tokens 
      SET used = 1 
      WHERE id = ?
    `).run(resetToken.id);
    
    // Revokovat všechny refresh tokeny uživatele (pro bezpečnost)
    db.prepare(`
      UPDATE refresh_tokens 
      SET revoked = 1 
      WHERE user_id = ?
    `).run(resetToken.user_id);
    
    // Log akce
    logAction(resetToken.user_id, 'password_reset', 'user', resetToken.user_id, 'Reset hesla', req);
    
    console.log(`Heslo resetováno pro user ID: ${resetToken.user_id}`);
    
    res.json({ 
      success: true, 
      message: 'Heslo bylo úspěšně změněno. Můžete se přihlásit.' 
    });
  } catch (error) {
    console.error('Chyba při reset hesla:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== EMAIL VERIFICATION ====================

// Odeslat verifikační email
app.post('/api/auth/send-verification', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }
    
    // Zkontrolovat, zda už není ověřený
    const existingVerification = db.prepare(`
      SELECT * FROM email_verification_tokens 
      WHERE user_id = ? AND verified_at IS NOT NULL
    `).get(userId);
    
    if (existingVerification) {
      return res.status(400).json({ error: 'Email je již ověřený' });
    }
    
    // Vygenerovat verifikační token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Uložit do DB
    db.prepare(`
      INSERT INTO email_verification_tokens (user_id, token)
      VALUES (?, ?)
    `).run(userId, verificationToken);
    
    // Odeslat email
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    try {
      await sendEmail(
        user.email,
        'Ověření emailu - Estate Private',
        `
        Dobrý den ${user.name},
        
        Pro dokončení registrace prosím ověřte váš email kliknutím na následující link:
        ${verifyUrl}
        
        S pozdravem,
        Estate Private tým
        `
      );
      
      console.log(`Verifikační email odeslán na: ${user.email}`);
      console.log(`Verify URL: ${verifyUrl}`);
    } catch (emailError) {
      console.error('Chyba při odesílání emailu:', emailError);
      return res.status(500).json({ error: 'Chyba při odesílání emailu' });
    }
    
    res.json({ 
      success: true, 
      message: 'Verifikační email byl odeslán' 
    });
  } catch (error) {
    console.error('Chyba při odesílání verifikace:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ověřit email
app.get('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: 'Token je povinný' });
    }
    
    // Najít token
    const verificationToken = db.prepare(`
      SELECT * FROM email_verification_tokens 
      WHERE token = ? AND verified_at IS NULL
    `).get(token);
    
    if (!verificationToken) {
      return res.status(400).json({ error: 'Neplatný nebo již použitý token' });
    }
    
    // Aktivovat uživatele
    db.prepare(`
      UPDATE users 
      SET is_active = 1 
      WHERE id = ?
    `).run(verificationToken.user_id);
    
    // Označit token jako ověřený
    db.prepare(`
      UPDATE email_verification_tokens 
      SET verified_at = datetime('now') 
      WHERE id = ?
    `).run(verificationToken.id);
    
    // Log akce
    logAction(verificationToken.user_id, 'email_verified', 'user', verificationToken.user_id, 'Email ověřen', req);
    
    console.log(`Email ověřen pro user ID: ${verificationToken.user_id}`);
    
    res.json({ 
      success: true, 
      message: 'Email byl ověřen. Můžete se přihlásit.' 
    });
  } catch (error) {
    console.error('Chyba při ověření emailu:', error);
    res.status(500).json({ error: error.message });
  }
});

// Registrace na waitlist
app.post('/api/registration-requests', async (req, res) => {
  try {
    const {
      name, surname, email, phone,
      address_street, address_city, address_zip,
      ico, dic, company, company_position,
      requested_role, user_type, demand_description
    } = req.body;

    // Kontrola duplicit - email
    const existingUserByEmail = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get(email);
    if (existingUserByEmail) {
      return res.status(400).json({ 
        error: 'Email je již registrován',
        details: `Uživatel s emailem ${email} již existuje v systému (${existingUserByEmail.name})`
      });
    }

    const existingRequestByEmail = db.prepare('SELECT id FROM registration_requests WHERE email = ? AND status = "pending"').get(email);
    if (existingRequestByEmail) {
      return res.status(400).json({ 
        error: 'Žádost s tímto emailem již existuje',
        details: 'Čeká na schválení administrátorem'
      });
    }

    // Kontrola duplicit - telefon
    if (phone) {
      const existingUserByPhone = db.prepare('SELECT id, name, phone FROM users WHERE phone = ?').get(phone);
      if (existingUserByPhone) {
        return res.status(400).json({ 
          error: 'Telefon je již registrován',
          details: `Uživatel s telefonem ${phone} již existuje v systému (${existingUserByPhone.name})`
        });
      }

      const existingRequestByPhone = db.prepare('SELECT id FROM registration_requests WHERE phone = ? AND status = "pending"').get(phone);
      if (existingRequestByPhone) {
        return res.status(400).json({ 
          error: 'Žádost s tímto telefonem již existuje',
          details: 'Čeká na schválení administrátorem'
        });
      }
    }

    // Kontrola duplicit - IČO (pouze pro agenty a firmy)
    if (ico && requested_role === 'agent') {
      const existingUserByIco = db.prepare('SELECT id, name, ico, company FROM users WHERE ico = ?').get(ico);
      if (existingUserByIco) {
        return res.status(400).json({ 
          error: 'IČO je již registrováno',
          details: `Společnost s IČO ${ico} již existuje v systému (${existingUserByIco.company || existingUserByIco.name})`
        });
      }

      const existingRequestByIco = db.prepare('SELECT id FROM registration_requests WHERE ico = ? AND status = "pending"').get(ico);
      if (existingRequestByIco) {
        return res.status(400).json({ 
          error: 'Žádost s tímto IČO již existuje',
          details: 'Čeká na schválení administrátorem'
        });
      }
    }

    // Vložení registrační žádosti
    const result = db.prepare(`
      INSERT INTO registration_requests (
        name, surname, email, phone,
        address_street, address_city, address_zip,
        ico, dic, company, company_position,
        requested_role, user_type, demand_description,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(
      name, surname, email, phone,
      address_street, address_city, address_zip,
      ico, dic, company, company_position,
      requested_role, user_type, demand_description
    );

    // Vytvořit uživatele jako neaktivního (bez hesla)
    const fullName = `${name} ${surname}`;
    const userResult = db.prepare(`
      INSERT INTO users (
        name, email, phone,
        address_street, address_city, address_zip,
        ico, dic, company, company_position,
        role, is_active, password
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, '')
    `).run(
      fullName, email, phone,
      address_street, address_city, address_zip,
      ico, dic, company, company_position,
      requested_role
    );

    // TODO: Odeslat email na info@ptf.cz
    // Zde bude implementace emailu s informacemi o nové registraci
    
    console.log(`Nová registrace: ${name} ${surname} (${email}) - ${requested_role}`);
    console.log(`Vytvořen neaktivní uživatel ID: ${userResult.lastInsertRowid}`);

    res.json({ 
      success: true, 
      message: 'Registrace byla úspěšně odeslána',
      id: result.lastInsertRowid,
      user_id: userResult.lastInsertRowid
    });
  } catch (error) {
    console.error('Chyba při registraci:', error);
    res.status(500).json({ error: error.message });
  }
});

// Získat všechny registrační žádosti (pouze admin)
app.get('/api/registration-requests', (req, res) => {
  try {
    const requests = db.prepare(`
      SELECT r.*, u.name as approved_by_name
      FROM registration_requests r
      LEFT JOIN users u ON r.approved_by = u.id
      ORDER BY r.created_at DESC
    `).all();
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Schválit registraci
app.post('/api/registration-requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { contract_type, commission_rate, commission_terms, admin_notes, approved_by } = req.body;

    const request = db.prepare('SELECT * FROM registration_requests WHERE id = ?').get(id);
    if (!request) {
      return res.status(404).json({ error: 'Registrace nenalezena' });
    }

    if (request.status === 'approved') {
      return res.status(400).json({ error: 'Registrace již byla schválena' });
    }

    // Najít existujícího uživatele (vytvořeného při registraci)
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(request.email);
    if (!existingUser) {
      return res.status(404).json({ error: 'Uživatel nebyl nalezen. Nejdřív musí být vytvořen při registraci.' });
    }

    const userId = existingUser.id;

    // Vygenerovat přístupový kód pro smlouvu a dočasné heslo
    const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const hashedPassword = await bcrypt.hash(accessCode, 10);

    // Nastavit heslo uživateli (pro aktivaci přes kód)
    db.prepare(`
      UPDATE users 
      SET password = ?
      WHERE id = ?
    `).run(hashedPassword, userId);

    // Vytvořit smlouvu
    const contractResult = db.prepare(`
      INSERT INTO contracts (
        user_id, contract_type, access_code,
        commission_rate, commission_terms,
        status, created_by
      ) VALUES (?, ?, ?, ?, ?, 'pending', ?)
    `).run(
      userId, contract_type, accessCode,
      commission_rate, commission_terms,
      approved_by
    );

    // Aktualizovat registraci
    db.prepare(`
      UPDATE registration_requests 
      SET status = 'approved', approved_by = ?, approved_at = CURRENT_TIMESTAMP, admin_notes = ?
      WHERE id = ?
    `).run(approved_by, admin_notes, id);

    // Odeslat schvalovací email s přístupovým kódem
    try {
      const fullName = `${request.name} ${request.surname}`;
      await sendRegistrationApproval(request.email, fullName, accessCode, contract_type, userId);
      console.log(`Registrace schválena: ${request.email}`);
      console.log(`Přístupový kód: ${accessCode}`);
      console.log(`Smlouva ID: ${contractResult.lastInsertRowid}`);
      console.log(`Email odeslán na: ${request.email}`);
    } catch (emailError) {
      console.error('Chyba při odesílání emailu:', emailError);
      // Pokračujeme i když email selže
    }

    res.json({ 
      success: true, 
      user_id: userId,
      access_code: accessCode,
      contract_id: contractResult.lastInsertRowid
    });
  } catch (error) {
    console.error('Chyba při schvalování:', error);
    res.status(500).json({ error: error.message });
  }
});

// Zamítnout registraci
app.post('/api/registration-requests/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    db.prepare(`
      UPDATE registration_requests 
      SET status = 'rejected', admin_notes = ?
      WHERE id = ?
    `).run(reason, id);

    // TODO: Odeslat email o zamítnutí
    console.log(`❌ Registrace zamítnuta: ID ${id}`);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== IMAGE UPLOAD ====================

// Upload dokumentů - musí být PŘED /api/upload/:type aby se správně matchoval
app.post('/api/upload/documents', uploadDocuments.array('documents', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Žádné soubory nebyly nahrány' });
    }

    const documentUrls = [];

    for (const file of req.files) {
      // Soubor je již v documents složce díky documentStorage
      const documentUrl = `http://localhost:${PORT}/uploads/documents/${file.filename}`;
      documentUrls.push(documentUrl);
    }

    res.json({ 
      success: true, 
      documents: documentUrls,
      count: documentUrls.length
    });
  } catch (error) {
    console.error('Chyba při uploadu dokumentů:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload jednoho nebo více obrázků
app.post('/api/upload/:type', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Žádné soubory nebyly nahrány' });
    }

    const processedImages = [];

    for (const file of req.files) {
      const outputPath = path.join(
        path.dirname(file.path),
        'compressed-' + path.basename(file.path)
      );

      // Komprimace obrázku pomocí sharp
      await sharp(file.path)
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85, progressive: true })
        .toFile(outputPath);

      // Smazat původní soubor
      fs.unlinkSync(file.path);

      // Přejmenovat komprimovaný soubor
      fs.renameSync(outputPath, file.path);

      // URL pro přístup k obrázku
      const imageUrl = `http://localhost:${PORT}/uploads/${req.params.type}/${path.basename(file.path)}`;
      processedImages.push(imageUrl);
    }

    res.json({ 
      success: true, 
      images: processedImages,
      count: processedImages.length
    });
  } catch (error) {
    console.error('Chyba při uploadu:', error);
    res.status(500).json({ error: error.message });
  }
});

// Smazat obrázek
app.delete('/api/upload/:type/:filename', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads', req.params.type, req.params.filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Obrázek byl smazán' });
    } else {
      res.status(404).json({ error: 'Soubor nenalezen' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získat audit logy (pouze admin)
app.get('/api/audit-logs', (req, res) => {
  try {
    const { user_id, action, entity_type, date_from, date_to } = req.query;
    
    let query = `
      SELECT al.*, u.name as user_name, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (user_id) {
      query += ' AND al.user_id = ?';
      params.push(user_id);
    }
    if (action) {
      query += ' AND al.action = ?';
      params.push(action);
    }
    if (entity_type) {
      query += ' AND al.entity_type = ?';
      params.push(entity_type);
    }
    if (date_from) {
      query += ' AND DATE(al.created_at) >= DATE(?)';
      params.push(date_from);
    }
    if (date_to) {
      query += ' AND DATE(al.created_at) <= DATE(?)';
      params.push(date_to);
    }
    
    query += ' ORDER BY al.created_at DESC LIMIT 1000';
    
    const logs = db.prepare(query).all(...params);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logovat akci z frontendu (kopírování, ukládání obrázků)
app.post('/api/audit-logs', (req, res) => {
  try {
    const { user_id, action, entity_type, entity_id, details } = req.body;
    
    if (!user_id || !action || !entity_type) {
      return res.status(400).json({ error: 'Chybí povinná pole' });
    }
    
    logAction(user_id, action, entity_type, entity_id, details, req);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== COMPANIES ====================

app.get('/api/companies', (req, res) => {
  try {
    const companies = db.prepare('SELECT * FROM companies ORDER BY name').all();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/companies/:id', (req, res) => {
  try {
    const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Společnost nenalezena' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== USERS ====================

app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.*, c.name as company_name, c.ico as company_ico
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      ORDER BY u.created_at DESC
    `).all();
    
    // Neposílat hesla
    users.forEach(user => delete user.password);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', (req, res) => {
  try {
    const user = db.prepare(`
      SELECT u.*, c.name as company_name, c.ico as company_ico, c.address_city as company_city
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.id = ?
    `).get(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }
    
    // Log zobrazení (pokud je requesting_user_id v query)
    if (req.query.requesting_user_id) {
      logAction(req.query.requesting_user_id, 'view', 'user', req.params.id, `Zobrazení profilu uživatele: ${user.name}`, req);
    }
    
    delete user.password;
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vytvořit nového uživatele
app.post('/api/users', async (req, res) => {
  try {
    const { 
      name, email, password, role, phone, phone_secondary, avatar,
      address_street, address_city, address_zip, address_country,
      company_id, company_position, ico, dic,
      preferred_contact, newsletter_subscribed, notes, is_active
    } = req.body;
    
    // Validace
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Jméno, email a heslo jsou povinné' });
    }
    
    // Kontrola duplicitního emailu
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Uživatel s tímto emailem již existuje' });
    }
    
    // Hash hesla
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Vložení do databáze
    const result = db.prepare(`
      INSERT INTO users (
        name, email, password, role, phone, phone_secondary, avatar,
        address_street, address_city, address_zip, address_country,
        company_id, company_position, ico, dic,
        preferred_contact, newsletter_subscribed, notes, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, email, hashedPassword, role || 'client', phone, phone_secondary, avatar,
      address_street, address_city, address_zip, address_country || 'Česká republika',
      company_id || null, company_position, ico, dic,
      preferred_contact || 'email', newsletter_subscribed !== undefined ? newsletter_subscribed : 1,
      notes, is_active !== undefined ? is_active : 1
    );
    
    // Logování
    logAction(1, 'create', 'user', result.lastInsertRowid, `Vytvořen uživatel: ${email}`, req);
    
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Chyba při vytváření uživatele:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upravit uživatele
app.put('/api/users/:id', async (req, res) => {
  try {
    const { 
      name, email, password, role, phone, phone_secondary, avatar,
      address_street, address_city, address_zip, address_country,
      company_id, company_position, ico, dic,
      preferred_contact, newsletter_subscribed, notes, is_active
    } = req.body;
    
    // Validace
    if (!name || !email) {
      return res.status(400).json({ error: 'Jméno a email jsou povinné' });
    }
    
    // Kontrola duplicitního emailu (kromě aktuálního uživatele)
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.params.id);
    if (existingUser) {
      return res.status(400).json({ error: 'Uživatel s tímto emailem již existuje' });
    }
    
    // Pokud je zadáno nové heslo, zahashovat ho
    let updateQuery = `
      UPDATE users SET
        name = ?, email = ?, role = ?, phone = ?, phone_secondary = ?, avatar = ?,
        address_street = ?, address_city = ?, address_zip = ?, address_country = ?,
        company_id = ?, company_position = ?, ico = ?, dic = ?,
        preferred_contact = ?, newsletter_subscribed = ?, notes = ?, is_active = ?,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    let params = [
      name, email, role, phone, phone_secondary, avatar,
      address_street, address_city, address_zip, address_country,
      company_id || null, company_position, ico, dic,
      preferred_contact, newsletter_subscribed, notes, is_active
    ];
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(req.params.id);
    
    db.prepare(updateQuery).run(...params);
    
    // Logování
    logAction(1, 'update', 'user', req.params.id, `Upraven uživatel: ${email}`, req);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Chyba při úpravě uživatele:', error);
    res.status(500).json({ error: error.message });
  }
});

// Deaktivovat uživatele (místo mazání)
app.delete('/api/users/:id', (req, res) => {
  try {
    const user = db.prepare('SELECT email, is_active FROM users WHERE id = ?').get(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }
    
    // Místo mazání pouze deaktivujeme
    db.prepare('UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);
    
    // Logování
    logAction(1, 'deactivate', 'user', req.params.id, `Deaktivován uživatel: ${user.email}`, req);
    
    res.json({ success: true, message: 'Uživatel byl deaktivován' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PROPERTIES ====================

// Získat všechny nemovitosti s filtry
app.get('/api/properties', (req, res) => {
  try {
    const {
      transaction_type,
      property_type,
      city,
      price_min,
      price_max,
      area_min,
      area_max,
      rooms_min,
      rooms_max,
      status,
      show_all // Nový parametr pro admina
    } = req.query;

    let query = 'SELECT p.*, u.name as agent_name, u.phone as agent_phone, u.email as agent_email FROM properties p LEFT JOIN users u ON p.agent_id = u.id WHERE 1=1';
    const params = [];

    // Filtr statusu - pokud není show_all, filtruj jen active
    if (!show_all && !status) {
      query += ' AND p.status = ?';
      params.push('active');
    } else if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (transaction_type) {
      query += ' AND p.transaction_type = ?';
      params.push(transaction_type);
    }

    if (property_type) {
      query += ' AND p.property_type = ?';
      params.push(property_type);
    }

    if (city) {
      query += ' AND p.city LIKE ?';
      params.push(`%${city}%`);
    }

    if (price_min) {
      query += ' AND p.price >= ?';
      params.push(parseFloat(price_min));
    }

    if (price_max) {
      query += ' AND p.price <= ?';
      params.push(parseFloat(price_max));
    }

    if (area_min) {
      query += ' AND p.area >= ?';
      params.push(parseFloat(area_min));
    }

    if (area_max) {
      query += ' AND p.area <= ?';
      params.push(parseFloat(area_max));
    }

    if (rooms_min) {
      query += ' AND p.rooms >= ?';
      params.push(parseInt(rooms_min));
    }

    if (rooms_max) {
      query += ' AND p.rooms <= ?';
      params.push(parseInt(rooms_max));
    }

    query += ' ORDER BY p.created_at DESC';

    const properties = db.prepare(query).all(...params);
    
    // Parse JSON fields
    properties.forEach(prop => {
      if (prop.images) prop.images = JSON.parse(prop.images);
    });

    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získat jednu nemovitost
app.get('/api/properties/:id', (req, res) => {
  try {
    const property = db.prepare(`
      SELECT p.*, u.name as agent_name, u.phone as agent_phone, u.email as agent_email, u.company as agent_company
      FROM properties p 
      LEFT JOIN users u ON p.agent_id = u.id 
      WHERE p.id = ?
    `).get(req.params.id);

    if (!property) {
      return res.status(404).json({ error: 'Nemovitost nenalezena' });
    }

    // Zvýšit počet zobrazení
    db.prepare('UPDATE properties SET views_count = views_count + 1 WHERE id = ?').run(req.params.id);

    // Log zobrazení (pokud je user_id v query)
    if (req.query.user_id) {
      logAction(req.query.user_id, 'view', 'property', req.params.id, `Zobrazení nemovitosti: ${property.title}`, req);
    }

    // Parse JSON
    if (property.images) property.images = JSON.parse(property.images);

    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Přidat nemovitost (agent, admin)
app.post('/api/properties', (req, res) => {
  try {
    const {
      title, description, transaction_type, property_type, property_subtype,
      price, price_note, city, district, street, zip_code, latitude, longitude,
      area, land_area, rooms, floor, total_floors,
      building_type, building_condition, ownership,
      furnished, has_balcony, has_loggia, has_terrace, has_cellar, has_garage,
      has_parking, has_elevator, has_garden, has_pool,
      energy_rating, heating_type,
      is_auction, exclusively_at_rk, attractive_offer,
      agent_id, images, main_image, documents,
      video_url, video_tour_url, matterport_url, floor_plans, website_url,
      user_role, validity_days
    } = req.body;

    // Určení statusu podle role:
    // - Admin může vytvořit nemovitost přímo jako 'active'
    // - Agent vytváří nemovitost jako 'pending' (čeká na schválení adminem)
    const initialStatus = user_role === 'admin' ? 'active' : 'pending';
    
    // Nastavit platnost - použít vlastní hodnotu nebo výchozí 14 dní
    // Pokud je 0, nastavit null (bez omezení)
    const daysToAdd = validity_days !== undefined ? validity_days : 14
    let validUntilStr = null
    if (daysToAdd > 0) {
      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + daysToAdd)
      validUntilStr = validUntil.toISOString()
    }
    const now = new Date().toISOString()

    const result = db.prepare(`
      INSERT INTO properties (
        title, description, transaction_type, property_type, property_subtype,
        commission_rate, commission_terms, contract_signed_at,
        price, price_note, city, district, street, zip_code, latitude, longitude,
        area, land_area, rooms, floor, total_floors,
        building_type, building_condition, ownership,
        furnished, has_balcony, has_terrace, has_cellar, has_garage,
        has_parking, has_elevator, has_garden, has_pool,
        energy_rating, heating_type,
        agent_id, status, views_count,
        images, main_image, documents,
        video_url, video_tour_url, matterport_url, floor_plans, website_url,
        has_loggia, is_auction, exclusively_at_rk, attractive_offer,
        sreality_id, valid_until, last_confirmed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title, description, transaction_type, property_type, property_subtype || null,
      null, null, null, // commission fields - nastaví admin při schvalování
      price, price_note || null, city, district || null, street || null, zip_code || null, latitude || null, longitude || null,
      area || null, land_area || null, rooms || null, floor || null, total_floors || null,
      building_type || null, building_condition || null, ownership || null,
      furnished || null, has_balcony || 0, has_terrace || 0, has_cellar || 0, has_garage || 0,
      has_parking || 0, has_elevator || 0, has_garden || 0, has_pool || 0,
      energy_rating || null, heating_type || null,
      agent_id, initialStatus, 0, // views_count = 0
      images ? JSON.stringify(images) : null,
      main_image || null,
      documents ? JSON.stringify(documents) : null,
      video_url || null, video_tour_url || null, matterport_url || null,
      floor_plans ? JSON.stringify(floor_plans) : null,
      website_url || null,
      has_loggia || 0, is_auction || 0, exclusively_at_rk || 0, attractive_offer || 0,
      null, // sreality_id
      validUntilStr, // valid_until
      now // last_confirmed_at
    );

    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(result.lastInsertRowid);
    if (property.images) property.images = JSON.parse(property.images);
    if (property.documents) property.documents = JSON.parse(property.documents);

    // Log vytvoření
    const statusNote = initialStatus === 'pending' ? ' (čeká na schválení)' : '';
    logAction(agent_id, 'create', 'property', result.lastInsertRowid, `Vytvořena nemovitost: ${title}${statusNote}`, req);

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aktualizovat nemovitost
app.put('/api/properties/:id', (req, res) => {
  try {
    const {
      title, description, transaction_type, property_type, property_subtype,
      price, price_note, city, district, street, zip_code, latitude, longitude,
      area, land_area, rooms, floor, total_floors,
      building_type, building_condition, ownership,
      furnished, has_balcony, has_loggia, has_terrace, has_cellar, has_garage,
      has_parking, has_elevator, has_garden, has_pool,
      energy_rating, heating_type,
      is_auction, exclusively_at_rk, attractive_offer,
      status, images, main_image, documents,
      video_url, video_tour_url, matterport_url, floor_plans, website_url,
      user_role
    } = req.body;

    // Zkontrolovat, jestli je nemovitost schválená
    const currentProperty = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
    
    let finalStatus = status;
    
    // Pokud agent upravuje schválenou nemovitost (active nebo approved_pending_contract), změnit status na pending_changes
    if (user_role !== 'admin' && currentProperty.approved_at && 
        (currentProperty.status === 'active' || currentProperty.status === 'approved_pending_contract')) {
      finalStatus = 'pending_changes';
      console.log(`Agent upravuje schvalenou nemovitost ${req.params.id} - status zmenen na pending_changes`);
    }

    db.prepare(`
      UPDATE properties SET
        title = ?, description = ?, transaction_type = ?, property_type = ?, property_subtype = ?,
        price = ?, price_note = ?, city = ?, district = ?, street = ?, zip_code = ?, latitude = ?, longitude = ?,
        area = ?, land_area = ?, rooms = ?, floor = ?, total_floors = ?,
        building_type = ?, building_condition = ?, ownership = ?,
        furnished = ?, has_balcony = ?, has_loggia = ?, has_terrace = ?, has_cellar = ?, has_garage = ?,
        has_parking = ?, has_elevator = ?, has_garden = ?, has_pool = ?,
        energy_rating = ?, heating_type = ?,
        is_auction = ?, exclusively_at_rk = ?, attractive_offer = ?,
        status = ?, images = ?, main_image = ?, documents = ?,
        video_url = ?, video_tour_url = ?, matterport_url = ?, floor_plans = ?, website_url = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title, description, transaction_type, property_type, property_subtype,
      price, price_note, city, district, street, zip_code, latitude, longitude,
      area, land_area, rooms, floor, total_floors,
      building_type, building_condition, ownership,
      furnished, has_balcony || 0, has_loggia || 0, has_terrace || 0, has_cellar || 0, has_garage || 0,
      has_parking || 0, has_elevator || 0, has_garden || 0, has_pool || 0,
      energy_rating, heating_type,
      is_auction || 0, exclusively_at_rk || 0, attractive_offer || 0,
      finalStatus,
      images ? JSON.stringify(images) : null,
      main_image,
      documents ? JSON.stringify(documents) : null,
      video_url, video_tour_url, matterport_url,
      floor_plans ? JSON.stringify(floor_plans) : null,
      website_url,
      req.params.id
    );

    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
    if (property.images) property.images = JSON.parse(property.images);
    if (property.documents) property.documents = JSON.parse(property.documents);

    // Log úpravy
    logAction(req.body.agent_id || property.agent_id, 'update', 'property', req.params.id, `Upravena nemovitost: ${title}`, req);

    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Smazat nemovitost
app.delete('/api/properties/:id', (req, res) => {
  try {
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
    db.prepare('DELETE FROM properties WHERE id = ?').run(req.params.id);
    
    // Log smazání
    if (property) {
      logAction(property.agent_id, 'delete', 'property', req.params.id, `Smazána nemovitost: ${property.title}`, req);
    }
    
    res.json({ message: 'Nemovitost smazána' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Moje nemovitosti (pro agenta)
app.get('/api/properties/agent/:agentId', (req, res) => {
  try {
    const properties = db.prepare('SELECT * FROM properties WHERE agent_id = ? ORDER BY created_at DESC').all(req.params.agentId);
    properties.forEach(prop => {
      if (prop.images) prop.images = JSON.parse(prop.images);
    });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Nabídky odpovídající poptávkám uživatele
app.get('/api/properties/matching/:userId', (req, res) => {
  try {
    // Zjistit roli uživatele
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.params.userId);
    
    // Pro agenty a klienty - vrátit VŠECHNY aktivní nabídky
    const properties = db.prepare(`
      SELECT DISTINCT p.*, 
             u.name as agent_name, 
             u.phone as agent_phone, 
             u.email as agent_email,
             CASE 
               WHEN p.agent_id = ? THEN 1
               ELSE 0
             END as is_mine,
             CASE
               WHEN EXISTS (
                 SELECT 1 FROM loi_signatures ls
                 WHERE ls.user_id = ?
                   AND ls.match_property_id = p.id
                   AND ls.signed_at IS NOT NULL
               ) THEN 1
               ELSE 0
             END as has_loi
      FROM properties p
      LEFT JOIN users u ON p.agent_id = u.id
      WHERE p.status = 'active'
      ORDER BY is_mine DESC, has_loi DESC, p.created_at DESC
    `).all(req.params.userId, req.params.userId);
    
    properties.forEach(prop => {
      if (prop.images) prop.images = JSON.parse(prop.images);
      if (prop.floor_plans) prop.floor_plans = JSON.parse(prop.floor_plans);
    });
    
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DEMANDS ====================

// Získat všechny poptávky
app.get('/api/demands', (req, res) => {
  try {
    const { agentId, show_all, status, userRole } = req.query;
    
    let query = `
      SELECT d.*, u.name as client_name, u.email as client_email, u.phone as client_phone
      FROM demands d
      LEFT JOIN users u ON d.client_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Admin vidí vše
    // Agent vidí všechny aktivní poptávky (stejně jako u properties)
    // Klient vidí pouze své
    if (userRole === 'client' && agentId && show_all !== 'true') {
      query += ' AND d.client_id = ?';
      params.push(agentId);
    } else if (userRole === 'agent') {
      // Agent vidí všechny aktivní poptávky
      query += ' AND d.status = "active"';
    }
    
    if (status && userRole !== 'agent') {
      query += ' AND d.status = ?';
      params.push(status);
    }
    
    
    query += ' ORDER BY d.created_at DESC';
    
    const demands = db.prepare(query).all(...params);

    demands.forEach(demand => {
      // Stará struktura
      if (demand.cities) demand.cities = JSON.parse(demand.cities);
      if (demand.districts) demand.districts = JSON.parse(demand.districts);
      if (demand.required_features) demand.required_features = JSON.parse(demand.required_features);
      // Nová struktura
      if (demand.property_requirements) demand.property_requirements = JSON.parse(demand.property_requirements);
      if (demand.common_filters) demand.common_filters = JSON.parse(demand.common_filters);
      if (demand.locations) demand.locations = JSON.parse(demand.locations);
      
      // Agent nevidí kontaktní údaje - musí požádat o přístup
      if (userRole === 'agent') {
        delete demand.client_name;
        delete demand.client_email;
        delete demand.client_phone;
        // Skrýt přesné lokality - zobrazit jen okresy/kraje
        if (demand.locations && Array.isArray(demand.locations)) {
          demand.locations = demand.locations.map(loc => ({
            district: loc.district,
            region: loc.region
          }));
        }
      }
    });

    res.json(demands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získat jednu poptávku
app.get('/api/demands/:id', (req, res) => {
  try {
    const demand = db.prepare(`
      SELECT d.*, u.name as client_name, u.email as client_email, u.phone as client_phone
      FROM demands d
      LEFT JOIN users u ON d.client_id = u.id
      WHERE d.id = ?
    `).get(req.params.id);

    if (!demand) {
      return res.status(404).json({ error: 'Poptávka nenalezena' });
    }

    // Log zobrazení (pokud je user_id v query)
    if (req.query.user_id) {
      logAction(req.query.user_id, 'view', 'demand', req.params.id, `Zobrazení poptávky: ${demand.transaction_type} ${demand.property_type}`, req);
    }

    // Stará struktura
    if (demand.cities) demand.cities = JSON.parse(demand.cities);
    if (demand.districts) demand.districts = JSON.parse(demand.districts);
    if (demand.required_features) demand.required_features = JSON.parse(demand.required_features);
    // Nová struktura
    if (demand.property_requirements) demand.property_requirements = JSON.parse(demand.property_requirements);
    if (demand.common_filters) demand.common_filters = JSON.parse(demand.common_filters);
    if (demand.locations) demand.locations = JSON.parse(demand.locations);
    
    // Agent nevidí kontaktní údaje - musí požádat o přístup
    if (req.query.userRole === 'agent') {
      delete demand.client_name;
      delete demand.client_email;
      delete demand.client_phone;
      // Skrýt přesné lokality - zobrazit jen okresy/kraje
      if (demand.locations && Array.isArray(demand.locations)) {
        demand.locations = demand.locations.map(loc => ({
          district: loc.district,
          region: loc.region
        }));
      }
    }

    res.json(demand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vytvořit poptávku (multi-demand support s flexibilními vlastnostmi)
app.post('/api/demands', (req, res) => {
  try {
    const {
      client_id, 
      // Nová flexibilní struktura
      property_requirements, // Array objektů s různými vlastnostmi pro každý typ
      common_filters, // Společné filtry (cena, lokace)
      // Stará struktura pro zpětnou kompatibilitu
      transaction_type, property_type, property_subtype,
      transaction_types, property_types,
      price_min, price_max, cities, districts,
      area_min, area_max, rooms_min, rooms_max,
      floor_min, floor_max, required_features, 
      email_notifications, user_role, validity_days
    } = req.body;

    // Určení statusu podle role:
    // - Admin může vytvořit poptávku přímo jako 'active'
    // - Agent i Klient vytváří poptávku jako 'pending' (čeká na schválení adminem)
    const initialStatus = user_role === 'admin' ? 'active' : 'pending';
    
    // Nastavit platnost - použít vlastní hodnotu nebo výchozí 30 dní
    // Pokud je 0, nastavit null (bez omezení)
    const daysToAdd = validity_days !== undefined ? validity_days : 30
    let validUntilStr = null
    if (daysToAdd > 0) {
      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + daysToAdd)
      validUntilStr = validUntil.toISOString()
    }
    const now = new Date().toISOString()

    // NOVÁ LOGIKA: Pokud jsou property_requirements, použít flexibilní strukturu
    if (property_requirements && property_requirements.length > 0) {
      // Pro zpětnou kompatibilitu nastavit transaction_type a property_type z prvního požadavku
      const firstReq = property_requirements[0];
      
      // Jedna poptávka s více konfiguracemi typů nemovitostí
      const result = db.prepare(`
        INSERT INTO demands (
          client_id, transaction_type, property_type, property_subtype,
          property_requirements, common_filters, locations,
          email_notifications, status, valid_until, last_confirmed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        client_id,
        firstReq.transaction_type || 'sale',
        firstReq.property_type || 'flat',
        firstReq.property_subtype || null,
        JSON.stringify(property_requirements),
        JSON.stringify(common_filters || {}),
        JSON.stringify(req.body.locations || []),
        email_notifications !== undefined ? email_notifications : 1,
        initialStatus,
        validUntilStr,
        now
      );

      const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(result.lastInsertRowid);
      if (demand.property_requirements) demand.property_requirements = JSON.parse(demand.property_requirements);
      if (demand.common_filters) demand.common_filters = JSON.parse(demand.common_filters);
      if (demand.locations) demand.locations = JSON.parse(demand.locations);

      const typesStr = property_requirements.map(r => `${r.transaction_type} ${r.property_type}`).join(', ');
      const statusNote = initialStatus === 'pending' ? ' (čeká na schválení)' : '';
      logAction(client_id, 'create', 'demand', result.lastInsertRowid, `Vytvořena flexibilní poptávka: ${typesStr}${statusNote}`, req);

      res.status(201).json(demand);
    } 
    // STARÁ LOGIKA: Zpětná kompatibilita
    else {
      const transactionTypesToCreate = transaction_types && transaction_types.length > 0 ? transaction_types : [transaction_type];
      const propertyTypesToCreate = property_types && property_types.length > 0 ? property_types : [property_type];

      const createdDemands = [];

      for (const transType of transactionTypesToCreate) {
        for (const propType of propertyTypesToCreate) {
          const result = db.prepare(`
            INSERT INTO demands (
              client_id, transaction_type, property_type, property_subtype,
              price_min, price_max, cities, districts,
              area_min, area_max, rooms_min, rooms_max,
              floor_min, floor_max, required_features, email_notifications, status,
              valid_until, last_confirmed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            client_id, transType, propType, property_subtype,
            price_min, price_max,
            cities ? JSON.stringify(cities) : null,
            districts ? JSON.stringify(districts) : null,
            area_min, area_max, rooms_min, rooms_max,
            floor_min, floor_max,
            required_features ? JSON.stringify(required_features) : null,
            email_notifications !== undefined ? email_notifications : 1,
            initialStatus,
            validUntilStr,
            now
          );

          const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(result.lastInsertRowid);
          if (demand.cities) demand.cities = JSON.parse(demand.cities);
          if (demand.districts) demand.districts = JSON.parse(demand.districts);
          if (demand.required_features) demand.required_features = JSON.parse(demand.required_features);

          createdDemands.push(demand);

          const statusNote = initialStatus === 'pending' ? ' (čeká na schválení)' : '';
          logAction(client_id, 'create', 'demand', result.lastInsertRowid, `Vytvořena poptávka: ${transType} ${propType}${statusNote}`, req);
        }
      }

      res.status(201).json(createdDemands.length === 1 ? createdDemands[0] : { demands: createdDemands, count: createdDemands.length });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aktualizovat poptávku
app.put('/api/demands/:id', (req, res) => {
  try {
    const {
      property_requirements,
      common_filters,
      locations,
      status,
      email_notifications
    } = req.body;

    // Nová flexibilní struktura
    if (property_requirements && property_requirements.length > 0) {
      const firstReq = property_requirements[0];
      
      db.prepare(`
        UPDATE demands SET
          transaction_type = ?,
          property_type = ?,
          property_subtype = ?,
          property_requirements = ?,
          common_filters = ?,
          locations = ?,
          status = ?,
          email_notifications = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        firstReq.transaction_type || 'sale',
        firstReq.property_type || 'flat',
        firstReq.property_subtype || null,
        JSON.stringify(property_requirements),
        JSON.stringify(common_filters || {}),
        JSON.stringify(locations || []),
        status || 'active',
        email_notifications !== undefined ? email_notifications : 1,
        req.params.id
      );

      const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(req.params.id);
      if (demand.property_requirements) demand.property_requirements = JSON.parse(demand.property_requirements);
      if (demand.common_filters) demand.common_filters = JSON.parse(demand.common_filters);
      if (demand.locations) demand.locations = JSON.parse(demand.locations);

      const typesStr = property_requirements.map(r => `${r.transaction_type} ${r.property_type}`).join(', ');
      logAction(demand.client_id, 'update', 'demand', req.params.id, `Upravena poptávka: ${typesStr}`, req);

      res.json(demand);
    } else {
      // Stará struktura - pro zpětnou kompatibilitu
      const {
        transaction_type, property_type, property_subtype,
        price_min, price_max, cities, districts,
        area_min, area_max, rooms_min, rooms_max,
        floor_min, floor_max, required_features
      } = req.body;

      db.prepare(`
        UPDATE demands SET
          transaction_type = ?, property_type = ?, property_subtype = ?,
          price_min = ?, price_max = ?, cities = ?, districts = ?,
          area_min = ?, area_max = ?, rooms_min = ?, rooms_max = ?,
          floor_min = ?, floor_max = ?, required_features = ?, status = ?, email_notifications = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        transaction_type, property_type, property_subtype,
        price_min, price_max,
        cities ? JSON.stringify(cities) : null,
        districts ? JSON.stringify(districts) : null,
        area_min, area_max, rooms_min, rooms_max,
        floor_min, floor_max,
        required_features ? JSON.stringify(required_features) : null,
        status, email_notifications,
        req.params.id
      );

      const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(req.params.id);
      if (demand.cities) demand.cities = JSON.parse(demand.cities);
      if (demand.districts) demand.districts = JSON.parse(demand.districts);
      if (demand.required_features) demand.required_features = JSON.parse(demand.required_features);

      logAction(demand.client_id, 'update', 'demand', req.params.id, `Upravena poptávka: ${transaction_type} ${property_type}`, req);

      res.json(demand);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Smazat poptávku
app.delete('/api/demands/:id', (req, res) => {
  try {
    const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(req.params.id);
    db.prepare('DELETE FROM demands WHERE id = ?').run(req.params.id);
    
    // Log smazání
    if (demand) {
      logAction(demand.client_id, 'delete', 'demand', req.params.id, `Smazána poptávka`, req);
    }
    
    res.json({ message: 'Poptávka smazána' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Moje poptávky (pro klienta)
app.get('/api/demands/client/:clientId', (req, res) => {
  try {
    const demands = db.prepare('SELECT * FROM demands WHERE client_id = ? ORDER BY created_at DESC').all(req.params.clientId);
    demands.forEach(demand => {
      if (demand.cities) demand.cities = JSON.parse(demand.cities);
      if (demand.districts) demand.districts = JSON.parse(demand.districts);
      if (demand.required_features) demand.required_features = JSON.parse(demand.required_features);
    });
    res.json(demands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== NAŠEPTÁVAČE ====================

// Našeptávač IČO (ARES API)
app.get('/api/suggest/ico/:ico', async (req, res) => {
  try {
    const ico = req.params.ico;
    
    // Volání ARES API
    const response = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`);
    
    if (!response.ok) {
      return res.status(404).json({ error: 'IČO nenalezeno' });
    }
    
    const data = await response.json();
    
    // Extrakce dat
    const result = {
      ico: data.ico,
      dic: data.dic,
      name: data.obchodniJmeno,
      address: {
        street: data.sidlo?.nazevUlice ? `${data.sidlo.nazevUlice} ${data.sidlo.cisloDomovni}` : '',
        city: data.sidlo?.nazevObce || '',
        zip: data.sidlo?.psc || ''
      }
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Chyba při načítání dat z ARES' });
  }
});

// Našeptávač adres (mock - v produkci použít Google Places nebo Mapy.cz API)
app.get('/api/suggest/address', (req, res) => {
  try {
    const query = req.query.q || '';
    
    // Mock data - v produkci nahradit skutečným API
    const mockAddresses = [
      { street: 'Václavské náměstí 1', city: 'Praha 1', zip: '110 00' },
      { street: 'Masarykova 123', city: 'Brno', zip: '602 00' },
      { street: 'Hlavní třída 45', city: 'Ostrava', zip: '702 00' },
      { street: 'Náměstí Svobody 10', city: 'Brno', zip: '602 00' },
      { street: 'Karlovo náměstí 5', city: 'Praha 2', zip: '120 00' }
    ];
    
    const filtered = mockAddresses.filter(addr => 
      addr.street.toLowerCase().includes(query.toLowerCase()) ||
      addr.city.toLowerCase().includes(query.toLowerCase())
    );
    
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== EXPORT & PRINT ====================

// Logování exportu nemovitosti
app.post('/api/properties/:id/export', (req, res) => {
  try {
    const { user_id, format } = req.body; // format: 'pdf', 'excel', 'word'
    const property = db.prepare('SELECT title FROM properties WHERE id = ?').get(req.params.id);
    
    if (property) {
      logAction(user_id, 'export', 'property', req.params.id, `Export nemovitosti do ${format}: ${property.title}`, req);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logování tisku nemovitosti
app.post('/api/properties/:id/print', (req, res) => {
  try {
    const { user_id } = req.body;
    const property = db.prepare('SELECT title FROM properties WHERE id = ?').get(req.params.id);
    
    if (property) {
      logAction(user_id, 'print', 'property', req.params.id, `Tisk nemovitosti: ${property.title}`, req);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logování sdílení nemovitosti
app.post('/api/properties/:id/share', (req, res) => {
  try {
    const { user_id, method, recipient } = req.body; // method: 'email', 'link', 'social'
    const property = db.prepare('SELECT title FROM properties WHERE id = ?').get(req.params.id);
    
    if (property) {
      logAction(user_id, 'share', 'property', req.params.id, `Sdílení nemovitosti přes ${method}: ${property.title}${recipient ? ` -> ${recipient}` : ''}`, req);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logování přidání do oblíbených
app.post('/api/properties/:id/favorite', (req, res) => {
  try {
    const { user_id, action } = req.body; // action: 'add', 'remove'
    const property = db.prepare('SELECT title FROM properties WHERE id = ?').get(req.params.id);
    
    if (property) {
      logAction(user_id, action === 'add' ? 'favorite_add' : 'favorite_remove', 'property', req.params.id, `${action === 'add' ? 'Přidáno do' : 'Odebráno z'} oblíbených: ${property.title}`, req);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logování stažení obrázku
app.post('/api/properties/:id/download-image', (req, res) => {
  try {
    const { user_id, image_url } = req.body;
    const property = db.prepare('SELECT title FROM properties WHERE id = ?').get(req.params.id);
    
    if (property) {
      logAction(user_id, 'download_image', 'property', req.params.id, `Stažení obrázku z nemovitosti: ${property.title}`, req);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logování exportu poptávky
app.post('/api/demands/:id/export', (req, res) => {
  try {
    const { user_id, format } = req.body;
    const demand = db.prepare('SELECT transaction_type, property_type FROM demands WHERE id = ?').get(req.params.id);
    
    if (demand) {
      logAction(user_id, 'export', 'demand', req.params.id, `Export poptávky do ${format}: ${demand.transaction_type} ${demand.property_type}`, req);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logování změny stavu poptávky
app.post('/api/demands/:id/status-change', (req, res) => {
  try {
    const { user_id, old_status, new_status } = req.body;
    const demand = db.prepare('SELECT transaction_type, property_type FROM demands WHERE id = ?').get(req.params.id);
    
    if (demand) {
      logAction(user_id, 'status_change', 'demand', req.params.id, `Změna stavu poptávky: ${old_status} -> ${new_status}`, req);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logování kontaktování agenta
app.post('/api/contact-agent', (req, res) => {
  try {
    const { user_id, agent_id, property_id, message_type } = req.body; // message_type: 'email', 'phone', 'form'
    
    logAction(user_id, 'contact_agent', 'user', agent_id, `Kontaktování agenta přes ${message_type}${property_id ? ` (nemovitost ID: ${property_id})` : ''}`, req);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logování hledání/filtrování
app.post('/api/search-log', (req, res) => {
  try {
    const { user_id, search_type, filters } = req.body; // search_type: 'properties', 'demands'
    
    logAction(user_id, 'search', search_type, null, `Vyhledávání: ${JSON.stringify(filters)}`, req);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== GDPR ====================

// Uložení GDPR souhlasu
app.post('/api/gdpr/consent', (req, res) => {
  try {
    const {
      user_id, email, consent_terms, consent_privacy, consent_marketing,
      consent_profiling, consent_third_party, consent_cookies_analytics,
      consent_cookies_marketing, consent_method
    } = req.body;

    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    const result = db.prepare(`
      INSERT INTO gdpr_consents (
        user_id, email, ip_address, user_agent,
        consent_terms, consent_privacy, consent_marketing,
        consent_profiling, consent_third_party,
        consent_cookies_analytics, consent_cookies_marketing,
        consent_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user_id || null, email, ip, userAgent,
      consent_terms ? 1 : 0,
      consent_privacy ? 1 : 0,
      consent_marketing ? 1 : 0,
      consent_profiling ? 1 : 0,
      consent_third_party ? 1 : 0,
      consent_cookies_analytics ? 1 : 0,
      consent_cookies_marketing ? 1 : 0,
      consent_method || 'web'
    );

    // Log akce
    if (user_id) {
      logAction(user_id, 'gdpr_consent', 'consent', result.lastInsertRowid, 'Udělen GDPR souhlas', req);
    }

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získání souhlasů uživatele
app.get('/api/gdpr/consent/:userId', (req, res) => {
  try {
    const consents = db.prepare(`
      SELECT * FROM gdpr_consents 
      WHERE user_id = ? AND withdrawn_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `).get(req.params.userId);

    res.json(consents || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aktualizace souhlasů
app.put('/api/gdpr/consent/:userId', (req, res) => {
  try {
    const {
      consent_marketing, consent_profiling, consent_third_party,
      consent_cookies_analytics, consent_cookies_marketing
    } = req.body;

    // Získat aktuální souhlas
    const current = db.prepare(`
      SELECT * FROM gdpr_consents 
      WHERE user_id = ? AND withdrawn_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `).get(req.params.userId);

    if (!current) {
      return res.status(404).json({ error: 'Souhlas nenalezen' });
    }

    // Vytvořit nový záznam s aktualizovanými hodnotami
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    db.prepare(`
      INSERT INTO gdpr_consents (
        user_id, email, ip_address, user_agent,
        consent_terms, consent_privacy, consent_marketing,
        consent_profiling, consent_third_party,
        consent_cookies_analytics, consent_cookies_marketing,
        consent_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.params.userId, current.email, ip, userAgent,
      current.consent_terms,
      current.consent_privacy,
      consent_marketing !== undefined ? (consent_marketing ? 1 : 0) : current.consent_marketing,
      consent_profiling !== undefined ? (consent_profiling ? 1 : 0) : current.consent_profiling,
      consent_third_party !== undefined ? (consent_third_party ? 1 : 0) : current.consent_third_party,
      consent_cookies_analytics !== undefined ? (consent_cookies_analytics ? 1 : 0) : current.consent_cookies_analytics,
      consent_cookies_marketing !== undefined ? (consent_cookies_marketing ? 1 : 0) : current.consent_cookies_marketing,
      'web_update'
    );

    logAction(req.params.userId, 'gdpr_consent_update', 'consent', null, 'Aktualizace GDPR souhlasů', req);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Odvolání souhlasu
app.post('/api/gdpr/consent/:userId/withdraw', (req, res) => {
  try {
    db.prepare(`
      UPDATE gdpr_consents 
      SET withdrawn_at = CURRENT_TIMESTAMP,
          consent_marketing = 0,
          consent_profiling = 0,
          consent_third_party = 0,
          consent_cookies_analytics = 0,
          consent_cookies_marketing = 0
      WHERE user_id = ? AND withdrawn_at IS NULL
    `).run(req.params.userId);

    logAction(req.params.userId, 'gdpr_consent_withdraw', 'consent', null, 'Odvolání GDPR souhlasu', req);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vytvoření GDPR žádosti
app.post('/api/gdpr/request', (req, res) => {
  try {
    const { user_id, request_type, request_data } = req.body;

    const result = db.prepare(`
      INSERT INTO gdpr_requests (user_id, request_type, request_data)
      VALUES (?, ?, ?)
    `).run(user_id, request_type, JSON.stringify(request_data || {}));

    logAction(user_id, 'gdpr_request', 'request', result.lastInsertRowid, `GDPR žádost: ${request_type}`, req);

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získání GDPR žádostí uživatele
app.get('/api/gdpr/requests/:userId', (req, res) => {
  try {
    const requests = db.prepare(`
      SELECT * FROM gdpr_requests 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.params.userId);

    requests.forEach(req => {
      if (req.request_data) req.request_data = JSON.parse(req.request_data);
      if (req.response_data) req.response_data = JSON.parse(req.response_data);
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získání všech GDPR žádostí (admin)
app.get('/api/gdpr/requests', (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT r.*, u.name as user_name, u.email as user_email
      FROM gdpr_requests r
      JOIN users u ON r.user_id = u.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE r.status = ?';
      params.push(status);
    }

    query += ' ORDER BY r.created_at DESC';

    const requests = db.prepare(query).all(...params);

    requests.forEach(req => {
      if (req.request_data) req.request_data = JSON.parse(req.request_data);
      if (req.response_data) req.response_data = JSON.parse(req.response_data);
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Zpracování GDPR žádosti (admin)
app.put('/api/gdpr/request/:id', (req, res) => {
  try {
    const { status, response_data, processed_by } = req.body;

    db.prepare(`
      UPDATE gdpr_requests 
      SET status = ?, 
          response_data = ?,
          processed_by = ?,
          processed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, JSON.stringify(response_data || {}), processed_by, req.params.id);

    logAction(processed_by, 'gdpr_request_process', 'request', req.params.id, `Zpracování GDPR žádosti: ${status}`, req);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export dat uživatele (GDPR právo na přenositelnost)
app.get('/api/gdpr/export/:userId', (req, res) => {
  try {
    const userId = req.params.userId;

    // Získat všechna data uživatele
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }
    delete user.password;

    const properties = db.prepare('SELECT * FROM properties WHERE agent_id = ?').all(userId);
    const demands = db.prepare('SELECT * FROM demands WHERE client_id = ?').all(userId);
    const auditLogs = db.prepare('SELECT * FROM audit_logs WHERE user_id = ?').all(userId);
    const consents = db.prepare('SELECT * FROM gdpr_consents WHERE user_id = ?').all(userId);

    const exportData = {
      user,
      properties,
      demands,
      audit_logs: auditLogs,
      gdpr_consents: consents,
      export_date: new Date().toISOString(),
      export_format: 'JSON'
    };

    logAction(userId, 'gdpr_export', 'user', userId, 'Export osobních dat', req);

    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STATS ====================

app.get('/api/stats', (req, res) => {
  try {
    const stats = {
      properties: {
        total: db.prepare("SELECT COUNT(*) as count FROM properties WHERE status IN ('active', 'approved_pending_contract')").get().count,
        sale: db.prepare("SELECT COUNT(*) as count FROM properties WHERE status IN ('active', 'approved_pending_contract') AND transaction_type = 'sale'").get().count,
        rent: db.prepare("SELECT COUNT(*) as count FROM properties WHERE status IN ('active', 'approved_pending_contract') AND transaction_type = 'rent'").get().count,
        pending: db.prepare("SELECT COUNT(*) as count FROM properties WHERE status = 'pending'").get().count,
        byType: {
          flat: db.prepare("SELECT COUNT(*) as count FROM properties WHERE status IN ('active', 'approved_pending_contract') AND property_type = 'flat'").get().count,
          house: db.prepare("SELECT COUNT(*) as count FROM properties WHERE status IN ('active', 'approved_pending_contract') AND property_type = 'house'").get().count,
          commercial: db.prepare("SELECT COUNT(*) as count FROM properties WHERE status IN ('active', 'approved_pending_contract') AND property_type = 'commercial'").get().count,
          land: db.prepare("SELECT COUNT(*) as count FROM properties WHERE status IN ('active', 'approved_pending_contract') AND property_type = 'land'").get().count,
        }
      },
      demands: {
        total: db.prepare("SELECT COUNT(*) as count FROM demands WHERE status = 'active'").get().count,
        sale: db.prepare("SELECT COUNT(*) as count FROM demands WHERE status = 'active' AND transaction_type = 'sale'").get().count,
        rent: db.prepare("SELECT COUNT(*) as count FROM demands WHERE status = 'active' AND transaction_type = 'rent'").get().count,
        pending: db.prepare("SELECT COUNT(*) as count FROM demands WHERE status = 'pending'").get().count,
      },
      users: {
        total: db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1').get().count,
        agents: db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'agent' AND is_active = 1").get().count,
        clients: db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'client' AND is_active = 1").get().count,
        admins: db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND is_active = 1").get().count,
      },
      matches: {
        total: 0, // Matches se počítají dynamicky, ne z tabulky
        new: 0,
        accepted: 0,
      },
      registrations: {
        pending: db.prepare("SELECT COUNT(*) as count FROM registration_requests WHERE status = 'pending'").get().count,
        approved: db.prepare("SELECT COUNT(*) as count FROM registration_requests WHERE status = 'approved'").get().count,
        rejected: db.prepare("SELECT COUNT(*) as count FROM registration_requests WHERE status = 'rejected'").get().count,
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SCHVALOVÁNÍ (ADMIN) ====================

// Schválit/zamítnout nemovitost
app.patch('/api/properties/:id/approve', async (req, res) => {
  try {
    const { status, admin_id, commission_rate, commission_terms } = req.body;
    
    if (!['active', 'rejected', 'approved_pending_contract'].includes(status)) {
      return res.status(400).json({ error: 'Neplatný status' });
    }
    
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
    
    if (!property) {
      return res.status(404).json({ error: 'Nemovitost nenalezena' });
    }
    
    // Pokud admin schvaluje (ne zamítá), nastaví provizi a status 'approved_pending_contract'
    if (status === 'active' || status === 'approved_pending_contract') {
      // Uložit aktuální verzi jako schválenou
      const currentSnapshot = JSON.stringify({
        title: property.title,
        description: property.description,
        price: property.price,
        area: property.area,
        rooms: property.rooms,
        // ... další důležitá pole
      });

      db.prepare(`
        UPDATE properties 
        SET status = 'approved_pending_contract', 
            commission_rate = ?, 
            commission_terms = ?,
            approved_at = CURRENT_TIMESTAMP,
            approved_by = ?,
            last_approved_version = ?,
            pending_changes = NULL,
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(commission_rate, commission_terms, admin_id, currentSnapshot, req.params.id);
      
      logAction(admin_id, 'approve', 'property', req.params.id, `Nemovitost schválena s provizí ${commission_rate}%: ${property.title}`, req);
      
      // Odeslat notifikaci agentovi o nutnosti podepsat zprostředkovatelskou smlouvu
      await notifyAgentContractRequired(req.params.id, property.agent_id, commission_rate, commission_terms);
      
    } else if (status === 'rejected') {
      db.prepare('UPDATE properties SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(status, req.params.id);
      
      logAction(admin_id, 'approve', 'property', req.params.id, `Nemovitost zamítnuta: ${property.title}`, req);
      await notifyPropertyRejected(req.params.id, property.agent_id);
    }
    
    const updated = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
    if (updated.images) updated.images = JSON.parse(updated.images);
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Schválit/zamítnout poptávku
app.patch('/api/demands/:id/approve', async (req, res) => {
  try {
    const { status, admin_id, commission_rate, commission_terms } = req.body;
    
    if (!['active', 'rejected', 'approved_pending_contract'].includes(status)) {
      return res.status(400).json({ error: 'Neplatný status' });
    }
    
    const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(req.params.id);
    
    if (!demand) {
      return res.status(404).json({ error: 'Poptávka nenalezena' });
    }
    
    // Pokud admin schvaluje (ne zamítá), nastaví provizi a status 'approved_pending_contract'
    if (status === 'active' || status === 'approved_pending_contract') {
      db.prepare(`
        UPDATE demands 
        SET status = 'approved_pending_contract', 
            commission_rate = ?, 
            commission_terms = ?,
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(commission_rate, commission_terms, req.params.id);
      
      logAction(admin_id, 'approve', 'demand', req.params.id, `Poptávka schválena s provizí ${commission_rate}%: ${demand.transaction_type} ${demand.property_type}`, req);
      
      // Odeslat notifikaci agentovi/klientovi o nutnosti podepsat zprostředkovatelskou smlouvu
      await notifyAgentContractRequired(req.params.id, demand.client_id, commission_rate, commission_terms, 'demand');
      
    } else if (status === 'rejected') {
      db.prepare('UPDATE demands SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(status, req.params.id);
      
      logAction(admin_id, 'approve', 'demand', req.params.id, `Poptávka zamítnuta: ${demand.transaction_type} ${demand.property_type}`, req);
      await notifyDemandRejected(req.params.id, demand.client_id);
    }
    
    const updated = db.prepare('SELECT * FROM demands WHERE id = ?').get(req.params.id);
    if (updated.cities) updated.cities = JSON.parse(updated.cities);
    if (updated.districts) updated.districts = JSON.parse(updated.districts);
    if (updated.required_features) updated.required_features = JSON.parse(updated.required_features);
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získat čekající schválení (pro admina)
app.get('/api/pending-approvals', (req, res) => {
  try {
    const pendingProperties = db.prepare(`
      SELECT p.*, u.name as agent_name 
      FROM properties p
      LEFT JOIN users u ON p.agent_id = u.id
      WHERE p.status = 'pending'
      ORDER BY p.created_at DESC
    `).all();
    
    const pendingDemands = db.prepare(`
      SELECT d.*, u.name as client_name 
      FROM demands d
      LEFT JOIN users u ON d.client_id = u.id
      WHERE d.status = 'pending'
      ORDER BY d.created_at DESC
    `).all();
    
    // Parse JSON fields
    pendingProperties.forEach(p => {
      if (p.images) p.images = JSON.parse(p.images);
    });
    
    pendingDemands.forEach(d => {
      if (d.cities) d.cities = JSON.parse(d.cities);
      if (d.districts) d.districts = JSON.parse(d.districts);
      if (d.required_features) d.required_features = JSON.parse(d.required_features);
    });
    
    res.json({
      properties: pendingProperties,
      demands: pendingDemands,
      total: pendingProperties.length + pendingDemands.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PŘÍSTUPOVÉ KÓDY ====================

// Generování náhodného 6-místného kódu
function generateAccessCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // bez podobných znaků (0,O,1,I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Vytvoření přístupového kódu
app.post('/api/access-codes', async (req, res) => {
  try {
    const { user_id, entity_type, entity_id, expires_in_days, send_email } = req.body;
    
    if (!user_id || !entity_type || !entity_id) {
      return res.status(400).json({ error: 'Chybí povinné parametry' });
    }
    
    // Kontrola, zda už kód pro tuto kombinaci neexistuje
    const existing = db.prepare(
      'SELECT * FROM access_codes WHERE user_id = ? AND entity_type = ? AND entity_id = ? AND is_active = 1'
    ).get(user_id, entity_type, entity_id);
    
    if (existing) {
      return res.json({ 
        code: existing.code, 
        expires_at: existing.expires_at,
        message: 'Kód již existuje'
      });
    }
    
    // Generování unikátního kódu
    let code;
    let attempts = 0;
    do {
      code = generateAccessCode();
      attempts++;
      if (attempts > 10) {
        return res.status(500).json({ error: 'Nepodařilo se vygenerovat unikátní kód' });
      }
    } while (db.prepare('SELECT id FROM access_codes WHERE code = ?').get(code));
    
    // Výpočet expirace
    let expires_at = null;
    if (expires_in_days) {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + expires_in_days);
      expires_at = expireDate.toISOString();
    }
    
    // Uložení kódu
    const result = db.prepare(`
      INSERT INTO access_codes (user_id, entity_type, entity_id, code, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(user_id, entity_type, entity_id, code, expires_at);
    
    // Log akce
    logAction(user_id, 'generate_code', entity_type, entity_id, `Vygenerován přístupový kód: ${code}`, req);
    
    // Odeslání emailu (pokud je požadováno)
    let emailSent = false;
    if (send_email !== false) { // Výchozí: odesílat email
      try {
        // Získat informace o uživateli
        const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(user_id);
        
        // Získat informace o entitě
        let entityTitle = '';
        if (entity_type === 'property') {
          const property = db.prepare('SELECT title FROM properties WHERE id = ?').get(entity_id);
          entityTitle = property?.title || 'Nemovitost';
        } else if (entity_type === 'demand') {
          const demand = db.prepare('SELECT transaction_type, property_type FROM demands WHERE id = ?').get(entity_id);
          entityTitle = demand ? `${demand.transaction_type} - ${demand.property_type}` : 'Poptávka';
        }
        
        // Odeslat email
        await sendAccessCode(
          user.email,
          user.name,
          code,
          entity_type,
          entityTitle,
          expires_at
        );
        
        emailSent = true;
        console.log(`📧 Email s kódem odeslán na ${user.email}`);
      } catch (emailError) {
        console.error('⚠️ Chyba při odesílání emailu:', emailError.message);
        // Pokračujeme i když email selže
      }
    }
    
    res.json({ 
      id: result.lastInsertRowid,
      code, 
      expires_at,
      message: 'Kód úspěšně vygenerován',
      email_sent: emailSent
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kontrola, zda má uživatel přístup k nemovitosti (kód NEBO smlouva/LOI)
app.get('/api/properties/:id/check-access/:userId', (req, res) => {
  try {
    const { id: property_id, userId: user_id } = req.params;
    
    // 0. Zkontrolovat, zda je uživatel admin
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(user_id);
    if (user && user.role === 'admin') {
      return res.json({ 
        hasAccess: true, 
        reason: 'admin',
        message: 'Admin má přístup ke všemu' 
      });
    }
    
    // 0b. Zkontrolovat, zda je uživatel vlastník nabídky (agent)
    const property = db.prepare('SELECT agent_id FROM properties WHERE id = ?').get(property_id);
    if (property && property.agent_id === parseInt(user_id)) {
      return res.json({ 
        hasAccess: true, 
        reason: 'owner',
        message: 'Vlastník nabídky' 
      });
    }
    
    // 0c. Zkontrolovat podepsanou LOI
    const loi = db.prepare(`
      SELECT * FROM loi_signatures
      WHERE user_id = ?
        AND match_property_id = ?
        AND signed_at IS NOT NULL
    `).get(user_id, property_id);
    
    if (loi) {
      return res.json({ 
        hasAccess: true, 
        reason: 'signed_loi',
        loiId: loi.id,
        message: 'LOI již podepsána' 
      });
    }
    
    // 1. Zkontrolovat aktivní přístupový kód
    const activeCode = db.prepare(`
      SELECT * FROM access_codes 
      WHERE user_id = ? 
        AND entity_type = 'property' 
        AND entity_id = ?
        AND is_active = 1
        AND (expires_at IS NULL OR expires_at > datetime('now'))
    `).get(user_id, property_id);
    
    if (activeCode) {
      return res.json({ 
        hasAccess: true, 
        reason: 'active_code',
        expiresAt: activeCode.expires_at 
      });
    }
    
    // 2. Zkontrolovat podepsanou zprostředkovatelskou smlouvu
    const contract = db.prepare(`
      SELECT * FROM brokerage_contracts
      WHERE user_id = ?
        AND entity_type = 'property'
        AND entity_id = ?
        AND signed_at IS NOT NULL
    `).get(user_id, property_id);
    
    if (contract) {
      return res.json({ 
        hasAccess: true, 
        reason: 'signed_contract',
        contractId: contract.id 
      });
    }
    
    // 3. Zkontrolovat podepsanou LOI (alternativní cesta)
    const loiAlt = db.prepare(`
      SELECT * FROM loi_signatures
      WHERE user_id = ?
        AND (match_property_id = ? OR match_demand_id IN (
          SELECT id FROM demands WHERE client_id = ?
        ))
        AND signed_at IS NOT NULL
    `).get(user_id, property_id, user_id);
    
    if (loiAlt) {
      return res.json({ 
        hasAccess: true, 
        reason: 'signed_loi',
        loiId: loiAlt.id 
      });
    }
    
    // Nemá přístup
    res.json({ hasAccess: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kontrola, zda má uživatel přístup k poptávce (kód NEBO smlouva/LOI)
app.get('/api/demands/:id/check-access/:userId', (req, res) => {
  try {
    const { id: demand_id, userId: user_id } = req.params;
    
    // 0. Zkontrolovat, zda je uživatel admin
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(user_id);
    if (user && user.role === 'admin') {
      return res.json({ 
        hasAccess: true, 
        reason: 'admin',
        message: 'Admin má přístup ke všemu' 
      });
    }
    
    // 0b. Zkontrolovat, zda je uživatel vlastník poptávky
    const demand = db.prepare('SELECT client_id FROM demands WHERE id = ?').get(demand_id);
    if (demand && demand.client_id === parseInt(user_id)) {
      return res.json({ 
        hasAccess: true, 
        reason: 'owner',
        message: 'Vlastník poptávky' 
      });
    }
    
    // 0c. Zkontrolovat podepsanou LOI pro poptávku
    const loiDemand = db.prepare(`
      SELECT * FROM loi_signatures
      WHERE user_id = ?
        AND match_demand_id = ?
        AND signed_at IS NOT NULL
    `).get(user_id, demand_id);
    
    if (loiDemand) {
      return res.json({ 
        hasAccess: true, 
        reason: 'signed_loi',
        loiId: loiDemand.id,
        message: 'LOI již podepsána' 
      });
    }
    
    // 1. Zkontrolovat aktivní přístupový kód
    const activeCode = db.prepare(`
      SELECT * FROM access_codes 
      WHERE user_id = ? 
        AND entity_type = 'demand' 
        AND entity_id = ?
        AND is_active = 1
        AND (expires_at IS NULL OR expires_at > datetime('now'))
    `).get(user_id, demand_id);
    
    if (activeCode) {
      return res.json({ 
        hasAccess: true, 
        reason: 'active_code',
        expiresAt: activeCode.expires_at 
      });
    }
    
    // 2. Zkontrolovat podepsanou zprostředkovatelskou smlouvu
    const contract = db.prepare(`
      SELECT * FROM brokerage_contracts
      WHERE user_id = ?
        AND entity_type = 'demand'
        AND entity_id = ?
        AND signed_at IS NOT NULL
    `).get(user_id, demand_id);
    
    if (contract) {
      return res.json({ 
        hasAccess: true, 
        reason: 'signed_contract',
        contractId: contract.id 
      });
    }
    
    // 3. Zkontrolovat podepsanou LOI (alternativní cesta)
    const loiDemandAlt = db.prepare(`
      SELECT * FROM loi_signatures
      WHERE user_id = ?
        AND (match_demand_id = ? OR match_property_id IN (
          SELECT id FROM properties WHERE agent_id = ?
        ))
        AND signed_at IS NOT NULL
    `).get(user_id, demand_id, user_id);
    
    if (loiDemandAlt) {
      return res.json({ 
        hasAccess: true, 
        reason: 'signed_loi',
        loiId: loiDemandAlt.id 
      });
    }
    
    // Nemá přístup
    res.json({ hasAccess: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ověření přístupového kódu pro nemovitost
app.post('/api/properties/:id/verify-code', (req, res) => {
  try {
    const { code, user_id } = req.body;
    const property_id = req.params.id;
    
    if (!code || !user_id) {
      return res.status(400).json({ error: 'Chybí kód nebo user_id' });
    }
    
    // Najít kód
    const accessCode = db.prepare(`
      SELECT * FROM access_codes 
      WHERE code = ? 
        AND user_id = ? 
        AND entity_type = 'property' 
        AND entity_id = ?
        AND is_active = 1
    `).get(code, user_id, property_id);
    
    if (!accessCode) {
      return res.status(403).json({ error: 'Neplatný nebo neexistující kód' });
    }
    
    // Kontrola expirace
    if (accessCode.expires_at) {
      const expireDate = new Date(accessCode.expires_at);
      if (expireDate < new Date()) {
        return res.status(403).json({ error: 'Kód již expiroval' });
      }
    }
    
    // Log úspěšného použití
    logAction(user_id, 'use_code', 'property', property_id, `Použit přístupový kód: ${code}`, req);
    
    res.json({ success: true, message: 'Kód ověřen' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ověření přístupového kódu pro poptávku
app.post('/api/demands/:id/verify-code', (req, res) => {
  try {
    const { code, user_id } = req.body;
    const demand_id = req.params.id;
    
    if (!code || !user_id) {
      return res.status(400).json({ error: 'Chybí kód nebo user_id' });
    }
    
    // Najít kód
    const accessCode = db.prepare(`
      SELECT * FROM access_codes 
      WHERE code = ? 
        AND user_id = ? 
        AND entity_type = 'demand' 
        AND entity_id = ?
        AND is_active = 1
    `).get(code, user_id, demand_id);
    
    if (!accessCode) {
      return res.status(403).json({ error: 'Neplatný nebo neexistující kód' });
    }
    
    // Kontrola expirace
    if (accessCode.expires_at) {
      const expireDate = new Date(accessCode.expires_at);
      if (expireDate < new Date()) {
        return res.status(403).json({ error: 'Kód již expiroval' });
      }
    }
    
    // Log úspěšného použití
    logAction(user_id, 'use_code', 'demand', demand_id, `Použit přístupový kód: ${code}`, req);
    
    res.json({ success: true, message: 'Kód ověřen' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získání všech kódů pro uživatele
app.get('/api/access-codes/user/:userId', (req, res) => {
  try {
    const codes = db.prepare(`
      SELECT ac.*, 
             p.title as property_title,
             d.transaction_type as demand_type
      FROM access_codes ac
      LEFT JOIN properties p ON ac.entity_type = 'property' AND ac.entity_id = p.id
      LEFT JOIN demands d ON ac.entity_type = 'demand' AND ac.entity_id = d.id
      WHERE ac.user_id = ?
      ORDER BY ac.created_at DESC
    `).all(req.params.userId);
    
    res.json(codes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deaktivace kódu
app.delete('/api/access-codes/:id', (req, res) => {
  try {
    db.prepare('UPDATE access_codes SET is_active = 0 WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Kód deaktivován' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== NOTIFIKACE ====================

// Získat notifikace uživatele
app.get('/api/notifications/:userId', (req, res) => {
  try {
    const { unread_only } = req.query;
    
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    if (unread_only === 'true') {
      query += ' AND is_read = 0';
    }
    query += ' ORDER BY created_at DESC LIMIT 50';
    
    const notifications = db.prepare(query).all(req.params.userId);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Označit notifikaci jako přečtenou
app.patch('/api/notifications/:id/read', (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
    
    const notification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(req.params.id);
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Označit všechny notifikace jako přečtené
app.patch('/api/notifications/user/:userId/read-all', (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0')
      .run(req.params.userId);
    
    res.json({ success: true, message: 'Všechny notifikace označeny jako přečtené' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Smazat notifikaci
app.delete('/api/notifications/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM notifications WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Notifikace smazána' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Počet nepřečtených notifikací
app.get('/api/notifications/:userId/unread-count', (req, res) => {
  try {
    const count = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0')
      .get(req.params.userId);
    
    res.json({ count: count.count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vytvoření prohlášení agenta s kódem
app.post('/api/agent-declarations', async (req, res) => {
  try {
    const { user_id, send_email } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'Chybí user_id' });
    }
    
    // Generování unikátního kódu
    let code;
    let attempts = 0;
    do {
      code = generateAccessCode();
      attempts++;
      if (attempts > 10) {
        return res.status(500).json({ error: 'Nepodařilo se vygenerovat unikátní kód' });
      }
    } while (db.prepare('SELECT id FROM agent_declarations WHERE code = ? AND is_active = 1').get(code));
    
    // Expirace 30 minut
    const expireDate = new Date();
    expireDate.setMinutes(expireDate.getMinutes() + 30);
    const expires_at = expireDate.toISOString();
    
    // Uložení prohlášení
    const result = db.prepare(`
      INSERT INTO agent_declarations (user_id, code, expires_at, declaration_text)
      VALUES (?, ?, ?, ?)
    `).run(user_id, code, expires_at, 'Prohlášení agenta o platné smlouvě s vlastníkem');
    
    // Log akce
    logAction(user_id, 'create', 'agent_declaration', result.lastInsertRowid, `Vygenerováno prohlášení agenta s kódem: ${code}`, req);
    
    // Odeslání emailu
    if (send_email !== false) {
      try {
        const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(user_id);
        
        await sendAccessCode(
          user.email,
          user.name,
          code,
          'agent_declaration',
          'Prohlášení agenta',
          expires_at
        );
        
        console.log(`📧 Email s kódem prohlášení odeslán na ${user.email}`);
      } catch (emailError) {
        console.error('⚠️ Chyba při odesílání emailu:', emailError.message);
      }
    }
    
    res.json({ 
      id: result.lastInsertRowid,
      code, 
      expires_at,
      message: 'Kód úspěšně vygenerován'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vytvoření zprostředkovatelské smlouvy s kódem
app.post('/api/brokerage-contracts', async (req, res) => {
  try {
    const { user_id, entity_type, entity_id, commission_rate, send_email } = req.body;
    
    if (!user_id || !entity_type || !entity_id) {
      return res.status(400).json({ error: 'Chybí povinné parametry' });
    }
    
    // Generování unikátního kódu
    let code;
    let attempts = 0;
    do {
      code = generateAccessCode();
      attempts++;
      if (attempts > 10) {
        return res.status(500).json({ error: 'Nepodařilo se vygenerovat unikátní kód' });
      }
    } while (db.prepare('SELECT id FROM brokerage_contracts WHERE code = ? AND is_active = 1').get(code));
    
    // Expirace 30 minut
    const expireDate = new Date();
    expireDate.setMinutes(expireDate.getMinutes() + 30);
    const expires_at = expireDate.toISOString();
    
    // Uložení smlouvy
    const result = db.prepare(`
      INSERT INTO brokerage_contracts (user_id, entity_type, entity_id, commission_rate, code, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(user_id, entity_type, entity_id, commission_rate, code, expires_at);
    
    // Log akce
    logAction(user_id, 'create', 'brokerage_contract', result.lastInsertRowid, `Vygenerována zprostředkovatelská smlouva pro ${entity_type} ${entity_id}`, req);
    
    // Odeslání emailu
    if (send_email !== false) {
      try {
        const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(user_id);
        
        await sendAccessCode(
          user.email,
          user.name,
          code,
          'brokerage_contract',
          'Zprostředkovatelská smlouva',
          expires_at
        );
        
        console.log(`📧 Email s kódem smlouvy odeslán na ${user.email}`);
      } catch (emailError) {
        console.error('⚠️ Chyba při odesílání emailu:', emailError.message);
      }
    }
    
    res.json({ 
      id: result.lastInsertRowid,
      code, 
      expires_at,
      message: 'Kód úspěšně vygenerován'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== LOI (Letter of Intent) ====================

// Žádost o LOI - vygeneruje kód a odešle email
app.post('/api/loi/request', async (req, res) => {
  try {
    const { user_id, property_id, demand_id } = req.body;
    
    if (!user_id || (!property_id && !demand_id)) {
      return res.status(400).json({ error: 'Chybí povinné parametry' });
    }
    
    const entity_type = property_id ? 'property' : 'demand';
    const entity_id = property_id || demand_id;
    
    // Zkontrolovat, zda už LOI neexistuje
    const existing = db.prepare(`
      SELECT * FROM loi_signatures
      WHERE user_id = ? 
        AND ${property_id ? 'match_property_id' : 'match_demand_id'} = ?
    `).get(user_id, entity_id);
    
    if (existing && existing.signed_at) {
      return res.json({ 
        success: true,
        message: 'LOI již podepsána',
        loi: existing 
      });
    }
    
    // Vygenerovat kód
    let code;
    let attempts = 0;
    do {
      code = generateAccessCode();
      attempts++;
      if (attempts > 10) {
        return res.status(500).json({ error: 'Nepodařilo se vygenerovat unikátní kód' });
      }
    } while (db.prepare('SELECT id FROM loi_signatures WHERE code = ?').get(code));
    
    // Expirace 30 minut
    const expireDate = new Date();
    expireDate.setMinutes(expireDate.getMinutes() + 30);
    const expires_at = expireDate.toISOString();
    
    // Uložit nebo aktualizovat LOI
    if (existing) {
      db.prepare(`
        UPDATE loi_signatures 
        SET code = ?, expires_at = ?, is_active = 1
        WHERE id = ?
      `).run(code, expires_at, existing.id);
    } else {
      // Pro property: match_property_id = property_id, match_demand_id = nejmenší existující demand
      // Pro demand: match_demand_id = demand_id, match_property_id = nejmenší existující property
      let finalPropertyId, finalDemandId;
      
      if (property_id) {
        finalPropertyId = property_id;
        // Najít jakýkoliv demand (kvůli FOREIGN KEY)
        const anyDemand = db.prepare('SELECT id FROM demands LIMIT 1').get();
        finalDemandId = anyDemand ? anyDemand.id : null;
      } else {
        finalDemandId = demand_id;
        // Najít jakoukoliv property (kvůli FOREIGN KEY)
        const anyProperty = db.prepare('SELECT id FROM properties LIMIT 1').get();
        finalPropertyId = anyProperty ? anyProperty.id : null;
      }
      
      if (!finalPropertyId || !finalDemandId) {
        return res.status(500).json({ error: 'Nelze vytvořit LOI - chybí data v databázi' });
      }
      
      const result = db.prepare(`
        INSERT INTO loi_signatures (
          user_id, 
          match_property_id, 
          match_demand_id, 
          code, 
          expires_at
        ) VALUES (?, ?, ?, ?, ?)
      `).run(
        user_id, 
        finalPropertyId, 
        finalDemandId, 
        code, 
        expires_at
      );
    }
    
    // Získat info o entitě
    const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(user_id);
    const entity = property_id 
      ? db.prepare('SELECT title as name FROM properties WHERE id = ?').get(property_id)
      : db.prepare('SELECT transaction_type, property_type FROM demands WHERE id = ?').get(demand_id);
    
    const entityName = property_id 
      ? entity.name 
      : `${entity.transaction_type} - ${entity.property_type}`;
    
    // Odeslat email s kódem (dočasně vypnuto - email není nakonfigurován)
    try {
      await sendAccessCode(
        user.email,
        user.name,
        code,
        'loi',
        entityName,
        expires_at
      );
    } catch (emailError) {
      console.log('⚠️ Email se nepodařilo odeslat (není nakonfigurován), ale LOI byla vytvořena');
      // Pokračovat i bez emailu - kód se zobrazí ve frontendu
    }
    
    // Log akce
    logAction(user_id, 'request_loi', entity_type, entity_id, `Žádost o LOI: ${entityName}`, req);
    
    res.json({ 
      success: true,
      code,
      expires_at,
      message: 'Kód odeslán na email'
    });
  } catch (error) {
    console.error('Chyba při žádosti o LOI:', error);
    res.status(500).json({ error: error.message });
  }
});

// Podpis LOI kódem
app.post('/api/loi/sign', async (req, res) => {
  try {
    const { user_id, property_id, demand_id, code } = req.body;
    
    if (!user_id || !code || (!property_id && !demand_id)) {
      return res.status(400).json({ error: 'Chybí povinné parametry' });
    }
    
    const entity_type = property_id ? 'property' : 'demand';
    const entity_id = property_id || demand_id;
    
    // Najít LOI
    const loi = db.prepare(`
      SELECT * FROM loi_signatures
      WHERE user_id = ? 
        AND ${property_id ? 'match_property_id' : 'match_demand_id'} = ?
        AND code = ?
        AND is_active = 1
        AND signed_at IS NULL
    `).get(user_id, entity_id, code);
    
    if (!loi) {
      return res.status(404).json({ error: 'Neplatný kód nebo LOI již podepsána' });
    }
    
    // Kontrola expirace
    if (loi.expires_at && new Date(loi.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Kód vypršel' });
    }
    
    // Připravit data pro uložení smlouvy
    let contractText = '';
    let contractHash = '';
    
    // Získat data pro email a uložení smlouvy
    try {
      console.log('📧 Začínám přípravu emailu s LOI...');
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(user_id);
      console.log(`👤 Uživatel: ${user.name} (${user.email})`);
      
      const entity = entity_type === 'property' 
        ? db.prepare('SELECT * FROM properties WHERE id = ?').get(entity_id)
        : db.prepare('SELECT * FROM demands WHERE id = ?').get(entity_id);
      
      const entityName = entity_type === 'property' 
        ? entity.title 
        : `${entity.transaction_type} - ${entity.property_type}`;
      
      console.log(`📄 Entita: ${entityName}`);
      
      // Získat šablonu LOI
      const template = db.prepare(`
        SELECT * FROM contract_templates 
        WHERE template_type = 'loi' AND is_active = 1
        ORDER BY created_at DESC LIMIT 1
      `).get();
      
      console.log(`📋 Šablona LOI: ${template ? 'nalezena' : 'NENALEZENA'}`);
      
      if (template && user.email) {
        // Nahradit placeholdery
        contractText = template.template_content;
        contractText = contractText.replace(/{{user_name}}/g, user.name || '');
        contractText = contractText.replace(/{{user_email}}/g, user.email || '');
        contractText = contractText.replace(/{{user_company}}/g, user.company ? `Firma: ${user.company}` : '');
        contractText = contractText.replace(/{{user_ico}}/g, user.ico ? `IČO: ${user.ico}` : '');
        contractText = contractText.replace(/{{entity_type}}/g, entity_type === 'property' ? 'nabídce nemovitosti' : 'poptávce');
        contractText = contractText.replace(/{{entity_name}}/g, entityName);
        contractText = contractText.replace(/{{signature_date}}/g, new Date().toLocaleDateString('cs-CZ'));
        contractText = contractText.replace(/{{signature_time}}/g, new Date().toLocaleTimeString('cs-CZ'));
        contractText = contractText.replace(/{{ip_address}}/g, req.ip || 'N/A');
        contractText = contractText.replace(/{{verification_code}}/g, code);
        
        // Vytvořit hash smlouvy
        contractHash = crypto.createHash('sha256').update(contractText).digest('hex');
        
        // Odeslat email s podepsanou smlouvou
        await sendEmail({
          to: user.email,
          subject: 'Podepsaná LOI - Letter of Intent',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #667eea;">Podepsaná LOI - Letter of Intent</h2>
              
              <p>Dobrý den ${user.name},</p>
              
              <p>děkujeme za podpis Letter of Intent. Níže naleznete kopii podepsané smlouvy.</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Detaily smlouvy:</h3>
                <p><strong>Předmět:</strong> ${entityName}</p>
                <p><strong>Datum podpisu:</strong> ${new Date().toLocaleString('cs-CZ')}</p>
                <p><strong>Ověřovací kód:</strong> ${code}</p>
                <p><strong>Platnost:</strong> 90 dnů</p>
              </div>
              
              <div style="background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Kompletní znění smlouvy:</h3>
                <pre style="white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.6;">${contractText}</pre>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Tuto smlouvu si prosím uschovejte pro své záznamy.<br>
                V případě dotazů nás kontaktujte na info@ptf.cz
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #9ca3af; font-size: 12px;">
                PTF reality, s.r.o.<br>
                Dřevěná 99/3, 301 00 Plzeň<br>
                IČO: 06684394
              </p>
            </div>
          `
        });
        
        console.log(`✅ LOI odeslána emailem na ${user.email}`);
      } else {
        console.log(`⚠️ Email s LOI NEBYL odeslán - šablona: ${!!template}, email: ${user.email}`);
      }
    } catch (emailError) {
      console.error('⚠️ Chyba při odesílání LOI emailem:', emailError);
      console.error('Stack trace:', emailError.stack);
      // Nepřerušujeme proces, i když email selže
    }
    
    // Podepsat LOI a uložit kompletní znění
    db.prepare(`
      UPDATE loi_signatures 
      SET signed_at = ?,
          contract_text = ?,
          contract_hash = ?,
          ip_address = ?,
          verification_code = ?
      WHERE id = ?
    `).run(new Date().toISOString(), contractText, contractHash, req.ip || 'N/A', code, loi.id);
    
    // Log akce
    logAction(user_id, 'sign_loi', entity_type, entity_id, `Podepsána LOI kódem: ${code}`, req);
    
    res.json({ 
      success: true,
      message: 'LOI úspěšně podepsána a odeslána na váš email'
    });
  } catch (error) {
    console.error('Chyba při podpisu LOI:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ZPROSTŘEDKOVATELSKÉ SMLOUVY ====================

// Ověření kódu zprostředkovatelské smlouvy a aktivace entity
app.post('/api/brokerage-contracts/verify', (req, res) => {
  try {
    const { user_id, entity_type, entity_id, code } = req.body;
    
    if (!user_id || !entity_type || !entity_id || !code) {
      return res.status(400).json({ error: 'Chybí povinné parametry' });
    }
    
    // Najít smlouvu
    const contract = db.prepare(`
      SELECT * FROM brokerage_contracts 
      WHERE code = ? 
        AND user_id = ? 
        AND entity_type = ?
        AND entity_id = ?
        AND is_active = 1
    `).get(code, user_id, entity_type, entity_id);
    
    if (!contract) {
      return res.status(404).json({ error: 'Neplatný nebo neexistující kód' });
    }
    
    // Kontrola expirace
    if (contract.expires_at && new Date(contract.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Kód vypršel' });
    }
    
    // Označit smlouvu jako podepsanou
    db.prepare('UPDATE brokerage_contracts SET signed_at = ? WHERE id = ?')
      .run(new Date().toISOString(), contract.id);
    
    // Aktivovat entitu (property nebo demand)
    const table = entity_type === 'property' ? 'properties' : 'demands';
    db.prepare(`UPDATE ${table} SET status = 'active', contract_signed_at = ? WHERE id = ?`)
      .run(new Date().toISOString(), entity_id);
    
    // Log akce
    logAction(user_id, 'sign', 'brokerage_contract', contract.id, `Podepsána zprostředkovatelská smlouva pro ${entity_type} ${entity_id}`, req);
    
    res.json({ 
      success: true,
      message: 'Smlouva podepsána, nabídka/poptávka aktivována',
      contract_id: contract.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získat historii entity (property nebo demand)
app.get('/api/history/:entityType/:id', (req, res) => {
  try {
    const { entityType, id } = req.params;
    
    console.log(`📊 History request: ${entityType}/${id}`);
    
    if (!['properties', 'demands'].includes(entityType)) {
      return res.status(400).json({ error: 'Neplatný typ entity' });
    }
    
    const history = [];
    
    // 1. Vytvoření entity
    const entity = db.prepare(`SELECT * FROM ${entityType} WHERE id = ?`).get(id);
    if (!entity) {
      console.log(`❌ Entity not found: ${entityType}/${id}`);
      return res.status(404).json({ error: 'Entita nenalezena' });
    }
    
    console.log(`✅ Entity found: ${entityType}/${id}`);
    
    const creator = db.prepare('SELECT name FROM users WHERE id = ?').get(entity.agent_id || entity.client_id);
    history.push({
      type: 'created',
      timestamp: entity.created_at,
      user: creator?.name || 'Neznámý',
      description: `${entityType === 'properties' ? 'Nabídka' : 'Poptávka'} vytvořena`,
      icon: 'plus',
      color: 'blue'
    });
    
    // 2. Schválení adminem (pokud má provizi)
    if (entity.commission_rate) {
      const singularType = entityType === 'properties' ? 'property' : 'demand';
      const approvalLog = db.prepare(`
        SELECT * FROM audit_logs 
        WHERE entity_type = ? AND entity_id = ? AND action = 'approve'
        ORDER BY created_at DESC LIMIT 1
      `).get(singularType, id);
      
      if (approvalLog) {
        const admin = db.prepare('SELECT name FROM users WHERE id = ?').get(approvalLog.user_id);
        history.push({
          type: 'approved',
          timestamp: approvalLog.created_at,
          user: admin?.name || 'Admin',
          description: `Schváleno s provizí ${entity.commission_rate}%`,
          details: entity.commission_terms,
          icon: 'check',
          color: 'green'
        });
      }
    }
    
    // 3. Podpis smlouvy
    if (entity.contract_signed_at) {
      const singularType = entityType === 'properties' ? 'property' : 'demand';
      const contract = db.prepare(`
        SELECT * FROM brokerage_contracts 
        WHERE entity_type = ? AND entity_id = ? AND signed_at IS NOT NULL
        ORDER BY signed_at DESC LIMIT 1
      `).get(singularType, id);
      
      if (contract) {
        const signer = db.prepare('SELECT name FROM users WHERE id = ?').get(contract.user_id);
        history.push({
          type: 'contract_signed',
          timestamp: contract.signed_at,
          user: signer?.name || 'Neznámý',
          description: `Zprostředkovatelská smlouva podepsána (${contract.commission_rate}% provize)`,
          icon: 'file-text',
          color: 'purple'
        });
      }
    }
    
    // 4. Změny statusu z audit_logs
    const singularType = entityType === 'properties' ? 'property' : 'demand';
    const statusChanges = db.prepare(`
      SELECT * FROM audit_logs 
      WHERE entity_type = ? AND entity_id = ? AND action IN ('update', 'approve')
      ORDER BY created_at ASC
    `).all(singularType, id);
    
    statusChanges.forEach(log => {
      const user = db.prepare('SELECT name FROM users WHERE id = ?').get(log.user_id);
      if (log.description && log.description.includes('status')) {
        history.push({
          type: 'status_change',
          timestamp: log.created_at,
          user: user?.name || 'Systém',
          description: log.description,
          icon: 'refresh',
          color: 'orange'
        });
      }
    });
    
    // Seřadit podle času
    history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.json(history);
  } catch (error) {
    console.error(`❌ History error for ${req.params.entityType}/${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Získat audit logy uživatele
app.get('/api/audit-logs/user/:userId', (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT * FROM audit_logs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).all(req.params.userId);
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získat všechny podepsané LOI (admin)
app.get('/api/loi-signatures/all', (req, res) => {
  try {
    const lois = db.prepare(`
      SELECT ls.*, u.name as user_name,
        p.title as property_title,
        d.transaction_type || ' - ' || d.property_type as demand_title
      FROM loi_signatures ls
      LEFT JOIN users u ON ls.user_id = u.id
      LEFT JOIN properties p ON ls.match_property_id = p.id
      LEFT JOIN demands d ON ls.match_demand_id = d.id
      WHERE ls.signed_at IS NOT NULL
      ORDER BY ls.signed_at DESC
    `).all();
    
    res.json(lois);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získat podepsané LOI uživatele
app.get('/api/loi-signatures/user/:userId', (req, res) => {
  try {
    const lois = db.prepare(`
      SELECT ls.*,
        p.title as property_title,
        d.transaction_type || ' - ' || d.property_type as demand_title
      FROM loi_signatures ls
      LEFT JOIN properties p ON ls.match_property_id = p.id
      LEFT JOIN demands d ON ls.match_demand_id = d.id
      WHERE ls.user_id = ? AND ls.signed_at IS NOT NULL
      ORDER BY ls.signed_at DESC
    `).all(req.params.userId);
    
    res.json(lois);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získat všechny podepsané smlouvy (admin)
app.get('/api/brokerage-contracts/all', (req, res) => {
  try {
    const contracts = db.prepare(`
      SELECT bc.*, u.name as user_name,
        CASE 
          WHEN bc.entity_type = 'property' THEN (SELECT title FROM properties WHERE id = bc.entity_id)
          WHEN bc.entity_type = 'demand' THEN (SELECT transaction_type || ' - ' || property_type FROM demands WHERE id = bc.entity_id)
        END as entity_title
      FROM brokerage_contracts bc
      LEFT JOIN users u ON bc.user_id = u.id
      WHERE bc.signed_at IS NOT NULL
      ORDER BY bc.signed_at DESC
    `).all();
    
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získat podepsané smlouvy uživatele
app.get('/api/brokerage-contracts/user/:userId', (req, res) => {
  try {
    const contracts = db.prepare(`
      SELECT bc.*,
        CASE 
          WHEN bc.entity_type = 'property' THEN (SELECT title FROM properties WHERE id = bc.entity_id)
          WHEN bc.entity_type = 'demand' THEN (SELECT transaction_type || ' - ' || property_type FROM demands WHERE id = bc.entity_id)
        END as entity_title
      FROM brokerage_contracts bc
      WHERE bc.user_id = ? AND bc.signed_at IS NOT NULL
      ORDER BY bc.signed_at DESC
    `).all(req.params.userId);
    
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získat všechny podepsané obecné smlouvy (admin)
app.get('/api/contracts/all', (req, res) => {
  try {
    const contracts = db.prepare(`
      SELECT c.*, u.name as user_name
      FROM contracts c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.status = 'signed'
      ORDER BY c.signed_at DESC
    `).all();
    
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získat podepsané obecné smlouvy uživatele
app.get('/api/contracts/user/:userId', (req, res) => {
  try {
    const contracts = db.prepare(`
      SELECT c.*
      FROM contracts c
      WHERE c.user_id = ? AND c.status = 'signed'
      ORDER BY c.signed_at DESC
    `).all(req.params.userId);
    
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získat matching demands pro property (dynamicky)
app.get('/api/properties/:id/matches', (req, res) => {
  try {
    console.log(`🎯 Matches request for property: ${req.params.id}`);
    
    // Získat property
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Nemovitost nenalezena' });
    }
    
    // Najít všechny aktivní poptávky - nefiltrujeme podle typu, protože multi-poptávka může mít více typů
    const demands = db.prepare(`
      SELECT d.*, u.name as client_name
      FROM demands d
      LEFT JOIN users u ON d.client_id = u.id
      WHERE d.status = 'active'
    `).all();
    
    // Vypočítat match score pro každou poptávku
    const matches = demands.map(demand => {
      let score = 0;
      let matchedRequirement = null;
      
      // Parse nové struktury
      const propertyRequirements = demand.property_requirements ? JSON.parse(demand.property_requirements) : null;
      const commonFilters = demand.common_filters ? JSON.parse(demand.common_filters) : null;
      const locations = demand.locations ? JSON.parse(demand.locations) : null;
      
      // NOVÁ LOGIKA: Pokud má poptávka property_requirements
      if (propertyRequirements && propertyRequirements.length > 0) {
        // Najít matching requirement (může jich být více typů)
        const matchingReq = propertyRequirements.find(req => 
          req.transaction_type === property.transaction_type && 
          req.property_type === property.property_type
        );
        
        if (!matchingReq) {
          return null; // Tento typ nemovitosti není v poptávce
        }
        
        matchedRequirement = matchingReq;
        
        // 1. Typ transakce a nemovitosti - 20 bodů
        score += 20;
        
        // Bonus za shodu podtypu - 10 bodů (podporuje array podtypů)
        const demandSubtypes = matchingReq.property_subtypes || (matchingReq.property_subtype ? [matchingReq.property_subtype] : []);
        
        if (demandSubtypes.length > 0 && property.property_subtype) {
          // Pokud poptávka má specifikované podtypy, kontrolovat shodu
          if (demandSubtypes.includes(property.property_subtype)) {
            score += 10;
          }
        } else if (demandSubtypes.length === 0) {
          // Pokud poptávka nemá specifikovaný podtyp (jakýkoliv), přidat částečný bonus
          score += 5;
        }
        
        // 2. Cena z common_filters - 30 bodů
        if (commonFilters?.price) {
          const priceMin = commonFilters.price.min || 0;
          const priceMax = commonFilters.price.max || Infinity;
          
          if (property.price >= priceMin && property.price <= priceMax) {
            score += 30;
          } else if (property.price < priceMin) {
            score += Math.max(0, 30 - ((priceMin - property.price) / priceMin * 30));
          } else {
            score += Math.max(0, 30 - ((property.price - priceMax) / priceMax * 30));
          }
        } else {
          score += 15;
        }
        
        // 3. Lokalita z locations (GPS) - 25 bodů
        if (locations && locations.length > 0) {
          const locationMatch = locations.some(loc => {
            // Porovnat název města/lokality
            if (loc.city && property.city) {
              return property.city.toLowerCase().includes(loc.city.toLowerCase()) ||
                     loc.city.toLowerCase().includes(property.city.toLowerCase());
            }
            if (loc.name && property.city) {
              return property.city.toLowerCase().includes(loc.name.toLowerCase()) ||
                     loc.name.toLowerCase().includes(property.city.toLowerCase());
            }
            return false;
          });
          if (locationMatch) score += 25;
        } else {
          score += 12;
        }
        
        // 4. Plocha z filters - 15 bodů
        if (matchingReq.filters?.area && property.area) {
          const areaMin = matchingReq.filters.area.min || 0;
          const areaMax = matchingReq.filters.area.max || Infinity;
          
          if (property.area >= areaMin && property.area <= areaMax) {
            score += 15;
          } else {
            score += Math.max(0, 15 - Math.abs(property.area - (areaMin + areaMax) / 2) / 10);
          }
        } else {
          score += 7;
        }
        
        // 5. Pokoje z filters (pro byty) - 10 bodů
        if (matchingReq.filters?.rooms && property.rooms) {
          const roomsMin = matchingReq.filters.rooms.min || 0;
          const roomsMax = matchingReq.filters.rooms.max || Infinity;
          
          if (property.rooms >= roomsMin && property.rooms <= roomsMax) {
            score += 10;
          }
        } else {
          score += 5;
        }
        
      } else {
        // STARÁ LOGIKA: Zpětná kompatibilita
        const cities = demand.cities ? JSON.parse(demand.cities) : [];
        
        // Kontrola typu
        if (demand.transaction_type !== property.transaction_type || 
            demand.property_type !== property.property_type) {
          return null;
        }
        
        score += 20;
        
        // Cena
        if (demand.price_min && demand.price_max) {
          if (property.price >= demand.price_min && property.price <= demand.price_max) {
            score += 30;
          } else if (property.price < demand.price_min) {
            score += Math.max(0, 30 - ((demand.price_min - property.price) / demand.price_min * 30));
          } else {
            score += Math.max(0, 30 - ((property.price - demand.price_max) / demand.price_max * 30));
          }
        } else {
          score += 15;
        }
        
        // Lokalita
        if (cities.length > 0) {
          const cityMatch = cities.some(city => property.city.toLowerCase().includes(city.toLowerCase()));
          if (cityMatch) score += 25;
        } else {
          score += 12;
        }
        
        // Plocha
        if (demand.area_min && demand.area_max && property.area) {
          if (property.area >= demand.area_min && property.area <= demand.area_max) {
            score += 15;
          } else {
            score += Math.max(0, 15 - Math.abs(property.area - (demand.area_min + demand.area_max) / 2) / 10);
          }
        } else {
          score += 7;
        }
        
        // Pokoje
        if (demand.rooms_min && demand.rooms_max && property.rooms) {
          if (property.rooms >= demand.rooms_min && property.rooms <= demand.rooms_max) {
            score += 10;
          }
        } else {
          score += 5;
        }
      }
      
      const match_score = Math.round(score);
      
      return {
        ...demand,
        match_score,
        property_requirements: propertyRequirements,
        common_filters: commonFilters,
        locations: locations,
        matched_requirement: matchedRequirement
      };
    })
    .filter(match => match !== null && match.match_score >= 50) // Jen shody nad 50%
    .sort((a, b) => b.match_score - a.match_score);
    
    console.log(`✅ Found ${matches.length} matches for property ${req.params.id}`);
    res.json(matches);
  } catch (error) {
    console.error(`❌ Matches error for property ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Získat matching properties pro demand (dynamicky)
app.get('/api/demands/:id/matches', (req, res) => {
  try {
    console.log(`🎯 Matches request for demand: ${req.params.id}`);
    
    // Získat demand
    const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(req.params.id);
    if (!demand) {
      return res.status(404).json({ error: 'Poptávka nenalezena' });
    }
    
    // Parse nové struktury
    const propertyRequirements = demand.property_requirements ? JSON.parse(demand.property_requirements) : null;
    const commonFilters = demand.common_filters ? JSON.parse(demand.common_filters) : null;
    const locations = demand.locations ? JSON.parse(demand.locations) : null;
    
    // Najít všechny aktivní nabídky - nefiltrujeme podle typu, protože multi-poptávka může mít více typů
    const properties = db.prepare(`
      SELECT p.*, u.name as agent_name
      FROM properties p
      LEFT JOIN users u ON p.agent_id = u.id
      WHERE p.status = 'active'
    `).all();
    
    // Vypočítat match score pro každou nabídku
    const matches = properties.map(property => {
      let score = 0;
      let matchedRequirement = null;
      
      // Parse images
      const images = property.images ? JSON.parse(property.images) : [];
      
      // NOVÁ LOGIKA: Pokud má poptávka property_requirements
      if (propertyRequirements && propertyRequirements.length > 0) {
        // Najít matching requirement
        const matchingReq = propertyRequirements.find(req => 
          req.transaction_type === property.transaction_type && 
          req.property_type === property.property_type
        );
        
        if (!matchingReq) {
          return null; // Tento typ nemovitosti není v poptávce
        }
        
        matchedRequirement = matchingReq;
        
        // 1. Typ transakce a nemovitosti - 20 bodů
        score += 20;
        
        // Bonus za shodu podtypu - 10 bodů (podporuje array podtypů)
        const demandSubtypes = matchingReq.property_subtypes || (matchingReq.property_subtype ? [matchingReq.property_subtype] : []);
        
        if (demandSubtypes.length > 0 && property.property_subtype) {
          // Pokud poptávka má specifikované podtypy, kontrolovat shodu
          if (demandSubtypes.includes(property.property_subtype)) {
            score += 10;
          }
        } else if (demandSubtypes.length === 0) {
          // Pokud poptávka nemá specifikovaný podtyp (jakýkoliv), přidat částečný bonus
          score += 5;
        }
        
        // 2. Cena z common_filters - 30 bodů
        if (commonFilters?.price) {
          const priceMin = commonFilters.price.min || 0;
          const priceMax = commonFilters.price.max || Infinity;
          
          if (property.price >= priceMin && property.price <= priceMax) {
            score += 30;
          } else if (property.price < priceMin) {
            score += Math.max(0, 30 - ((priceMin - property.price) / priceMin * 30));
          } else {
            score += Math.max(0, 30 - ((property.price - priceMax) / priceMax * 30));
          }
        } else {
          score += 15;
        }
        
        // 3. Lokalita z locations - 25 bodů
        if (locations && locations.length > 0) {
          const locationMatch = locations.some(loc => {
            if (loc.city && property.city) {
              return property.city.toLowerCase().includes(loc.city.toLowerCase()) ||
                     loc.city.toLowerCase().includes(property.city.toLowerCase());
            }
            if (loc.name && property.city) {
              return property.city.toLowerCase().includes(loc.name.toLowerCase()) ||
                     loc.name.toLowerCase().includes(property.city.toLowerCase());
            }
            return false;
          });
          if (locationMatch) score += 25;
        } else {
          score += 12;
        }
        
        // 4. Plocha z filters - 15 bodů
        if (matchingReq.filters?.area && property.area) {
          const areaMin = matchingReq.filters.area.min || 0;
          const areaMax = matchingReq.filters.area.max || Infinity;
          
          if (property.area >= areaMin && property.area <= areaMax) {
            score += 15;
          } else {
            score += Math.max(0, 15 - Math.abs(property.area - (areaMin + areaMax) / 2) / 10);
          }
        } else {
          score += 7;
        }
        
        // 5. Pokoje z filters - 10 bodů
        if (matchingReq.filters?.rooms && property.rooms) {
          const roomsMin = matchingReq.filters.rooms.min || 0;
          const roomsMax = matchingReq.filters.rooms.max || Infinity;
          
          if (property.rooms >= roomsMin && property.rooms <= roomsMax) {
            score += 10;
          }
        } else {
          score += 5;
        }
        
      } else {
        // STARÁ LOGIKA: Zpětná kompatibilita
        const cities = demand.cities ? JSON.parse(demand.cities) : [];
        
        // Kontrola typu
        if (demand.transaction_type !== property.transaction_type || 
            demand.property_type !== property.property_type) {
          return null;
        }
        
        score += 20;
        
        // Cena
        if (demand.price_min && demand.price_max) {
          if (property.price >= demand.price_min && property.price <= demand.price_max) {
            score += 30;
          } else if (property.price < demand.price_min) {
            score += Math.max(0, 30 - ((demand.price_min - property.price) / demand.price_min * 30));
          } else {
            score += Math.max(0, 30 - ((property.price - demand.price_max) / demand.price_max * 30));
          }
        } else {
          score += 15;
        }
        
        // Lokalita
        if (cities.length > 0) {
          const cityMatch = cities.some(city => property.city.toLowerCase().includes(city.toLowerCase()));
          if (cityMatch) score += 25;
        } else {
          score += 12;
        }
        
        // Plocha
        if (demand.area_min && demand.area_max && property.area) {
          if (property.area >= demand.area_min && property.area <= demand.area_max) {
            score += 15;
          } else {
            score += Math.max(0, 15 - Math.abs(property.area - (demand.area_min + demand.area_max) / 2) / 10);
          }
        } else {
          score += 7;
        }
        
        // Pokoje
        if (demand.rooms_min && demand.rooms_max && property.rooms) {
          if (property.rooms >= demand.rooms_min && property.rooms <= demand.rooms_max) {
            score += 10;
          }
        } else {
          score += 5;
        }
      }
      
      const match_score = Math.round(score);
      
      return {
        ...property,
        match_score,
        images,
        matched_requirement: matchedRequirement
      };
    })
    .filter(match => match !== null && match.match_score >= 50) // Jen shody nad 50%
    .sort((a, b) => b.match_score - a.match_score);
    
    console.log(`✅ Found ${matches.length} matches for demand ${req.params.id}`);
    res.json(matches);
  } catch (error) {
    console.error(`❌ Matches error for demand ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Ověření kódu prohlášení agenta
app.post('/api/agent-declarations/verify', (req, res) => {
  try {
    const { user_id, code } = req.body;
    
    if (!user_id || !code) {
      return res.status(400).json({ error: 'Chybí povinné parametry' });
    }
    
    // Najít kód
    const declaration = db.prepare(`
      SELECT * FROM agent_declarations 
      WHERE code = ? 
        AND user_id = ? 
        AND is_active = 1
    `).get(code, user_id);
    
    if (!declaration) {
      return res.status(404).json({ error: 'Neplatný nebo neexistující kód' });
    }
    
    // Kontrola expirace
    if (declaration.expires_at && new Date(declaration.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Kód vypršel' });
    }
    
    // Označit jako použitý
    db.prepare('UPDATE agent_declarations SET verified_at = ? WHERE id = ?')
      .run(new Date().toISOString(), declaration.id);
    
    // Log akce
    logAction(user_id, 'verify', 'agent_declaration', declaration.id, `Ověřeno prohlášení agenta kódem: ${code}`, req);
    
    res.json({ 
      success: true,
      message: 'Kód ověřen',
      declaration_id: declaration.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CONTRACT TEMPLATES
// ============================================

// Získat šablonu smlouvy podle typu
app.get('/api/contract-templates/:type', (req, res) => {
  try {
    const { type } = req.params
    
    const template = db.prepare(`
      SELECT * FROM contract_templates 
      WHERE template_type = ? AND is_active = 1
      ORDER BY created_at DESC
      LIMIT 1
    `).get(type)
    
    if (!template) {
      return res.status(404).json({ error: 'Šablona nenalezena' })
    }
    
    res.json(template)
  } catch (error) {
    console.error('Chyba při načítání šablony:', error)
    res.status(500).json({ error: error.message })
  }
})

// Získat všechny šablony (admin)
app.get('/api/contract-templates', (req, res) => {
  try {
    const templates = db.prepare(`
      SELECT * FROM contract_templates 
      ORDER BY template_type, created_at DESC
    `).all()
    
    res.json(templates)
  } catch (error) {
    console.error('Chyba při načítání šablon:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// PASSWORD RESET
// ============================================

// Request password reset (pošle email s kódem)
app.post('/api/auth/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email je povinný' });
    }
    
    // Najít uživatele
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      // Z bezpečnostních důvodů neříkáme, že email neexistuje
      return res.json({ success: true, message: 'Pokud email existuje, byl odeslán kód pro reset hesla' });
    }
    
    // Vygenerovat 6-místný kód
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expires_at = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minut
    
    // Uložit do access_codes
    db.prepare(`
      INSERT INTO access_codes (user_id, entity_type, entity_id, code, expires_at, is_active)
      VALUES (?, 'password_reset', 0, ?, ?, 1)
    `).run(user.id, code, expires_at);
    
    // Odeslat email
    try {
      await sendAccessCode(
        user.email,
        user.name,
        code,
        'password_reset',
        'Reset hesla',
        expires_at
      );
    } catch (emailError) {
      console.log('⚠️ Email se nepodařilo odeslat, ale kód byl vygenerován:', code);
    }
    
    // Log akce
    logAction(user.id, 'request_password_reset', 'user', user.id, `Žádost o reset hesla`, req);
    
    res.json({ 
      success: true, 
      message: 'Kód pro reset hesla byl odeslán na email',
      code: process.env.NODE_ENV === 'development' ? code : undefined // Pro testování
    });
    
  } catch (error) {
    console.error('Chyba při žádosti o reset hesla:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reset password s kódem
app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { email, code, new_password } = req.body;
    
    if (!email || !code || !new_password) {
      return res.status(400).json({ error: 'Email, kód a nové heslo jsou povinné' });
    }
    
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Heslo musí mít alespoň 6 znaků' });
    }
    
    // Najít uživatele
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }
    
    // Ověřit kód
    const accessCode = db.prepare(`
      SELECT * FROM access_codes 
      WHERE user_id = ? 
        AND code = ? 
        AND entity_type = 'password_reset'
        AND is_active = 1
        AND datetime(expires_at) > datetime('now')
      ORDER BY created_at DESC
      LIMIT 1
    `).get(user.id, code.toUpperCase());
    
    if (!accessCode) {
      return res.status(400).json({ error: 'Neplatný nebo expirovaný kód' });
    }
    
    // Hashovat nové heslo
    const hashedPassword = bcrypt.hashSync(new_password, 10);
    
    // Aktualizovat heslo
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, user.id);
    
    // Deaktivovat kód
    db.prepare('UPDATE access_codes SET is_active = 0 WHERE id = ?').run(accessCode.id);
    
    // Log akce
    logAction(user.id, 'password_reset', 'user', user.id, `Heslo bylo resetováno`, req);
    
    res.json({ success: true, message: 'Heslo bylo úspěšně změněno' });
    
  } catch (error) {
    console.error('Chyba při resetu hesla:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ověřit LOI kód
app.post('/api/auth/verify-loi-code', async (req, res) => {
  try {
    const { user_id, code, entityType, entityId } = req.body;
    
    if (!user_id || !code || !entityType || !entityId) {
      return res.status(400).json({ error: 'Chybí povinné parametry' });
    }
    
    // Najít uživatele
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(user_id);
    
    if (!user) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }
    
    // Ověřit kód
    const accessCode = db.prepare(`
      SELECT * FROM access_codes 
      WHERE user_id = ? 
        AND code = ? 
        AND entity_type = 'loi'
        AND is_active = 1
        AND datetime(expires_at) > datetime('now')
      ORDER BY created_at DESC
      LIMIT 1
    `).get(user.id, code.toUpperCase());
    
    if (!accessCode) {
      return res.status(400).json({ error: 'Neplatný nebo expirovaný kód' });
    }
    
    // Označit kód jako použitý
    db.prepare('UPDATE access_codes SET is_active = 0 WHERE id = ?').run(accessCode.id);
    
    // Připravit data pro uložení smlouvy
    let contractText = '';
    let contractHash = '';
    
    // Odeslat podepsanou smlouvu emailem a uložit do DB
    try {
      const entity = entityType === 'property' 
        ? db.prepare('SELECT * FROM properties WHERE id = ?').get(entityId)
        : db.prepare('SELECT * FROM demands WHERE id = ?').get(entityId);
      
      const entityName = entityType === 'property' 
        ? entity.title 
        : `${entity.transaction_type} - ${entity.property_type}`;
      
      // Získat šablonu LOI
      const template = db.prepare(`
        SELECT * FROM contract_templates 
        WHERE template_type = 'loi' AND is_active = 1
        ORDER BY created_at DESC LIMIT 1
      `).get();
      
      if (template && user.email) {
        // Nahradit placeholdery
        contractText = template.template_content;
        contractText = contractText.replace(/{{user_name}}/g, user.name || '');
        contractText = contractText.replace(/{{user_email}}/g, user.email || '');
        contractText = contractText.replace(/{{user_company}}/g, user.company ? `Firma: ${user.company}` : '');
        contractText = contractText.replace(/{{user_ico}}/g, user.ico ? `IČO: ${user.ico}` : '');
        contractText = contractText.replace(/{{entity_type}}/g, entityType === 'property' ? 'nabídce nemovitosti' : 'poptávce');
        contractText = contractText.replace(/{{entity_name}}/g, entityName);
        contractText = contractText.replace(/{{signature_date}}/g, new Date().toLocaleDateString('cs-CZ'));
        contractText = contractText.replace(/{{signature_time}}/g, new Date().toLocaleTimeString('cs-CZ'));
        contractText = contractText.replace(/{{ip_address}}/g, req.ip || 'N/A');
        contractText = contractText.replace(/{{verification_code}}/g, code);
        
        // Vytvořit hash smlouvy pro ověření integrity
        contractHash = crypto.createHash('sha256').update(contractText).digest('hex');
        
        // Odeslat email s podepsanou smlouvou
        await sendEmail({
          to: user.email,
          subject: 'Podepsaná LOI - Letter of Intent',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #667eea;">Podepsaná LOI - Letter of Intent</h2>
              
              <p>Dobrý den ${user.name},</p>
              
              <p>děkujeme za podpis Letter of Intent. Níže naleznete kopii podepsané smlouvy.</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Detaily smlouvy:</h3>
                <p><strong>Předmět:</strong> ${entityName}</p>
                <p><strong>Datum podpisu:</strong> ${new Date().toLocaleString('cs-CZ')}</p>
                <p><strong>Ověřovací kód:</strong> ${code}</p>
                <p><strong>Platnost:</strong> 90 dnů</p>
              </div>
              
              <div style="background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Kompletní znění smlouvy:</h3>
                <pre style="white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.6;">${contractText}</pre>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Tuto smlouvu si prosím uschovejte pro své záznamy.<br>
                V případě dotazů nás kontaktujte na info@ptf.cz
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #9ca3af; font-size: 12px;">
                PTF reality, s.r.o.<br>
                Dřevěná 99/3, 301 00 Plzeň<br>
                IČO: 06684394
              </p>
            </div>
          `
        });
        
        console.log(`✅ LOI odeslána emailem na ${user.email}`);
      }
    } catch (emailError) {
      console.error('⚠️ Chyba při odesílání LOI emailem:', emailError);
      // Nepřerušujeme proces, i když email selže
    }
    
    // Uložit kompletní znění smlouvy do databáze
    if (contractText) {
      try {
        // Najít záznam LOI signature
        const loiSignature = db.prepare(`
          SELECT * FROM loi_signatures 
          WHERE user_id = ? 
            AND ((match_property_id = ? AND ? = 'property') OR (match_demand_id = ? AND ? = 'demand'))
          ORDER BY created_at DESC
          LIMIT 1
        `).get(user_id, entityId, entityType, entityId, entityType);
        
        if (loiSignature) {
          // Aktualizovat s kompletním textem
          db.prepare(`
            UPDATE loi_signatures 
            SET contract_text = ?,
                contract_hash = ?,
                ip_address = ?,
                verification_code = ?,
                signed_at = datetime('now')
            WHERE id = ?
          `).run(contractText, contractHash, req.ip || 'N/A', code, loiSignature.id);
          
          console.log(`✅ Kompletní znění LOI uloženo do databáze (ID: ${loiSignature.id})`);
        }
      } catch (dbError) {
        console.error('⚠️ Chyba při ukládání znění smlouvy do DB:', dbError);
      }
    }
    
    // Log akce
    logAction(user_id, 'loi_signed', entityType, entityId, `LOI podepsána pro ${entityType} ID ${entityId}`, req);
    
    res.json({ success: true, message: 'LOI byla úspěšně podepsána a odeslána na váš email' });
  } catch (error) {
    console.error('Chyba při ověřování LOI kódu:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin reset hesla (bez kódu)
app.post('/api/admin/reset-user-password', (req, res) => {
  try {
    const { admin_id, user_id, new_password } = req.body;
    
    // Ověřit, že je admin
    const admin = db.prepare('SELECT * FROM users WHERE id = ? AND role = "admin"').get(admin_id);
    
    if (!admin) {
      return res.status(403).json({ error: 'Pouze admin může resetovat hesla' });
    }
    
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: 'Heslo musí mít alespoň 6 znaků' });
    }
    
    // Najít uživatele
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(user_id);
    
    if (!user) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }
    
    // Hashovat nové heslo
    const hashedPassword = bcrypt.hashSync(new_password, 10);
    
    // Aktualizovat heslo
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, user_id);
    
    // Log akce
    logAction(admin_id, 'admin_password_reset', 'user', user_id, `Admin resetoval heslo pro ${user.name}`, req);
    
    res.json({ success: true, message: `Heslo pro ${user.name} bylo úspěšně změněno` });
    
  } catch (error) {
    console.error('Chyba při admin resetu hesla:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ==================== EMAIL TEMPLATES ====================

// Získat všechny emailové šablony
app.get('/api/email-templates', (req, res) => {
  try {
    const templates = db.prepare('SELECT * FROM email_templates ORDER BY name').all();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získat jednu emailovou šablonu
app.get('/api/email-templates/:id', (req, res) => {
  try {
    const { id } = req.params;
    const template = db.prepare('SELECT * FROM email_templates WHERE id = ?').get(id);
    
    if (!template) {
      return res.status(404).json({ error: 'Šablona nenalezena' });
    }
    
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aktualizovat emailovou šablonu
app.put('/api/email-templates/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, html_content, variables, description, is_active } = req.body;
    
    db.prepare(`
      UPDATE email_templates 
      SET name = ?, subject = ?, html_content = ?, variables = ?, 
          description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, subject, html_content, variables, description, is_active, id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// START SERVER
// ============================================

// ==================== IMPORT API ====================

// Import API routes
app.post('/api/import/properties', 
  authenticateImportSource, 
  importRateLimiter,
  logImportRequest,
  importProperty
);

app.delete('/api/import/properties/:external_id', 
  authenticateImportSource, 
  importRateLimiter,
  logImportRequest,
  deleteImportedProperty
);

app.get('/api/import/properties', 
  authenticateImportSource, 
  logImportRequest,
  listImportedProperties
);

app.get('/api/import/stats', 
  authenticateImportSource, 
  logImportRequest,
  getImportStats
);

// ==================== SERVER START ====================

app.listen(PORT, () => {
  console.log(`[SERVER] Realitní API běží na http://localhost:${PORT}`);
  console.log(`[IMPORT] Import API: http://localhost:${PORT}/api/import`);
});
