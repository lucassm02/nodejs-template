export const groupBy = <T>(
  array: T[],
  callback: (value: T) => string | number
) =>
  array.reduce((acc, value) => {
    (acc[callback(value)] ||= []).push(value);
    return acc;
  }, {} as { [key: string]: T[] });
