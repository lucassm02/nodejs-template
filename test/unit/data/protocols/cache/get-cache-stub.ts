import { GetCache } from '@/data/protocols/cache';

export class GetCacheStub implements GetCache {
  get(
    key: string,
    options: { parseToJson: true }
  ): Promise<Record<string, unknown> | undefined>;
  get(
    key: string,
    options: { parseToJson: false }
  ): Promise<Buffer | undefined>;
  get(
    key: string,
    options?: { parseToJson: boolean } | undefined
  ): Promise<Buffer | undefined>;
  get():
    | Promise<Buffer | undefined>
    | Promise<Record<string, unknown> | undefined> {
    return Promise.resolve(Buffer.from('any_buffer'));
  }
}
