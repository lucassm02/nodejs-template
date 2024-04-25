type UnknownObject = Record<string, unknown>;
type Args = UnknownObject[];

export type Merge = <T extends Args>(...objects: T) => Record<string, unknown>;
