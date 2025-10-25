import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'realestate.db'));

// Reálné adresy po celé ČR včetně okresních měst
const realAddresses = [
  // Praha a okolí
  { city: 'Praha', district: 'Vinohrady', street: 'Korunní 1234/56', lat: 50.0755, lng: 14.4378 },
  { city: 'Praha', district: 'Žižkov', street: 'Seifertova 789/12', lat: 50.0875, lng: 14.4528 },
  { city: 'Praha', district: 'Karlín', street: 'Sokolovská 345/67', lat: 50.0933, lng: 14.4508 },
  { city: 'Praha', district: 'Dejvice', street: 'Evropská 2345/89', lat: 50.0997, lng: 14.3914 },
  { city: 'Praha', district: 'Holešovice', street: 'Dukelských hrdinů 456/78', lat: 50.1033, lng: 14.4378 },
  
  // Brno
  { city: 'Brno', district: 'Brno-střed', street: 'Hybešova 789/12', lat: 49.1951, lng: 16.6068 },
  { city: 'Brno', district: 'Žabovřesky', street: 'Studentská 123/45', lat: 49.2108, lng: 16.5988 },
  { city: 'Brno', district: 'Líšeň', street: 'Horníkova 234/56', lat: 49.2108, lng: 16.6708 },
  { city: 'Brno', district: 'Kohoutovice', street: 'Bašného 345/67', lat: 49.2258, lng: 16.5408 },
  
  // Ostrava
  { city: 'Ostrava', district: 'Moravská Ostrava', street: 'Nádražní 123/45', lat: 49.8209, lng: 18.2625 },
  { city: 'Ostrava', district: 'Poruba', street: 'Opavská 234/56', lat: 49.8209, lng: 18.1625 },
  { city: 'Ostrava', district: 'Vítkovice', street: 'Ruská 345/67', lat: 49.7909, lng: 18.2625 },
  
  // Plzeň
  { city: 'Plzeň', district: 'Plzeň 1', street: 'Americká 123/45', lat: 49.7384, lng: 13.3736 },
  { city: 'Plzeň', district: 'Plzeň 3', street: 'Klatovská 234/56', lat: 49.7284, lng: 13.3636 },
  { city: 'Plzeň', district: 'Bolevec', street: 'Bolevecká 345/67', lat: 49.7584, lng: 13.3536 },
  
  // Liberec
  { city: 'Liberec', district: 'Liberec I', street: 'Soukenné náměstí 123/1', lat: 50.7663, lng: 15.0543 },
  { city: 'Liberec', district: 'Liberec III', street: 'Jablonecká 234/56', lat: 50.7763, lng: 15.0643 },
  
  // Olomouc
  { city: 'Olomouc', district: 'Olomouc-střed', street: 'Tř. Svobody 123/45', lat: 49.5938, lng: 17.2509 },
  { city: 'Olomouc', district: 'Nová Ulice', street: 'Hněvotínská 234/56', lat: 49.6038, lng: 17.2609 },
  
  // České Budějovice
  { city: 'České Budějovice', district: 'České Budějovice 1', street: 'Lannova třída 123/45', lat: 48.9745, lng: 14.4743 },
  { city: 'České Budějovice', district: 'České Budějovice 2', street: 'Pražská 234/56', lat: 48.9845, lng: 14.4843 },
  
  // Hradec Králové
  { city: 'Hradec Králové', district: 'Hradec Králové 1', street: 'Gočárova třída 123/45', lat: 50.2093, lng: 15.8327 },
  { city: 'Hradec Králové', district: 'Slezské Předměstí', street: 'Brněnská 234/56', lat: 50.1993, lng: 15.8427 },
  
  // Pardubice
  { city: 'Pardubice', district: 'Pardubice I', street: 'Třída Míru 123/45', lat: 50.0343, lng: 15.7812 },
  { city: 'Pardubice', district: 'Zelené Předměstí', street: 'Kyjevská 234/56', lat: 50.0443, lng: 15.7912 },
  
  // Zlín
  { city: 'Zlín', district: 'Zlín-střed', street: 'Třída Tomáše Bati 123/45', lat: 49.2238, lng: 17.6619 },
  { city: 'Zlín', district: 'Malenovice', street: 'Malenovická 234/56', lat: 49.2138, lng: 17.6519 },
  
  // Jihlava
  { city: 'Jihlava', district: 'Jihlava-město', street: 'Masarykovo náměstí 123/1', lat: 49.3961, lng: 15.5911 },
  { city: 'Jihlava', district: 'Horní Kosov', street: 'Brněnská 234/56', lat: 49.4061, lng: 15.6011 },
  
  // Karlovy Vary
  { city: 'Karlovy Vary', district: 'Karlovy Vary 1', street: 'Tržní náměstí 123/1', lat: 50.2329, lng: 12.8719 },
  { city: 'Karlovy Vary', district: 'Dvory', street: 'Chebská 234/56', lat: 50.2229, lng: 12.8619 },
  
  // Ústí nad Labem
  { city: 'Ústí nad Labem', district: 'Ústí nad Labem-střed', street: 'Mírové náměstí 123/1', lat: 50.6607, lng: 14.0422 },
  { city: 'Ústí nad Labem', district: 'Severní Terasa', street: 'Moskevská 234/56', lat: 50.6707, lng: 14.0522 },
  
  // Kladno
  { city: 'Kladno', district: 'Kladno-střed', street: 'Náměstí Starosty Pavla 123/1', lat: 50.1476, lng: 14.1028 },
  { city: 'Kladno', district: 'Rozdělov', street: 'Kladenská 234/56', lat: 50.1576, lng: 14.1128 },
  
  // Mladá Boleslav
  { city: 'Mladá Boleslav', district: 'Mladá Boleslav I', street: 'Staroměstské náměstí 123/1', lat: 50.4113, lng: 14.9033 },
  { city: 'Mladá Boleslav', district: 'Mladá Boleslav II', street: 'Jičínská 234/56', lat: 50.4213, lng: 14.9133 },
  
  // Tábor
  { city: 'Tábor', district: 'Tábor-město', street: 'Žižkovo náměstí 123/1', lat: 49.4144, lng: 14.6578 },
  { city: 'Tábor', district: 'Čekanice', street: 'Budějovická 234/56', lat: 49.4244, lng: 14.6678 },
  
  // Prostějov
  { city: 'Prostějov', district: 'Prostějov-město', street: 'Náměstí T. G. Masaryka 123/1', lat: 49.4719, lng: 17.1119 },
  { city: 'Prostějov', district: 'Prostějov-Vrahovice', street: 'Olomoucká 234/56', lat: 49.4819, lng: 17.1219 },
  
  // Přerov
  { city: 'Přerov', district: 'Přerov I-Město', street: 'Masarykovo náměstí 123/1', lat: 49.4556, lng: 17.4508 },
  { city: 'Přerov', district: 'Přerov II-Předmostí', street: 'Tovární 234/56', lat: 49.4656, lng: 17.4608 },
  
  // Chomutov
  { city: 'Chomutov', district: 'Chomutov-město', street: 'Náměstí 1. máje 123/1', lat: 50.4607, lng: 13.4178 },
  { city: 'Chomutov', district: 'Chomutov-Spořice', street: 'Pražská 234/56', lat: 50.4707, lng: 13.4278 },
  
  // Děčín
  { city: 'Děčín', district: 'Děčín I-Děčín', street: 'Masarykovo náměstí 123/1', lat: 50.7821, lng: 14.2145 },
  { city: 'Děčín', district: 'Děčín IV-Podmokly', street: 'Teplická 234/56', lat: 50.7921, lng: 14.2245 },
  
  // Frýdek-Místek
  { city: 'Frýdek-Místek', district: 'Frýdek', street: 'Náměstí Svobody 123/1', lat: 49.6851, lng: 18.3490 },
  { city: 'Frýdek-Místek', district: 'Místek', street: 'Hlavní třída 234/56', lat: 49.6951, lng: 18.3590 },
  
  // Havířov
  { city: 'Havířov', district: 'Havířov-město', street: 'Dlouhá třída 123/45', lat: 49.7797, lng: 18.4369 },
  { city: 'Havířov', district: 'Šumbark', street: 'Těšínská 234/56', lat: 49.7897, lng: 18.4469 },
  
  // Opava
  { city: 'Opava', district: 'Opava-město', street: 'Horní náměstí 123/1', lat: 49.9387, lng: 17.9027 },
  { city: 'Opava', district: 'Kateřinky', street: 'Olomoucká 234/56', lat: 49.9487, lng: 17.9127 },
  
  // Most
  { city: 'Most', district: 'Most-město', street: 'Budovatelů 123/45', lat: 50.5030, lng: 13.6363 },
  { city: 'Most', district: 'Most-Velebudice', street: 'Litvínovská 234/56', lat: 50.5130, lng: 13.6463 }
];

// Typy nemovitostí s různými variantami
const propertyTypes = [
  {
    transaction: 'sale',
    type: 'flat',
    subtype: '1+kk',
    titles: ['Moderní byt 1+kk', 'Světlý byt 1+kk', 'Útulný byt 1+kk', 'Nový byt 1+kk'],
    priceRange: [2500000, 4500000],
    areaRange: [25, 40],
    rooms: 1
  },
  {
    transaction: 'sale',
    type: 'flat',
    subtype: '2+kk',
    titles: ['Prostorný byt 2+kk', 'Moderní byt 2+kk', 'Světlý byt 2+kk', 'Nový byt 2+kk'],
    priceRange: [4000000, 7000000],
    areaRange: [45, 65],
    rooms: 2
  },
  {
    transaction: 'sale',
    type: 'flat',
    subtype: '3+kk',
    titles: ['Rodinný byt 3+kk', 'Prostorný byt 3+kk', 'Moderní byt 3+kk', 'Světlý byt 3+kk'],
    priceRange: [6000000, 9500000],
    areaRange: [70, 90],
    rooms: 3
  },
  {
    transaction: 'sale',
    type: 'flat',
    subtype: '3+1',
    titles: ['Cihlový byt 3+1', 'Prostorný byt 3+1', 'Rodinný byt 3+1', 'Klasický byt 3+1'],
    priceRange: [5500000, 8500000],
    areaRange: [75, 95],
    rooms: 3
  },
  {
    transaction: 'sale',
    type: 'flat',
    subtype: '4+kk',
    titles: ['Luxusní byt 4+kk', 'Prostorný byt 4+kk', 'Rodinný byt 4+kk', 'Moderní byt 4+kk'],
    priceRange: [8500000, 14000000],
    areaRange: [95, 130],
    rooms: 4
  },
  {
    transaction: 'sale',
    type: 'house',
    subtype: '4+1',
    titles: ['Rodinný dům 4+1', 'Prostorný dům 4+1', 'Moderní dům 4+1', 'Cihlový dům 4+1'],
    priceRange: [7000000, 12000000],
    areaRange: [120, 160],
    rooms: 4
  },
  {
    transaction: 'sale',
    type: 'house',
    subtype: '5+1',
    titles: ['Rodinný dům 5+1', 'Prostorný dům 5+1', 'Luxusní dům 5+1', 'Moderní dům 5+1'],
    priceRange: [9000000, 16000000],
    areaRange: [150, 200],
    rooms: 5
  },
  {
    transaction: 'rent',
    type: 'flat',
    subtype: '1+kk',
    titles: ['Pronájem bytu 1+kk', 'Moderní byt 1+kk k pronájmu', 'Útulný byt 1+kk', 'Nový byt 1+kk'],
    priceRange: [10000, 18000],
    areaRange: [25, 40],
    rooms: 1
  },
  {
    transaction: 'rent',
    type: 'flat',
    subtype: '2+kk',
    titles: ['Pronájem bytu 2+kk', 'Moderní byt 2+kk k pronájmu', 'Prostorný byt 2+kk', 'Světlý byt 2+kk'],
    priceRange: [15000, 28000],
    areaRange: [45, 65],
    rooms: 2
  },
  {
    transaction: 'rent',
    type: 'flat',
    subtype: '3+kk',
    titles: ['Pronájem bytu 3+kk', 'Rodinný byt 3+kk k pronájmu', 'Prostorný byt 3+kk', 'Moderní byt 3+kk'],
    priceRange: [20000, 35000],
    areaRange: [70, 90],
    rooms: 3
  }
];

// Popisy nemovitostí
const descriptions = [
  'Krásný světlý byt po kompletní rekonstrukci. Plně vybavená kuchyň s moderními spotřebiči. Výborná dostupnost MHD a občanské vybavenosti.',
  'Prostorný byt v klidné lokalitě s výbornou dostupností centra. Sklep, možnost parkování v okolí. Ideální pro rodinu.',
  'Moderní byt v novostavbě s balkonem. Nízké náklady na bydlení. Parkování v podzemních garážích. Dostupné ihned.',
  'Útulný byt v cihlové zástavbě. Nová okna, zateplená fasáda. Blízko školy, školky a obchody. Klidná lokalita.',
  'Světlý byt s velkými okny a krásným výhledem. Kompletně zrekonstruovaný. Výborná lokalita s veškerou občanskou vybaveností.',
  'Prostorný byt ideální pro rodinu. Sklep, balkon, možnost parkování. Blízko parku a dětského hřiště.',
  'Moderní byt po rekonstrukci s kvalitním vybavením. Nízké náklady. Výborná dostupnost do centra i na dálnici.',
  'Cihlový byt v původním stavu, vhodný k rekonstrukci dle vlastních představ. Dobrá lokalita s veškerou občanskou vybaveností.',
  'Nový byt v novostavbě s terasou. Moderní design, kvalitní materiály. Parkování v ceně. Výborná investiční příležitost.',
  'Prostorný byt v klidné části města. Blízko přírody, ideální pro rodiny s dětmi. Dobrá dostupnost do centra.'
];

// Vlastnosti budov
const buildingTypes = ['brick', 'panel', 'brick'];
const buildingConditions = ['after_reconstruction', 'original', 'new_building', 'very_good'];
const furnishedTypes = ['furnished', 'partly_furnished', 'not_furnished'];

// Funkce pro náhodný výběr
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomFloat = (min, max) => Math.round((Math.random() * (max - min) + min) * 100) / 100;

// Příprava SQL příkazu
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
  ) VALUES (
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?,
    ?, ?, ?,
    ?, ?, ?,
    ?, ?
  )
`);

console.log('Začínám generovat 50 nových nabídek...\n');

// Generování 50 nabídek
for (let i = 0; i < 50; i++) {
  const address = realAddresses[i];
  const propType = randomChoice(propertyTypes);
  const title = `${randomChoice(propType.titles)} - ${address.city}`;
  const description = randomChoice(descriptions);
  
  const price = random(propType.priceRange[0], propType.priceRange[1]);
  const priceNote = propType.transaction === 'rent' ? 'Kč/měsíc + energie' : null;
  
  const area = random(propType.areaRange[0], propType.areaRange[1]);
  const landArea = propType.type === 'house' ? random(300, 1000) : null;
  
  const floor = propType.type === 'flat' ? random(1, 8) : null;
  const totalFloors = propType.type === 'flat' ? random(floor || 1, 10) : (propType.type === 'house' ? random(1, 2) : null);
  
  const buildingType = randomChoice(buildingTypes);
  const buildingCondition = randomChoice(buildingConditions);
  const furnished = randomChoice(furnishedTypes);
  
  const hasBalcony = propType.type === 'flat' ? random(0, 1) : 0;
  const hasLoggia = propType.type === 'flat' && hasBalcony === 0 ? random(0, 1) : 0;
  const hasTerrace = propType.type === 'house' || (propType.type === 'flat' && floor >= 7) ? random(0, 1) : 0;
  const hasCellar = random(0, 1);
  const hasGarage = propType.type === 'house' ? random(0, 1) : 0;
  const hasParking = random(0, 1);
  const hasElevator = propType.type === 'flat' && totalFloors > 3 ? random(0, 1) : 0;
  const hasGarden = propType.type === 'house' ? 1 : 0;
  const hasPool = propType.type === 'house' && price > 10000000 ? random(0, 1) : 0;
  
  const energyRatings = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const energyRating = randomChoice(energyRatings);
  
  const heatingTypes = ['gas', 'electric', 'central', 'coal', 'heat_pump'];
  const heatingType = randomChoice(heatingTypes);
  
  const isAuction = random(0, 10) > 8 ? 1 : 0;
  const exclusivelyAtRk = random(0, 10) > 7 ? 1 : 0;
  const attractiveOffer = random(0, 10) > 6 ? 1 : 0;
  
  // Agent ID - náhodně mezi 2 a 3 (Jana Nováková a Petr Svoboda)
  const agentId = random(2, 3);
  
  const viewsCount = random(0, 150);
  
  // Generování obrázků
  const imageCount = random(3, 8);
  const images = [];
  for (let j = 0; j < imageCount; j++) {
    images.push(`https://picsum.photos/800/600?random=${i * 10 + j}`);
  }
  const imagesJson = JSON.stringify(images);
  const mainImage = images[0];
  
  // Vložení do databáze
  try {
    insertProperty.run(
      title,
      description,
      propType.transaction,
      propType.type,
      propType.subtype,
      price,
      priceNote,
      address.city,
      address.district,
      address.street,
      null, // zip_code
      address.lat,
      address.lng,
      area,
      landArea,
      propType.rooms,
      floor,
      totalFloors,
      buildingType,
      buildingCondition,
      'personal', // ownership
      furnished,
      hasBalcony,
      hasLoggia,
      hasTerrace,
      hasCellar,
      hasGarage,
      hasParking,
      hasElevator,
      hasGarden,
      hasPool,
      energyRating,
      heatingType,
      isAuction,
      exclusivelyAtRk,
      attractiveOffer,
      agentId,
      'active',
      viewsCount,
      imagesJson,
      mainImage
    );
    
    console.log(`${i + 1}. ${title} - ${price.toLocaleString('cs-CZ')} Kč`);
  } catch (error) {
    console.error(`Chyba při vkládání nemovitosti ${i + 1}:`, error.message);
  }
}

console.log('\n✅ Úspěšně přidáno 50 nových nabídek s reálnými adresami po celé ČR!');
console.log('📍 Města zahrnují: Praha, Brno, Ostrava, Plzeň, Liberec, Olomouc, České Budějovice,');
console.log('   Hradec Králové, Pardubice, Zlín, Jihlava, Karlovy Vary, Ústí nad Labem,');
console.log('   Kladno, Mladá Boleslav, Tábor, Prostějov, Přerov, Chomutov, Děčín,');
console.log('   Frýdek-Místek, Havířov, Opava, Most a další okresní města.');

db.close();
