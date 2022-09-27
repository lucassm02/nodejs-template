/* eslint-disable guard-for-in */
import { logger } from '@/util';

import { SharedState } from '../protocols/shared-state';

type Dependencies = (keyof SharedState)[];

export function stateDependencies(dependencies: Dependencies) {
  return function (
    target: Object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const STATE_INDEX_IN_REQUEST = 1;
    const STATE_INDEX_IN_STATE = 0;

    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      for (const index in dependencies) {
        const DEPENDENCY_NAME = dependencies[index];

        const state =
          args[STATE_INDEX_IN_REQUEST][STATE_INDEX_IN_STATE]?.[DEPENDENCY_NAME];

        if (state === undefined) {
          const error = new Error(`MISSING_DEPENDENCY: ${DEPENDENCY_NAME}`);
          logger.log(error);
          throw error;
        }
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
