import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'realestate.db'));

// Reálné lokality po celé ČR s GPS souřadnicemi pro pozemky
const landLocations = [
  { city: 'Praha', district: 'Praha-západ', street: 'Stavební parcela 123', zip: '252 41', lat: 50.0755, lng: 14.3378 },
  { city: 'Říčany', district: 'Praha-východ', street: 'Pozemek 456/12', zip: '251 01', lat: 49.9917, lng: 14.6544 },
  { city: 'Černošice', district: 'Praha-západ', street: 'Parcela 789/3', zip: '252 28', lat: 49.9608, lng: 14.3189 },
  { city: 'Beroun', district: 'Beroun', street: 'Stavební pozemek 234/5', zip: '266 01', lat: 49.9639, lng: 14.0722 },
  { city: 'Brno', district: 'Brno-venkov', street: 'Pozemek 567/8', zip: '664 34', lat: 49.1951, lng: 16.5068 },
  { city: 'Modřice', district: 'Brno-venkov', street: 'Stavební parcela 890/1', zip: '664 42', lat: 49.1436, lng: 16.6169 },
  { city: 'Kuřim', district: 'Brno-venkov', street: 'Pozemek 123/45', zip: '664 34', lat: 49.2981, lng: 16.5311 },
  { city: 'Ostrava', district: 'Ostrava-jih', street: 'Parcela 456/78', zip: '700 30', lat: 49.8009, lng: 18.2225 },
  { city: 'Havířov', district: 'Karviná', street: 'Stavební pozemek 789/90', zip: '736 01', lat: 49.7797, lng: 18.4369 },
  { city: 'Plzeň', district: 'Plzeň-sever', street: 'Pozemek 234/56', zip: '330 00', lat: 49.7684, lng: 13.3436 },
  { city: 'Starý Plzenec', district: 'Plzeň-jih', street: 'Parcela 567/89', zip: '332 02', lat: 49.7114, lng: 13.4594 },
  { city: 'Liberec', district: 'Liberec', street: 'Stavební pozemek 890/12', zip: '460 01', lat: 50.7563, lng: 15.0443 },
  { city: 'Jablonec nad Nisou', district: 'Jablonec nad Nisou', street: 'Pozemek 123/34', zip: '466 01', lat: 50.7243, lng: 15.1711 },
  { city: 'Hradec Králové', district: 'Hradec Králové', street: 'Parcela 456/56', zip: '500 02', lat: 50.1993, lng: 15.8227 },
  { city: 'Pardubice', district: 'Pardubice', street: 'Stavební pozemek 789/78', zip: '530 02', lat: 50.0243, lng: 15.7712 },
  { city: 'Olomouc', district: 'Olomouc', street: 'Pozemek 234/90', zip: '779 00', lat: 49.6138, lng: 17.2709 },
  { city: 'Prostějov', district: 'Prostějov', street: 'Parcela 567/12', zip: '796 01', lat: 49.4719, lng: 17.1119 },
  { city: 'Zlín', district: 'Zlín', street: 'Stavební pozemek 890/34', zip: '760 01', lat: 49.2338, lng: 17.6819 },
  { city: 'Uherské Hradiště', district: 'Uherské Hradiště', street: 'Pozemek 123/56', zip: '686 01', lat: 49.0697, lng: 17.4600 },
  { city: 'České Budějovice', district: 'České Budějovice', street: 'Parcela 456/78', zip: '370 01', lat: 48.9645, lng: 14.4643 },
  { city: 'Tábor', district: 'Tábor', street: 'Stavební pozemek 789/90', zip: '390 01', lat: 49.4144, lng: 14.6578 },
  { city: 'Písek', district: 'Písek', street: 'Pozemek 234/12', zip: '397 01', lat: 49.3088, lng: 14.1475 },
  { city: 'Jihlava', district: 'Jihlava', street: 'Parcela 567/34', zip: '586 01', lat: 49.3861, lng: 15.5811 },
  { city: 'Třebíč', district: 'Třebíč', street: 'Stavební pozemek 890/56', zip: '674 01', lat: 49.2149, lng: 15.8819 },
  { city: 'Karlovy Vary', district: 'Karlovy Vary', street: 'Pozemek 123/78', zip: '360 01', lat: 50.2429, lng: 12.8819 },
  { city: 'Cheb', district: 'Cheb', street: 'Parcela 456/90', zip: '350 02', lat: 50.0797, lng: 12.3739 },
  { city: 'Ústí nad Labem', district: 'Ústí nad Labem', street: 'Stavební pozemek 789/12', zip: '400 01', lat: 50.6507, lng: 14.0322 },
  { city: 'Teplice', district: 'Teplice', street: 'Pozemek 234/34', zip: '415 01', lat: 50.6404, lng: 13.8246 },
  { city: 'Most', district: 'Most', street: 'Parcela 567/56', zip: '434 01', lat: 50.5030, lng: 13.6363 },
  { city: 'Chomutov', district: 'Chomutov', street: 'Stavební pozemek 890/78', zip: '430 01', lat: 50.4607, lng: 13.4178 }
];

// Lokality pro projekty (bytové domy, rezidenční projekty)
const projectLocations = [
  { city: 'Praha', district: 'Karlín', street: 'Rohanské nábřeží 123', zip: '186 00', lat: 50.0933, lng: 14.4508 },
  { city: 'Praha', district: 'Smíchov', street: 'Nádražní 456', zip: '150 00', lat: 50.0707, lng: 14.4041 },
  { city: 'Praha', district: 'Holešovice', street: 'Dukelských hrdinů 789', zip: '170 00', lat: 50.1033, lng: 14.4378 },
  { city: 'Praha', district: 'Libeň', street: 'Zenklova 234', zip: '180 00', lat: 50.1033, lng: 14.4678 },
  { city: 'Brno', district: 'Brno-střed', street: 'Hybešova 567', zip: '602 00', lat: 49.1951, lng: 16.6068 },
  { city: 'Brno', district: 'Černá Pole', street: 'Lesnická 890', zip: '613 00', lat: 49.2108, lng: 16.6208 },
  { city: 'Brno', district: 'Žabovřesky', street: 'Studentská 123', zip: '616 00', lat: 49.2108, lng: 16.5988 },
  { city: 'Ostrava', district: 'Moravská Ostrava', street: 'Nádražní 456', zip: '702 00', lat: 49.8209, lng: 18.2625 },
  { city: 'Ostrava', district: 'Poruba', street: 'Opavská 789', zip: '708 00', lat: 49.8209, lng: 18.1625 },
  { city: 'Plzeň', district: 'Plzeň 1', street: 'Americká 234', zip: '301 00', lat: 49.7384, lng: 13.3736 },
  { city: 'Plzeň', district: 'Plzeň 3', street: 'Klatovská 567', zip: '301 00', lat: 49.7284, lng: 13.3636 },
  { city: 'Liberec', district: 'Liberec I', street: 'Soukenné náměstí 890', zip: '460 01', lat: 50.7663, lng: 15.0543 },
  { city: 'Olomouc', district: 'Olomouc-střed', street: 'Tř. Svobody 123', zip: '779 00', lat: 49.5938, lng: 17.2509 },
  { city: 'České Budějovice', district: 'České Budějovice 1', street: 'Lannova třída 456', zip: '370 01', lat: 48.9745, lng: 14.4743 },
  { city: 'Hradec Králové', district: 'Hradec Králové 1', street: 'Gočárova třída 789', zip: '500 02', lat: 50.2093, lng: 15.8327 },
  { city: 'Pardubice', district: 'Pardubice I', street: 'Třída Míru 234', zip: '530 02', lat: 50.0343, lng: 15.7812 },
  { city: 'Zlín', district: 'Zlín-střed', street: 'Třída Tomáše Bati 567', zip: '760 01', lat: 49.2238, lng: 17.6619 },
  { city: 'Karlovy Vary', district: 'Karlovy Vary 1', street: 'Tržní náměstí 890', zip: '360 01', lat: 50.2329, lng: 12.8719 },
  { city: 'Ústí nad Labem', district: 'Ústí nad Labem-střed', street: 'Mírové náměstí 123', zip: '400 01', lat: 50.6607, lng: 14.0422 },
  { city: 'Jihlava', district: 'Jihlava-město', street: 'Masarykovo náměstí 456', zip: '586 01', lat: 49.3961, lng: 15.5911 }
];

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

const insertProperty = db.prepare(`
  INSERT INTO properties (
    title, description, transaction_type, property_type, property_subtype,
    price, price_note, city, district, street, zip_code, latitude, longitude,
    area, land_area, rooms, floor, total_floors, 
    building_type, building_condition, ownership,
    furnished, has_balcony, has_loggia, has_terrace, has_cellar, 
    has_garage, has_parking, has_elevator, has_garden, has_pool,
    energy_rating, heating_type,
    is_auction, exclusively_at_rk, attractive_offer,
    agent_id, status, views_count,
    images, main_image
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

console.log('Začínám generovat 30 pozemků...\n');

// Generování 30 pozemků
const landTypes = ['building', 'agricultural', 'forest', 'recreational'];
const landTypeLabels = {
  'building': 'Stavební pozemek',
  'agricultural': 'Zemědělský pozemek',
  'forest': 'Lesní pozemek',
  'recreational': 'Rekreační pozemek'
};

for (let i = 0; i < 30; i++) {
  const location = landLocations[i];
  const landType = randomChoice(landTypes);
  const title = `${landTypeLabels[landType]} - ${location.city}`;
  
  const descriptions = [
    'Pozemek v klidné lokalitě s výbornou dostupností. Všechny inženýrské sítě v dosahu. Ideální pro výstavbu rodinného domu.',
    'Rovinatý pozemek s možností napojení na všechny sítě. Výborná lokalita s občanskou vybaveností v okolí.',
    'Stavební parcela v rozvojové oblasti. Elektrická energie a voda na hranici pozemku. Klidná lokalita s výhledem.',
    'Pozemek s vydaným územním rozhodnutím. Přístup po zpevněné komunikaci. Ideální pro rodinnou výstavbu.',
    'Atraktivní pozemek v žádané lokalitě. Možnost napojení na inženýrské sítě. Výborná investiční příležitost.'
  ];
  
  const area = random(500, 3000);
  const price = landType === 'building' ? random(1500000, 8000000) : random(500000, 3000000);
  
  const imageCount = random(3, 6);
  const images = [];
  for (let j = 0; j < imageCount; j++) {
    images.push(`https://picsum.photos/800/600?random=${(i + 200) * 10 + j}`);
  }
  
  try {
    insertProperty.run(
      title,
      randomChoice(descriptions),
      'sale',
      'land',
      landType,
      price,
      null,
      location.city,
      location.district,
      location.street,
      location.zip,
      location.lat,
      location.lng,
      area,
      area,
      null,
      null,
      null,
      null,
      null,
      'personal',
      'not_furnished',
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      null,
      null,
      random(0, 1),
      random(0, 1),
      random(0, 1),
      1,
      'active',
      random(0, 100),
      JSON.stringify(images),
      images[0]
    );
    
    console.log(`${i + 1}. ${title} - ${price.toLocaleString('cs-CZ')} Kč (${area} m²)`);
  } catch (error) {
    console.error(`Chyba při vkládání pozemku ${i + 1}:`, error.message);
  }
}

console.log('\n\nZačínám generovat 20 projektů...\n');

// Generování 20 projektů (bytové domy, rezidenční projekty)
const projectTypes = [
  { name: 'Rezidenční projekt', units: [20, 50], pricePerUnit: [3500000, 8000000] },
  { name: 'Bytový dům', units: [10, 30], pricePerUnit: [4000000, 9000000] },
  { name: 'Polyfunkční dům', units: [15, 40], pricePerUnit: [3000000, 7000000] },
  { name: 'Developerský projekt', units: [30, 80], pricePerUnit: [3500000, 8500000] }
];

for (let i = 0; i < 20; i++) {
  const location = projectLocations[i];
  const projectType = randomChoice(projectTypes);
  const units = random(projectType.units[0], projectType.units[1]);
  const title = `${projectType.name} ${units} jednotek - ${location.city}`;
  
  const descriptions = [
    'Moderní rezidenční projekt v atraktivní lokalitě. Kvalitní provedení, nízká energetická náročnost. Parkování v podzemních garážích.',
    'Nový bytový dům s nadstandardním vybavením. Výborná dostupnost centra i dálnice. Zelená terasa na střeše.',
    'Exkluzivní projekt v prémiové lokalitě. Vysoký standard bydlení, recepce, fitness centrum. Dokončení 2025.',
    'Moderní bydlení v klidné části města. Bytové jednotky různých dispozic. Vlastní dětské hřiště a park.',
    'Investiční příležitost - developerský projekt v rozvojové oblasti. Vysoký potenciál zhodnocení.'
  ];
  
  const totalArea = random(2000, 8000);
  const avgPricePerUnit = random(projectType.pricePerUnit[0], projectType.pricePerUnit[1]);
  const totalPrice = units * avgPricePerUnit;
  
  const imageCount = random(5, 10);
  const images = [];
  for (let j = 0; j < imageCount; j++) {
    images.push(`https://picsum.photos/800/600?random=${(i + 300) * 10 + j}`);
  }
  
  try {
    insertProperty.run(
      title,
      randomChoice(descriptions),
      'sale',
      'commercial',
      'project',
      totalPrice,
      `Projekt ${units} bytových jednotek`,
      location.city,
      location.district,
      location.street,
      location.zip,
      location.lat,
      location.lng,
      totalArea,
      null,
      units,
      null,
      null,
      'brick',
      'new_building',
      'personal',
      'not_furnished',
      0, 0, 0, 0, 1, 1, 1, 0, 0,
      'A',
      'central',
      0,
      1,
      1,
      1,
      'active',
      random(50, 200),
      JSON.stringify(images),
      images[0]
    );
    
    console.log(`${i + 1}. ${title} - ${totalPrice.toLocaleString('cs-CZ')} Kč`);
  } catch (error) {
    console.error(`Chyba při vkládání projektu ${i + 1}:`, error.message);
  }
}

console.log('\n✅ Úspěšně přidáno 30 pozemků a 20 projektů!');
console.log('📍 Všechny nemovitosti mají GPS souřadnice a patří adminovi (agent_id = 1)');

db.close();
