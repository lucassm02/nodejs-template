export const ALLOWED_CONTEXT = <const>['EXAMPLE', 'TOKEN_BLACK_LIST'];

export type CacheContexts = (typeof ALLOWED_CONTEXT)[number];

export type GetCacheKeyByContext = (
  context: CacheContexts,
  meta?: string
) => string;
