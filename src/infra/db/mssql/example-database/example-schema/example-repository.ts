import {
  CreateExampleRepository,
  GetExampleRepository,
} from '@/data/protocols/db/example';
import { EXAMPLE_DB, sqlConnection } from '@/infra/db/mssql/util';
import {
  convertCamelCaseKeysToSnakeCase,
  filterKeys,
  pipe,
} from '@/util/object';

const {
  EXAMPLE: { EXAMPLE },
} = EXAMPLE_DB;

export class ExampleRepository
  implements CreateExampleRepository, GetExampleRepository
{
  async get(): GetExampleRepository.Result {
    return sqlConnection(EXAMPLE.TABLE)
      .select({
        exampleId: EXAMPLE.COLUMNS.EXAMPLE_ID,
        value: EXAMPLE.COLUMNS.VALUE,
        description: EXAMPLE.COLUMNS.DESCRIPTION,
        createdAt: EXAMPLE.COLUMNS.CREATED_AT,
        updatedAt: EXAMPLE.COLUMNS.UPDATED_AT,
      })
      .whereNotNull(EXAMPLE.COLUMNS.DELETED_AT);
  }
  async create(
    params: CreateExampleRepository.Params
  ): CreateExampleRepository.Result {
    const transaction = await sqlConnection.transaction();

    const data = pipe(params)(
      (value) => filterKeys(value, ['description', 'value']),
      convertCamelCaseKeysToSnakeCase
    );

    const [record] = await transaction(EXAMPLE.TABLE)
      .insert(data)
      .whereNotNull(EXAMPLE.COLUMNS.DELETED_AT)
      .returning('*');

    return {
      record,
      transaction: {
        commit: async () => {
          transaction.commit();
        },
        rollback: async () => {
          transaction.rollback();
        },
      },
    };
  }
}
