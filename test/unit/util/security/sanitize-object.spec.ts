import { sanitizeObject } from '@/util/security/sanitize-object';

describe('sanitizeObject', () => {
  describe('masking', () => {
    it('should redact a secret value', () => {
      expect(sanitizeObject({ password: 'my_password' })).toEqual({
        password: '[REDACTED]'
      });
    });

    it('should mask a card keeping the bin and the last four digits', () => {
      expect(sanitizeObject({ cardNumber: '4111111111111111' })).toEqual({
        cardNumber: '411111******1111'
      });
    });

    it('should mask nested sensitive values', () => {
      const result = sanitizeObject({
        user: { name: 'Ada', cpf: '12345678901' }
      });

      expect(result.user.name).toBe('Ada');
      expect(result.user.cpf).not.toBe('12345678901');
    });

    it('should mask sensitive values inside arrays', () => {
      const result = sanitizeObject({ items: [{ token: 'abc' }] });

      expect(result.items[0].token).toBe('[REDACTED]');
    });

    it('should inherit the parent type for sub values', () => {
      const result = sanitizeObject({ card: { number: '4111111111111111' } });

      expect(result.card.number).toBe('411111******1111');
    });
  });

  describe('identity when nothing is masked', () => {
    it('should return the same reference for a clean object', () => {
      const input = { message: 'ok', level: 'info' };

      expect(sanitizeObject(input)).toBe(input);
    });

    it('should return the same reference for a clean nested object', () => {
      const input = { body: { items: [{ id: 1 }, { id: 2 }] } };
      const result = sanitizeObject(input);

      expect(result).toBe(input);
      expect(result.body).toBe(input.body);
      expect(result.body.items).toBe(input.body.items);
    });

    it('should return the same reference for a clean array', () => {
      const input = [{ id: 1 }, { id: 2 }];

      expect(sanitizeObject(input)).toBe(input);
    });

    it('should return primitives untouched', () => {
      expect(sanitizeObject('text')).toBe('text');
      expect(sanitizeObject(42)).toBe(42);
      expect(sanitizeObject(null)).toBeNull();
      expect(sanitizeObject(undefined)).toBeUndefined();
    });
  });

  describe('isolation when something is masked', () => {
    it('should not mutate the received object', () => {
      const input = { password: 'my_password', message: 'ok' };
      const result = sanitizeObject(input);

      expect(input.password).toBe('my_password');
      expect(result).not.toBe(input);
      expect(result.password).toBe('[REDACTED]');
    });

    it('should not mutate a nested object', () => {
      const input = { auth: { token: 'abc' }, message: 'ok' };
      const result = sanitizeObject(input);

      expect(input.auth.token).toBe('abc');
      expect(result.auth.token).toBe('[REDACTED]');
    });

    it('should keep untouched branches shared with the input', () => {
      const input = { password: 'my_password', body: { items: [1, 2, 3] } };
      const result = sanitizeObject(input);

      expect(result).not.toBe(input);
      expect(result.body).toBe(input.body);
    });

    it('should not mutate the received array', () => {
      const input = [{ token: 'abc' }, { id: 1 }];
      const result = sanitizeObject(input);

      expect(input[0].token).toBe('abc');
      expect(result).not.toBe(input);
      expect(result[1]).toBe(input[1]);
    });
  });
});
