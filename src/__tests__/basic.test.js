describe('Basic Tests', () => {
  test('true is true', () => {
    expect(true).toBe(true);
  });

  test('1 + 1 equals 2', () => {
    expect(1 + 1).toBe(2);
  });

  test('array contains item', () => {
    const arr = [1, 2, 3];
    expect(arr).toContain(2);
  });
});
