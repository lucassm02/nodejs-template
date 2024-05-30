// TODO: We should seek better alternatives in the future, but for now, it's not a problem.
/* eslint-disable @typescript-eslint/no-explicit-any */
export type ReprocessingData = {
  middleware: string | null;
  tries: { current: number; max: number; delays: number[] } | null;
  progress?: { step: number; total: number };
  data: {
    payload: any;
    state: any;
  };
};
