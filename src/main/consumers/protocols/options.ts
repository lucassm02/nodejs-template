export type Options = {
  enabled: boolean;
  queue: string;
  handler: (object: Record<string, unknown>) => void;
};
