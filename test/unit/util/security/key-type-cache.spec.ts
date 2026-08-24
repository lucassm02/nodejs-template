import { getSensitiveKeyType } from '@/util/security/is-sensitive-key';

describe('sensitive key classification cache', () => {
  it('should return the same classification on repeated calls', () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      expect(getSensitiveKeyType('password')).toBe('redact');
      expect(getSensitiveKeyType('cardNumber')).toBe('card');
      expect(getSensitiveKeyType('user_cpf')).toBe('partial');
      expect(getSensitiveKeyType('charge')).toBeNull();
    }
  });

  it('should keep the value based branch working for a cached neutral key', () => {
    expect(getSensitiveKeyType('reference')).toBeNull();
    expect(getSensitiveKeyType('reference', 'ordinary value')).toBeNull();
    expect(getSensitiveKeyType('reference', '4111111111111111')).toBe('card');
  });

  it('should keep classifying correctly past the cache ceiling', () => {
    for (let index = 0; index < 6_000; index++) {
      getSensitiveKeyType(`neutral_key_${index}`);
    }

    expect(getSensitiveKeyType('neutral_key_9999')).toBeNull();
    expect(getSensitiveKeyType('password_9999')).toBe('redact');
    expect(getSensitiveKeyType('charge_9999')).toBeNull();
  });
});
