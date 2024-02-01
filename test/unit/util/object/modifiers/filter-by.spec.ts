import { filterBy } from '@/util';

describe('filterBy Function', () => {
  const records = [
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob', age: 30 },
    { id: 3, name: 'Charlie', age: 25 }
  ];

  it('Should filter records based on a single key-value pair', () => {
    const result = filterBy(records, ['age'], [25]);
    expect(result).toEqual([
      { id: 1, name: 'Alice', age: 25 },
      { id: 3, name: 'Charlie', age: 25 }
    ]);
  });

  it('Should filter records based on multiple key-value pairs (AND condition)', () => {
    const result = filterBy(records, ['age', 'name'], [25, 'Alice']);
    expect(result).toEqual([{ id: 1, name: 'Alice', age: 25 }]);
  });

  it('Should handle filtering when value is undefined or null', () => {
    const result = filterBy(records, ['name'], [undefined]);
    expect(result).toEqual(records);

    const result2 = filterBy(records, ['name'], [null]);
    expect(result2).toEqual(records);
  });

  it('Should return all records when no filtering keys and values are provided', () => {
    const result = filterBy(records, [], []);
    expect(result).toEqual(records);
  });

  it('Should handle filtering on non-existing key', () => {
    const result = filterBy(records as any, ['nonExistingKey'], ['value']);
    expect(result).toEqual([]);
  });

  it.skip('should handle filtering on multiple keys with some non-existing keys', () => {
    const result = filterBy(
      records as any,
      ['name', 'nonExistingKey'],
      ['Alice', 'value']
    );
    expect(result).toEqual([{ id: 1, name: 'Alice', age: 25 }]);
  });
});
