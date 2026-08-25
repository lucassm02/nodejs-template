import { APM, elasticAPM } from '@/util';
import { sanitizeObject } from '@/util/security/sanitize-object';

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
    if (!APM.ENABLED) return;

    const transaction = elasticAPM().getAPM()?.currentTransaction;
    if (!transaction) return;

    const responseLabels = makeLabel(
      sanitizeObject(response),
      'http-response-'
    );
    const requestLabels = makeLabel(sanitizeObject(request), 'http-request-');
    transaction.addLabels(responseLabels, false);
    transaction.addLabels(requestLabels, false);
  }
);
