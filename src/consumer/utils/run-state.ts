export const runState = (state: { [key: string]: any }, data: any) => {
  for (const key in data) {
    if (typeof key === 'string' || typeof key === 'number')
      state[key] = data[key];
  }
};
