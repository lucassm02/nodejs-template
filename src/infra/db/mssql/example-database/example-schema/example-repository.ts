import {
  CreateExampleRepository,
  GetExampleRepository,
  GetFooWithExampleRepository,
  UpdateExampleRepository
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
  EXAMPLE: { EXAMPLE },
  FOO: { FOO }
} = EXAMPLE_DB;

export class ExampleRepository
  extends Repository
  implements
    CreateExampleRepository,
    GetExampleRepository,
    GetFooWithExampleRepository,
    UpdateExampleRepository
{
  async update(
    params: UpdateExampleRepository.Params
  ): UpdateExampleRepository.Result {
    await this.connection(EXAMPLE.TABLE)
      .update({
        [EXAMPLE.COLUMNS.VALUE]: params.value,
        [EXAMPLE.COLUMNS.DESCRIPTION]: params.description
      })
      .where(EXAMPLE.COLUMNS.EXAMPLE_ID, '=', params.exampleId);
  }
  async getFooWithExample(
    params: GetFooWithExampleRepository.Params
  ): GetFooWithExampleRepository.Result {
    return this.connection(FOO.TABLE)
      .select({
        fooId: FOO.COLUMNS.FOO_ID,
        exampleId: EXAMPLE.COLUMNS.EXAMPLE_ID,
        createdAt: EXAMPLE.COLUMNS.CREATED_AT,
        deletedAt: EXAMPLE.COLUMNS.DELETED_AT,
        updatedAt: EXAMPLE.COLUMNS.UPDATED_AT,
        description: EXAMPLE.COLUMNS.DESCRIPTION,
        value: EXAMPLE.COLUMNS.VALUE
      })
      .innerJoin(
        EXAMPLE.TABLE,
        EXAMPLE.COLUMNS.EXAMPLE_ID,
        FOO.COLUMNS.EXAMPLE_ID
      );
  }
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
