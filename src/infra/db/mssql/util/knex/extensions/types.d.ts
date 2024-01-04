export type Statement = {
  grouping: string;
  type: string;
  column: string;
  operator: string;
  value: unknown;
  not: boolean;
  bool: string;
  asColumn: boolean;
};
export type ContextType = {
  _single?: {
    table: string;
    insert?: Record<string, unknown>;
    update?: Record<string, unknown>;
    only: boolean;
  };
  _statements?: Statement[];
};
