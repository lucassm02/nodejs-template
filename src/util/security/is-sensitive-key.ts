const CARD_KEYWORDS = [
  'card',
  'creditcard',
  'credit_card',
  'cardnumber',
  'card_number',
  'card_num',
  'cardnum',
  'card_no',
  'cardno',
  'cc_number',
  'ccnumber',
  'pan'
];

const REDACT_KEYWORDS = [
  'password',
  'passwd',
  'pwd',
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
  'private_key',
  'jwt',
  'session_id',
  'sessionid',
  'access_token',
  'accesstoken',
  'refresh_token',
  'refreshtoken',
  'api_secret',
  'apisecret',
  'client_secret',
  'clientsecret',
  'signing_key',
  'signingkey',
  'webhook_secret',
  'webhooksecret'
];

const PARTIAL_KEYWORDS = [
  'cvv',
  'cvv2',
  'cvc',
  'cvc2',
  'security_code',
  'securitycode',
  'ssn',
  'cpf',
  'cnpj',
  'rg',
  'pin',
  'otp',
  'mfa',
  'expiry',
  'expiration',
  'dob',
  'birth',
  'passport',
  'driver_license',
  'driverlicense',
  'national_id',
  'nationalid',
  'tax_id',
  'taxid',
  'fiscal'
];

const ALL_SENSITIVE_PATTERN = new RegExp(
  [...CARD_KEYWORDS, ...REDACT_KEYWORDS, ...PARTIAL_KEYWORDS].join('|'),
  'i'
);

// Short keywords are abbreviations that also occur inside ordinary words, so
// substring matching classifies `charge` (rg), `shipping` (pin), `company`
// (pan) and `author` (auth) as sensitive and masks them. They only match a
// whole word of the key; longer keywords keep substring matching, which is what
// covers concatenated keys such as `mycardnumber`.
const SHORT_KEYWORD_MAX_LENGTH = 4;

function splitKeyIntoWords(key: string): string[] {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function matchesKeywords(
  keywords: string[],
  lowerKey: string,
  words: string[]
): boolean {
  return keywords.some((keyword) =>
    keyword.length <= SHORT_KEYWORD_MAX_LENGTH
      ? words.includes(keyword)
      : lowerKey.includes(keyword)
  );
}

const PAN_LENGTHS = new Set([13, 14, 15, 16, 17, 18, 19]);

function luhn(digits: string): boolean {
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function isPAN(value: unknown): boolean {
  if (typeof value !== 'string' && typeof value !== 'number') return false;
  const digits = String(value).replace(/[\s-]/g, '');
  if (!/^\d+$/.test(digits)) return false;
  if (!PAN_LENGTHS.has(digits.length)) return false;
  return luhn(digits);
}

export type SensitiveKeyType = 'card' | 'redact' | 'partial';

export function getSensitiveKeyType(
  key: string,
  value?: unknown
): SensitiveKeyType | null {
  if (!ALL_SENSITIVE_PATTERN.test(key)) {
    if (value !== undefined && isPAN(value)) return 'card';
    return null;
  }
  const lower = key.toLowerCase();
  const words = splitKeyIntoWords(key);

  if (matchesKeywords(CARD_KEYWORDS, lower, words)) return 'card';
  if (matchesKeywords(REDACT_KEYWORDS, lower, words)) return 'redact';
  if (matchesKeywords(PARTIAL_KEYWORDS, lower, words)) return 'partial';
  return null;
}

export function isSensitiveKey(key: string, value?: unknown): boolean {
  return getSensitiveKeyType(key, value) !== null;
}
