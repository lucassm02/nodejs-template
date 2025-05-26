const SENSITIVE_KEYWORDS = [
  'cvv',
  'authorization',
  'password',
  'auth',
  'authentication',
  'token',
  'secret',
  'apiKey',
  'apikey',
  'api_key',
  'ssn',
  'creditCard',
  'creditcard',
  'credit_card',
  'cardnumber',
  'card_number',
  'card'
];

export function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_KEYWORDS.some((keyword) => lower.includes(keyword));
}
