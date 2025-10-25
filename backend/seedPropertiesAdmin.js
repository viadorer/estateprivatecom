import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'realestate.db'));

// Další reálné adresy po celé ČR
const realAddresses = [
  { city: 'Praha', district: 'Nusle', street: 'Budějovická 1667/64', zip: '140 00', lat: 50.0617, lng: 14.4418 },
  { city: 'Praha', district: 'Strašnice', street: 'Průmyslová 123/45', zip: '100 00', lat: 50.0717, lng: 14.4918 },
  { city: 'Praha', district: 'Vršovice', street: 'Kodaňská 234/56', zip: '101 00', lat: 50.0717, lng: 14.4518 },
  { city: 'Praha', district: 'Libeň', street: 'Zenklova 345/67', zip: '180 00', lat: 50.1033, lng: 14.4678 },
  { city: 'Praha', district: 'Prosek', street: 'Prosecká 456/78', zip: '190 00', lat: 50.1133, lng: 14.4878 },
  { city: 'Brno', district: 'Černá Pole', street: 'Lesnická 123/45', zip: '613 00', lat: 49.2108, lng: 16.6208 },
  { city: 'Brno', district: 'Bohunice', street: 'Netroufalky 234/56', zip: '625 00', lat: 49.1708, lng: 16.5608 },
  { city: 'Brno', district: 'Starý Lískovec', street: 'Oblá 345/67', zip: '625 00', lat: 49.1608, lng: 16.5508 },
  { city: 'Brno', district: 'Komín', street: 'Chironova 456/78', zip: '617 00', lat: 49.2308, lng: 16.6408 },
  { city: 'Brno', district: 'Řečkovice', street: 'Terezy Novákové 567/89', zip: '621 00', lat: 49.2208, lng: 16.6708 },
  { city: 'Ostrava', district: 'Slezská Ostrava', street: 'Těšínská 123/45', zip: '710 00', lat: 49.8109, lng: 18.2825 },
  { city: 'Ostrava', district: 'Zábřeh', street: 'Výškovická 234/56', zip: '700 00', lat: 49.8409, lng: 18.2425 },
  { city: 'Ostrava', district: 'Hrabůvka', street: 'Horní 345/67', zip: '700 00', lat: 49.8009, lng: 18.2225 },
  { city: 'Plzeň', district: 'Plzeň 2', street: 'Slovanská 123/45', zip: '326 00', lat: 49.7484, lng: 13.3836 },
  { city: 'Plzeň', district: 'Plzeň 4', street: 'Karlovarská 234/56', zip: '301 00', lat: 49.7684, lng: 13.3436 },
  { city: 'Plzeň', district: 'Doubravka', street: 'Doubravecká 345/67', zip: '312 00', lat: 49.7784, lng: 13.3336 },
  { city: 'Liberec', district: 'Liberec II', street: 'Husova 123/45', zip: '460 01', lat: 50.7563, lng: 15.0443 },
  { city: 'Liberec', district: 'Liberec V', street: 'Jablonecká 234/56', zip: '460 05', lat: 50.7863, lng: 15.0743 },
  { city: 'České Budějovice', district: 'České Budějovice 3', street: 'Husova 123/45', zip: '370 01', lat: 48.9645, lng: 14.4643 },
  { city: 'České Budějovice', district: 'České Budějovice 4', street: 'Žižkova 234/56', zip: '370 04', lat: 48.9545, lng: 14.4543 },
  { city: 'Hradec Králové', district: 'Hradec Králové 2', street: 'Riegrovo náměstí 123/1', zip: '500 02', lat: 50.1993, lng: 15.8227 },
  { city: 'Hradec Králové', district: 'Nový Hradec Králové', street: 'Pražská 234/56', zip: '500 09', lat: 50.2193, lng: 15.8527 },
  { city: 'Pardubice', district: 'Pardubice II', street: 'Palackého třída 123/45', zip: '530 02', lat: 50.0243, lng: 15.7712 },
  { city: 'Pardubice', district: 'Polabiny', street: 'Poděbradova 234/56', zip: '530 09', lat: 50.0543, lng: 15.8012 },
  { city: 'Olomouc', district: 'Hodolany', street: 'Tabulový vrch 123/45', zip: '779 00', lat: 49.6138, lng: 17.2709 },
  { city: 'Olomouc', district: 'Nové Sady', street: 'Schweitzerova 234/56', zip: '779 00', lat: 49.5838, lng: 17.2409 },
  { city: 'Zlín', district: 'Prštné', street: 'Prštné 123/45', zip: '760 01', lat: 49.2338, lng: 17.6819 },
  { city: 'Zlín', district: 'Louky', street: 'Louky 234/56', zip: '763 02', lat: 49.2038, lng: 17.6419 },
  { city: 'Jihlava', district: 'Jihlava-Pávov', street: 'Pávov 123/45', zip: '586 01', lat: 49.3861, lng: 15.5811 },
  { city: 'Jihlava', district: 'Jihlava-Helenín', street: 'Helenín 234/56', zip: '586 01', lat: 49.4161, lng: 15.6111 },
  { city: 'Karlovy Vary', district: 'Karlovy Vary 2', street: 'Západní 123/45', zip: '360 01', lat: 50.2429, lng: 12.8819 },
  { city: 'Karlovy Vary', district: 'Drahovice', street: 'Drahovická 234/56', zip: '360 10', lat: 50.2129, lng: 12.8519 },
  { city: 'Ústí nad Labem', district: 'Ústí nad Labem-Bukov', street: 'Husova 123/45', zip: '400 01', lat: 50.6507, lng: 14.0322 },
  { city: 'Ústí nad Labem', district: 'Ústí nad Labem-Střekov', street: 'Střekovské nábřeží 234/56', zip: '400 03', lat: 50.6807, lng: 14.0622 },
  { city: 'Kladno', district: 'Kladno-Kročehlavy', street: 'Kročehlavská 123/45', zip: '272 01', lat: 50.1376, lng: 14.0928 },
  { city: 'Kladno', district: 'Kladno-Dubí', street: 'Dubská 234/56', zip: '272 01', lat: 50.1676, lng: 14.1228 },
  { city: 'Teplice', district: 'Teplice-město', street: 'Masarykova třída 123/45', zip: '415 01', lat: 50.6404, lng: 13.8246 },
  { city: 'Teplice', district: 'Teplice-Trnovany', street: 'Trnovany 234/56', zip: '415 01', lat: 50.6504, lng: 13.8346 },
  { city: 'Jablonec nad Nisou', district: 'Jablonec-město', street: 'Mírové náměstí 123/1', zip: '466 01', lat: 50.7243, lng: 15.1711 },
  { city: 'Jablonec nad Nisou', district: 'Jablonec-Kokonín', street: 'Kokonínská 234/56', zip: '466 01', lat: 50.7343, lng: 15.1811 },
  { city: 'Mladá Boleslav', district: 'Mladá Boleslav III', street: 'Václavkova 123/45', zip: '293 01', lat: 50.4013, lng: 14.8933 },
  { city: 'Mladá Boleslav', district: 'Mladá Boleslav IV', street: 'Pražská 234/56', zip: '293 01', lat: 50.4313, lng: 14.9233 },
  { city: 'Příbram', district: 'Příbram I', street: 'Náměstí T. G. Masaryka 123/1', zip: '261 01', lat: 49.6896, lng: 14.0106 },
  { city: 'Příbram', district: 'Příbram II', street: 'Pražská 234/56', zip: '261 01', lat: 49.6996, lng: 14.0206 },
  { city: 'Třebíč', district: 'Třebíč-město', street: 'Karlovo náměstí 123/1', zip: '674 01', lat: 49.2149, lng: 15.8819 },
  { city: 'Třebíč', district: 'Třebíč-Borovina', street: 'Boroviny 234/56', zip: '674 01', lat: 49.2249, lng: 15.8919 },
  { city: 'Znojmo', district: 'Znojmo-město', street: 'Masarykovo náměstí 123/1', zip: '669 02', lat: 48.8555, lng: 16.0488 },
  { city: 'Znojmo', district: 'Znojmo-Přímětice', street: 'Přímětická 234/56', zip: '669 04', lat: 48.8655, lng: 16.0588 },
  { city: 'Kolín', district: 'Kolín I', street: 'Karlovo náměstí 123/1', zip: '280 02', lat: 50.0281, lng: 15.2000 },
  { city: 'Kolín', district: 'Kolín II', street: 'Pražská 234/56', zip: '280 02', lat: 50.0381, lng: 15.2100 }
];

const propertyConfigs = [
  { trans: 'sale', type: 'flat', sub: '1+kk', title: 'Moderní byt 1+kk', price: [2000000, 4500000], area: [25, 42], rooms: 1 },
  { trans: 'sale', type: 'flat', sub: '2+kk', title: 'Prostorný byt 2+kk', price: [3500000, 7500000], area: [45, 68], rooms: 2 },
  { trans: 'sale', type: 'flat', sub: '3+kk', title: 'Rodinný byt 3+kk', price: [5500000, 10000000], area: [70, 95], rooms: 3 },
  { trans: 'sale', type: 'flat', sub: '3+1', title: 'Cihlový byt 3+1', price: [5000000, 9000000], area: [75, 100], rooms: 3 },
  { trans: 'sale', type: 'flat', sub: '4+kk', title: 'Luxusní byt 4+kk', price: [8000000, 15000000], area: [95, 135], rooms: 4 },
  { trans: 'sale', type: 'house', sub: '4+1', title: 'Rodinný dům 4+1', price: [6500000, 13000000], area: [120, 170], rooms: 4 },
  { trans: 'sale', type: 'house', sub: '5+1', title: 'Prostorný dům 5+1', price: [8500000, 18000000], area: [150, 220], rooms: 5 },
  { trans: 'sale', type: 'land', sub: 'building', title: 'Stavební pozemek', price: [1500000, 8000000], area: [500, 2000], rooms: null },
  { trans: 'sale', type: 'commercial', sub: 'office', title: 'Kancelářské prostory', price: [5000000, 20000000], area: [80, 300], rooms: null },
  { trans: 'rent', type: 'flat', sub: '2+kk', title: 'Pronájem bytu 2+kk', price: [14000, 30000], area: [45, 68], rooms: 2 }
];

const descriptions = [
  'Krásný světlý byt po kompletní rekonstrukci. Plně vybavená kuchyň s moderními spotřebiči.',
  'Prostorný byt v klidné lokalitě. Sklep, možnost parkování. Ideální pro rodinu.',
  'Moderní byt v novostavbě s balkonem. Parkování v podzemních garážích.',
  'Útulný byt v cihlové zástavbě. Nová okna, zateplená fasáda.',
  'Světlý byt s velkými okny a krásným výhledem. Kompletně zrekonstruovaný.'
];

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

const insertProperty = db.prepare(`
  INSERT INTO properties (
    title, description, transaction_type, property_type, property_subtype,
    price, price_note, city, district, street, zip_code, latitude, longitude,
    area, land_area, rooms, floor, total_floors, 
    building_type, building_condition, ownership, furnished,
    has_balcony, has_loggia, has_terrace, has_cellar, has_garage, has_parking, has_elevator, has_garden, has_pool,
    energy_rating, heating_type, is_auction, exclusively_at_rk, attractive_offer,
    agent_id, status, views_count, images, main_image
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

console.log('Začínám generovat dalších 50 nabídek pro admina...\n');

for (let i = 0; i < 50; i++) {
  const address = realAddresses[i];
  const config = randomChoice(propertyConfigs);
  const title = `${config.title} - ${address.city}`;
  const description = randomChoice(descriptions);
  const price = random(config.price[0], config.price[1]);
  const priceNote = config.trans === 'rent' ? 'Kč/měsíc + energie' : null;
  const area = config.area ? random(config.area[0], config.area[1]) : null;
  const landArea = config.type === 'house' ? random(300, 1200) : (config.type === 'land' ? random(500, 2000) : null);
  const floor = config.type === 'flat' ? random(1, 9) : null;
  const totalFloors = config.type === 'flat' ? random(floor || 1, 12) : (config.type === 'house' ? random(1, 3) : null);
  const buildingType = config.type !== 'land' ? randomChoice(['brick', 'panel', 'brick']) : null;
  const buildingCondition = config.type !== 'land' ? randomChoice(['after_reconstruction', 'original', 'new_building']) : null;
  const furnished = config.type === 'flat' || config.type === 'house' ? randomChoice(['furnished', 'partly_furnished', 'not_furnished']) : 'not_furnished';
  const hasBalcony = config.type === 'flat' ? random(0, 1) : 0;
  const hasLoggia = config.type === 'flat' && hasBalcony === 0 ? random(0, 1) : 0;
  const hasTerrace = config.type === 'house' ? random(0, 1) : 0;
  const hasCellar = config.type === 'flat' || config.type === 'house' ? random(0, 1) : 0;
  const hasGarage = config.type === 'house' ? random(0, 1) : 0;
  const hasParking = random(0, 1);
  const hasElevator = config.type === 'flat' && totalFloors > 3 ? random(0, 1) : 0;
  const hasGarden = config.type === 'house' ? 1 : 0;
  const hasPool = config.type === 'house' && price > 10000000 ? random(0, 1) : 0;
  const energyRating = randomChoice(['A', 'B', 'C', 'D', 'E']);
  const heatingType = randomChoice(['gas', 'electric', 'central']);
  const viewsCount = random(0, 150);
  const imageCount = random(3, 8);
  const images = [];
  for (let j = 0; j < imageCount; j++) {
    images.push(`https://picsum.photos/800/600?random=${(i + 50) * 10 + j}`);
  }
  const imagesJson = JSON.stringify(images);
  const mainImage = images[0];

  try {
    insertProperty.run(
      title, description, config.trans, config.type, config.sub,
      price, priceNote, address.city, address.district, address.street, address.zip, address.lat, address.lng,
      area, landArea, config.rooms, floor, totalFloors,
      buildingType, buildingCondition, 'personal', furnished,
      hasBalcony, hasLoggia, hasTerrace, hasCellar, hasGarage, hasParking, hasElevator, hasGarden, hasPool,
      energyRating, heatingType, 0, 0, random(0, 1),
      1, 'active', viewsCount, imagesJson, mainImage
    );
    console.log(`${i + 1}. ${title} - ${price.toLocaleString('cs-CZ')} ${config.trans === 'rent' ? 'Kč/měsíc' : 'Kč'}`);
  } catch (error) {
    console.error(`Chyba ${i + 1}:`, error.message);
  }
}

console.log('\n✅ Úspěšně přidáno 50 nových nabídek pro admina!');
db.close();
