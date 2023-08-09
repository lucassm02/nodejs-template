type SetOption = {
  key: string;
  value: string | Record<string, unknown> | Record<string, unknown>[];
  ttl?: number;
};

export interface SetCache {
  set(
    key: SetOption['key'],
    value: SetOption['value'],
    ttl?: SetOption['ttl']
  ): Promise<boolean>;
  set(params: SetOption): Promise<boolean>;
}
