export type RenameKeys = <T>(
  object: T,
  manifest: { [P in keyof T]?: string }
) => T;
