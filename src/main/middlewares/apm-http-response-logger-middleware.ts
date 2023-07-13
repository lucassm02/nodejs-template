import { elasticAPM } from '@/util';

import { httpLoggerAdapter } from '../adapters';

export const apmHttpResponseLoggerMiddleware = httpLoggerAdapter(
  ({ response }) => {
    const entries = Object.entries(response).map(([key, value]) => {
      const newKey = `http-response-${key}`;
      return [newKey, JSON.stringify(value)];
    });

    const labels = Object.fromEntries(entries);

    elasticAPM().getAPM()?.currentTransaction?.addLabels(labels, false);
  }
);
