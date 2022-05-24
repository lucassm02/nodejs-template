import { NoAuthenticationController } from '@/presentation/controllers';

export const makeNoAuthenticationController = () => {
  return new NoAuthenticationController();
};
