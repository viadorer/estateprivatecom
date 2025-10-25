# Flexibilní struktura poptávky

## Datová struktura

```javascript
{
  client_id: 5,
  property_requirements: [
    {
      transaction_type: 'sale',  // nebo 'rent'
      property_type: 'flat',     // flat, house, commercial, land, project
      property_subtype: '2+kk',  // podle typu
      filters: {
        // Dynamické vlastnosti podle typu nemovitosti
        rooms: { min: 2, max: 4 },
        floor: { min: 2, max: 10 },
        area: { min: 50, max: 100 },
        has_balcony: true,
        has_elevator: true
      }
    },
    {
      transaction_type: 'sale',
      property_type: 'land',
      property_subtype: 'building_plot',
      filters: {
        land_area: { min: 500, max: 2000 }
        // žádné pokoje ani patro - každý typ má své vlastnosti
      }
    }
  ],
  common_filters: {
    price: { min: 3000000, max: 8000000 },
    cities: ['Praha', 'Brno'],
    districts: ['Praha 5', 'Brno-střed']
  },
  validity_days: 30,
  email_notifications: 1
}
```

## Vlastnosti podle typu nemovitosti

### Byt (flat)
- rooms (min/max)
- floor (min/max)
- area (min/max)
- has_balcony, has_loggia, has_terrace, has_cellar, has_elevator

### Dům (house)
- rooms (min/max)
- area (min/max)
- land_area (min/max)
- total_floors (min/max)
- has_garden, has_garage, has_pool

### Komerční (commercial)
- area (min/max)
- floor (min/max) - pro kanceláře
- has_parking, has_elevator

### Pozemek (land)
- land_area (min/max)

### Projekt (project)
- area (min/max)
- units_count (min/max) - počet jednotek
