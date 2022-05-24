import { format } from 'winston';

export const cli = format.printf(({ level, timestamp, ...params }) => {
  const upperCaseLevel = String(level).toLocaleUpperCase();

  if (level === 'error') {
    const message = `LEVEL: [${upperCaseLevel}], MESSAGE: [${params.message}], STACK: [${params?.stack}], TIMESTAMP: [${timestamp}]`;
    return message.replace(/\n|\r|( {3})+/g, '');
  }

  const info = `LEVEL: [${upperCaseLevel}], TIMESTAMP: [${timestamp}]`;

  if (Object.keys(params).length > 0) {
    const paramsToString = Object.entries(params).reduce(
      (acc, [key, value], index) => {
        if (!value || value === '') return acc;

        const valueToString =
          typeof value === 'object' ? JSON.stringify(value) : value;

        if (index === 0) {
          return `${String(key).toLocaleUpperCase()}: [${valueToString}]`;
        }

        return `${acc}, ${String(key).toLocaleUpperCase()}: [${valueToString}]`;
      },
      ''
    );

    return `${info}, ${paramsToString}`;
  }

  return info;
});
