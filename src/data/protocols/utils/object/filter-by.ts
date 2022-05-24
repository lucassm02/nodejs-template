export type FilterBy = <T>(records: T[], by: (keyof T)[], value: any[]) => T[];
