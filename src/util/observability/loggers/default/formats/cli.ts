import { format } from 'winston';

export const cli = format.printf(({ level, timestamp, ...params }) => {
  const upperCaseLevel = String(level).toLocaleUpperCase();

  const baseText = `LEVEL: [${upperCaseLevel}], TIMESTAMP: [${timestamp}]`;

  if (Object.keys(params).length > 0) {
    const paramsToString = Object.entries(params).reduce(
      (acc, [key, value], index) => {
        if (!value || value === '') return acc;

        const valueToString =
          typeof value === 'object' ? JSON.stringify(value) : value;

        const sanitizedValueToString = valueToString.replace(
          /\n|\r|( {3})+/g,
          ''
        );

        if (index === 0) {
          return `${String(
            key
          ).toLocaleUpperCase()}: [${sanitizedValueToString}]`;
        }

        return `${acc}, ${String(
          key
        ).toLocaleUpperCase()}: [${sanitizedValueToString}]`;
      },
      ''
    );

    return `${baseText}, ${paramsToString}`;
  }

  return baseText;
});
