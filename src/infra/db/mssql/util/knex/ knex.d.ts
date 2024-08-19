import { Knex as KnexOriginal } from 'knex';

declare module 'knex' {
  // export interface Config extends KnexOriginal.Config {
  //   client: KnexOriginal.Config['client'] & 'sqlite3+';
  // }

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
  namespace Knex {
    interface KnexConfig {
      cacheClient?: 'node-cache' | 'memjs';
    }
    interface QueryBuilder {
      _turbo?: boolean;
      turbo<TRecord, TResult>(): KnexOriginal.QueryBuilder<TRecord, TResult>;
      noLock<TRecord, TResult>(): KnexOriginal.QueryBuilder<TRecord, TResult>;
      noLockFrom<TRecord, TResult>(
        from: string
      ): KnexOriginal.QueryBuilder<TRecord, TResult>;
      noLockInnerJoin<TRecord, TResult>(
        table: string,
        columnOne: string,
        columnTwo: string
      ): KnexOriginal.QueryBuilder<TRecord, TResult>;

      noLockLeftJoin<TRecord, TResult>(
        table: string,
        columnOne: string,
        columnTwo: string
      ): KnexOriginal.QueryBuilder<TRecord, TResult>;
      formattedSelect<TRecord, TResult>(
        object: Object
      ): KnexOriginal.QueryBuilder<TRecord, TResult>;
    }
  }
}
