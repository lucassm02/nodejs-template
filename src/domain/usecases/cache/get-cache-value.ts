export interface GetCacheValue {
  get(params: GetCacheValue.Params): GetCacheValue.Result;
}
export namespace GetCacheValue {
  export type Params = {
    key: string;
    options: { parseToJson: boolean; parseBufferToString: boolean };
  };
  export type Result = Promise<
    Record<string, unknown> | Buffer | null | string
  >;
}
