import { CreateExampleController } from '@/presentation/controllers';
import { commitAll } from '@/util';

export const makeCreateExampleController = () => {
  return new CreateExampleController(commitAll);
};
