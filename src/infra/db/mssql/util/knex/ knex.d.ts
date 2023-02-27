import { Knex as KnexOriginal } from 'knex';

declare module 'knex' {
  namespace Knex {
    interface QueryBuilder {
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
    }
  }
}
