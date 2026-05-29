import { CallbackWithStateHook } from '@/infra/http/util/web-server/types';
import { YupSchema } from '@/presentation/protocols';
import { badRequest } from '@/presentation/utils/http-response';
import { formatYupError } from '@/util/formatters/yup-error-formatter';

type ValidationPayload = Record<string, unknown>;

type CaseMode = 'insensitive' | 'strict';
type ValidationStrategy = 'merge' | 'strict';

export interface RequestValidationAdapterOptions {
  caseMode?: CaseMode;
  strategy?: ValidationStrategy;
}

const defaultOptions: Required<RequestValidationAdapterOptions> = {
  caseMode: 'insensitive',
  strategy: 'merge'
};

const isPlainObject = (value: unknown): value is ValidationPayload =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const splitKeyWords = (key: string): string[] => {
  return key
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-\s]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.toLowerCase());
};

const capitalize = (word: string): string =>
  `${word.charAt(0).toUpperCase()}${word.slice(1)}`;

const toCamelCase = (words: string[]): string =>
  words.map((word, index) => (index === 0 ? word : capitalize(word))).join('');

const toPascalCase = (words: string[]): string =>
  words.map(capitalize).join('');

const toSnakeCase = (words: string[]): string => words.join('_');

const toUpperSnakeCase = (words: string[]): string =>
  toSnakeCase(words).toUpperCase();

const toLowerCase = (words: string[]): string => words.join('');

const toUpperCase = (words: string[]): string =>
  toLowerCase(words).toUpperCase();

const getCaseVariants = (key: string): string[] => {
  const words = splitKeyWords(key);

  if (!words.length) return [key];

  return Array.from(
    new Set([
      key,
      toCamelCase(words),
      toPascalCase(words),
      toSnakeCase(words),
      toUpperSnakeCase(words),
      toLowerCase(words),
      toUpperCase(words)
    ])
  );
};

const expandPayloadCaseVariants = (payload: unknown): unknown => {
  if (Array.isArray(payload)) {
    return payload.map(expandPayloadCaseVariants);
  }

  if (!isPlainObject(payload)) {
    return payload;
  }

  return Object.entries(payload).reduce<ValidationPayload>(
    (data, [key, value]) => {
      const expandedValue = expandPayloadCaseVariants(value);

      return getCaseVariants(key).reduce<ValidationPayload>(
        (result, variant) => ({
          ...result,
          [variant]: expandedValue
        }),
        data
      );
    },
    {}
  );
};

const transformPayloadKeys = (
  payload: unknown,
  transformKey: (key: string) => string
): unknown => {
  if (Array.isArray(payload)) {
    return payload.map((item) => transformPayloadKeys(item, transformKey));
  }

  if (!isPlainObject(payload)) {
    return payload;
  }

  return Object.entries(payload).reduce<ValidationPayload>(
    (data, [key, value]) => ({
      ...data,
      [transformKey(key)]: transformPayloadKeys(value, transformKey)
    }),
    {}
  );
};

const buildStrictCasePayloads = (payload: unknown): unknown[] => {
  const transforms = [
    (key: string) => key,
    (key: string) => toCamelCase(splitKeyWords(key)),
    (key: string) => toPascalCase(splitKeyWords(key)),
    (key: string) => toSnakeCase(splitKeyWords(key)),
    (key: string) => toUpperSnakeCase(splitKeyWords(key)),
    (key: string) => toLowerCase(splitKeyWords(key)),
    (key: string) => toUpperCase(splitKeyWords(key))
  ];

  return transforms.map((transform) =>
    transformPayloadKeys(payload, transform)
  );
};

const buildValidationPayloads = (
  payload: unknown,
  options: Required<RequestValidationAdapterOptions>
): unknown[] => {
  if (options.caseMode === 'strict') {
    return [payload];
  }

  if (options.strategy === 'strict') {
    return buildStrictCasePayloads(payload);
  }

  return [expandPayloadCaseVariants(payload)];
};

export function requestValidationAdapter(
  schema: YupSchema,
  options: RequestValidationAdapterOptions = {}
): CallbackWithStateHook {
  const validationOptions = {
    ...defaultOptions,
    ...options
  };

  return async (req, res, next) => {
    const httpRequest = {
      ...req.body,
      ...req.params,
      ...req.query,
      ...req.headers
    };

    try {
      const validationPayloads = buildValidationPayloads(
        httpRequest,
        validationOptions
      );

      const errors: unknown[] = [];

      for (const validationPayload of validationPayloads) {
        try {
          await schema.validate(validationPayload, {
            abortEarly: false
          });

          return next();
        } catch (error) {
          errors.push(error);
        }
      }

      throw errors[0];
    } catch (error) {
      const { body, statusCode } = badRequest(formatYupError(error));
      return res.status(statusCode).send(body);
    }
  };
}
