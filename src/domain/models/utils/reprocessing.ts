export type ReprocessingData = {
  middleware: string | null;
  tries: { current: number; max: number; delays: number[] } | null;
  progress?: { step: number; total: number };
  data: {
    payload: any;
    state: any;
  };
};
