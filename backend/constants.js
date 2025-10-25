// Kompletni ciselniky pro realitni aplikaci (podle Sreality API)

export const TRANSACTION_TYPES = {
  SALE: 'sale',
  RENT: 'rent'
};

export const PROPERTY_TYPES = {
  FLAT: 'flat',
  HOUSE: 'house',
  COMMERCIAL: 'commercial',
  LAND: 'land',
  PROJECT: 'project'
};

export const FLAT_SUBTYPES = {
  '1_KK': '1+kk',
  '1_1': '1+1',
  '2_KK': '2+kk',
  '2_1': '2+1',
  '3_KK': '3+kk',
  '3_1': '3+1',
  '4_KK': '4+kk',
  '4_1': '4+1',
  '5_KK': '5+kk',
  '5_1': '5+1',
  '6_KK': '6+kk',
  '6_1': '6+1',
  ATYPICAL: 'atypical',
  OTHER: 'other'
};

export const HOUSE_SUBTYPES = {
  FAMILY_HOUSE: 'family_house',
  VILLA: 'villa',
  COTTAGE: 'cottage',
  CABIN: 'cabin',
  FARMHOUSE: 'farmhouse',
  MOBILE_HOME: 'mobile_home',
  OTHER: 'other'
};

export const COMMERCIAL_SUBTYPES = {
  OFFICE: 'office',
  RETAIL: 'retail',
  WAREHOUSE: 'warehouse',
  PRODUCTION: 'production',
  RESTAURANT: 'restaurant',
  ACCOMMODATION: 'accommodation',
  AGRICULTURAL: 'agricultural',
  GARAGE: 'garage',
  OTHER: 'other'
};

export const LAND_SUBTYPES = {
  BUILDING_PLOT: 'building_plot',
  AGRICULTURAL: 'agricultural',
  FOREST: 'forest',
  GARDEN: 'garden',
  ORCHARD: 'orchard',
  MEADOW: 'meadow',
  POND: 'pond',
  OTHER: 'other'
};

export const PROJECT_SUBTYPES = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  MIXED: 'mixed',
  OTHER: 'other'
};

export const BUILDING_TYPES = {
  BRICK: 'brick',
  PANEL: 'panel',
  WOOD: 'wood',
  STONE: 'stone',
  MIXED: 'mixed',
  MONOLITHIC: 'monolithic',
  SKELETON: 'skeleton',
  OTHER: 'other'
};

export const BUILDING_CONDITIONS = {
  NEW_BUILDING: 'new_building',
  VERY_GOOD: 'very_good',
  GOOD: 'good',
  AFTER_RECONSTRUCTION: 'after_reconstruction',
  BEFORE_RECONSTRUCTION: 'before_reconstruction',
  IN_CONSTRUCTION: 'in_construction',
  PROJECT: 'project',
  DEMOLISHED: 'demolished'
};

export const OWNERSHIP_TYPES = {
  PERSONAL: 'personal',
  COOPERATIVE: 'cooperative',
  STATE: 'state',
  CHURCH: 'church',
  TRANSFERRED: 'transferred'
};

export const FURNISHED_TYPES = {
  FURNISHED: 'furnished',
  PARTLY_FURNISHED: 'partly_furnished',
  NOT_FURNISHED: 'not_furnished'
};

export const ENERGY_RATINGS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

export const HEATING_TYPES = {
  GAS: 'gas',
  ELECTRIC: 'electric',
  CENTRAL: 'central',
  SOLID_FUEL: 'solid_fuel',
  HEAT_PUMP: 'heat_pump',
  SOLAR: 'solar',
  NO_HEATING: 'no_heating',
  OTHER: 'other'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  CLIENT: 'client'
};

export const CONTRACT_TYPES = {
  LOI: 'loi',
  BROKERAGE: 'brokerage',
  COOPERATION_CLIENT: 'cooperation_client',
  COOPERATION_CLIENT_COMMISSION: 'cooperation_client_commission',
  COOPERATION_AGENT: 'cooperation_agent'
};

export const REGISTRATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const PROPERTY_STATUS = {
  ACTIVE: 'active',
  RESERVED: 'reserved',
  SOLD: 'sold',
  ARCHIVED: 'archived'
};

export const DEMAND_STATUS = {
  ACTIVE: 'active',
  FULFILLED: 'fulfilled',
  CANCELLED: 'cancelled'
};

export const MATCH_STATUS = {
  NEW: 'new',
  VIEWED: 'viewed',
  INTERESTED: 'interested',
  REJECTED: 'rejected'
};

export const VIEWING_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Ceske nazvy pro UI
export const LABELS_CS = {
  // Typy transakci
  sale: 'Prodej',
  rent: 'Pronájem',
  
  // Typy nemovitosti
  flat: 'Byt',
  house: 'Dům',
  commercial: 'Komerční',
  land: 'Pozemek',
  project: 'Projekt',
  
  // Podtypy bytu
  '1+kk': '1+kk',
  '1+1': '1+1',
  '2+kk': '2+kk',
  '2+1': '2+1',
  '3+kk': '3+kk',
  '3+1': '3+1',
  '4+kk': '4+kk',
  '4+1': '4+1',
  '5+kk': '5+kk',
  '5+1': '5+1',
  '6+kk': '6+kk',
  '6+1': '6+1',
  atypical: 'Atypický',
  
  // Podtypy domu
  family_house: 'Rodinný dům',
  villa: 'Vila',
  cottage: 'Chata',
  cabin: 'Chalupa',
  farmhouse: 'Zemědělská usedlost',
  mobile_home: 'Mobilní dům',
  
  // Podtypy komercni
  office: 'Kancelář',
  retail: 'Obchod',
  warehouse: 'Sklad',
  production: 'Výroba',
  restaurant: 'Restaurace',
  accommodation: 'Ubytování',
  agricultural: 'Zemědělský objekt',
  garage: 'Garáž',
  
  // Podtypy pozemku
  building_plot: 'Stavební pozemek',
  forest: 'Les',
  garden: 'Zahrada',
  orchard: 'Sad',
  meadow: 'Louka',
  pond: 'Rybník',
  
  // Podtypy projektu
  residential: 'Bytový projekt',
  mixed: 'Smíšený projekt',
  
  // Typ stavby
  brick: 'Cihlová',
  panel: 'Panelová',
  wood: 'Dřevěná',
  stone: 'Kamenná',
  mixed: 'Smíšená',
  monolithic: 'Monolitická',
  skeleton: 'Skeletová',
  
  // Stav stavby
  new_building: 'Novostavba',
  very_good: 'Velmi dobrý',
  good: 'Dobrý',
  after_reconstruction: 'Po rekonstrukci',
  before_reconstruction: 'Před rekonstrukcí',
  in_construction: 'Ve výstavbě',
  project: 'Projekt',
  demolished: 'K demolici',
  
  // Vlastnictvi
  personal: 'Osobní',
  cooperative: 'Družstevní',
  state: 'Státní',
  church: 'Církevní',
  transferred: 'Převod',
  
  // Vybaveni
  furnished: 'Vybavený',
  partly_furnished: 'Částečně vybavený',
  not_furnished: 'Nevybavený',
  
  // Vytapeni
  gas: 'Plynové',
  electric: 'Elektrické',
  central: 'Ústřední',
  solid_fuel: 'Tuhá paliva',
  heat_pump: 'Tepelné čerpadlo',
  solar: 'Solární',
  no_heating: 'Bez vytápění',
  
  // Role
  admin: 'Administrátor',
  agent: 'Realitní makléř',
  client: 'Klient',
  
  // Typy smluv
  loi: 'Letter of Intent',
  brokerage: 'Zprostředkovatelská smlouva',
  cooperation_client: 'Smlouva o spolupráci - Klient',
  cooperation_client_commission: 'Smlouva o spolupráci - Klient s provizí',
  cooperation_agent: 'Smlouva o spolupráci - Agent',
  
  // Stavy registrace
  pending: 'Čeká na schválení',
  approved: 'Schváleno',
  rejected: 'Zamítnuto',
  
  // Stavy
  active: 'Aktivní',
  reserved: 'Rezervováno',
  sold: 'Prodáno',
  archived: 'Archivováno',
  fulfilled: 'Splněno',
  cancelled: 'Zrušeno',
  new: 'Nové',
  viewed: 'Zobrazeno',
  interested: 'Zájem',
  rejected: 'Odmítnuto',
  scheduled: 'Naplánováno',
  completed: 'Dokončeno',
  
  other: 'Jiné'
};
