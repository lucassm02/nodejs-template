import { DbGetExample } from '@/data/usecases/db/example';
import { ExampleRepository } from '@/infra/db/mssql/example-database';
import { GetExampleMiddleware } from '@/presentation/middlewares/example';
import { logger } from '@/util';

import { makeErrorHandler } from '../../usecases';

type FactoryParams = {
  useTransaction?: boolean;
  context: 'GET_EXAMPLE' | 'CREATE_EXAMPLE';
};

export const makeGetExampleMiddleware = ({
  context,
  useTransaction
}: FactoryParams) => {
  const extractValuesSchema = {
    GET_EXAMPLE: ['state.getExample.name'],
    CREATE_EXAMPLE: [{ name: 'request.body.userName' }]
  };

  const extractValues = extractValuesSchema[context];

  const exampleRepository = new ExampleRepository(useTransaction);
  const dbGetExample = new DbGetExample(exampleRepository);
  return new GetExampleMiddleware(
    dbGetExample,
    logger,
    makeErrorHandler(),
    extractValues
  );
};
