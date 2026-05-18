const CARD_KEYWORDS = [
  'card',
  'creditcard',
  'credit_card',
  'cardnumber',
  'card_number',
  'pan'
];

const REDACT_KEYWORDS = [
  'password',
  'secret',
  'token',
  'apikey',
  'api_key',
  'auth',
  'authorization',
  'authentication',
  'bearer',
  'private',
  'privatekey',
  'private_key'
];

const PARTIAL_KEYWORDS = [
  'cvv',
  'ssn',
  'cpf',
  'cnpj',
  'rg',
  'pin',
  'otp',
  'mfa',
  'expiry',
  'expiration'
];

const ALL_SENSITIVE_PATTERN = new RegExp(
  [...CARD_KEYWORDS, ...REDACT_KEYWORDS, ...PARTIAL_KEYWORDS].join('|'),
  'i'
);

export type SensitiveKeyType = 'card' | 'redact' | 'partial';

export function getSensitiveKeyType(key: string): SensitiveKeyType | null {
  if (!ALL_SENSITIVE_PATTERN.test(key)) return null;
  const lower = key.toLowerCase();
  if (CARD_KEYWORDS.some((k) => lower.includes(k))) return 'card';
  if (REDACT_KEYWORDS.some((k) => lower.includes(k))) return 'redact';
  if (PARTIAL_KEYWORDS.some((k) => lower.includes(k))) return 'partial';
  return null;
}

export function isSensitiveKey(key: string): boolean {
  return getSensitiveKeyType(key) !== null;
}
