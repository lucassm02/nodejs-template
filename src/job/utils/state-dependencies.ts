import { makeStateDependencies } from '@/plugin';

import { SharedState } from '../protocols/shared-state';

export const stateDependencies = makeStateDependencies<SharedState>({
  trowException: true,
});
