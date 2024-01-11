export type ReprocessingModel = {
  reprocessingId: string;
  reprocessing: object;
  headers: object;
  exchange: string;
  routingKey: string;
  createdAt: Date;
  queue: string;
};
