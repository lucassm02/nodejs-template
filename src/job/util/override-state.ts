// TODO: We should seek better alternatives in the future, but for now, it's not a problem.
/* eslint-disable @typescript-eslint/no-explicit-any */
export const overrideState = (state: { [key: string]: any }, data: any) => {
  for (const key in data) {
    if (typeof key === 'string' || typeof key === 'number')
      state[key] = data[key];
  }
};
