type ReplaceOption = {
  key: string;
  value: string | Record<string, unknown> | Record<string, unknown>[];
  ttl?: number;
};

export interface ReplaceCache {
  replace(
    key: ReplaceOption['key'],
    value: ReplaceOption['value'],
    ttl?: ReplaceOption['ttl']
  ): Promise<boolean>;
  replace(params: ReplaceOption): Promise<boolean>;
}
