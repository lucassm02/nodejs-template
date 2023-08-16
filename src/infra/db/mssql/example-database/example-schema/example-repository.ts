import {
  CreateExampleRepository,
  GetExampleRepository
} from '@/data/protocols/db/example';
import { EXAMPLE_DB, Repository } from '@/infra/db/mssql/util';
import {
  convertCamelCaseKeysToSnakeCase,
  filterKeys,
  renameKeys,
  transform
} from '@/util/object';
import { removeUndefinedValues } from '@/util/object/modifiers/remove-undefined-values';

const {
  EXAMPLE: { EXAMPLE }
} = EXAMPLE_DB;

export class ExampleRepository
  extends Repository
  implements CreateExampleRepository, GetExampleRepository
{
  async get(): GetExampleRepository.Result {
    const exampleSchema = transform(EXAMPLE.getColumnsObject('CAMEL'))
      .pipe((value) =>
        filterKeys(value, { deniedKeys: ['deletedAt', 'exampleId'] })
      )
      .pipe((value) => renameKeys(value, { externalId: 'exampleId' }))
      .get();

    return this.connection(EXAMPLE.TABLE)
      .formattedSelect({ example: { exampleSchema } })
      .whereNotNull(EXAMPLE.COLUMNS.DELETED_AT);
  }
  async create(
    params: CreateExampleRepository.Params
  ): CreateExampleRepository.Result {
    const connection = await this.getConnection();

    const data = transform(params)
      .pipe((value) =>
        filterKeys(value, { allowedKeys: ['description', 'value'] })
      )
      .pipe(removeUndefinedValues)
      .pipe(convertCamelCaseKeysToSnakeCase)
      .get();

    const [record] = await connection(EXAMPLE.TABLE)
      .insert(data)
      .whereNotNull(EXAMPLE.COLUMNS.DELETED_AT)
      .returning('*');

    return {
      record,
      transaction: this.transactionAdapter(connection)
    };
  }
}
