import { makeStateDependencies } from '@/plugin';

import { SharedState } from '../protocols/shared-state';
import { serverError } from './http-response';

export const stateDependencies = makeStateDependencies<SharedState>({
  trowException: false,
  exceptionHandler: serverError,
});
