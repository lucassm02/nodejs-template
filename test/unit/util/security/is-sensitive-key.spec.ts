import {
  getSensitiveKeyType,
  isSensitiveKey
} from '@/util/security/is-sensitive-key';

describe('isSensitiveKey', () => {
  describe('short keywords', () => {
    it.each([
      ['rg', 'partial'],
      ['user_rg', 'partial'],
      ['userRg', 'partial'],
      ['pin', 'partial'],
      ['pinCode', 'partial'],
      ['cpf', 'partial'],
      ['dob', 'partial'],
      ['pan', 'card'],
      ['card', 'card'],
      ['cardNumber', 'card'],
      ['card_number', 'card'],
      ['auth', 'redact'],
      ['authToken', 'redact']
    ])('should classify %s as %s', (key, expected) => {
      expect(getSensitiveKeyType(key)).toBe(expected);
    });

    it.each([
      'charge',
      'chargeValue',
      'organization',
      'target',
      'shipping',
      'shippingAddress',
      'company',
      'companyName',
      'author',
      'authorId',
      'authorized',
      'authors',
      'authorName',
      'wildcard',
      'cardholder',
      'discard'
    ])('should not classify %s as sensitive', (key) => {
      expect(getSensitiveKeyType(key)).toBeNull();
      expect(isSensitiveKey(key)).toBe(false);
    });
  });

  describe('short keywords concatenated with a key affix', () => {
    // A short keyword also matches inside a longer word when what surrounds
    // it is a common key fragment (`user`, `pre`, `data`, `token`...), which
    // is what covers names built without a separator.
    it.each([
      ['userauth', 'redact'],
      ['userAuth', 'redact'],
      ['user_auth', 'redact'],
      ['authdata', 'redact'],
      ['authData', 'redact'],
      ['preauth', 'redact'],
      ['preAuth', 'redact'],
      ['myauthdata', 'redact'],
      ['oauthToken', 'redact'],
      ['cardHolder', 'card']
    ])('should classify %s as %s', (key, expected) => {
      expect(getSensitiveKeyType(key)).toBe(expected);
    });
  });

  describe('short keywords concatenated with another keyword', () => {
    it.each([
      ['cpfcnpj', 'partial'],
      ['cnpjcpf', 'partial'],
      ['cpfCnpj', 'partial'],
      ['cpf_cnpj', 'partial'],
      ['usercpfcnpj', 'partial'],
      ['cpfcnpjuser', 'partial'],
      ['documentcpf', 'partial'],
      ['documentoCpf', 'partial'],
      ['cardpan', 'card'],
      ['numeropan', 'card']
    ])('should classify %s as %s', (key, expected) => {
      expect(getSensitiveKeyType(key)).toBe(expected);
    });

    it.each([
      'panel',
      'japan',
      'expand',
      'pancake',
      'spinner',
      'opinion',
      'campaign',
      'champion',
      'container',
      'documentation',
      'keyring',
      'margin'
    ])('should not classify %s as sensitive', (key) => {
      expect(getSensitiveKeyType(key)).toBeNull();
    });
  });

  describe('long keywords', () => {
    it.each([
      ['cardnumber', 'card'],
      ['mycardnumber', 'card'],
      ['ccnumber', 'card'],
      ['password', 'redact'],
      ['authorization', 'redact'],
      ['authentication', 'redact'],
      ['accessToken', 'redact'],
      ['client_secret', 'redact'],
      ['dateOfBirth', 'partial'],
      ['expiration', 'partial'],
      ['securitycode', 'partial']
    ])('should keep matching %s as %s by substring', (key, expected) => {
      expect(getSensitiveKeyType(key)).toBe(expected);
    });
  });

  describe('precedence', () => {
    it('should prefer card over redact and partial', () => {
      expect(getSensitiveKeyType('card_token')).toBe('card');
    });

    it('should prefer redact over partial', () => {
      expect(getSensitiveKeyType('auth_pin')).toBe('redact');
    });
  });

  describe('value based detection', () => {
    it('should classify a Luhn valid PAN as card even on a neutral key', () => {
      expect(getSensitiveKeyType('reference', '4111111111111111')).toBe('card');
    });

    it('should not classify an ordinary value on a neutral key', () => {
      expect(getSensitiveKeyType('reference', 'ordinary value')).toBeNull();
    });
  });
});
