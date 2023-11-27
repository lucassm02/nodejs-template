import { Knex as KnexOriginal } from 'knex';

declare module 'knex' {
  namespace Knex {
    interface QueryBuilder {
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
      insertInTestEnvironment<TRecord, TResult>(data: {
        builder: {
          getColumnsObject: (keyCase: 'SNAKE') => { [key: string]: string };
        };
        query: Object;
      }): KnexOriginal.QueryBuilder<TRecord, TResult>;
    }
  }
}
