export interface RunReprocessing {
  run(params: RunReprocessing.Params): RunReprocessing.Result;
}

export namespace RunReprocessing {
  export type Params = {
    reprocessingId?: string;
    identifier?: Record<string, unknown>;
  };

  export type Result = Promise<void>;
}
