export interface GenericCacheService {
  get<T>(...args: unknown[]): Promise<T>;
  get<T>(...args: unknown[]): T;

  set<T>(...args: unknown[]): T;
}
