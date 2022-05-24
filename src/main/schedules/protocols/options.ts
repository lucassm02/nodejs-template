export type Options = {
  enabled: boolean;
  cron: string;
  handler: (object: object) => void;
};
