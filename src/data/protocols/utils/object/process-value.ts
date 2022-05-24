export type ProcessValue = <T>(
  object: T,
  manifest: { [P in keyof T]?: Function }
) => T;
