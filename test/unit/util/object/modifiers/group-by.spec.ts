import { groupBy } from '@/util/object/modifiers/group-by';

describe('groupBy', () => {
  it('should group objects by string key', () => {
    const input = [
      { type: 'fruit', name: 'apple' },
      { type: 'vegetable', name: 'carrot' },
      { type: 'fruit', name: 'banana' }
    ];
    const result = groupBy(input, (v) => v.type);
    expect(result).toEqual({
      fruit: [
        { type: 'fruit', name: 'apple' },
        { type: 'fruit', name: 'banana' }
      ],
      vegetable: [{ type: 'vegetable', name: 'carrot' }]
    });
  });

  it('should group numbers by numeric callback', () => {
    const input = [1, 2, 3, 4, 5, 6];
    const result = groupBy(input, (v) => v % 2);
    expect(result['0']).toEqual([2, 4, 6]);
    expect(result['1']).toEqual([1, 3, 5]);
  });

  it('should return empty object for empty array', () => {
    const result = groupBy([], (v) => String(v));
    expect(result).toEqual({});
  });

  it('should group all into one bucket when callback returns same key', () => {
    const input = [1, 2, 3];
    const result = groupBy(input, () => 'same');
    expect(result).toEqual({ same: [1, 2, 3] });
  });
});
