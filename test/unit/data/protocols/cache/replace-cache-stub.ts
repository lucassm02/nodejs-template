import { ReplaceCache } from '@/data/protocols/cache';

export class ReplaceCacheStub implements ReplaceCache {
  replace(
    key: string,
    value: string | Record<string, unknown> | Record<string, unknown>[],
    ttl?: number | undefined
  ): Promise<boolean>;
  replace(params: {
    key: string;
    value: string | Record<string, unknown> | Record<string, unknown>[];
    ttl?: number | undefined;
  }): Promise<boolean>;
  replace(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
