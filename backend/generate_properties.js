import Database from 'better-sqlite3';

const db = new Database('realestate.db');

// Získat agenty
const agents = db.prepare("SELECT id FROM users WHERE role = 'agent'").all();

// Reálné adresy v různých městech ČR
const locations = [
  // Praha
  { city: 'Praha 1', district: 'Praha', street: 'Václavské náměstí', zip: '110 00', lat: 50.0813, lng: 14.4267 },
  { city: 'Praha 2', district: 'Praha', street: 'Vinohradská', zip: '120 00', lat: 50.0755, lng: 14.4378 },
  { city: 'Praha 3', district: 'Praha', street: 'Seifertova', zip: '130 00', lat: 50.0835, lng: 14.4502 },
  { city: 'Praha 4', district: 'Praha', street: 'Budějovická', zip: '140 00', lat: 50.0393, lng: 14.4505 },
  { city: 'Praha 5', district: 'Praha', street: 'Plzeňská', zip: '150 00', lat: 50.0755, lng: 14.4011 },
  { city: 'Praha 6', district: 'Praha', street: 'Evropská', zip: '160 00', lat: 50.1007, lng: 14.3916 },
  { city: 'Praha 7', district: 'Praha', street: 'Dukelských hrdinů', zip: '170 00', lat: 50.1007, lng: 14.4308 },
  { city: 'Praha 8', district: 'Praha', street: 'Sokolovská', zip: '180 00', lat: 50.1007, lng: 14.4502 },
  { city: 'Praha 9', district: 'Praha', street: 'Prosecká', zip: '190 00', lat: 50.1007, lng: 14.4696 },
  { city: 'Praha 10', district: 'Praha', street: 'Moskevská', zip: '100 00', lat: 50.0674, lng: 14.4696 },
  
  // Brno
  { city: 'Brno', district: 'Brno-město', street: 'Masarykova', zip: '602 00', lat: 49.1951, lng: 16.6068 },
  { city: 'Brno', district: 'Brno-město', street: 'Česká', zip: '602 00', lat: 49.1951, lng: 16.6068 },
  { city: 'Brno', district: 'Brno-město', street: 'Husova', zip: '602 00', lat: 49.1951, lng: 16.6068 },
  { city: 'Brno', district: 'Brno-město', street: 'Veveří', zip: '616 00', lat: 49.2108, lng: 16.5987 },
  
  // Ostrava
  { city: 'Ostrava', district: 'Ostrava-město', street: '28. října', zip: '702 00', lat: 49.8209, lng: 18.2625 },
  { city: 'Ostrava', district: 'Ostrava-město', street: 'Nádražní', zip: '702 00', lat: 49.8209, lng: 18.2625 },
  { city: 'Ostrava', district: 'Ostrava-město', street: 'Sokolská třída', zip: '702 00', lat: 49.8209, lng: 18.2625 },
  
  // Plzeň
  { city: 'Plzeň', district: 'Plzeň-město', street: 'Americká', zip: '301 00', lat: 49.7477, lng: 13.3775 },
  { city: 'Plzeň', district: 'Plzeň-město', street: 'Klatovská', zip: '301 00', lat: 49.7477, lng: 13.3775 },
  { city: 'Plzeň', district: 'Plzeň-město', street: 'Slovanská alej', zip: '326 00', lat: 49.7477, lng: 13.3775 },
  
  // Liberec
  { city: 'Liberec', district: 'Liberec', street: 'Soukenné náměstí', zip: '460 01', lat: 50.7663, lng: 15.0543 },
  { city: 'Liberec', district: 'Liberec', street: 'Moskevská', zip: '460 01', lat: 50.7663, lng: 15.0543 },
  
  // Olomouc
  { city: 'Olomouc', district: 'Olomouc', street: 'Horní náměstí', zip: '779 00', lat: 49.5938, lng: 17.2509 },
  { city: 'Olomouc', district: 'Olomouc', street: 'Riegrova', zip: '779 00', lat: 49.5938, lng: 17.2509 },
  
  // České Budějovice
  { city: 'České Budějovice', district: 'České Budějovice', street: 'Lannova třída', zip: '370 01', lat: 48.9745, lng: 14.4743 },
  { city: 'České Budějovice', district: 'České Budějovice', street: 'Kněžská', zip: '370 01', lat: 48.9745, lng: 14.4743 },
  
  // Hradec Králové
  { city: 'Hradec Králové', district: 'Hradec Králové', street: 'Velké náměstí', zip: '500 03', lat: 50.2093, lng: 15.8327 },
  { city: 'Hradec Králové', district: 'Hradec Králové', street: 'Gočárova třída', zip: '500 02', lat: 50.2093, lng: 15.8327 },
  
  // Pardubice
  { city: 'Pardubice', district: 'Pardubice', street: 'Třída Míru', zip: '530 02', lat: 50.0343, lng: 15.7812 },
  { city: 'Pardubice', district: 'Pardubice', street: 'Palackého třída', zip: '530 02', lat: 50.0343, lng: 15.7812 },
  
  // Zlín
  { city: 'Zlín', district: 'Zlín', street: 'náměstí Práce', zip: '760 01', lat: 49.2266, lng: 17.6667 },
  { city: 'Zlín', district: 'Zlín', street: 'třída Tomáše Bati', zip: '760 01', lat: 49.2266, lng: 17.6667 },
  
  // Havířov
  { city: 'Havířov', district: 'Karviná', street: 'Dlouhá třída', zip: '736 01', lat: 49.7794, lng: 18.4369 },
  
  // Kladno
  { city: 'Kladno', district: 'Kladno', street: 'náměstí Starosty Pavla', zip: '272 01', lat: 50.1476, lng: 14.1028 },
  
  // Most
  { city: 'Most', district: 'Most', street: 'Budovatelů', zip: '434 01', lat: 50.5030, lng: 13.6357 },
  
  // Opava
  { city: 'Opava', district: 'Opava', street: 'Horní náměstí', zip: '746 01', lat: 49.9387, lng: 17.9025 },
  
  // Frýdek-Místek
  { city: 'Frýdek-Místek', district: 'Frýdek-Místek', street: 'Hlavní třída', zip: '738 01', lat: 49.6851, lng: 18.3481 },
  
  // Jihlava
  { city: 'Jihlava', district: 'Jihlava', street: 'Masarykovo náměstí', zip: '586 01', lat: 49.3961, lng: 15.5910 },
  
  // Teplice
  { city: 'Teplice', district: 'Teplice', street: 'Masarykova třída', zip: '415 01', lat: 50.6404, lng: 13.8245 },
  
  // Karlovy Vary
  { city: 'Karlovy Vary', district: 'Karlovy Vary', street: 'T. G. Masaryka', zip: '360 01', lat: 50.2329, lng: 12.8716 },
  
  // Děčín
  { city: 'Děčín', district: 'Děčín', street: 'Masarykovo náměstí', zip: '405 02', lat: 50.7821, lng: 14.2148 },
  
  // Chomutov
  { city: 'Chomutov', district: 'Chomutov', street: 'náměstí 1. máje', zip: '430 01', lat: 50.4607, lng: 13.4177 },
];

// Typy nemovitostí a jejich podtypy
const propertyTypes = {
  flat: ['1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1', '5+kk', '5+1'],
  house: ['rodinný dům', 'vila', 'chalupa', 'chata'],
  land: ['stavební pozemek', 'zemědělská půda', 'les', 'zahrada'],
  commercial: ['kancelář', 'obchod', 'sklad', 'restaurace', 'hotel'],
  other: ['garáž', 'vinný sklep', 'ateliér']
};

// Generátor obrázků (placeholder URLs)
const getImages = (type, count) => {
  const images = [];
  for (let i = 0; i < count; i++) {
    images.push(`https://picsum.photos/800/600?random=${Math.floor(Math.random() * 10000)}`);
  }
  return JSON.stringify(images);
};

// Generátor popisů
const descriptions = {
  flat: [
    'Moderní byt v klidné lokalitě s výbornou dostupností MHD. Byt je po kompletní rekonstrukci.',
    'Prostorný byt s balkonem a krásným výhledem. Nízké náklady na bydlení.',
    'Světlý byt v cihlové stavbě. Možnost parkování v okolí.',
    'Útulný byt ideální pro mladou rodinu. V blízkosti školy a obchody.',
    'Luxusní byt s terasou a vlastním parkovacím stáním.'
  ],
  house: [
    'Krásný rodinný dům se zahradou v klidné části města. Dům je v perfektním stavu.',
    'Prostorný dům s garáží a velkým pozemkem. Ideální pro rodinu s dětmi.',
    'Moderní vila s bazénem a wellness. Luxusní vybavení.',
    'Útulná chalupa v přírodě, ideální k rekreaci. Možnost celoročního bydlení.',
    'Rekonstruovaný rodinný dům s krásným výhledem do krajiny.'
  ],
  land: [
    'Stavební pozemek v klidné lokalitě s kompletními inženýrskými sítěmi.',
    'Velký pozemek vhodný pro výstavbu rodinného domu. Krásný výhled.',
    'Zemědělská půda v atraktivní lokalitě. Možnost změny využití.',
    'Lesní pozemek s přístupovou cestou. Ideální pro myslivce.',
    'Zahrada s chatkou a studnou. Klidná lokalita.'
  ],
  commercial: [
    'Moderní kancelářské prostory v centru města. Výborná dostupnost.',
    'Obchodní prostor na frekventované ulici. Vysoký potenciál.',
    'Skladové prostory s rampu a vlastním parkovištěm.',
    'Restaurace s kompletním vybavením a zahrádkou.',
    'Hotelový objekt v turistické lokalitě. Plně funkční provoz.'
  ],
  other: [
    'Prostorná garáž v uzavřeném areálu. Možnost skladování.',
    'Vinný sklep s degustačním prostorem. Tradiční konstrukce.',
    'Světlý ateliér vhodný pro umělce nebo kanceláře.',
    'Garáž s elektřinou a vodou. Dobrá dostupnost.',
    'Sklep s klimatizací, ideální pro skladování vína.'
  ]
};

// Generátor cen podle typu a velikosti
const generatePrice = (type, area) => {
  const basePrice = {
    flat: 80000,
    house: 60000,
    land: 1500,
    commercial: 100000,
    other: 50000
  };
  
  const price = basePrice[type] * area * (0.8 + Math.random() * 0.4);
  return Math.round(price / 10000) * 10000;
};

// Generátor plochy podle typu
const generateArea = (type, subtype) => {
  const ranges = {
    flat: [25, 150],
    house: [80, 300],
    land: [300, 2000],
    commercial: [50, 500],
    other: [15, 80]
  };
  
  const [min, max] = ranges[type];
  return Math.floor(min + Math.random() * (max - min));
};

const insertProperty = db.prepare(`
  INSERT INTO properties (
    title, description, transaction_type, property_type, property_subtype,
    price, area, rooms, floor, total_floors,
    street, city, district, zip_code,
    latitude, longitude,
    images, main_image, video_url,
    status, agent_id, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

let count = 0;

// Generovat 200 nabídek
for (let i = 0; i < 200; i++) {
  const location = locations[Math.floor(Math.random() * locations.length)];
  const agent = agents[Math.floor(Math.random() * agents.length)];
  
  const typeKeys = Object.keys(propertyTypes);
  const propertyType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
  const subtypes = propertyTypes[propertyType];
  const propertySubtype = subtypes[Math.floor(Math.random() * subtypes.length)];
  
  const transactionType = Math.random() > 0.3 ? 'sale' : 'rent';
  const area = generateArea(propertyType, propertySubtype);
  const price = generatePrice(propertyType, area);
  
  const rooms = propertyType === 'flat' ? parseInt(propertySubtype.charAt(0)) || null : null;
  const floor = propertyType === 'flat' ? Math.floor(Math.random() * 10) + 1 : null;
  const totalFloors = floor ? floor + Math.floor(Math.random() * 5) : null;
  
  const imageCount = 3 + Math.floor(Math.random() * 7);
  const images = getImages(propertyType, imageCount);
  const mainImage = JSON.parse(images)[0];
  
  const videoUrl = Math.random() > 0.7 ? `https://www.youtube.com/watch?v=dQw4w9WgXcQ` : null;
  
  const descList = descriptions[propertyType];
  const description = descList[Math.floor(Math.random() * descList.length)];
  
  const features = JSON.stringify([
    'Balkon', 'Sklep', 'Parkování', 'Výtah', 'Lodžie', 'Terasa', 'Zahrada'
  ].filter(() => Math.random() > 0.5));
  
  const title = `${transactionType === 'sale' ? 'Prodej' : 'Pronájem'} ${propertySubtype}, ${area} m², ${location.city}`;
  
  const status = ['active', 'active', 'active', 'archived'][Math.floor(Math.random() * 4)];
  
  try {
    insertProperty.run(
      title,
      description,
      transactionType,
      propertyType,
      propertySubtype,
      price,
      area,
      rooms,
      floor,
      totalFloors,
      location.street + ' ' + (Math.floor(Math.random() * 100) + 1),
      location.city,
      location.district,
      location.zip,
      location.lat + (Math.random() - 0.5) * 0.01,
      location.lng + (Math.random() - 0.5) * 0.01,
      images,
      mainImage,
      videoUrl,
      status,
      agent.id
    );
    count++;
    
    if (count % 20 === 0) {
      console.log(`Vytvořeno ${count} nabídek...`);
    }
  } catch (error) {
    console.error(`Chyba při vytváření nabídky ${i + 1}:`, error.message);
  }
}

console.log(`\n✓ Celkem vytvořeno ${count} nabídek nemovitostí`);
console.log(`  - Různé typy: byty, domy, pozemky, komerční, ostatní`);
console.log(`  - Různé lokality: Praha, Brno, Ostrava a další města ČR`);
console.log(`  - S obrázky a některé s videi`);

db.close();
