// Import Mapper - Mapování externích dat na náš formát

// Mapování typů transakce
export const TRANSACTION_TYPE_MAP = {
  'sale': 'sale',
  'rent': 'rent',
  'auction': 'sale',
  'share': 'sale'
};

// Mapování typů nemovitostí
export const PROPERTY_TYPE_MAP = {
  'flat': 'flat',
  'house': 'house',
  'land': 'land',
  'commercial': 'commercial',
  'other': 'other'
};

// Mapování podtypů bytů
export const FLAT_SUBTYPE_MAP = {
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
  '6+': '6+kk',
  'atypical': 'atypical'
};

// Mapování podtypů domů
export const HOUSE_SUBTYPE_MAP = {
  'family': 'family',
  'villa': 'villa',
  'cottage': 'cottage',
  'farmhouse': 'farmhouse',
  'other': 'other'
};

// Validace vstupních dat
export function validatePropertyData(data) {
  const errors = [];
  
  // Povinná pole
  if (!data.external_id) errors.push('external_id je povinne');
  if (!data.transaction_type) errors.push('transaction_type je povinne');
  if (!data.property_type) errors.push('property_type je povinne');
  if (!data.price || data.price <= 0) errors.push('price musi byt vetsi nez 0');
  if (!data.title || data.title.length < 10) errors.push('title musi mit alespon 10 znaku');
  if (!data.description || data.description.length < 50) errors.push('description musi mit alespon 50 znaku');
  if (!data.city) errors.push('city je povinne');
  if (!data.area || data.area <= 0) errors.push('area musi byt vetsi nez 0');
  
  // Validace číselníků
  if (data.transaction_type && !TRANSACTION_TYPE_MAP[data.transaction_type]) {
    errors.push(`Neplatny transaction_type: ${data.transaction_type}`);
  }
  
  if (data.property_type && !PROPERTY_TYPE_MAP[data.property_type]) {
    errors.push(`Neplatny property_type: ${data.property_type}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Mapování na náš interní formát
export function mapToInternalFormat(externalData) {
  return {
    title: externalData.title,
    description: externalData.description,
    transaction_type: TRANSACTION_TYPE_MAP[externalData.transaction_type],
    property_type: PROPERTY_TYPE_MAP[externalData.property_type],
    property_subtype: externalData.property_subtype || null,
    price: parseFloat(externalData.price),
    price_note: externalData.price_note || null,
    city: externalData.city,
    district: externalData.district || null,
    street: externalData.street || null,
    latitude: externalData.latitude || null,
    longitude: externalData.longitude || null,
    area: parseInt(externalData.area),
    rooms: externalData.rooms || null,
    floor: externalData.floor || null,
    total_floors: externalData.total_floors || null,
    building_type: externalData.building_type || null,
    building_condition: externalData.building_condition || null,
    furnished: externalData.furnished || null,
    has_balcony: externalData.balcony ? 1 : 0,
    has_elevator: externalData.elevator ? 1 : 0,
    has_parking: externalData.parking ? 1 : 0,
    agent_id: externalData.agent_id || null,
    status: externalData.published ? 'active' : 'draft',
    images: '[]',
    main_image: null
  };
}
