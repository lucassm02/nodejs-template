export type ReprocessingModel = {
  reprocessingId: string;
  reprocessing: {
    middleware: string;
    tries: object;
    data: { payload: { body: object; properties: object } };
    state: object;
  };
  queue: string;
};
