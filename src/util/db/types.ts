import {
  BooleanSchema,
  DateSchema,
  NumberSchema,
  StringSchema
} from './schemas';

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
