import { SetCache } from '@/data/protocols/cache';

export class SetCacheStub implements SetCache {
  set(
    key: string,
    value: string | Record<string, unknown> | Record<string, unknown>[],
    ttl?: number | undefined
  ): Promise<boolean>;
  set(params: {
    key: string;
    value: string | Record<string, unknown> | Record<string, unknown>[];
    ttl?: number | undefined;
  }): Promise<boolean>;
  set(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
