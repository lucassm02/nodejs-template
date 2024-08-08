export interface SaveInCache {
  save(params: SaveInCache.Params): SaveInCache.Result;
}

export namespace SaveInCache {
  type Value = Record<string, unknown>;
  export type Params = {
    key: string;
    subKey: unknown;
    value: Value;
    ttl?: number;
  };
  export enum Exceptions {
    ERROR_ON_SAVE_IN_CACHE = 'ERROR_ON_SAVE_IN_CACHE'
  }
  export type Result = Promise<void>;
}
