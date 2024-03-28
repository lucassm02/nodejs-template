import { recursiveDataConvertFilterLayer } from '@/util/object/formatters/recursive-data-converter';

describe('recursiveDataConvertFilterLayer Function', () => {
  it('should return data when data is an array and items are diff of object', () => {
    const data = [1, 2, 3, 'a', 'b', 'c'];
    const formatter = jest.fn();
    const result = recursiveDataConvertFilterLayer(data, formatter);

    const expected = [1, 2, 3, 'a', 'b', 'c'];
    expect(result).toStrictEqual(expected);
  });

  it('should return data when data is string', () => {
    const data = 'any_data';
    const formatter = jest.fn();
    const result = recursiveDataConvertFilterLayer(data, formatter);

    const expected = 'any_data';
    expect(result).toStrictEqual(expected);
  });

  it('should return data when data is number', () => {
    const data = 1;
    const formatter = jest.fn();
    const result = recursiveDataConvertFilterLayer(data, formatter);

    const expected = 1;
    expect(result).toStrictEqual(expected);
  });

  it('should return data when data is Date', () => {
    const data = new Date('2023-01-01');
    const formatter = jest.fn();
    const result = recursiveDataConvertFilterLayer(data, formatter);

    const expected = new Date('2023-01-01');
    expect(result).toStrictEqual(expected);
  });

  it('should return data when data is an array of object', () => {
    const data = [
      { id: 1, name: 'name1', payload: ['item1', { item: 'item2' }, 1] },
      { id: 2, name: 'name2', createdAt: new Date('2023-01-01') }
    ];
    const formatter = jest.fn((value) => value);
    const result = recursiveDataConvertFilterLayer(data, formatter);

    const expected = [
      { id: 1, name: 'name1', payload: ['item1', { item: 'item2' }, 1] },
      { id: 2, name: 'name2', createdAt: new Date('2023-01-01') }
    ];
    expect(result).toStrictEqual(expected);
  });
});
