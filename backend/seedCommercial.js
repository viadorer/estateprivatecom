import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'realestate.db'));

// Reálné lokality pro komerční nemovitosti po celé ČR
const commercialLocations = [
  // Praha
  { city: 'Praha', district: 'Praha 1', street: 'Václavské náměstí 12', zip: '110 00', lat: 50.0813, lng: 14.4264 },
  { city: 'Praha', district: 'Karlín', street: 'Rohanské nábřeží 670', zip: '186 00', lat: 50.0933, lng: 14.4508 },
  { city: 'Praha', district: 'Smíchov', street: 'Nádražní 123', zip: '150 00', lat: 50.0707, lng: 14.4041 },
  { city: 'Praha', district: 'Vinohrady', street: 'Vinohradská 234', zip: '130 00', lat: 50.0755, lng: 14.4378 },
  { city: 'Praha', district: 'Holešovice', street: 'Dukelských hrdinů 345', zip: '170 00', lat: 50.1033, lng: 14.4378 },
  { city: 'Praha', district: 'Nusle', street: 'Budějovická 456', zip: '140 00', lat: 50.0617, lng: 14.4418 },
  { city: 'Praha', district: 'Libeň', street: 'Zenklova 567', zip: '180 00', lat: 50.1033, lng: 14.4678 },
  { city: 'Praha', district: 'Dejvice', street: 'Evropská 678', zip: '160 00', lat: 50.0997, lng: 14.3914 },
  
  // Brno
  { city: 'Brno', district: 'Brno-střed', street: 'Masarykova 123', zip: '602 00', lat: 49.1951, lng: 16.6068 },
  { city: 'Brno', district: 'Brno-střed', street: 'Hybešova 234', zip: '602 00', lat: 49.1951, lng: 16.6068 },
  { city: 'Brno', district: 'Černá Pole', street: 'Lesnická 345', zip: '613 00', lat: 49.2108, lng: 16.6208 },
  { city: 'Brno', district: 'Žabovřesky', street: 'Studentská 456', zip: '616 00', lat: 49.2108, lng: 16.5988 },
  { city: 'Brno', district: 'Bohunice', street: 'Netroufalky 567', zip: '625 00', lat: 49.1708, lng: 16.5608 },
  
  // Ostrava
  { city: 'Ostrava', district: 'Moravská Ostrava', street: 'Nádražní 123', zip: '702 00', lat: 49.8209, lng: 18.2625 },
  { city: 'Ostrava', district: 'Poruba', street: 'Opavská 234', zip: '708 00', lat: 49.8209, lng: 18.1625 },
  { city: 'Ostrava', district: 'Vítkovice', street: 'Ruská 345', zip: '703 00', lat: 49.7909, lng: 18.2625 },
  { city: 'Ostrava', district: 'Slezská Ostrava', street: 'Těšínská 456', zip: '710 00', lat: 49.8109, lng: 18.2825 },
  
  // Plzeň
  { city: 'Plzeň', district: 'Plzeň 1', street: 'Americká 123', zip: '301 00', lat: 49.7384, lng: 13.3736 },
  { city: 'Plzeň', district: 'Plzeň 2', street: 'Slovanská 234', zip: '326 00', lat: 49.7484, lng: 13.3836 },
  { city: 'Plzeň', district: 'Plzeň 3', street: 'Klatovská 345', zip: '301 00', lat: 49.7284, lng: 13.3636 },
  
  // Liberec
  { city: 'Liberec', district: 'Liberec I', street: 'Soukenné náměstí 12', zip: '460 01', lat: 50.7663, lng: 15.0543 },
  { city: 'Liberec', district: 'Liberec II', street: 'Husova 234', zip: '460 01', lat: 50.7563, lng: 15.0443 },
  
  // Olomouc
  { city: 'Olomouc', district: 'Olomouc-střed', street: 'Tř. Svobody 123', zip: '779 00', lat: 49.5938, lng: 17.2509 },
  { city: 'Olomouc', district: 'Nová Ulice', street: 'Hněvotínská 234', zip: '779 00', lat: 49.6038, lng: 17.2609 },
  
  // České Budějovice
  { city: 'České Budějovice', district: 'České Budějovice 1', street: 'Lannova třída 123', zip: '370 01', lat: 48.9745, lng: 14.4743 },
  { city: 'České Budějovice', district: 'České Budějovice 2', street: 'Pražská 234', zip: '370 01', lat: 48.9845, lng: 14.4843 },
  
  // Hradec Králové
  { city: 'Hradec Králové', district: 'Hradec Králové 1', street: 'Gočárova třída 123', zip: '500 02', lat: 50.2093, lng: 15.8327 },
  { city: 'Hradec Králové', district: 'Slezské Předměstí', street: 'Brněnská 234', zip: '500 02', lat: 50.1993, lng: 15.8427 },
  
  // Pardubice
  { city: 'Pardubice', district: 'Pardubice I', street: 'Třída Míru 123', zip: '530 02', lat: 50.0343, lng: 15.7812 },
  { city: 'Pardubice', district: 'Zelené Předměstí', street: 'Kyjevská 234', zip: '530 02', lat: 50.0443, lng: 15.7912 },
  
  // Zlín
  { city: 'Zlín', district: 'Zlín-střed', street: 'Třída Tomáše Bati 123', zip: '760 01', lat: 49.2238, lng: 17.6619 },
  { city: 'Zlín', district: 'Malenovice', street: 'Malenovická 234', zip: '763 02', lat: 49.2138, lng: 17.6519 },
  
  // Jihlava
  { city: 'Jihlava', district: 'Jihlava-město', street: 'Masarykovo náměstí 12', zip: '586 01', lat: 49.3961, lng: 15.5911 },
  { city: 'Jihlava', district: 'Horní Kosov', street: 'Brněnská 234', zip: '586 01', lat: 49.4061, lng: 15.6011 },
  
  // Karlovy Vary
  { city: 'Karlovy Vary', district: 'Karlovy Vary 1', street: 'Tržní náměstí 12', zip: '360 01', lat: 50.2329, lng: 12.8719 },
  { city: 'Karlovy Vary', district: 'Dvory', street: 'Chebská 234', zip: '360 06', lat: 50.2229, lng: 12.8619 },
  
  // Ústí nad Labem
  { city: 'Ústí nad Labem', district: 'Ústí nad Labem-střed', street: 'Mírové náměstí 12', zip: '400 01', lat: 50.6607, lng: 14.0422 },
  { city: 'Ústí nad Labem', district: 'Severní Terasa', street: 'Moskevská 234', zip: '400 11', lat: 50.6707, lng: 14.0522 },
  
  // Kladno
  { city: 'Kladno', district: 'Kladno-střed', street: 'Náměstí Starosty Pavla 12', zip: '272 01', lat: 50.1476, lng: 14.1028 },
  { city: 'Kladno', district: 'Rozdělov', street: 'Kladenská 234', zip: '272 01', lat: 50.1576, lng: 14.1128 },
  
  // Teplice
  { city: 'Teplice', district: 'Teplice-město', street: 'Masarykova třída 123', zip: '415 01', lat: 50.6404, lng: 13.8246 },
  
  // Most
  { city: 'Most', district: 'Most-město', street: 'Budovatelů 123', zip: '434 01', lat: 50.5030, lng: 13.6363 },
  
  // Chomutov
  { city: 'Chomutov', district: 'Chomutov-město', street: 'Náměstí 1. máje 12', zip: '430 01', lat: 50.4607, lng: 13.4178 },
  
  // Děčín
  { city: 'Děčín', district: 'Děčín I-Děčín', street: 'Masarykovo náměstí 12', zip: '405 02', lat: 50.7821, lng: 14.2145 },
  
  // Frýdek-Místek
  { city: 'Frýdek-Místek', district: 'Frýdek', street: 'Náměstí Svobody 12', zip: '738 01', lat: 49.6851, lng: 18.3490 },
  
  // Havířov
  { city: 'Havířov', district: 'Havířov-město', street: 'Dlouhá třída 123', zip: '736 01', lat: 49.7797, lng: 18.4369 },
  
  // Opava
  { city: 'Opava', district: 'Opava-město', street: 'Horní náměstí 12', zip: '746 01', lat: 49.9387, lng: 17.9027 },
  
  // Prostějov
  { city: 'Prostějov', district: 'Prostějov-město', street: 'Náměstí T. G. Masaryka 12', zip: '796 01', lat: 49.4719, lng: 17.1119 },
  
  // Přerov
  { city: 'Přerov', district: 'Přerov I-Město', street: 'Masarykovo náměstí 12', zip: '750 02', lat: 49.4556, lng: 17.4508 }
];

const commercialTypes = [
  {
    subtype: 'office',
    titles: ['Kancelářské prostory', 'Moderní kanceláře', 'Administrativní budova', 'Business centrum'],
    descriptions: [
      'Moderní kancelářské prostory v prestižní lokalitě. Recepce, klimatizace, parkování. Výborná dostupnost MHD.',
      'Reprezentativní kanceláře v centru města. Kompletní zázemí, meeting rooms, kuchyňka. Ideální pro firmy.',
      'Nové administrativní prostory s nadstandardním vybavením. Bezpečnostní systém, vysokorychlostní internet.',
      'Flexibilní kancelářské plochy v business centru. Možnost pronájmu jednotlivých kanceláří i celého patra.'
    ],
    areaRange: [50, 500],
    priceRange: { sale: [3000000, 25000000], rent: [15000, 150000] }
  },
  {
    subtype: 'retail',
    titles: ['Obchodní prostory', 'Prodejna', 'Retail unit', 'Komerční prostor'],
    descriptions: [
      'Obchodní prostory v centru města s vysokou frekvencí. Výloha, zázemí, parkování. Ideální pro maloobchod.',
      'Moderní retail unit v nákupním centru. Výborná viditelnost, velký počet návštěvníků.',
      'Prodejna v pěší zóně s výbornou dostupností. Kompletně vybavená, připravená k okamžitému využití.',
      'Komerční prostor v atraktivní lokalitě. Možnost úpravy dle potřeb nájemce.'
    ],
    areaRange: [40, 300],
    priceRange: { sale: [2500000, 18000000], rent: [20000, 120000] }
  },
  {
    subtype: 'warehouse',
    titles: ['Skladové prostory', 'Výrobní hala', 'Logistický areál', 'Sklad'],
    descriptions: [
      'Moderní skladové prostory s výbornou dostupností. Rampy, vysoké stropy, parkování pro nákladní vozy.',
      'Výrobní a skladovací hala s administrativním zázemím. Možnost rozšíření, vlastní pozemek.',
      'Logistický areál u dálnice. Kompletní infrastruktura, bezpečnostní systém, možnost pronájmu po částech.',
      'Skladové prostory s kancelářským zázemím. Výborná dopravní dostupnost, parkování.'
    ],
    areaRange: [200, 2000],
    priceRange: { sale: [5000000, 40000000], rent: [30000, 200000] }
  },
  {
    subtype: 'restaurant',
    titles: ['Restaurace', 'Bistro', 'Kavárna', 'Gastro provozovna'],
    descriptions: [
      'Plně vybavená restaurace v centru města. Kompletní kuchyně, terasa, parkování. Zavedená klientela.',
      'Moderní bistro s venkovním posezením. Nová kuchyňská linka, klimatizace, výborná lokalita.',
      'Kavárna v pěší zóně s vysokou frekvencí. Kompletní vybavení, možnost okamžitého provozu.',
      'Gastro provozovna s licencí. Kompletně zařízená, připravená k provozu.'
    ],
    areaRange: [60, 250],
    priceRange: { sale: [3000000, 15000000], rent: [25000, 100000] }
  },
  {
    subtype: 'hotel',
    titles: ['Hotel', 'Penzion', 'Ubytovací zařízení', 'Boutique hotel'],
    descriptions: [
      'Moderní hotel v centru města. Kompletně vybavené pokoje, recepce, restaurace. Zavedený provoz.',
      'Rodinný penzion v klidné lokalitě. Parkování, zahrada, možnost rozšíření.',
      'Boutique hotel s nadstandardním vybavením. Wellness, restaurace, konferenční místnosti.',
      'Ubytovací zařízení s výbornou obsazeností. Kompletně zrekonstruované, připravené k provozu.'
    ],
    areaRange: [300, 1500],
    priceRange: { sale: [15000000, 80000000], rent: [100000, 400000] }
  }
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

console.log('Zacinam generovat 50 komercnich nemovitosti...\n');

for (let i = 0; i < 50; i++) {
  const location = commercialLocations[i % commercialLocations.length];
  const type = randomChoice(commercialTypes);
  const transactionType = random(0, 10) > 6 ? 'rent' : 'sale';
  
  const title = `${randomChoice(type.titles)} - ${location.city}`;
  const description = randomChoice(type.descriptions);
  
  const area = random(type.areaRange[0], type.areaRange[1]);
  const price = transactionType === 'sale' 
    ? random(type.priceRange.sale[0], type.priceRange.sale[1])
    : random(type.priceRange.rent[0], type.priceRange.rent[1]);
  
  const priceNote = transactionType === 'rent' ? 'Kc/mesic + sluzby' : null;
  
  const buildingCondition = randomChoice(['after_reconstruction', 'very_good', 'new_building', 'good']);
  const hasParking = random(0, 1);
  const hasElevator = area > 200 ? random(0, 1) : 0;
  
  const imageCount = random(4, 8);
  const images = [];
  for (let j = 0; j < imageCount; j++) {
    images.push(`https://picsum.photos/800/600?random=${(i + 400) * 10 + j}`);
  }
  
  try {
    insertProperty.run(
      title,
      description,
      transactionType,
      'commercial',
      type.subtype,
      price,
      priceNote,
      location.city,
      location.district,
      location.street,
      location.zip,
      location.lat,
      location.lng,
      area,
      null,
      null,
      random(1, 5),
      random(3, 10),
      'brick',
      buildingCondition,
      'personal',
      'not_furnished',
      0, 0, 0, 0, 0, hasParking, hasElevator, 0, 0,
      randomChoice(['A', 'B', 'C', 'D']),
      randomChoice(['central', 'gas', 'electric']),
      0,
      random(0, 1),
      random(0, 1),
      1,
      'active',
      random(20, 150),
      JSON.stringify(images),
      images[0]
    );
    
    const priceStr = transactionType === 'rent' 
      ? `${price.toLocaleString('cs-CZ')} Kc/mesic`
      : `${price.toLocaleString('cs-CZ')} Kc`;
    
    console.log(`${i + 1}. ${title} - ${priceStr} (${area} m2)`);
  } catch (error) {
    console.error(`Chyba pri vkladani nemovitosti ${i + 1}:`, error.message);
  }
}

console.log('\nUspesne pridano 50 komercnich nemovitosti!');
console.log('Typy: kancelare, obchody, sklady, restaurace, hotely');
console.log('Transakce: prodej i pronajem');
console.log('Vlastnik: admin (agent_id = 1)');

db.close();
