const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

const snakeCaseKeyToCamelCase = (key: string): string =>
  key
    .split('_')
    .map((part, index) => (index > 0 ? capitalize(part) : part))
    .join('');

const camelCaseKeyToSnakeCase = (key: string): string =>
  key.replace(/^[a-z]|[A-Z]/g, (match: string, offset: number) =>
    offset === 0 ? match.toLowerCase() : `_${match.toLowerCase()}`
  );

const keyToLowerCase = (key: string): string => key.toLocaleLowerCase();

const makeKeyFormatter =
  (convertKey: (key: string) => string) =>
  <T extends object>(object: T): T => {
    if (!object) return object;

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(object)) {
      result[convertKey(key)] = value;
    }

    return result as T;
  };

export const snakeCaseKeyFormatter = makeKeyFormatter(snakeCaseKeyToCamelCase);
export const camelCaseKeyFormatter = makeKeyFormatter(camelCaseKeyToSnakeCase);
export const lowerCaseKeyFormatter = makeKeyFormatter(keyToLowerCase);
