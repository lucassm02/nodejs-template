export interface UpdateEvent {
  update: (params: UpdateEvent.Params) => UpdateEvent.Result;
}

export namespace UpdateEvent {
  export type Params = Record<string, unknown>;
  export type Result = Promise<{ id: string }>;
}
