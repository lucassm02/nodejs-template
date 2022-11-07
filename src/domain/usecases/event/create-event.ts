export interface CreateEvent {
  create: (params: CreateEvent.Params) => CreateEvent.Result;
}

export namespace CreateEvent {
  export type Params = Record<string, unknown>;
  export type Result = Promise<{ id: string }>;
}
