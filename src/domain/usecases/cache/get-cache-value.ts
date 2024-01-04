export interface GetCacheValue {
  get(params: GetCacheValue.Params): GetCacheValue.Result;
}
export namespace GetCacheValue {
  export type Params = {
    key: string;
    throws?: boolean;
    options: { parseToJson: boolean; parseBufferToString: boolean };
  };
  export type Result = Promise<
    Record<string, unknown> | Buffer | null | string
  >;
  export enum Exceptions {
    ERROR_ON_GET_CACHE_VALUE = 'ERROR_ON_GET_CACHE_VALUE'
  }
}
