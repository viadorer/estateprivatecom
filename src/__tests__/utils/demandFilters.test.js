describe('Demand Filtering Logic', () => {
  const mockDemands = [
    {
      id: 1,
      client_id: '18',
      transaction_type: 'sale',
      property_type: 'flat',
      price_min: 2000000,
      price_max: 5000000,
      preferred_location: 'Praha'
    },
    {
      id: 2,
      client_id: '22',
      transaction_type: 'rent',
      property_type: 'house',
      price_min: 15000,
      price_max: 25000,
      preferred_location: 'Brno'
    },
    {
      id: 3,
      client_id: '18',
      transaction_type: 'sale',
      property_type: 'commercial',
      price_min: 5000000,
      price_max: 10000000,
      preferred_location: 'Praha'
    }
  ];

  test('filters demands by client_id correctly', () => {
    const currentUser = { id: '18', role: 'client' };
    const filters = { mine: true };

    const filteredDemands = mockDemands.filter(demand => {
      // Filtr "Moje poptávky"
      if (filters.mine && Number(demand.client_id) !== Number(currentUser.id)) {
        return false;
      }
      return true;
    });

    expect(filteredDemands).toHaveLength(2);
    expect(filteredDemands.every(d => d.client_id === '18')).toBe(true);
  });

  test('filters demands by location', () => {
    const filters = { location_search: 'praha' };

    const filteredDemands = mockDemands.filter(demand => {
      if (filters.location_search && demand.preferred_location) {
        if (!demand.preferred_location.toLowerCase().includes(filters.location_search.toLowerCase())) {
          return false;
        }
      }
      return true;
    });

    expect(filteredDemands).toHaveLength(2);
    expect(filteredDemands.every(d => d.preferred_location === 'Praha')).toBe(true);
  });

  test('filters demands by price range', () => {
    const filters = { price_min: '3000000', price_max: '8000000' };

    const filteredDemands = mockDemands.filter(demand => {
      if (filters.price_min && demand.price_max < parseInt(filters.price_min)) {
        return false;
      }
      if (filters.price_max && demand.price_min > parseInt(filters.price_max)) {
        return false;
      }
      return true;
    });

    expect(filteredDemands).toHaveLength(1);
    expect(filteredDemands[0].id).toBe(3);
  });

  test('filters demands by transaction type', () => {
    const filters = { transaction_type: 'sale' };

    const filteredDemands = mockDemands.filter(demand => {
      if (filters.transaction_type && demand.transaction_type !== filters.transaction_type) {
        return false;
      }
      return true;
    });

    expect(filteredDemands).toHaveLength(2);
    expect(filteredDemands.every(d => d.transaction_type === 'sale')).toBe(true);
  });
});
