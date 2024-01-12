export type ReprocessingModel = {
  reprocessingId: string;
  reprocessing: {
    middleware: string;
    tries: object;
    data: { payload: { body: object; headers: object; properties: object } };
    state: object;
  };
  queue: string;
  createdAt: string;
};
