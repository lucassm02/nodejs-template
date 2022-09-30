export interface TroubleExample {
  trouble(params: TroubleExample.Params): TroubleExample.Result;
}

export namespace TroubleExample {
  export type Params = {
    current: number;
  };

  export type Result = void;
}
