import {
  CreateExampleRepository,
  GetExampleRepository,
} from '@/data/protocols/db/example';
import { EXAMPLE_DB, Repository } from '@/infra/db/mssql/util';
import {
  convertCamelCaseKeysToSnakeCase,
  filterKeys,
  transform,
} from '@/util/object';

const {
  EXAMPLE: { EXAMPLE },
} = EXAMPLE_DB;

export class ExampleRepository
  extends Repository
  implements CreateExampleRepository, GetExampleRepository
{
  async get(): GetExampleRepository.Result {
    return this.connection(EXAMPLE.TABLE)
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
    const connection = await this.getConnection();

    const data = transform(params)
      .pipe((value) => filterKeys(value, ['description', 'value']))
      .pipe(convertCamelCaseKeysToSnakeCase);

    const [record] = await connection(EXAMPLE.TABLE)
      .insert(data)
      .whereNotNull(EXAMPLE.COLUMNS.DELETED_AT)
      .returning('*');

    return {
      record,
      transaction: this.transactionAdapter(connection),
    };
  }
}
