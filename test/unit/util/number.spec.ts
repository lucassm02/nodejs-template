import { randomInt } from '@/util';

describe('RandomInt Function', () => {
  it('Should return a random integer between min and max (inclusive)', () => {
    const min = 5;
    const max = 10;
    const result = randomInt(min, max);

    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
    expect(Number.isInteger(result)).toBe(true);
  });

  it('Should return the provided min value if min and max are the same', () => {
    const min = 5;
    const max = 5;
    const result = randomInt(min, max);

    expect(result).toBe(min);
  });

  it('Should return NaN if either min or max is not a number', () => {
    const result1 = randomInt(Number('invalid'), 10);
    const result2 = randomInt(5, Number('invalid'));
    const result3 = randomInt(Number('invalid'), Number('invalid'));

    expect(Number.isNaN(result1)).toBe(true);
    expect(Number.isNaN(result2)).toBe(true);
    expect(Number.isNaN(result3)).toBe(true);
  });
});
