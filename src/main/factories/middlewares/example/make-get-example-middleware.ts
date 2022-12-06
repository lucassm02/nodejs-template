import { DbGetExample } from '@/data/usecases/db/example';
import { ExampleRepository } from '@/infra/db/mssql/example-database';
import { GetExampleMiddleware } from '@/presentation/middlewares/example';
import { logger } from '@/util';

import { makeErrorHandler } from '../../usecases';

export const makeGetExampleMiddleware = () => {
  const exampleRepository = new ExampleRepository();
  const dbGetExample = new DbGetExample(exampleRepository);
  return new GetExampleMiddleware(dbGetExample, logger, makeErrorHandler());
};
