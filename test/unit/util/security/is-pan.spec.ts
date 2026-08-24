import { getSensitiveKeyType } from '@/util/security/is-sensitive-key';

// `isPAN` is internal, so it is exercised through the value based branch of
// getSensitiveKeyType, which only runs when the key itself is not sensitive.
const detectsPAN = (value: unknown) =>
  getSensitiveKeyType('reference', value) === 'card';

describe('PAN detection', () => {
  it.each([
    '4111111111111111',
    '4111 1111 1111 1111',
    '4111-1111-1111-1111',
    '5500005555555559',
    '340000000000009',
    '30000000000004',
    '4111\t1111\t1111\t1111',
    '4111 1111 1111 1111'
  ])('should detect %s', (value) => {
    expect(detectsPAN(value)).toBe(true);
  });

  it('should detect a numeric PAN', () => {
    expect(detectsPAN(4111111111111111)).toBe(true);
  });

  it.each([
    ['a Luhn invalid number', '4111111111111112'],
    ['too few digits', '411111111111'],
    ['too many digits', '41111111111111111111'],
    ['ordinary text', 'transaction approved'],
    ['an ISO timestamp', '2026-08-19T11:47:38Z'],
    ['a UUID', '9b749cba-7c6a-40da-b7ff-166d07a7344e'],
    ['an empty string', ''],
    ['a decimal', '4111111111111111.5'],
    ['a boolean', true],
    ['null', null],
    ['an object', { pan: '4111111111111111' }]
  ])('should reject %s', (_label, value) => {
    expect(detectsPAN(value)).toBe(false);
  });

  it('should reject a long text that contains a PAN', () => {
    const text = `payment made with card 4111111111111111 on the store`;
    expect(detectsPAN(text)).toBe(false);
  });

  // A hyphen is a separator anywhere in the value, including in leading
  // position, so a negative number reads as a PAN. Kept as is to preserve the
  // behaviour of the previous implementation.
  it('should treat a leading minus sign as a separator', () => {
    expect(detectsPAN(-4111111111111111)).toBe(true);
  });
});
