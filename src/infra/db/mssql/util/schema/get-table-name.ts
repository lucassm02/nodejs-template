import { Options } from './make-table-builder';

export function getTableName<T>(database: string, options: Options<T>): string {
  if (process.env.NODE_ENV !== 'test') return `[${database}].${options.table}`;
  const table = options.table.match(/\[([^\]]+)\]\.\[([^\]]+)\]/);
  if (!table) {
    throw new Error(
      `Match value for table ${options.table} does not match with default pattern`
    );
  }
  return table[2];
}
