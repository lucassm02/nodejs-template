import { DbCreateExample } from '@/data/usecases/db/example';
import { ExampleRepository } from '@/infra/db/mssql/example-database';
import { CreateExampleMiddleware } from '@/presentation/middlewares';
import { logger, rollbackAll } from '@/util';

import { makeErrorHandler } from '../../usecases';
import { makeDataValidation } from '../../validation';

type FactoryParams = {
  useTransaction?: boolean;
  context: 'GET_EXAMPLE' | 'CREATE_EXAMPLE';
};

export const makeCreateExampleMiddleware = (
  { useTransaction, context }: FactoryParams = {
    useTransaction: false,
    context: 'CREATE_EXAMPLE'
  }
) => {
  const extractValuesSchema = {
    GET_EXAMPLE: ['state.getExample.name'],
    CREATE_EXAMPLE: [{ name: 'request.body.userName' }]
  };
  const extractValues = extractValuesSchema[context];

  const exampleRepository = new ExampleRepository(useTransaction);
  const dbCreateExample = new DbCreateExample(exampleRepository);
  return new CreateExampleMiddleware(
    dbCreateExample,
    logger,
    makeDataValidation(),
    makeErrorHandler([
      async (_error, transactions) => {
        if (!transactions) return;
        await rollbackAll(transactions);
      }
    ]),
    extractValues
  );
};
