import { format } from 'winston';

import { sanitizedParams } from './utils';

export const standard = format.printf((rawParams) => {
  const { level, message, timestamp, ...params } = sanitizedParams(rawParams);
  if (Object.keys(params).length > 0)
    return JSON.stringify({ level, message, ...params, timestamp });

  return JSON.stringify({ level, message, timestamp });
});
