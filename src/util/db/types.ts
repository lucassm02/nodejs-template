import { BooleanSchema } from './types/boolean-schema';
import { DateSchema } from './types/date-schema';
import { NumberSchema } from './types/number-schema';
import { StringSchema } from './types/string-schema';

export function number(): NumberSchema {
  return new NumberSchema();
}
export function string(): StringSchema {
  return new StringSchema();
}
export function boolean(): BooleanSchema {
  return new BooleanSchema();
}

export function date(): DateSchema {
  return new DateSchema();
}
