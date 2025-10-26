// Import Middleware - Autentizace a rate limiting pro import API

import db from './database.js';
import rateLimit from 'express-rate-limit';

// Ověření API klíče
export const authenticateImportSource = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API klic chybi',
      message: 'Pouzijte header X-API-Key'
    });
  }
  
  const source = db.prepare(`
    SELECT * FROM import_sources 
    WHERE api_key = ? AND is_active = 1
  `).get(apiKey);
  
  if (!source) {
    return res.status(401).json({ 
      error: 'Neplatny API klic',
      message: 'API klic neni aktivni nebo neexistuje'
    });
  }
  
  req.importSource = source;
  next();
};

// Rate limiting per source
export const importRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hodina
  max: (req) => req.importSource?.rate_limit || 100,
  keyGenerator: (req) => `import_${req.importSource?.id}`,
  message: { error: 'Prekorocen limit importu', retry_after: '1 hour' },
  standardHeaders: true,
  legacyHeaders: false
});

// Logování requestu
export const logImportRequest = (req, res, next) => {
  req.importStartTime = Date.now();
  
  // Log po dokončení requestu
  res.on('finish', () => {
    const duration = Date.now() - req.importStartTime;
    console.log(`[IMPORT] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms) - Source: ${req.importSource?.name}`);
  });
  
  next();
};
