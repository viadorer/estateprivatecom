import Database from 'better-sqlite3';

const db = new Database('realestate.db');

// Získat klienty
const clients = db.prepare("SELECT id FROM users WHERE role = 'client'").all();

// Reálné lokality v ČR
const locations = [
  // Praha a okolí
  { cities: ['Praha 1', 'Praha 2', 'Praha 3'], districts: ['Praha'], label: 'Praha centrum' },
  { cities: ['Praha 4', 'Praha 5', 'Praha 6'], districts: ['Praha'], label: 'Praha západ' },
  { cities: ['Praha 7', 'Praha 8', 'Praha 9'], districts: ['Praha'], label: 'Praha sever' },
  { cities: ['Praha 10', 'Praha 11', 'Praha 12'], districts: ['Praha'], label: 'Praha východ' },
  { cities: ['Černošice', 'Říčany', 'Čelákovice'], districts: ['Praha-západ', 'Praha-východ'], label: 'Okolí Prahy' },
  
  // Brno a okolí
  { cities: ['Brno'], districts: ['Brno-město'], label: 'Brno centrum' },
  { cities: ['Brno', 'Kuřim', 'Rosice'], districts: ['Brno-město', 'Brno-venkov'], label: 'Brno a okolí' },
  
  // Ostrava a okolí
  { cities: ['Ostrava'], districts: ['Ostrava-město'], label: 'Ostrava' },
  { cities: ['Havířov', 'Karviná', 'Frýdek-Místek'], districts: ['Karviná', 'Frýdek-Místek'], label: 'Ostravsko' },
  
  // Plzeň a okolí
  { cities: ['Plzeň'], districts: ['Plzeň-město'], label: 'Plzeň' },
  { cities: ['Plzeň', 'Rokycany', 'Klatovy'], districts: ['Plzeň-město', 'Plzeň-jih'], label: 'Plzeňsko' },
  
  // Liberec a okolí
  { cities: ['Liberec', 'Jablonec nad Nisou'], districts: ['Liberec'], label: 'Liberecko' },
  
  // Olomouc a okolí
  { cities: ['Olomouc', 'Prostějov'], districts: ['Olomouc', 'Prostějov'], label: 'Olomoucko' },
  
  // České Budějovice a okolí
  { cities: ['České Budějovice', 'Tábor'], districts: ['České Budějovice', 'Tábor'], label: 'Jihočeský kraj' },
  
  // Hradec Králové a okolí
  { cities: ['Hradec Králové', 'Pardubice'], districts: ['Hradec Králové', 'Pardubice'], label: 'Východní Čechy' },
  
  // Zlín a okolí
  { cities: ['Zlín', 'Uherské Hradiště'], districts: ['Zlín', 'Uherské Hradiště'], label: 'Zlínský kraj' },
  
  // Další města
  { cities: ['Kladno', 'Mladá Boleslav'], districts: ['Kladno', 'Mladá Boleslav'], label: 'Střední Čechy' },
  { cities: ['Most', 'Teplice', 'Chomutov'], districts: ['Most', 'Teplice', 'Chomutov'], label: 'Ústecký kraj' },
  { cities: ['Karlovy Vary', 'Cheb'], districts: ['Karlovy Vary', 'Cheb'], label: 'Karlovarský kraj' },
  { cities: ['Jihlava', 'Třebíč'], districts: ['Jihlava', 'Třebíč'], label: 'Vysočina' },
];

// Typy nemovitostí a jejich podtypy
const propertyTypes = {
  flat: {
    label: 'Byt',
    subtypes: ['1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1', '5+kk', '5+1', 'atypický']
  },
  house: {
    label: 'Dům',
    subtypes: ['rodinný dům', 'vila', 'chalupa', 'chata', 'řadový dům', 'dvojdomek']
  },
  land: {
    label: 'Pozemek',
    subtypes: ['stavební pozemek', 'zemědělská půda', 'les', 'zahrada', 'louka']
  },
  commercial: {
    label: 'Komerční',
    subtypes: ['kancelář', 'obchod', 'sklad', 'restaurace', 'hotel', 'výrobní prostor']
  },
  other: {
    label: 'Ostatní',
    subtypes: ['garáž', 'vinný sklep', 'ateliér', 'dílna']
  }
};

// Generátor popisů poptávek
const generateDescription = (type, subtype, transactionType) => {
  const descriptions = {
    flat: [
      `Hledám ${subtype} k ${transactionType === 'sale' ? 'koupi' : 'pronájmu'}. Preferuji klidnou lokalitu s dobrou dostupností MHD.`,
      `Sháním ${subtype} pro mladou rodinu. Důležitý je balkon a možnost parkování.`,
      `Hledám ${subtype} v dobrém stavu, ideálně po rekonstrukci. Důležitá je světlost a dispozice.`,
      `Potřebuji ${subtype} v blízkosti centra. Preferuji vyšší patro s výtahem.`,
      `Hledám ${subtype} s možností vlastního parkování. Důležitá je klidná lokalita.`
    ],
    house: [
      `Hledám ${subtype} se zahradou. Preferuji klidnou lokalitu s dobrou občanskou vybaveností.`,
      `Sháním ${subtype} pro větší rodinu. Důležitá je garáž a dostatečně velký pozemek.`,
      `Hledám ${subtype} v dobrém stavu nebo k rekonstrukci. Preferuji okraj města.`,
      `Potřebuji ${subtype} s možností rozšíření. Důležitá je dobrá dostupnost do města.`,
      `Hledám ${subtype} v přírodě, ale s dobrou dostupností. Preferuji klidnou lokalitu.`
    ],
    land: [
      `Hledám ${subtype} pro výstavbu rodinného domu. Preferuji lokalitu s inženýrskými sítěmi.`,
      `Sháním ${subtype} v klidné oblasti. Důležitý je dobrý přístup a orientace.`,
      `Hledám ${subtype} s možností napojení na sítě. Preferuji rovinatý terén.`,
      `Potřebuji ${subtype} v blízkosti lesa. Důležitá je dobrá dostupnost.`,
      `Hledám ${subtype} s krásným výhledem. Preferuji jižní orientaci.`
    ],
    commercial: [
      `Hledám ${subtype} na frekventovaném místě. Důležitá je dobrá viditelnost a parkování.`,
      `Sháním ${subtype} v centru města. Preferuji prostory s vlastním vchodem.`,
      `Hledám ${subtype} s možností úprav. Důležitá je dobrá dostupnost pro zákazníky.`,
      `Potřebuji ${subtype} s dostatečnou kapacitou. Preferuji moderní prostory.`,
      `Hledám ${subtype} v obchodní zóně. Důležité je parkování a dostupnost.`
    ],
    other: [
      `Hledám ${subtype} v uzavřeném areálu. Preferuji dobrou dostupnost.`,
      `Sháním ${subtype} s elektřinou a vodou. Důležitá je bezpečnost.`,
      `Hledám ${subtype} v klidné lokalitě. Preferuji suché prostory.`,
      `Potřebuji ${subtype} s možností skladování. Důležitá je velikost.`,
      `Hledám ${subtype} blízko bydliště. Preferuji dobré zabezpečení.`
    ]
  };
  
  const typeDescriptions = descriptions[type] || descriptions.flat;
  return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
};

// Generátor cen podle typu
const generatePriceBudget = (type, transactionType) => {
  const budgets = {
    flat: {
      sale: { min: 2000000, max: 8000000 },
      rent: { min: 15000, max: 35000 }
    },
    house: {
      sale: { min: 4000000, max: 15000000 },
      rent: { min: 25000, max: 60000 }
    },
    land: {
      sale: { min: 500000, max: 5000000 },
      rent: { min: 5000, max: 20000 }
    },
    commercial: {
      sale: { min: 3000000, max: 20000000 },
      rent: { min: 20000, max: 100000 }
    },
    other: {
      sale: { min: 300000, max: 2000000 },
      rent: { min: 3000, max: 10000 }
    }
  };
  
  const budget = budgets[type][transactionType];
  const minPrice = budget.min + Math.random() * (budget.max - budget.min) * 0.3;
  const maxPrice = minPrice + Math.random() * (budget.max - minPrice);
  
  return {
    min: Math.round(minPrice / 10000) * 10000,
    max: Math.round(maxPrice / 10000) * 10000
  };
};

// Generátor plochy podle typu
const generateAreaRange = (type) => {
  const ranges = {
    flat: { min: 40, max: 120 },
    house: { min: 100, max: 250 },
    land: { min: 500, max: 1500 },
    commercial: { min: 60, max: 300 },
    other: { min: 20, max: 60 }
  };
  
  const range = ranges[type];
  const minArea = range.min + Math.random() * (range.max - range.min) * 0.3;
  const maxArea = minArea + Math.random() * (range.max - minArea);
  
  return {
    min: Math.floor(minArea),
    max: Math.floor(maxArea)
  };
};

const insertDemand = db.prepare(`
  INSERT INTO demands (
    transaction_type, property_type, property_subtype,
    price_min, price_max, area_min, area_max, rooms_min, rooms_max,
    cities, districts,
    status, client_id, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

let count = 0;

// Generovat 100 poptávek
for (let i = 0; i < 100; i++) {
  const client = clients[Math.floor(Math.random() * clients.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  
  const typeKeys = Object.keys(propertyTypes);
  const propertyType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
  const typeData = propertyTypes[propertyType];
  
  // Vybrat 1-3 podtypy
  const subtypeCount = 1 + Math.floor(Math.random() * 3);
  const selectedSubtypes = [];
  for (let j = 0; j < subtypeCount; j++) {
    const subtype = typeData.subtypes[Math.floor(Math.random() * typeData.subtypes.length)];
    if (!selectedSubtypes.includes(subtype)) {
      selectedSubtypes.push(subtype);
    }
  }
  
  const transactionType = Math.random() > 0.4 ? 'sale' : 'rent';
  const priceBudget = generatePriceBudget(propertyType, transactionType);
  const areaRange = generateAreaRange(propertyType);
  
  const roomsMin = propertyType === 'flat' ? (1 + Math.floor(Math.random() * 3)) : null;
  const roomsMax = roomsMin ? roomsMin + Math.floor(Math.random() * 3) : null;
  
  const description = generateDescription(propertyType, selectedSubtypes[0], transactionType);
  
  const title = `${transactionType === 'sale' ? 'Koupě' : 'Pronájem'} - ${typeData.label} (${selectedSubtypes.join(', ')}) - ${location.label}`;
  
  const status = ['active', 'active', 'active', 'fulfilled', 'cancelled'][Math.floor(Math.random() * 5)];
  
  try {
    insertDemand.run(
      transactionType,
      propertyType,
      JSON.stringify(selectedSubtypes),
      priceBudget.min,
      priceBudget.max,
      areaRange.min,
      areaRange.max,
      roomsMin,
      roomsMax,
      JSON.stringify(location.cities),
      JSON.stringify(location.districts),
      status,
      client.id
    );
    count++;
    
    if (count % 20 === 0) {
      console.log(`Vytvořeno ${count} poptávek...`);
    }
  } catch (error) {
    console.error(`Chyba při vytváření poptávky ${i + 1}:`, error.message);
  }
}

console.log(`\n✓ Celkem vytvořeno ${count} poptávek`);
console.log(`  - Různé typy: byty, domy, pozemky, komerční, ostatní`);
console.log(`  - Multi-lokality: Praha, Brno, Ostrava a další oblasti ČR`);
console.log(`  - Multi-podtypy: kombinace různých dispozic a typů`);
console.log(`  - Prodej i pronájem s realistickými cenovými rozpětími`);

db.close();
