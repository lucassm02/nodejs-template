import { GetPlanByIdController } from '@/presentation/controllers';
import { overrideAttributeValue } from '@/util';

export const makeGetPlanByIdController = () => {
  return new GetPlanByIdController(overrideAttributeValue);
};
