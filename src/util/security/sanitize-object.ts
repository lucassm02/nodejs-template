import { isSensitiveKey } from './is-sensitive-key';
import { maskValue } from './mask-value';

type AnyObject = Record<string, any>;

const sensitiveSubValues = ['number', 'value', 'content'];

/**
 * Sanitizes an object: for each sensitive property,
 * masks 80% of the value; for the rest, it resorts in
 */
export function sanitizeObject(obj: any, parentKey: string = ''): any {
  if (Array.isArray(obj)) {
    return obj.map((value) => sanitizeObject(value));
  }
  if (obj !== null && typeof obj === 'object') {
    const out: AnyObject = {};
    for (const [key, val] of Object.entries(obj)) {
      if (
        (isSensitiveKey(key) ||
          (isSensitiveKey(parentKey) && sensitiveSubValues.includes(key))) &&
        ['string', 'number'].includes(typeof val)
      ) {
        const str = String(val);
        out[key] = maskValue(str);
      } else {
        out[key] = sanitizeObject(val, key);
      }
    }
    return out;
  }

  return obj;
}
