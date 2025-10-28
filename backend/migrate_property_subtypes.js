import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'realestate.db');

if (!fs.existsSync(dbPath)) {
  console.error(`❌ Database file not found at ${dbPath}`);
  process.exit(1);
}

const db = new Database(dbPath);

defineMappings();

function defineMappings() {
  const normalizeKey = (value) => {
    return value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9+]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const canonicalSets = {
    flat: new Set(['1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1', '5+kk', '5+1', '6+kk', '6+1', 'atypical', 'other']),
    house: new Set(['family_house', 'villa', 'cottage', 'cabin', 'farmhouse', 'mobile_home', 'other']),
    commercial: new Set(['apartment_building', 'office', 'retail', 'warehouse', 'production', 'restaurant', 'accommodation', 'agricultural', 'garage', 'other']),
    land: new Set(['building_plot', 'agricultural', 'forest', 'garden', 'orchard', 'meadow', 'pond', 'other']),
    project: new Set(['residential', 'commercial', 'mixed', 'other']),
    other: new Set(['garage', 'wine_cellar', 'studio', 'workshop', 'other'])
  };

  const mapping = {
    flat: {
      atypicky: 'atypical',
      atypical: 'atypical'
    },
    house: {
      rodinny_dum: 'family_house',
      radovy_dum: 'family_house',
      dvojdomek: 'family_house',
      vila: 'villa',
      chata: 'cottage',
      chalupa: 'cabin',
      domek: 'family_house'
    },
    commercial: {
      kancelar: 'office',
      kancelar_sklad: 'office',
      obchod: 'retail',
      restaurace: 'restaurant',
      sklad: 'warehouse',
      hotel: 'accommodation',
      vyrobni_prostor: 'production',
      vyrobni: 'production',
      cinzovni_dum: 'apartment_building',
      cinzovni_domy: 'apartment_building',
      apartment_building: 'apartment_building'
    },
    land: {
      stavebni_pozemek: 'building_plot',
      zemedelska_puda: 'agricultural',
      les: 'forest',
      zahrada: 'garden',
      louka: 'meadow',
      sad: 'orchard'
    },
    other: {
      garaz: 'garage',
      dilna: 'workshop',
      atelier: 'studio',
      vinny_sklep: 'wine_cellar'
    },
    '*': {
      atypicky: 'atypical'
    }
  };

  const stats = {
    propertiesUpdated: 0,
    demandsUpdated: 0,
    propertyRequirementsUpdated: 0,
    unmapped: new Set(),
    parseErrors: 0
  };

  const mapSubtype = (type, value) => {
    if (value === null || value === undefined) return value;
    const trimmed = String(value).trim();
    if (trimmed.length === 0) return null;

    const canonicalSet = canonicalSets[type];
    if (canonicalSet && canonicalSet.has(trimmed)) {
      return trimmed;
    }

    const normalized = normalizeKey(trimmed);
    if (canonicalSet && canonicalSet.has(normalized)) {
      return normalized;
    }

    if (mapping[type] && mapping[type][normalized]) {
      return mapping[type][normalized];
    }

    if (mapping['*'] && mapping['*'][normalized]) {
      return mapping['*'][normalized];
    }

    stats.unmapped.add(`${type}:${trimmed}`);
    return trimmed;
  };

  const uniqueAndTruthy = (values) => {
    return Array.from(new Set(values.filter(Boolean)));
  };

  const arraysEqual = (a, b) => {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
  };

  const propertyRows = db.prepare('SELECT id, property_type, property_subtype FROM properties').all();
  const updateProperty = db.prepare('UPDATE properties SET property_subtype = ? WHERE id = ?');

  const demandRows = db.prepare('SELECT id, transaction_type, property_type, property_subtype, property_requirements FROM demands').all();
  const updateDemand = db.prepare('UPDATE demands SET property_subtype = ?, property_requirements = ? WHERE id = ?');

  const migrate = db.transaction(() => {
    for (const row of propertyRows) {
      const mapped = mapSubtype(row.property_type, row.property_subtype);
      if (mapped !== row.property_subtype) {
        updateProperty.run(mapped, row.id);
        stats.propertiesUpdated += 1;
      }
    }

    for (const row of demandRows) {
      let updated = false;

      const subtypeList = parseSubtypeList(row.property_subtype);
      const mappedSubtypeList = uniqueAndTruthy(subtypeList.map((sub) => mapSubtype(row.property_type, sub)));
      const subtypeValue = mappedSubtypeList.length > 0 ? mappedSubtypeList[0] : null;
      if ((subtypeList[0] ?? null) !== subtypeValue) {
        updated = true;
      }

      let requirements = parseJson(row.property_requirements, stats);
      let requirementsString = row.property_requirements;

      const ensureRequirements = () => {
        if (Array.isArray(requirements) && requirements.length > 0) {
          return;
        }

        if (!row.property_type && mappedSubtypeList.length === 0) {
          return;
        }

        const requirement = {
          transaction_type: row.transaction_type || null,
          property_type: row.property_type || null
        };

        if (mappedSubtypeList.length > 0) {
          requirement.property_subtypes = mappedSubtypeList;
        }

        requirements = [requirement];
        requirementsString = JSON.stringify(requirements);
        stats.propertyRequirementsUpdated += 1;
        updated = true;
      };

      if (Array.isArray(requirements) && requirements.length > 0) {
        let reqChanged = false;

        const mappedRequirements = requirements.map((req) => {
          if (!req || typeof req !== 'object') return req;
          const clone = { ...req };
          const reqType = clone.property_type || row.property_type;

          if (clone.property_subtype) {
            const mappedSubtype = mapSubtype(reqType, clone.property_subtype);
            if (mappedSubtype !== clone.property_subtype) {
              clone.property_subtype = mappedSubtype;
              reqChanged = true;
            }
          }

          if (Array.isArray(clone.property_subtypes)) {
            const mappedList = uniqueAndTruthy(clone.property_subtypes.map((sub) => mapSubtype(reqType, sub)));
            if (mappedList.length > 0) {
              if (!arraysEqual(clone.property_subtypes, mappedList)) {
                clone.property_subtypes = mappedList;
                reqChanged = true;
              }
            } else if (clone.property_subtypes.length > 0) {
              delete clone.property_subtypes;
              reqChanged = true;
            }
          }

          return clone;
        });

        if (reqChanged) {
          requirementsString = JSON.stringify(mappedRequirements);
          stats.propertyRequirementsUpdated += 1;
          updated = true;
        }
      } else {
        ensureRequirements();
      }

      if (!requirementsString) {
        ensureRequirements();
      }

      if (updated) {
        updateDemand.run(subtypeValue, requirementsString || null, row.id);
        stats.demandsUpdated += 1;
      }
    }
  });

  migrate();

  db.close();

  console.log('✅ Migration completed');
  console.log(`• Properties updated: ${stats.propertiesUpdated}`);
  console.log(`• Demands updated: ${stats.demandsUpdated}`);
  console.log(`• Demand requirements updated: ${stats.propertyRequirementsUpdated}`);
  if (stats.unmapped.size > 0) {
    console.warn('⚠️ Unmapped subtype values:');
    for (const value of stats.unmapped) {
      console.warn(`  - ${value}`);
    }
  }
}

function parseSubtypeList(value) {
  if (value === null || value === undefined) return [];

  if (Array.isArray(value)) return value;

  const str = String(value).trim();
  if (!str) return [];

  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    // Fall back to returning single string value
  }

  return [str];
}

function parseJson(value, stats) {
  if (!value) return null;
  if (typeof value !== 'string') return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    if (stats) {
      stats.parseErrors += 1;
    }
    return null;
  }
}
