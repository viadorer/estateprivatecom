// Import Controller - Správa importu nemovitostí

import db from './database.js';
import { validatePropertyData, mapToInternalFormat } from './importMapper.js';

// Helper funkce pro logování
function logImport(sourceId, action, entityType, entityId, externalId, status, error = null, requestData = null, req) {
  db.prepare(`
    INSERT INTO import_logs (
      source_id, action, entity_type, entity_id, external_id, 
      status, error_message, request_data, ip_address, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    sourceId,
    action,
    entityType,
    entityId,
    externalId,
    status,
    error,
    requestData ? JSON.stringify(requestData) : null,
    req.ip,
    req.get('user-agent')
  );
}

// POST /api/import/properties - Vytvoření nebo aktualizace nemovitosti
export const importProperty = async (req, res) => {
  try {
    const externalData = req.body;
    
    // Validace
    const validation = validatePropertyData(externalData);
    if (!validation.valid) {
      logImport(
        req.importSource.id,
        'create',
        'property',
        null,
        externalData.external_id,
        'error',
        validation.errors.join(', '),
        externalData,
        req
      );
      
      return res.status(400).json({ 
        error: 'Neplatna data', 
        details: validation.errors 
      });
    }
    
    // Mapování na náš formát
    const internalData = mapToInternalFormat(externalData);
    
    // Kontrola, zda už existuje mapování
    const existing = db.prepare(`
      SELECT internal_id FROM import_mappings 
      WHERE source_id = ? AND external_id = ? AND entity_type = 'property'
    `).get(req.importSource.id, externalData.external_id);
    
    let propertyId;
    let action;
    
    if (existing) {
      // UPDATE existující nemovitosti
      db.prepare(`
        UPDATE properties 
        SET title = ?, description = ?, transaction_type = ?, property_type = ?, 
            property_subtype = ?, price = ?, price_note = ?, city = ?, district = ?, 
            street = ?, latitude = ?, longitude = ?, area = ?, rooms = ?, floor = ?, 
            total_floors = ?, building_type = ?, building_condition = ?, furnished = ?, 
            has_balcony = ?, has_elevator = ?, has_parking = ?, agent_id = ?, status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        internalData.title,
        internalData.description,
        internalData.transaction_type,
        internalData.property_type,
        internalData.property_subtype,
        internalData.price,
        internalData.price_note,
        internalData.city,
        internalData.district,
        internalData.street,
        internalData.latitude,
        internalData.longitude,
        internalData.area,
        internalData.rooms,
        internalData.floor,
        internalData.total_floors,
        internalData.building_type,
        internalData.building_condition,
        internalData.furnished,
        internalData.has_balcony,
        internalData.has_elevator,
        internalData.has_parking,
        internalData.agent_id,
        internalData.status,
        existing.internal_id
      );
      
      propertyId = existing.internal_id;
      action = 'update';
      
    } else {
      // CREATE nové nemovitosti
      const result = db.prepare(`
        INSERT INTO properties (
          title, description, transaction_type, property_type, property_subtype,
          price, price_note, city, district, street, latitude, longitude,
          area, rooms, floor, total_floors, building_type, building_condition,
          furnished, has_balcony, has_elevator, has_parking, agent_id, status, images, main_image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        internalData.title,
        internalData.description,
        internalData.transaction_type,
        internalData.property_type,
        internalData.property_subtype,
        internalData.price,
        internalData.price_note,
        internalData.city,
        internalData.district,
        internalData.street,
        internalData.latitude,
        internalData.longitude,
        internalData.area,
        internalData.rooms,
        internalData.floor,
        internalData.total_floors,
        internalData.building_type,
        internalData.building_condition,
        internalData.furnished,
        internalData.has_balcony,
        internalData.has_elevator,
        internalData.has_parking,
        internalData.agent_id,
        internalData.status,
        internalData.images,
        internalData.main_image
      );
      
      propertyId = result.lastInsertRowid;
      action = 'create';
      
      // Uložit mapování
      db.prepare(`
        INSERT INTO import_mappings (source_id, external_id, internal_id, entity_type)
        VALUES (?, ?, ?, 'property')
      `).run(req.importSource.id, externalData.external_id, propertyId);
    }
    
    // Log úspěchu
    logImport(
      req.importSource.id,
      action,
      'property',
      propertyId,
      externalData.external_id,
      'success',
      null,
      null,
      req
    );
    
    res.json({ 
      success: true, 
      property_id: propertyId,
      external_id: externalData.external_id,
      action: action
    });
    
  } catch (error) {
    console.error('Chyba pri importu nemovitosti:', error);
    
    logImport(
      req.importSource.id,
      'create',
      'property',
      null,
      req.body.external_id,
      'error',
      error.message,
      req.body,
      req
    );
    
    res.status(500).json({ 
      error: 'Interni chyba serveru',
      message: error.message 
    });
  }
};

// DELETE /api/import/properties/:external_id - Smazání nemovitosti
export const deleteImportedProperty = async (req, res) => {
  try {
    const { external_id } = req.params;
    
    // Najít mapování
    const mapping = db.prepare(`
      SELECT internal_id FROM import_mappings 
      WHERE source_id = ? AND external_id = ? AND entity_type = 'property'
    `).get(req.importSource.id, external_id);
    
    if (!mapping) {
      return res.status(404).json({ 
        error: 'Nemovitost nenalezena',
        external_id: external_id
      });
    }
    
    // Smazat nemovitost
    db.prepare('DELETE FROM properties WHERE id = ?').run(mapping.internal_id);
    
    // Smazat mapování
    db.prepare(`
      DELETE FROM import_mappings 
      WHERE source_id = ? AND external_id = ? AND entity_type = 'property'
    `).run(req.importSource.id, external_id);
    
    // Log
    logImport(
      req.importSource.id,
      'delete',
      'property',
      mapping.internal_id,
      external_id,
      'success',
      null,
      null,
      req
    );
    
    res.json({ 
      success: true,
      external_id: external_id
    });
    
  } catch (error) {
    console.error('Chyba pri mazani nemovitosti:', error);
    
    logImport(
      req.importSource.id,
      'delete',
      'property',
      null,
      req.params.external_id,
      'error',
      error.message,
      null,
      req
    );
    
    res.status(500).json({ 
      error: 'Interni chyba serveru',
      message: error.message 
    });
  }
};

// GET /api/import/properties - Seznam importovaných nemovitostí
export const listImportedProperties = async (req, res) => {
  try {
    const properties = db.prepare(`
      SELECT 
        p.*,
        im.external_id,
        im.created_at as imported_at
      FROM properties p
      JOIN import_mappings im ON p.id = im.internal_id
      WHERE im.source_id = ? AND im.entity_type = 'property'
      ORDER BY p.created_at DESC
    `).all(req.importSource.id);
    
    res.json({ 
      success: true,
      count: properties.length,
      properties: properties
    });
    
  } catch (error) {
    console.error('Chyba pri vypisu nemovitosti:', error);
    res.status(500).json({ 
      error: 'Interni chyba serveru',
      message: error.message 
    });
  }
};

// GET /api/import/stats - Statistiky importu
export const getImportStats = async (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_imports,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed,
        COUNT(DISTINCT DATE(created_at)) as active_days
      FROM import_logs
      WHERE source_id = ?
    `).get(req.importSource.id);
    
    const recentLogs = db.prepare(`
      SELECT *
      FROM import_logs
      WHERE source_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(req.importSource.id);
    
    res.json({
      success: true,
      stats: stats,
      recent_logs: recentLogs
    });
    
  } catch (error) {
    console.error('Chyba pri nacteni statistik:', error);
    res.status(500).json({ 
      error: 'Interni chyba serveru',
      message: error.message 
    });
  }
};
