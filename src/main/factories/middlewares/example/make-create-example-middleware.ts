import { DbCreateExample } from '@/data/usecases/db/example';
import { ExampleRepository } from '@/infra/db/mssql/example-database';
import { CreateExampleMiddleware } from '@/presentation/middlewares';
import { logger } from '@/util';

import { makeErrorHandler } from '../../usecases';

export const makeCreateExampleMiddleware = () => {
  const exampleRepository = new ExampleRepository();
  const dbCreateExample = new DbCreateExample(exampleRepository);
  return new CreateExampleMiddleware(
    dbCreateExample,
    logger,
    makeErrorHandler()
  );
};
