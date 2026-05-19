import { filterKeys } from '@/util/object/modifiers/filter-keys';

describe('filterKeys', () => {
  it('should return object unchanged when no options provided', () => {
    const input = { a: 1, b: 2, c: 3 };
    const result = filterKeys(input, {});
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('should keep only allowedKeys', () => {
    const input = { a: 1, b: 2, c: 3 };
    const result = filterKeys(input, { allowedKeys: ['a', 'c'] });
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it('should remove deniedKeys', () => {
    const input = { a: 1, b: 2, c: 3 };
    const result = filterKeys(input, { deniedKeys: ['b'] });
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it('should apply allowedKeys then deniedKeys', () => {
    const input = { a: 1, b: 2, c: 3 };
    const result = filterKeys(input, {
      allowedKeys: ['a', 'b'],
      deniedKeys: ['b']
    });
    expect(result).toEqual({ a: 1 });
  });

  it('should return original value when input is not an object', () => {
    const result = filterKeys('not-an-object' as any, {
      allowedKeys: ['a'] as any
    });
    expect(result).toBe('not-an-object');
  });

  it('should return empty object when allowedKeys matches nothing', () => {
    const input = { a: 1, b: 2 };
    const result = filterKeys(input, { allowedKeys: ['z'] });
    expect(result).toEqual({});
  });
});
