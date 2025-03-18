import { ALLOWED_CONTEXT, CacheContexts } from '@/data/protocols/cache';

import { name } from '../../package.json';

export function getCacheKeyByContext(context: CacheContexts, meta?: string) {
  if (!ALLOWED_CONTEXT.includes(context))
    throw new Error('Context not allowed');

  if (context.includes('.') || meta?.includes('.'))
    throw new Error('Dot (.) character are not allowed in context or meta');

  const applicationName = name.toUpperCase().replaceAll('-', '_');

  if (!meta) {
    return `${applicationName}.${context}`;
  }

  const metaValue = meta ? `.${meta}` : '';
  return `${applicationName}.${context}${metaValue}`;
}
