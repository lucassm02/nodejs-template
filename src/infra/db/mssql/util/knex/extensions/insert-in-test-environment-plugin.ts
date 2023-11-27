import k from 'knex';

export function insertInTestEnvironmentPlugin(knex: typeof k) {
  type ContextType<Type> = { _single: { table: string } } & Type;
  type InsertParams = {
    builder: {
      getColumnsObject: (keyCase: 'SNAKE') => { [key: string]: string };
    };
    query: any;
  };

  knex.QueryBuilder.extend(
    'insertInTestEnvironment',
    function (this, data: InsertParams) {
      if (process.env.NODE_ENV !== 'test') return this;
      if (this.client.config.client !== 'sqlite3') return this;

      const context = <ContextType<typeof this>>this;

      const { table } = context._single;

      const { builder, query } = data;

      if (!builder.getColumnsObject) return this;

      const columns = Object.keys(builder.getColumnsObject('SNAKE'));

      const newQueryWithoutTableName: any = Object.entries(query).reduce(
        (last, actual) => {
          const newKey = actual[0].split('.')[1];
          return {
            ...last,
            [newKey]: actual[1]
          };
        },
        {}
      );

      const insertQuery = columns.reduce((last, actual) => {
        return {
          ...last,
          [actual]: newQueryWithoutTableName[actual]
        };
      }, {});
      return this.insert(insertQuery as any).into(table);
    }
  );

  return knex;
}
