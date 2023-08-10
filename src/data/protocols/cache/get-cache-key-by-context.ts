export const ALLOWED_CONTEXT = <const>['EXAMPLE'];

export type CacheContexts = (typeof ALLOWED_CONTEXT)[number];

export type GetCacheKeyByContext = (context: CacheContexts) => string;
