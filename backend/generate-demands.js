import Database from 'better-sqlite3';
const db = new Database('./realestate.db');

// České lokality s GPS souřadnicemi
const locations = [
  // Praha a okolí
  { name: 'Praha', city: 'Praha', district: 'Hlavní město Praha', region: 'Hlavní město Praha', latitude: 50.08355, longitude: 14.43414 },
  { name: 'Praha 1', city: 'Praha', quarter: 'Praha 1', district: 'Praha', latitude: 50.0875, longitude: 14.4213 },
  { name: 'Praha 2', city: 'Praha', quarter: 'Praha 2', district: 'Praha', latitude: 50.0755, longitude: 14.4378 },
  { name: 'Praha 5', city: 'Praha', quarter: 'Praha 5', district: 'Praha', latitude: 50.0755, longitude: 14.4011 },
  { name: 'Praha 6', city: 'Praha', quarter: 'Praha 6', district: 'Praha', latitude: 50.1008, longitude: 14.3917 },
  { name: 'Beroun', city: 'Beroun', district: 'Beroun', latitude: 49.96382, longitude: 14.072 },
  { name: 'Kladno', city: 'Kladno', district: 'Kladno', latitude: 50.14734, longitude: 14.10285 },
  
  // Brno a okolí
  { name: 'Brno', city: 'Brno', district: 'Brno-město', region: 'Jihomoravský kraj', latitude: 49.20022, longitude: 16.60784 },
  { name: 'Brno-střed', city: 'Brno', quarter: 'Brno-střed', district: 'Brno-město', latitude: 49.1951, longitude: 16.6068 },
  { name: 'Brno-sever', city: 'Brno', quarter: 'Brno-sever', district: 'Brno-město', latitude: 49.2108, longitude: 16.6086 },
  
  // Plzeň a okolí
  { name: 'Plzeň', city: 'Plzeň', district: 'Plzeň-město', region: 'Plzeňský kraj', latitude: 49.74778, longitude: 13.37835 },
  { name: 'Rokycany', city: 'Rokycany', district: 'Rokycany', latitude: 49.74294, longitude: 13.59467 },
  
  // Ostrava a okolí
  { name: 'Ostrava', city: 'Ostrava', district: 'Ostrava-město', region: 'Moravskoslezský kraj', latitude: 49.83465, longitude: 18.28204 },
  { name: 'Havířov', city: 'Havířov', district: 'Karviná', latitude: 49.77984, longitude: 18.43688 },
  
  // České Budějovice
  { name: 'České Budějovice', city: 'České Budějovice', district: 'České Budějovice', region: 'Jihočeský kraj', latitude: 48.97447, longitude: 14.47434 },
  
  // Liberec
  { name: 'Liberec', city: 'Liberec', district: 'Liberec', region: 'Liberecký kraj', latitude: 50.76711, longitude: 15.05619 },
  
  // Hradec Králové
  { name: 'Hradec Králové', city: 'Hradec Králové', district: 'Hradec Králové', region: 'Královéhradecký kraj', latitude: 50.20923, longitude: 15.83277 },
  
  // Pardubice
  { name: 'Pardubice', city: 'Pardubice', district: 'Pardubice', region: 'Pardubický kraj', latitude: 50.04075, longitude: 15.77659 },
  
  // Olomouc
  { name: 'Olomouc', city: 'Olomouc', district: 'Olomouc', region: 'Olomoucký kraj', latitude: 49.59552, longitude: 17.25175 },
  
  // Zlín
  { name: 'Zlín', city: 'Zlín', district: 'Zlín', region: 'Zlínský kraj', latitude: 49.22645, longitude: 17.66716 },
  
  // Karlovy Vary
  { name: 'Karlovy Vary', city: 'Karlovy Vary', district: 'Karlovy Vary', region: 'Karlovarský kraj', latitude: 50.23271, longitude: 12.87117 },
  
  // Ústí nad Labem
  { name: 'Ústí nad Labem', city: 'Ústí nad Labem', district: 'Ústí nad Labem', region: 'Ústecký kraj', latitude: 50.6607, longitude: 14.03227 },
  { name: 'Teplice', city: 'Teplice', district: 'Teplice', latitude: 50.6404, longitude: 13.82451 },
  { name: 'Litvínov', city: 'Litvínov', district: 'Most', latitude: 50.60069, longitude: 13.61111 },
  { name: 'Chomutov', city: 'Chomutov', district: 'Chomutov', latitude: 50.46048, longitude: 13.41779 },
  
  // Jihlava
  { name: 'Jihlava', city: 'Jihlava', district: 'Jihlava', region: 'Kraj Vysočina', latitude: 49.39602, longitude: 15.59124 }
];

// Typy nemovitostí s podtypy
const propertyTypes = {
  flat: ['1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1', '5+kk', '5+1', 'atypical'],
  house: ['family_house', 'villa', 'cottage', 'cabin', 'farmhouse'],
  commercial: ['office', 'retail', 'warehouse', 'production', 'restaurant', 'accommodation'],
  land: ['building_plot', 'agricultural', 'forest', 'garden', 'orchard'],
  project: ['residential', 'commercial', 'mixed']
};

// Generovat náhodné číslo v rozmezí
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Vybrat náhodné prvky z pole
const randomItems = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Generovat poptávky
const generateDemands = () => {
  const demands = [];
  
  for (let i = 0; i < 300; i++) {
    const transactionType = Math.random() > 0.7 ? 'rent' : 'sale';
    
    // Počet typů nemovitostí (1-3)
    const numPropertyTypes = randomBetween(1, 3);
    const propertyRequirements = [];
    
    // Vybrat náhodné typy nemovitostí
    const selectedTypes = randomItems(Object.keys(propertyTypes), numPropertyTypes);
    
    for (const propType of selectedTypes) {
      const subtype = propertyTypes[propType][randomBetween(0, propertyTypes[propType].length - 1)];
      
      const filters = {};
      
      // Přidat filtry podle typu
      if (propType === 'flat') {
        if (Math.random() > 0.3) {
          filters.rooms = {
            min: randomBetween(1, 3),
            max: randomBetween(3, 6)
          };
        }
        if (Math.random() > 0.4) {
          filters.floor = {
            min: randomBetween(0, 2),
            max: randomBetween(5, 15)
          };
        }
        if (Math.random() > 0.2) {
          filters.area = {
            min: randomBetween(30, 60),
            max: randomBetween(80, 150)
          };
        }
      } else if (propType === 'house') {
        if (Math.random() > 0.3) {
          filters.rooms = {
            min: randomBetween(3, 4),
            max: randomBetween(5, 8)
          };
        }
        if (Math.random() > 0.2) {
          filters.area = {
            min: randomBetween(80, 120),
            max: randomBetween(150, 300)
          };
        }
        if (Math.random() > 0.4) {
          filters.land_area = {
            min: randomBetween(300, 500),
            max: randomBetween(800, 2000)
          };
        }
      } else if (propType === 'land') {
        if (Math.random() > 0.2) {
          filters.land_area = {
            min: randomBetween(500, 1000),
            max: randomBetween(2000, 10000)
          };
        }
      } else if (propType === 'commercial') {
        if (Math.random() > 0.2) {
          filters.area = {
            min: randomBetween(50, 100),
            max: randomBetween(200, 500)
          };
        }
      }
      
      propertyRequirements.push({
        transaction_type: transactionType,
        property_type: propType,
        property_subtype: subtype,
        filters
      });
    }
    
    // Společné filtry
    const commonFilters = {
      price: {}
    };
    
    if (transactionType === 'sale') {
      commonFilters.price.min = randomBetween(1, 5) * 1000000;
      commonFilters.price.max = randomBetween(5, 15) * 1000000;
    } else {
      commonFilters.price.min = randomBetween(5, 15) * 1000;
      commonFilters.price.max = randomBetween(20, 50) * 1000;
    }
    
    // Lokality (1-5)
    const numLocations = randomBetween(1, 5);
    const selectedLocations = randomItems(locations, numLocations);
    
    // Platnost
    const validityDays = [14, 30, 60, 0][randomBetween(0, 3)];
    
    demands.push({
      client_id: 1, // Admin
      transaction_type: propertyRequirements[0].transaction_type,
      property_type: propertyRequirements[0].property_type,
      property_subtype: propertyRequirements[0].property_subtype,
      property_requirements: JSON.stringify(propertyRequirements),
      common_filters: JSON.stringify(commonFilters),
      locations: JSON.stringify(selectedLocations),
      email_notifications: Math.random() > 0.3 ? 1 : 0,
      status: 'active',
      validity_days: validityDays,
      valid_until: validityDays > 0 ? new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString() : null,
      last_confirmed_at: new Date().toISOString()
    });
  }
  
  return demands;
};

// Vložit poptávky do databáze
const insertDemands = () => {
  const demands = generateDemands();
  
  const stmt = db.prepare(`
    INSERT INTO demands (
      client_id, transaction_type, property_type, property_subtype,
      property_requirements, common_filters, locations,
      email_notifications, status, valid_until, last_confirmed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertMany = db.transaction((demands) => {
    for (const demand of demands) {
      stmt.run(
        demand.client_id,
        demand.transaction_type,
        demand.property_type,
        demand.property_subtype,
        demand.property_requirements,
        demand.common_filters,
        demand.locations,
        demand.email_notifications,
        demand.status,
        demand.valid_until,
        demand.last_confirmed_at
      );
    }
  });
  
  insertMany(demands);
  console.log(`✅ Vloženo ${demands.length} poptávek`);
};

// Spustit
insertDemands();
db.close();
