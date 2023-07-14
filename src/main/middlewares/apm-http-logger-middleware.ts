import { elasticAPM } from '@/util';

import { httpLoggerAdapter } from '../adapters';

const makeLabel = (object: Record<string, unknown>, labelPrefix: string) => {
  const entries = Object.entries(object).map(([key, value]) => {
    const newKey = labelPrefix + key;

    return [newKey, JSON.stringify(value)];
  });

  return Object.fromEntries(entries);
};

export const apmHttpLoggerMiddleware = httpLoggerAdapter(
  ({ response, request }) => {
    const responseLabels = makeLabel(response, 'http-response-');
    const requestLabels = makeLabel(request, 'http-request-');
    const transaction = elasticAPM().getAPM()?.currentTransaction;
    transaction?.addLabels(responseLabels, false);
    transaction?.addLabels(requestLabels, false);
  }
);
