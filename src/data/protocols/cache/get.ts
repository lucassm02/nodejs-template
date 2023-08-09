type GetOptions = { parseToJson: boolean };

export interface GetCache {
  get(
    key: string,
    options: { parseToJson: true }
  ): Promise<Record<string, unknown> | undefined>;
  get(
    key: string,
    options: { parseToJson: false }
  ): Promise<Buffer | undefined>;
  get(key: string, options?: GetOptions): Promise<Buffer | undefined>;
}
