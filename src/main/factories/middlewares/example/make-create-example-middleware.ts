import { DbCreateExample } from '@/data/usecases/db/example';
import { ExampleRepository } from '@/infra/db/mssql/example-database';
import { CreateExampleMiddleware } from '@/presentation/middlewares';
import { logger, rollbackAll } from '@/util';

import { makeErrorHandler } from '../../usecases';

type Params = { useTransaction: boolean };

export const makeCreateExampleMiddleware = (
  { useTransaction }: Params = { useTransaction: false }
) => {
  const exampleRepository = new ExampleRepository(useTransaction);
  const dbCreateExample = new DbCreateExample(exampleRepository);
  return new CreateExampleMiddleware(
    dbCreateExample,
    logger,
    makeErrorHandler([
      async (_error, transactions) => {
        if (!transactions) return;
        await rollbackAll(transactions);
      },
    ])
  );
};
