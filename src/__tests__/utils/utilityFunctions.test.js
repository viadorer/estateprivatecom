describe('Utility Functions', () => {
  test('handles number conversion safely', () => {
    // Test pro Number() conversion v filtrech
    expect(Number('22')).toBe(22);
    expect(Number(22)).toBe(22);
    expect(Number(null)).toBe(0);
    expect(Number(undefined)).toBe(NaN);
  });

  test('string case insensitive search works', () => {
    const searchTerm = 'praha';
    const locations = ['Praha', 'Brno', 'Ostrava'];

    const results = locations.filter(loc =>
      loc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    expect(results).toHaveLength(1);
    expect(results[0]).toBe('Praha');
  });

  test('parseInt handles invalid input', () => {
    expect(parseInt('5000000')).toBe(5000000);
    expect(parseInt('')).toBe(NaN);
    expect(parseInt(null)).toBe(NaN);
    expect(parseInt(undefined)).toBe(NaN);
  });

  test('array filtering preserves original array', () => {
    const original = [1, 2, 3, 4, 5];
    const filtered = original.filter(x => x > 3);

    expect(original).toHaveLength(5);
    expect(filtered).toHaveLength(2);
    expect(filtered).toEqual([4, 5]);
  });
});
