import { sendAccessCode, sendEmailFromTemplate } from './emailService.js';
import db from './database.js';

// Vytvoření notifikace v databázi
const createNotification = (userId, type, title, message, entityType = null, entityId = null, actionUrl = null) => {
  try {
    const result = db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, action_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, type, title, message, entityType, entityId, actionUrl);
    
    return {
      id: result.lastInsertRowid,
      user_id: userId,
      type,
      title,
      message,
      entity_type: entityType,
      entity_id: entityId,
      action_url: actionUrl,
      is_read: 0,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Chyba při vytváření notifikace:', error);
    return null;
  }
};

// Odeslání notifikace s emailem
const sendNotificationWithEmail = async (userId, type, title, message, entityType = null, entityId = null, actionUrl = null, emailSubject = null, emailHtml = null) => {
  // Vytvořit notifikaci v databázi
  const notification = createNotification(userId, type, title, message, entityType, entityId, actionUrl);
  
  if (!notification) {
    return { success: false, error: 'Nepodařilo se vytvořit notifikaci' };
  }
  
  // Získat informace o uživateli
  const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(userId);
  
  if (!user || !user.email) {
    return { success: true, notification, email_sent: false, reason: 'Uživatel nemá email' };
  }
  
  // Odeslat email (pokud je poskytnut)
  let emailSent = false;
  if (emailSubject && emailHtml) {
    try {
      const nodemailer = await import('nodemailer');
      const dotenv = await import('dotenv');
      dotenv.config();
      
      const transporter = nodemailer.default.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      
      await transporter.sendMail({
        from: {
          name: 'Estateprivate.com',
          address: process.env.EMAIL_USER || 'info@ptf.cz'
        },
        to: user.email,
        subject: emailSubject,
        html: emailHtml
      });
      
      emailSent = true;
      console.log(`📧 Email notifikace odeslán na ${user.email}`);
    } catch (emailError) {
      console.error('⚠️ Chyba při odesílání emailu:', emailError.message);
    }
  }
  
  return {
    success: true,
    notification,
    email_sent: emailSent
  };
};

// Notifikace pro schválení nemovitosti
const notifyPropertyApproved = async (propertyId, agentId) => {
  const property = db.prepare('SELECT title FROM properties WHERE id = ?').get(propertyId);
  
  if (!property) return { success: false };
  
  const title = '✅ Nemovitost schválena';
  const message = `Vaše nemovitost "${property.title}" byla schválena a je nyní aktivní.`;
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>✅ Nemovitost schválena!</h1>
      </div>
      <div class="content">
        <div class="success-box">
          <p style="margin: 0;"><strong>Vaše nemovitost byla schválena:</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 18px;"><strong>${property.title}</strong></p>
        </div>
        <p>Nemovitost je nyní aktivní a viditelná pro klienty.</p>
        <p>S pozdravem,<br><strong>Tým Estateprivate.com</strong></p>
      </div>
    </body>
    </html>
  `;
  
  return await sendNotificationWithEmail(
    agentId,
    'approval',
    title,
    message,
    'property',
    propertyId,
    `/properties/${propertyId}`,
    title,
    emailHtml
  );
};

// Notifikace pro zamítnutí nemovitosti
const notifyPropertyRejected = async (propertyId, agentId) => {
  const property = db.prepare('SELECT title FROM properties WHERE id = ?').get(propertyId);
  
  if (!property) return { success: false };
  
  const title = '❌ Nemovitost zamítnuta';
  const message = `Vaše nemovitost "${property.title}" byla zamítnuta. Kontaktujte administrátora pro více informací.`;
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>❌ Nemovitost zamítnuta</h1>
      </div>
      <div class="content">
        <div class="warning-box">
          <p style="margin: 0;"><strong>Vaše nemovitost byla zamítnuta:</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 18px;"><strong>${property.title}</strong></p>
        </div>
        <p>Pro více informací kontaktujte administrátora systému.</p>
        <p>S pozdravem,<br><strong>Tým Estateprivate.com</strong></p>
      </div>
    </body>
    </html>
  `;
  
  return await sendNotificationWithEmail(
    agentId,
    'rejection',
    title,
    message,
    'property',
    propertyId,
    `/properties/${propertyId}`,
    title,
    emailHtml
  );
};

// Notifikace pro schválení poptávky
const notifyDemandApproved = async (demandId, clientId) => {
  const demand = db.prepare('SELECT transaction_type, property_type FROM demands WHERE id = ?').get(demandId);
  
  if (!demand) return { success: false };
  
  const title = '✅ Poptávka schválena';
  const message = `Vaše poptávka "${demand.transaction_type} - ${demand.property_type}" byla schválena a je nyní aktivní.`;
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>✅ Poptávka schválena!</h1>
      </div>
      <div class="content">
        <div class="success-box">
          <p style="margin: 0;"><strong>Vaše poptávka byla schválena:</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 18px;"><strong>${demand.transaction_type} - ${demand.property_type}</strong></p>
        </div>
        <p>Poptávka je nyní aktivní a systém vám bude zasílat vhodné nabídky.</p>
        <p>S pozdravem,<br><strong>Tým Estateprivate.com</strong></p>
      </div>
    </body>
    </html>
  `;
  
  return await sendNotificationWithEmail(
    clientId,
    'approval',
    title,
    message,
    'demand',
    demandId,
    `/demands/${demandId}`,
    title,
    emailHtml
  );
};

// Notifikace pro zamítnutí poptávky
const notifyDemandRejected = async (demandId, clientId) => {
  const demand = db.prepare('SELECT transaction_type, property_type FROM demands WHERE id = ?').get(demandId);
  
  if (!demand) return { success: false };
  
  const title = '❌ Poptávka zamítnuta';
  const message = `Vaše poptávka "${demand.transaction_type} - ${demand.property_type}" byla zamítnuta.`;
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>❌ Poptávka zamítnuta</h1>
      </div>
      <div class="content">
        <div class="warning-box">
          <p style="margin: 0;"><strong>Vaše poptávka byla zamítnuta:</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 18px;"><strong>${demand.transaction_type} - ${demand.property_type}</strong></p>
        </div>
        <p>Pro více informací kontaktujte administrátora systému.</p>
        <p>S pozdravem,<br><strong>Tým Estateprivate.com</strong></p>
      </div>
    </body>
    </html>
  `;
  
  return await sendNotificationWithEmail(
    clientId,
    'rejection',
    title,
    message,
    'demand',
    demandId,
    `/demands/${demandId}`,
    title,
    emailHtml
  );
};

// Notifikace pro novou shodu
const notifyNewMatch = async (matchId, userId) => {
  const match = db.prepare(`
    SELECT m.*, p.title as property_title, d.transaction_type, d.property_type
    FROM matches m
    JOIN properties p ON m.property_id = p.id
    JOIN demands d ON m.demand_id = d.id
    WHERE m.id = ?
  `).get(matchId);
  
  if (!match) return { success: false };
  
  const title = '🎯 Nová shoda nalezena!';
  const message = `Našli jsme shodu pro vaši poptávku: ${match.property_title}`;
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .match-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎯 Nová shoda!</h1>
      </div>
      <div class="content">
        <div class="match-box">
          <p style="margin: 0;"><strong>Našli jsme nemovitost, která odpovídá vaší poptávce:</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 18px;"><strong>${match.property_title}</strong></p>
          <p style="margin: 10px 0 0 0;">Shoda: ${match.match_score}%</p>
        </div>
        <p>Přihlaste se do systému pro zobrazení detailů.</p>
        <p>S pozdravem,<br><strong>Tým Estateprivate.com</strong></p>
      </div>
    </body>
    </html>
  `;
  
  return await sendNotificationWithEmail(
    userId,
    'match',
    title,
    message,
    'match',
    matchId,
    `/matches/${matchId}`,
    title,
    emailHtml
  );
};

// Notifikace pro nutnost podepsat zprostředkovatelskou smlouvu
const notifyAgentContractRequired = async (entityId, userId, commissionRate, commissionTerms, entityType = 'property') => {
  const entity = entityType === 'property'
    ? db.prepare('SELECT title as name FROM properties WHERE id = ?').get(entityId)
    : db.prepare('SELECT transaction_type, property_type FROM demands WHERE id = ?').get(entityId);
  
  if (!entity) return { success: false };
  
  const entityName = entityType === 'property' 
    ? entity.name 
    : `${entity.transaction_type} - ${entity.property_type}`;
  
  const title = '📝 Podepište zprostředkovatelskou smlouvu';
  const message = `Vaše ${entityType === 'property' ? 'nabídka' : 'poptávka'} "${entityName}" byla schválena. Pro aktivaci je nutné podepsat zprostředkovatelskou smlouvu s provizí ${commissionRate}%.`;
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .commission-box { background: white; border: 2px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📝 Podpis smlouvy vyžadován</h1>
      </div>
      <div class="content">
        <div class="info-box">
          <p style="margin: 0;"><strong>${entityType === 'property' ? 'Nabídka' : 'Poptávka'} schválena:</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 18px;"><strong>${entityName}</strong></p>
        </div>
        
        <div class="commission-box">
          <p style="margin: 0; font-size: 14px; color: #666;">Provize Estate Private</p>
          <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #f59e0b;">${commissionRate}%</p>
        </div>
        
        <p><strong>Podmínky spolupráce:</strong></p>
        <p style="background: #f3f4f6; padding: 15px; border-radius: 4px;">${commissionTerms || 'Standardní podmínky zprostředkování'}</p>
        
        <p><strong>Další kroky:</strong></p>
        <ol>
          <li>Přihlaste se do systému</li>
          <li>Otevřete notifikaci</li>
          <li>Přečtěte si zprostředkovatelskou smlouvu</li>
          <li>Podepište smlouvu pomocí ověřovacího kódu</li>
          <li>Po podpisu bude ${entityType === 'property' ? 'nabídka' : 'poptávka'} aktivována</li>
        </ol>
        
        <p>S pozdravem,<br><strong>Tým Estateprivate.com</strong></p>
      </div>
    </body>
    </html>
  `;
  
  return await sendNotificationWithEmail(
    userId,
    'contract_required',
    title,
    message,
    entityType,
    entityId,
    `/${entityType === 'property' ? 'properties' : 'demands'}/${entityId}/sign-contract`,
    title,
    emailHtml
  );
};

// Odeslani notifikaci o nove nabidce klientum s odpovida jicimi poptavkami
const notifyClientsAboutNewProperty = async (propertyId) => {
  try {
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(propertyId);
    if (!property) return { success: false, error: 'Property not found' };

    // Najit vsechny aktivni poptavky, ktere odpovida ji
    const matches = db.prepare(`
      SELECT DISTINCT d.client_id, d.id as demand_id, u.email, u.name, u.notify_new_properties, u.min_match_score
      FROM demands d
      JOIN users u ON d.client_id = u.id
      WHERE d.status = 'active'
        AND d.transaction_type = ?
        AND d.property_type = ?
        AND u.notify_new_properties = 1
        AND u.is_active = 1
    `).all(property.transaction_type, property.property_type);

    let sentCount = 0;
    
    for (const match of matches) {
      // Vypocitat match score (zjednodusena verze)
      let matchScore = 70; // Zakladni shoda typu a transakce
      
      // Kontrola ceny
      if (match.price_min && match.price_max) {
        if (property.price >= match.price_min && property.price <= match.price_max) {
          matchScore += 15;
        }
      }
      
      // Kontrola plochy
      if (match.area_min && match.area_max) {
        if (property.area >= match.area_min && property.area <= match.area_max) {
          matchScore += 15;
        }
      }
      
      // Pokud je match score nizsi nez minimum uzivatele, preskocit
      if (matchScore < (match.min_match_score || 70)) {
        continue;
      }
      
      // Vygenerovat pristupovy kod
      const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dni
      
      db.prepare(`
        INSERT INTO access_codes (user_id, entity_type, entity_id, code, expires_at)
        VALUES (?, 'property', ?, ?, ?)
      `).run(match.client_id, propertyId, accessCode, expiresAt.toISOString());
      
      // Odeslat email
      try {
        await sendEmailFromTemplate('new_property_match', match.email, {
          recipientName: match.name,
          propertyTitle: property.title,
          propertyLocation: `${property.city}${property.district ? ', ' + property.district : ''}`,
          propertyPrice: new Intl.NumberFormat('cs-CZ').format(property.price) + ' Kc',
          propertyArea: property.area,
          propertyType: property.property_type,
          matchScore: matchScore,
          accessCode: accessCode
        }, match.client_id);
        
        sentCount++;
      } catch (error) {
        console.error(`Chyba pri odesilani emailu klientovi ${match.client_id}:`, error);
      }
    }
    
    return { success: true, sentCount };
  } catch (error) {
    console.error('Chyba pri notifikovani klientu o nove nabidce:', error);
    return { success: false, error: error.message };
  }
};

// Odeslani notifikaci o nove poptavce agentum s odpovida jicimi nabidkami
const notifyAgentsAboutNewDemand = async (demandId) => {
  try {
    const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(demandId);
    if (!demand) return { success: false, error: 'Demand not found' };
    
    const client = db.prepare('SELECT name, email, phone FROM users WHERE id = ?').get(demand.client_id);

    // Najit vsechny aktivni nabidky, ktere odpovida ji
    const matches = db.prepare(`
      SELECT DISTINCT p.id as property_id, p.agent_id, p.title, u.email, u.name, u.notify_new_demands, u.min_match_score
      FROM properties p
      JOIN users u ON p.agent_id = u.id
      WHERE p.status = 'active'
        AND p.transaction_type = ?
        AND p.property_type = ?
        AND u.notify_new_demands = 1
        AND u.is_active = 1
    `).all(demand.transaction_type, demand.property_type);

    let sentCount = 0;
    
    for (const match of matches) {
      // Vypocitat match score
      let matchScore = 70;
      
      const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(match.property_id);
      
      if (demand.price_min && demand.price_max && property) {
        if (property.price >= demand.price_min && property.price <= demand.price_max) {
          matchScore += 15;
        }
      }
      
      if (demand.area_min && demand.area_max && property) {
        if (property.area >= demand.area_min && property.area <= demand.area_max) {
          matchScore += 15;
        }
      }
      
      if (matchScore < (match.min_match_score || 70)) {
        continue;
      }
      
      // Odeslat email
      try {
        const cities = demand.cities ? JSON.parse(demand.cities) : [];
        const priceRange = `${new Intl.NumberFormat('cs-CZ').format(demand.price_min || 0)} - ${new Intl.NumberFormat('cs-CZ').format(demand.price_max || 0)} Kc`;
        const areaRange = `${demand.area_min || 0} - ${demand.area_max || 0}`;
        
        await sendEmailFromTemplate('new_demand_match', match.email, {
          recipientName: match.name,
          propertyTitle: match.title,
          demandType: demand.property_type,
          demandPriceRange: priceRange,
          demandAreaRange: areaRange,
          demandLocations: cities.join(', '),
          matchScore: matchScore,
          clientName: client.name,
          clientEmail: client.email,
          clientPhone: client.phone || 'Neuvedeno'
        }, match.agent_id);
        
        sentCount++;
      } catch (error) {
        console.error(`Chyba pri odesilani emailu agentovi ${match.agent_id}:`, error);
      }
    }
    
    return { success: true, sentCount };
  } catch (error) {
    console.error('Chyba pri notifikovani agentu o nove poptavce:', error);
    return { success: false, error: error.message };
  }
};

export {
  createNotification,
  sendNotificationWithEmail,
  notifyPropertyApproved,
  notifyPropertyRejected,
  notifyDemandApproved,
  notifyDemandRejected,
  notifyNewMatch,
  notifyAgentContractRequired,
  notifyClientsAboutNewProperty,
  notifyAgentsAboutNewDemand
};
