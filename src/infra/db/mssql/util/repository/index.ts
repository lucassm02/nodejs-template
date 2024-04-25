import { Knex } from 'knex';

import { sqlConnection } from '../connection';

export class Repository {
  protected connection!: Knex;

  constructor(private readonly useTransaction: boolean = false) {
    this.connection = sqlConnection;
  }

  protected async getConnection() {
    if (this.useTransaction) {
      return sqlConnection.transaction();
    }

    return sqlConnection;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected transactionAdapter(connection: Record<string, any>) {
    if (
      typeof connection.commit === 'function' &&
      typeof connection.rollback === 'function'
    ) {
      return {
        commit: async () => {
          await connection.commit();
        },
        rollback: async () => {
          await connection.rollback();
        }
      };
    }

    return null;
  }
}
