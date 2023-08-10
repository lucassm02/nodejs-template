import { ALLOWED_CONTEXT, CacheContexts } from '@/data/protocols/cache';

import { name } from '../../package.json';

export function getCacheKeyByContext(context: CacheContexts) {
  if (!ALLOWED_CONTEXT.includes(context)) throw new Error('');
  const applicationName = name.toUpperCase().replace('-', '_');
  return `${applicationName}.${context}`;
}
