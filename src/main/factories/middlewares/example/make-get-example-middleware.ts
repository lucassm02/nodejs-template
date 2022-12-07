import { DbGetExample } from '@/data/usecases/db/example';
import { ExampleRepository } from '@/infra/db/mssql/example-database';
import { GetExampleMiddleware } from '@/presentation/middlewares/example';
import { logger } from '@/util';

import { makeErrorHandler } from '../../usecases';

type Params = { useTransaction: boolean };
export const makeGetExampleMiddleware = (
  { useTransaction }: Params = { useTransaction: false }
) => {
  const exampleRepository = new ExampleRepository(useTransaction);
  const dbGetExample = new DbGetExample(exampleRepository);
  return new GetExampleMiddleware(dbGetExample, logger, makeErrorHandler());
};
