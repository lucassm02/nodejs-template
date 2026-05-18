const SANITIZE_REGEX = /\n|\r|( {4})+/g;

export const sanitizedParams = (params: Record<string, unknown>) => {
  const entries = Object.entries(params);

  const sanitizedEntries = entries.map(([key, value]) => {
    if (typeof value === 'string') {
      const sanitizedValue = value?.replace(SANITIZE_REGEX, '');
      return [key, sanitizedValue];
    }

    return [key, value];
  });

  return Object.fromEntries(sanitizedEntries);
};
