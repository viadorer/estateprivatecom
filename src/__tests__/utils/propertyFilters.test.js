describe('Property Filtering Logic', () => {
  const mockProperties = [
    {
      id: 1,
      agent_id: '22',
      title: 'Rodinný dům Praha',
      city: 'Praha',
      price: 5000000,
      transaction_type: 'sale',
      property_type: 'house'
    },
    {
      id: 2,
      agent_id: '25',
      title: 'Byt Brno',
      city: 'Brno',
      price: 3000000,
      transaction_type: 'sale',
      property_type: 'flat'
    },
    {
      id: 3,
      agent_id: '22',
      title: 'Kancelář Praha',
      city: 'Praha',
      price: 8000000,
      transaction_type: 'sale',
      property_type: 'commercial'
    }
  ];

  test('filters properties by agent_id correctly', () => {
    const currentUser = { id: '22', role: 'agent' };
    const filters = { mine: true };

    const filteredProperties = mockProperties.filter(property => {
      // Filtr "Moje nabídky"
      if (filters.mine && Number(property.agent_id) !== Number(currentUser.id)) {
        return false;
      }
      return true;
    });

    expect(filteredProperties).toHaveLength(2);
    expect(filteredProperties.every(p => p.agent_id === '22')).toBe(true);
  });

  test('filters properties by city', () => {
    const filters = { city: 'Praha' };

    const filteredProperties = mockProperties.filter(property => {
      if (filters.city && !property.city.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }
      return true;
    });

    expect(filteredProperties).toHaveLength(2);
    expect(filteredProperties.every(p => p.city === 'Praha')).toBe(true);
  });

  test('filters properties by price range', () => {
    const filters = { price_min: '4000000', price_max: '7000000' };

    const filteredProperties = mockProperties.filter(property => {
      if (filters.price_min && property.price < parseInt(filters.price_min)) {
        return false;
      }
      if (filters.price_max && property.price > parseInt(filters.price_max)) {
        return false;
      }
      return true;
    });

    expect(filteredProperties).toHaveLength(1);
    expect(filteredProperties[0].id).toBe(1);
  });

  test('filters properties by transaction type', () => {
    const filters = { transaction_type: 'sale' };

    const filteredProperties = mockProperties.filter(property => {
      if (filters.transaction_type && property.transaction_type !== filters.transaction_type) {
        return false;
      }
      return true;
    });

    expect(filteredProperties).toHaveLength(3); // All are 'sale'
  });

  test('combines multiple filters correctly', () => {
    const currentUser = { id: '22', role: 'agent' };
    const filters = {
      mine: true,
      city: 'Praha',
      price_max: '6000000'
    };

    const filteredProperties = mockProperties.filter(property => {
      // Filtr "Moje nabídky"
      if (filters.mine && Number(property.agent_id) !== Number(currentUser.id)) {
        return false;
      }

      if (filters.city && !property.city.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }

      if (filters.price_max && property.price > parseInt(filters.price_max)) {
        return false;
      }

      return true;
    });

    expect(filteredProperties).toHaveLength(1);
    expect(filteredProperties[0].id).toBe(1);
  });
});
