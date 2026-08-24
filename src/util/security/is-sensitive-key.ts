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

const PAN_MIN_DIGITS = 13;
const PAN_MAX_DIGITS = 19;
// Longest accepted candidate: every digit followed by one separator.
const PAN_MAX_RAW_LENGTH = PAN_MAX_DIGITS * 2;

const HYPHEN = 45;
const SPACE = 32;
const ZERO = 48;
const NINE = 57;
const ASCII_MAX = 127;
const TAB = 9;
const CARRIAGE_RETURN = 13;

function isSeparator(charCode: number, char: string): boolean {
  if (charCode === HYPHEN || charCode === SPACE) return true;
  if (charCode >= TAB && charCode <= CARRIAGE_RETURN) return true;
  // Keeps parity with the `\s` class for the rare non ASCII space.
  return charCode > ASCII_MAX && /\s/.test(char);
}

// Runs Luhn over the raw value in a single pass, so a candidate is rejected
// without ever allocating the digits-only copy the check used to build for
// every logged value.
function isPAN(value: unknown): boolean {
  let raw: string;

  if (typeof value === 'string') raw = value;
  else if (typeof value === 'number') raw = String(value);
  else return false;

  const { length } = raw;
  if (length < PAN_MIN_DIGITS || length > PAN_MAX_RAW_LENGTH) return false;

  let digits = 0;
  let sum = 0;
  let alternate = false;

  for (let index = length - 1; index >= 0; index--) {
    const charCode = raw.charCodeAt(index);

    if (charCode < ZERO || charCode > NINE) {
      if (isSeparator(charCode, raw[index])) continue;
      return false;
    }

    let digit = charCode - ZERO;
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    alternate = !alternate;

    if (++digits > PAN_MAX_DIGITS) return false;
  }

  if (digits < PAN_MIN_DIGITS) return false;
  return sum % 10 === 0;
}

export type SensitiveKeyType = 'card' | 'redact' | 'partial';

// A log stream repeats the same key names indefinitely, and classifying a key
// is deterministic, so the result is memoized. Keys can come from an external
// payload, hence the ceiling: past it the cache stops growing and classifying
// falls back to computing the result every time.
const KEY_TYPE_CACHE_MAX_SIZE = 5_000;
const keyTypeCache = new Map<string, SensitiveKeyType | null>();

function classifyKey(key: string): SensitiveKeyType | null {
  const cached = keyTypeCache.get(key);
  if (cached !== undefined) return cached;

  let type: SensitiveKeyType | null = null;

  if (ALL_SENSITIVE_PATTERN.test(key)) {
    const lower = key.toLowerCase();
    const words = splitKeyIntoWords(key);

    if (matchesKeywords(CARD_KEYWORDS, lower, words)) type = 'card';
    else if (matchesKeywords(REDACT_KEYWORDS, lower, words)) type = 'redact';
    else if (matchesKeywords(PARTIAL_KEYWORDS, lower, words)) type = 'partial';
  }

  if (keyTypeCache.size < KEY_TYPE_CACHE_MAX_SIZE) keyTypeCache.set(key, type);

  return type;
}

export function getSensitiveKeyType(
  key: string,
  value?: unknown
): SensitiveKeyType | null {
  const typeByKey = classifyKey(key);
  if (typeByKey) return typeByKey;

  if (value !== undefined && isPAN(value)) return 'card';
  return null;
}

export function isSensitiveKey(key: string, value?: unknown): boolean {
  return getSensitiveKeyType(key, value) !== null;
}
