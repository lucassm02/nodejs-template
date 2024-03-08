import { equals } from '@/util';

describe('equals Function', () => {
  it('Should return true for equal primitive values', () => {
    expect(equals(5, 5)).toBe(true);
    expect(equals('foo', 'foo')).toBe(true);
    expect(equals(true, true)).toBe(true);
    expect(equals(null, null)).toBe(true);
    expect(equals(undefined, undefined)).toBe(true);
  });

  it('Should return true for equal Date objects', () => {
    const date1 = new Date('2024-01-31');
    const date2 = new Date('2024-01-31');
    expect(equals(date1, date2)).toBe(true);
  });

  it('Should return true for equal objects', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 2 } };
    expect(equals(obj1, obj2)).toBe(true);
  });

  it('Should return false for different primitive values', () => {
    expect(equals(5, 10)).toBe(false);
    expect(equals('foo', 'bar')).toBe(false);
    expect(equals(true, false)).toBe(false);
  });

  it('Should return false for different Date objects', () => {
    const date1 = new Date('2024-01-31');
    const date2 = new Date('2024-02-01');
    expect(equals(date1, date2)).toBe(false);
  });

  it('Should return false for different objects', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { a: 1, b: { c: 3 } };
    expect(equals(obj1, obj2)).toBe(false);
  });

  it('Should return false for objects with different number of keys', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2, c: 3 };
    expect(equals(obj1, obj2)).toBe(false);
  });
});
