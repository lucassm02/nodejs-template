import deepEqual from 'fast-deep-equal';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const equals = (a: any, b: any): boolean => deepEqual(a, b);
