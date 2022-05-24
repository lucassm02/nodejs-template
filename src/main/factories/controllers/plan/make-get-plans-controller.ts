import { GetPlansController } from '@/presentation/controllers';
import { overrideAttributeValue } from '@/util';

export const makeGetPlansController = () => {
  return new GetPlansController(overrideAttributeValue);
};
