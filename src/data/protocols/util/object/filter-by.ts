export type FilterBy = <T, V>(records: T[], by: (keyof T)[], value: V[]) => T[];
