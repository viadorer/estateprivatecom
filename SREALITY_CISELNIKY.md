# Sreality API - Kompletni Ciselniky

Porovnani nasich hodnot s realnymi hodnotami ze Sreality API.

## Co mame implementovano

### transaction_type
- sale - Prodej
- rent - Pronajem

### property_type
- flat - Byt
- house - Dum
- commercial - Komercni
- land - Pozemek

## Co chybi podle Sreality API

### property_subtype - Podtypy nemovitosti

Byty (flat):
- 1+kk, 1+1, 2+kk, 2+1, 3+kk, 3+1, 4+kk, 4+1, 5+kk, 5+1, 6+kk, 6+1
- atypical, other

Domy (house):
- family_house, villa, cottage, cabin, farmhouse, mobile_home, other

Komercni (commercial):
- office, retail, warehouse, production, restaurant, accommodation
- agricultural, garage, other

Pozemky (land):
- building_plot, agricultural, forest, garden, orchard, meadow, pond, other

### building_type - Typ stavby
- brick, panel, wood, stone, mixed, monolithic, skeleton, other

### building_condition - Stav stavby
- new_building, very_good, good, after_reconstruction
- before_reconstruction, in_construction, project, demolished

### ownership - Vlastnictvi
- personal, cooperative, state, church, transferred

### furnished - Vybaveni
- furnished, partly_furnished, not_furnished

### energy_rating - Energeticka trida
- A, B, C, D, E, F, G

### heating_type - Typ vytapeni
- gas, electric, central, solid_fuel, heat_pump, solar, no_heating, other

### Dalsi parametry ze Sreality

- has_video - Ma video
- has_panorama - Ma panorama
- has_floor_plan - Ma pudorys
- has_matterport_url - Ma 3D prohlidku
- is_auction - Je drazba
- exclusively_at_rk - Exkluzivne v RK
- attractive_offer - Atraktivni nabidka
- new - Nove (posledni 3 dny)

### Labels (Stitky)
- new_building - Novostavba
- balcony - Balkon
- loggia - Lodzie
- terrace - Terasa
- cellar - Sklep
- garage - Garaz
- parking_lots - Parkovani
- elevator - Vytah
- garden - Zahrada
- basin - Bazen

### Lokace - Dostupnost
- metro - Metro X min pesky
- tram - Tramvaj X min pesky
- bus_public_transport - Autobus X min pesky
- train - Vlak X min pesky
- shop - Obchod X min pesky
- restaurant - Restaurace X min pesky
- school - Skola X min pesky
- kindergarten - Skolka X min pesky
- post_office - Posta X min pesky
- medic - Lekar X min pesky
- pharmacy - Lekarna X min pesky

## Doporuceni

1. Pridat vsechny podtypy do DB
2. Rozsirit building_type a building_condition
3. Pridat video, panorama, floor_plan
4. Pridat labels jako JSON pole
5. Pridat dostupnost jako JSON objekt
